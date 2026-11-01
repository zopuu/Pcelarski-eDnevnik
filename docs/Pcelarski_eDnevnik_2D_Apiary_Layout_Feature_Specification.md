---
title: "Pčelarski eDnevnik — 2D Apiary Layout and Interactive Map"
subtitle: "Functional, domain, API, frontend, and integration specification"
version: "1.0"
status: "Approved product decisions; implementation design baseline"
date: "2026-10-31"
---

# Pčelarski eDnevnik — 2D Apiary Layout and Interactive Map

**Technical feature specification · Version 1.0 · 31 October 2026**  
**Status:** Implementation planning baseline. Product decisions are recorded below; exact existing project symbols and routes must be verified against the repository before coding.  
**Primary language of the UI:** Serbian. **Specification language:** English.

> **Purpose.** Add a two-dimensional, editable layout of the hives belonging to an apiary's current stay. The first release replaces the active-hive list on Apiary Details with a reusable interactive map and adds a dedicated layout editor. The underlying map must be extensible to bulk hive actions, different hive shapes, and statistics overlays without coupling the renderer to those features.

## Document control and interpretation

This document consolidates the decisions made during the feature-design discussion and aligns them with the project's supplied **Frontend Architecture**, **Validation and Error Handling Guide**, **Current User Identification and Data Ownership** guidance, and **Contextual Action Bar Specification**. It describes the **intended design**, not a claim that the feature already exists.

- **Confirmed** means an explicit product/architectural decision.
- **Implementation guidance** means a recommended way of satisfying confirmed requirements; exact class names, file paths, numerical dimensions, and library wiring remain subject to implementation planning.
- **Deferred** means deliberately excluded from the first release, even if supported by extension points.
- Example GUIDs and API paths in this document are illustrative contracts, not production data or a promise about existing route registration.

---

# 1. Executive summary

## 1.1 Objectives

1. Represent hive placement within an apiary as a **logical 2D layout**, independent of real-world GPS or measured distance.
2. Associate a layout with an **ApiaryStay**, preserving the final layout when a whole-apiary relocation ends that stay.
3. Allow users to **drag and position any subset** of their active hives and leave the rest unplaced.
4. Display the map inside **Apiary Details** and provide a **dedicated layout editor**.
5. Reuse the same map engine for future **syrup/patty feeding, Varroa treatments, and per-hive statistical widgets**.
6. Preserve strict **multi-user ownership**, **modular boundaries**, **atomic writes**, and **optimistic concurrency**.
7. Keep the implementation mobile-first, maintainable, and suitable for **1000+ application users**.

## 1.2 Architectural summary

- **Backend:** ASP.NET Core / .NET modular monolith, EF Core, PostgreSQL.
- **Domain ownership:** `Apiaries` owns `ApiaryLayout` and `ApiaryLayoutPosition`; `Hives` owns hive identities and hive stays; `Relocations` orchestrates relocation operations.
- **Frontend:** Expo + React Native + TypeScript + NativeWind; Expo Router; TanStack Query; React Native Gesture Handler and Reanimated for map gestures.
- **Read:** one composed map endpoint returns current layout metadata and all active hives, including unplaced ones.
- **Write:** one atomic full-layout PUT with `expectedVersion` in JSON.
- **Recovery:** local per-account/per-stay unsaved drafts, recoverable after application termination.
- **Consistency:** explicit synchronous module contracts and one shared PostgreSQL transaction for cross-module membership changes.

---

# 2. Scope and release boundaries

## 2.1 Required in first implementation (MVP)

| Area | Included |
|---|---|
| Backend data | `ApiaryLayout`, positions, EF mapping/migration, initial/backfilled empty layouts |
| Read API | Current stay layout + active hive ID, label, color, position/null |
| Write API | Replace complete placement set, validate, update version atomically |
| Viewing | Interactive map embedded in Apiary Details, tap hive to navigate to its details |
| Editing | Dedicated screen, long-press drag/place/unplace, magnetic alignment, collision feedback |
| Unplaced hives | Shared collapsible horizontal tray below map; different actions by screen |
| Camera | Pan, pinch zoom, deterministic initial camera, edge auto-pan while dragging |
| Recovery | Persistent local draft, confirm discard, recovery and version checking |
| Relocations | Remove departing hives from source current layout; create empty layout for new ApiaryStay; preserve completed-stay layout |
| Hive lifecycle | Synchronously remove placement on hive deactivation or membership departure; invalidate layout version |
| Errors | Existing Problem Details conventions and structured collision pairs |
| UI integration | Reuse current hive icon; preserve existing Apiary Details navigation and contextual action patterns |

## 2.2 Explicitly deferred

- Automated test suite **for now** (requirements are testable, but writing/running automated tests is outside this implementation's requested scope).
- API and UI for reading historical layouts.
- API and UI for copying the previous stay's arrangement (agreed future post-relocation action).
- Full historical position revisions within a stay.
- New nucleus-hive illustrations or other marker variants; architecture must support them later.
- Bulk syrup/patty feeding and Varroa treatment screens powered by the map.
- Statistics widgets, per-hive analytics data aggregation, and selectable overlay modes.
- Rotation of hive icons; real-world measurement/GPS-based scale; real-time multi-user collaborative editing; automatic cross-device draft synchronization.
- Offline submission/queueing of layout saves, undo/redo history, and automatic merge of competing edits.

**Release rule:** Do not show an interactive *Copy previous layout* choice until the corresponding endpoint and behavior exist. In the initial relocation flow, the new stay simply receives an empty layout; hives are arranged afterward.

## 2.3 Non-goals

The layout is **not** a cadastral map, GPS survey, pathfinding system, geographic distance model, source of hive membership, or historical audit trail of every positioning gesture. A hive can be active and completely usable without ever being positioned on the map.

---

# 3. Domain vocabulary and ownership

| Term | Meaning / authority |
|---|---|
| `Apiary` | Existing beekeeper-owned apiary (Apiaries module) |
| `ApiaryStay` | A period of an apiary at a location; one current active stay as per existing rules (Apiaries) |
| `Hive` | Physical hive identity, label, color and hive type (Hives module) |
| `HiveStay` | Hive membership in an apiary over time; current active membership is authoritative (Hives module) |
| `ApiaryLayout` | One spatial arrangement owned by exactly one `ApiaryStay` (Apiaries) |
| `ApiaryLayoutPosition` | One placed hive's integer `(x, y)` within one layout (Apiaries) |
| **Placed** | Active hive having a position record in the current stay's layout |
| **Unplaced** | Active hive having **no** position record in that layout |
| **Historical layout** | Immutable final arrangement of a completed `ApiaryStay` |
| **Layout version** | Monotonic concurrency counter; **not** a history of old positions |
| **Working copy** | Frontend in-memory edits not yet saved |
| **Local draft** | Persistent device-local recovery data for the working copy |

### Authoritative relationship

```text
Apiary 1 ── * ApiaryStay
ApiaryStay 1 ── 1 ApiaryLayout
ApiaryLayout 1 ── * ApiaryLayoutPosition
ApiaryLayoutPosition * ── (logical reference) HiveId [Hives module]

ActiveHives(apiary) = active HiveStays controlled by Hives
PlacedHives(apiary) = active IDs with current layout positions
UnplacedHives(apiary) = ActiveHives − PlacedHives
```

The Apiaries module does not persist hive labels, colors, feeder data, colonies, queens, actions, or inspection results in layout tables. Any such information comes from owner modules via explicit contracts/read projections.

---

# 4. Functional requirements

Each requirement has a stable ID for implementation planning and acceptance review.

## 4.1 Apiary Details — map viewing

| ID | Requirement |
|---|---|
| `MAP-VIEW-001` | Replace the current active-hive list in Apiary Details with a 2D map. |
| `MAP-VIEW-002` | Render all **placed active** hives using the existing hive icon, individual color, and label. |
| `MAP-VIEW-003` | Tap a placed hive to **navigate directly to Hive Details**; no mandatory intermediate selection panel. |
| `MAP-VIEW-004` | Drag starting anywhere inside the viewport (including on a marker) pans; pinch zooms; meaningful dragging must not accidentally trigger navigation. |
| `MAP-VIEW-005` | Display active unplaced hives in a **collapsible, horizontally scrolling section beneath** the map. Tapping an item opens Hive Details. |
| `MAP-VIEW-006` | Hide or minimize the unplaced section when no active unplaced hives exist. |
| `MAP-VIEW-007` | Provide a contextual **Uredi raspored** action opening the dedicated editor. |
| `MAP-VIEW-008` | Display appropriate loading, error, empty-apiary, and all-unplaced states; a blank map is valid. |

The feature should respect the existing **ContextualActionBar** system: Apiary Details owns which contextual action opens the editor. Do not build a second competing app-level action bar inside the map.

## 4.2 Layout editor

| ID | Requirement |
|---|---|
| `MAP-EDIT-001` | Open a dedicated editor screen with a new camera at logical `(0,0)` and zoom `1.0`. |
| `MAP-EDIT-002` | The editor is a full-screen **screen**, not a map that consumes all available height. Map height targets approximately 60% of viewport. |
| `MAP-EDIT-003` | Initially all active hives lacking positions appear in a horizontally scrolling **unplaced tray below** the map. |
| `MAP-EDIT-004` | Long-press an unplaced hive and drag from the tray onto the map to place it. Ordinary swipes scroll the tray. |
| `MAP-EDIT-005` | Long-press a positioned hive and drag it to change its position. |
| `MAP-EDIT-006` | Remove a positioned hive by dragging it into the tray **or** choosing contextual **Ukloni sa rasporeda**. This does not deactivate, delete, or transfer the hive. |
| `MAP-EDIT-007` | A completed drag updates only the local working copy; no per-drag server request is issued. |
| `MAP-EDIT-008` | Allow zero, some, or all active hives to remain positioned. Empty layouts can be saved. |
| `MAP-EDIT-009` | Show valid/invalid drop feedback, including a red invalid outline and restoration of previous state after an invalid release. |
| `MAP-EDIT-010` | Support default-on magnetic alignment with an optional toggle; snapping is an editing aid, not a persisted relation. |
| `MAP-EDIT-011` | Keep Save/Cancel available without overlapping the map or tray and respect device safe areas. |
| `MAP-EDIT-012` | Disable/guard conflicting gestures while a hive is actively being dragged. |

### Invalid drop behavior

- **Existing positioned hive:** restore the original saved-in-editor position.
- **Unplaced hive dragged from tray:** return it to the unplaced list.
- **Drag into unplaced tray:** remove the position only after a valid tray-drop gesture.
- Never move neighboring hives automatically to make room.

## 4.3 Editor saving and local recovery

| ID | Requirement |
|---|---|
| `MAP-DRAFT-001` | Start editing from an isolated copy of the fetched layout; do not mutate the TanStack Query cache. |
| `MAP-DRAFT-002` | Derive dirty state from current positions versus initial positions; pan/zoom/selection/snapping preference do not make the layout dirty. |
| `MAP-DRAFT-003` | On dirty navigation away, show **Nesačuvane izmene** with options to continue editing or discard. |
| `MAP-DRAFT-004` | On explicit discard, clear the local draft and leave backend positions unchanged. |
| `MAP-DRAFT-005` | Persist a device-local draft after completed placement/movement/unplacement changes; avoid writes on each animation frame. |
| `MAP-DRAFT-006` | After unexpected app termination, offer to restore or discard an eligible draft. |
| `MAP-DRAFT-007` | Before restoration, compare authenticated account, apiary, active stay ID and base layout version. Do not silently apply stale drafts. |
| `MAP-DRAFT-008` | On successful save, refresh cached layout, clear draft, close editor; on failure preserve draft. |
| `MAP-DRAFT-009` | Reject outdated saves; do not automatically merge or overwrite changes made elsewhere. |

A newly initialized empty layout is already stored in the backend (because it is created with `ApiaryStay`). The editor does not need an additional create-layout API.

## 4.4 Relocations and hive lifecycle

| ID | Requirement |
|---|---|
| `MAP-LIFE-001` | Create one blank layout whenever an `ApiaryStay` is created. |
| `MAP-LIFE-002` | On **whole-apiary relocation**, close the previous stay, preserve its final layout, create a new stay and its blank layout, and complete relocation **without requiring positioning**. |
| `MAP-LIFE-003` | On **individual hive transfer**, remove transferred hive positions from the source's current layout; destination hives are active but unplaced. |
| `MAP-LIFE-004` | After successful transfer, open the destination apiary map and refetch active hives and positions. |
| `MAP-LIFE-005` | On hive deactivation or other departure from active membership, remove its source current position synchronously. |
| `MAP-LIFE-006` | On hive addition/reactivation in an apiary, the hive is unplaced; active membership changes invalidate an editor's old layout version. |
| `MAP-LIFE-007` | Preserve historical layouts; completed-stay layouts are read-only. |
| `MAP-LIFE-008` | Coordinate membership changes, affected positions, version increments and relocation records **atomically**. |

**Exception:** Ending an entire `ApiaryStay` is not the same as transferring individual hives out while that stay continues. Never delete the completed stay's final positions merely because a new apiary stay begins.

## 4.5 Reuse in future feature screens (architectural requirements only)

The initial map engine must allow the following later without source-level changes to its core gesture/camera logic:

| Future feature | Tap | Long press | Per-hive presentation |
|---|---|---|---|
| Syrup feeding | Toggle selected/deselected | Select if needed, open config | Percent and/or ml on hive front; ineligible hives visible but disabled |
| Patty feeding | Toggle selection | Configure mass/default | Mass/percentage of configured quantity |
| Varroa treatments | Toggle selection | Configure dose/method | Dose/status as relevant |
| Statistics widgets | Screen-specific detail behavior | Optional detail behavior | Last inspection, queen mark color, last feeding, treatments, production, etc. |

**Syrup feeding future rule:** A selected hive with a feeder defaults to **100% of its own feeder capacity**. User-adjusted percentage converts to an actual quantity in milliliters; the backend must revalidate eligibility and amount. A hive lacking a feeder is displayed but not selectable for syrup feeding. A missing/unknown feeder capacity must not be treated as an invented numeric capacity. Bulk actions may select hives from the unplaced tray as well as the map.

**Interaction rule:** In bulk-action screens, **tap** toggles selection. **Long press** opens the action-specific submenu; if previously unselected, it selects with default settings first. Canceling the submenu retains the selection and previous settings; saving applies changed settings. These bulk actions are **deferred**, but the interaction-extension contract is required now.

---

# 5. Coordinate system, camera, geometry

## 5.1 Logical coordinate space

- Use **logical units**, not meters, pixels tied to a device, or GPS coordinates.
- Origin: top-left `(0,0)`; `+X` rightward; `+Y` downward.
- Stored coordinates: **nonnegative PostgreSQL `integer`** values representing footprint top-left.
- No product-defined maximum canvas width or height; integer storage provides a technical maximum. Do not fabricate physical scale.
- Workspace grows right and down. The user initially sees the top-left.
- Smooth dragging can use fractional UI values but successful placements are quantized to integer logical coordinates.
- No hive rotation in the initial implementation.

## 5.2 Camera model

```ts
interface MapCamera {
  x: number;    // logical X at viewport's top-left
  y: number;    // logical Y at viewport's top-left
  zoom: number;
}

screenX = (logicalX - camera.x) * camera.zoom;
screenY = (logicalY - camera.y) * camera.zoom;
logicalX = screenX / camera.zoom + camera.x;
logicalY = screenY / camera.zoom + camera.y;
```

For accurate pointer dragging, the transform must account for the measured map viewport's location on the screen and the anchor offset within the dragged hive marker. Zooming is anchored at the pinch focal point so the point under the fingers remains visually stationary.

**Camera policy:**

- Every newly mounted map view starts at `(0,0), zoom = 1.0`; opening the editor **does not inherit** camera state from Apiary Details.
- One-finger pan and two-finger pinch zoom; double-tap and fit-all/reset controls can be added as optional affordances without affecting persistence.
- Initial suggested zoom clamp is about `0.5–2.5`; exact limits depend on marker measurements and should be tuned during implementation.
- Allow controlled visual overscroll/margins around positioned content, but **never persist negative placement coordinates**. Apply soft panning bounds, not arbitrary hard logical canvas dimensions.
- Viewport/camera values are local UI state; they never mark the layout dirty and are not stored in PostgreSQL.
- The same renderer can be used in tablet/web contexts with different viewport sizes.

## 5.3 Viewport and layout

| Host screen | Width | Target map height |
|---|---|---|
| Apiary Details | 100% of host content width | ~50% of viewport height |
| Dedicated editor | 100% | ~60% of viewport height |
| Future bulk-action screen | 100% | Adjustable ~50–60% |
| Future statistics screen | 100% | Host-configured |

Height is owned by the **host screen**, not hardcoded into the map engine. Use actual `onLayout` measurements, window dimensions, safe-area insets, and responsive minimum heights. On small screens, preserve Save/Cancel and tray usability rather than forcing an exact 60%.

The map remains inside the vertically scrolling Apiary Details page but **owns all pan/zoom gestures that start inside its viewport**. Gestures starting outside belong to the parent scroll container. Do not create competing nested pan handlers.

The unplaced section/tray occupies **its own region below the map** and does not overlap it. In the editor, dragging from the tray to the map crosses sibling boundaries, so provide a screen-level drag preview/overlay. The tray supports horizontal scrolling and can be collapsed.

## 5.4 Hive footprints and variable variants

Current release: use the **existing hive icon** and one standard footprint for every hive. Do not redesign or replace the current icon.

Future: support a **narrower nucleus-hive marker** and potentially other shapes. Each variant resolves to a logical axis-aligned footprint `(width,height)`; the backend and frontend must use equivalent authoritative definitions. Position records do **not** store width or height.

The footprint is the **reserved interactive/display envelope**, including on-front labels and supported overlays, not just the colored wooden body. Statistics may change the content on the hive's front face, but overlays must fit within the declared variant footprint; switching a widget must not introduce uncontrolled visual overlaps.

```ts
// Example design contract, not a finished implementation API
interface HiveFootprint { width: number; height: number }
interface HivePlacement { hiveId: string; x: number; y: number }

// variant := derived from Hives-owned hive type and a versioned marker catalog
resolveHiveFootprint(variant): HiveFootprint
```

**Deferred risk:** when a hive's physical variant changes and its footprint grows, previously valid coordinates might collide. The future variant-change workflow must validate or explicitly resolve this; it must not silently persist invalid geometry. The first release avoids this issue because all hives use the same variant.

## 5.5 Collision and minimum separation

Every pair of placed hive footprints must be nonoverlapping and have at least a configured minimum logical gap. Use axis-aligned bounding-box checks on the **complete footprint**.

For rectangles `A=(ax,ay,aw,ah)` and `B=(bx,by,bw,bh)` with minimum gap `g`, there is a placement conflict when all these conditions hold:

```text
ax < bx + bw + g
bx < ax + aw + g
ay < by + bh + g
by < ay + ah + g
```

This is a conservative rectangular separation rule. At exact required gap, the placement is valid. Perform intermediate arithmetic with a sufficiently wide integer type on the backend (e.g., `long`) so `int` coordinate additions cannot overflow.

The formerly discussed `60 × 75` footprint and `15` gap are **illustrative**, not approved final UI measurements. Resolve the actual constants after measuring the existing hive asset. All initial markers have one common footprint; architecture permits per-variant footprints later.

Spatial checks are repeated in frontend (interactive feedback) and backend (authority). PostgreSQL enforces structural numeric constraints, not collision geometry in the first version.

## 5.6 Magnetic alignment

- Enabled by default in the editor; can be disabled with a toggle.
- Snap near **horizontal top-edge alignment** by locking the candidate Y coordinate while X remains movable, or **vertical left-edge alignment** by locking X while Y remains movable.
- Start with one snapped axis at a time; show a guide line.
- Suggested thresholds: engage around `10 dp`, disengage around `28 dp` (hysteresis), converted correctly for zoom and screen density. Values are tunable.
- Collision and minimum-gap validation take priority: never force a snapped invalid placement.
- No persisted relationship, snapping history, or alignment metadata.

## 5.7 Drag gesture coordination

- **Viewing:** tap marker navigates/details per host; one-finger drag pans; pinch zooms.
- **Editor:** long-press positioned marker starts drag; long-press tray marker starts placement; ordinary tray swipe scrolls horizontally.
- **While dragging:** map pan/pinch gestures are suspended, **edge auto-pan only** is active. No simultaneous multitouch manipulation of the camera.
- Edge auto-pan should operate near the viewport boundary in all available directions while preserving nonnegative final placement coordinates.
- Release over invalid map location restores prior placement; release over tray unplaces; release over valid map location commits local integer coordinates.
- Reanimated shared values drive frame-by-frame movement; commit working positions when gesture completes, not per animation frame.
- Tap and long-press must be mutually resolved to prevent a drag unintentionally opening details.

---

# 6. Backend domain model and persistence

## 6.1 Ownership and aggregate relationships

`Apiaries` owns the new layout concept. A `HiveId` on a position is a **logical cross-module reference**, not a second ownership source. Module-to-module operations use explicit application-level contracts.

### `ApiaryLayout`

| Field | Storage type | Rule |
|---|---|---|
| `Id` | `uuid` | PK |
| `ApiaryStayId` | `uuid` | NOT NULL, unique FK to Apiaries-owned stay |
| `Version` | `bigint` | NOT NULL, `>= 1`, starts at `1` |
| `CreatedAtUtc` | `timestamptz` | NOT NULL |
| `UpdatedAtUtc` | `timestamptz` | NOT NULL |

Suggested table: `apiaries.apiary_layouts`. Enforce `UNIQUE(apiary_stay_id)`, preventing duplicate layouts under concurrent creation. One layout per stay is an application lifecycle guarantee; the database guarantees **at most** one and the same transaction creates both records.

### `ApiaryLayoutPosition`

| Field | Storage type | Rule |
|---|---|---|
| `LayoutId` | `uuid` | FK to `apiary_layouts` |
| `HiveId` | `uuid` | Logical reference to Hives-owned identity |
| `X` | `integer` | NOT NULL, `CHECK(x >= 0)` |
| `Y` | `integer` | NOT NULL, `CHECK(y >= 0)` |

Suggested table: `apiaries.apiary_layout_positions`. Composite primary key: `(layout_id, hive_id)`.

**No separate `PositionId`, `IsPlaced`, unplaced collection, rotation, explicit canvas size, hive label, hive color, or marker dimensions are persisted.** A hive absent from `positions` is unplaced **only if it belongs to the current active membership**.

## 6.2 Constraints and indexes

- PK on layout ID.
- Unique index on `apiary_stay_id` (also serves direct stay-to-layout lookup).
- Composite PK `(layout_id, hive_id)` (also serves retrieving positions by layout).
- Foreign key from layout to stay, with restrictive/non-cascading stay deletion policy.
- Foreign key from position to layout; position cleanup on an intentional layout deletion may cascade, but normal stay closure never deletes a layout.
- No direct database FK from `hive_id` to private Hives tables; enforce authorization/membership through contracts and coordinated lifecycle operations.
- No index on X or Y in the first release. Add a hive-first index only if a real query warrants it.
- Use named EF mappings/constraints consistently with existing infrastructure conventions.

## 6.3 Lifecycle and migration

1. **New apiary/stay:** create its empty layout in the same transaction as `ApiaryStay` creation, version `1`.
2. **Old active stays:** backfill a new empty layout where missing.
3. **Old completed stays:** backfill an empty layout if adopting the universal one-layout-per-stay invariant, but never imply that it accurately reconstructs historical placement. A later historical API should communicate this limitation.
4. **Stay closure:** freeze its final layout logically. Historical layouts remain queryable by future APIs but are not writable through normal `PUT`.
5. **Whole-apiary relocation:** preserve old layout, create new stay and blank layout; do not require layout editing during relocation.
6. **Partial hive relocation/deactivation:** remove applicable current position records and advance the affected layout version atomically with membership changes.

**Historical nuance:** after a stay closes, its positions may legitimately reference hives that are **no longer active there today**. The current-active-membership invariant applies to **active** stays; do not retroactively clean historical final snapshots based on later membership.

## 6.4 Domain invariants

| ID | Invariant |
|---|---|
| `INV-001` | Every newly created `ApiaryStay` receives exactly one layout. |
| `INV-002` | One hive appears at most once per layout. |
| `INV-003` | Stored X/Y are nonnegative integers. |
| `INV-004` | Current positioned hive IDs form a subset of current active hive IDs for the owning apiary. |
| `INV-005` | All positioned rectangles obey backend-authoritative minimum spacing. |
| `INV-006` | Only the **active stay's** layout may be edited through normal save API. |
| `INV-007` | A completed stay's final positions are preserved. |
| `INV-008` | Membership changes invalidate previously loaded editor snapshots by advancing version. |
| `INV-009` | A stale save cannot replace a newer saved layout. |
| `INV-010` | The frontend cannot grant itself access by supplying a beekeeper/user ID. |

---

# 7. Cross-module contracts and transactions

## 7.1 Responsibilities

| Operation | Owning module |
|---|---|
| Resolve current active hive membership | Hives |
| Resolve hive metadata (ID, label, color, type) | Hives |
| Create/close apiary stays | Apiaries |
| Create, read and replace layout/positions | Apiaries |
| Validate geometry | Apiaries domain/application |
| Change hive stays | Hives |
| Persist relocation record and coordinate relocation | Relocations |
| Enforce common transaction and global Problem Details | Shared infrastructure / API Host, respectively |

Do not inject another module's private DbContext into feature handlers. Avoid circular project references: contracts should live at suitable module boundaries or an existing contracts layer, not force mutual implementation-project dependencies.

## 7.2 Synchronous read composition

The `GET` handler in Apiaries obtains an owner-scoped layout and calls an explicit Hives read contract for active hives and the metadata required by the map. The response is a projection, not the sharing of EF entities across modules. Prevent N+1 database reads.

## 7.3 Cross-module write coordination

Use a **shared, explicit PostgreSQL transaction** for operations spanning Apiaries, Hives, and Relocations. In the EF Core design, participating DbContexts must enlist in the same connection and transaction; use a reusable transaction-coordinator infrastructure abstraction with the existing module implementation patterns. Verify exact integration with the existing Relocations transaction code before implementing.

The orchestrating use-case handler decides **when** the operation happens. Every module executes its own authorized operation and owns its own data. The shared coordinator manages commit/rollback; avoid nested independent commits and concurrent use of one connection/DbContext.

### Partial hive relocation: atomic effects

```text
Relocations handler / transaction coordinator
  1. validate ownership, destination, source and expected stays
  2. acquire consistent concurrency protection
  3. Hives: end source HiveStay(s), start destination HiveStay(s)
  4. Apiaries: remove source current positions, increment source layout version
  5. invalidate destination's current layout version for changed membership
  6. Relocations: record relocation
  7. commit all effects together

After commit:
  navigate to destination map → refetch active hives + layout
  incoming active hives without positions appear in unplaced tray
```

Step 5 is important: **a membership addition also changes the editor's active-hive snapshot**, even when there are no destination positions to remove. Version should change on every affected current layout. A coordinated write path and deterministic lock order must guard against race conditions.

### Whole-apiary relocation: atomic effects

```text
Relocations handler / shared transaction
  1. close previous ApiaryStay
  2. retain its existing final layout untouched
  3. create new ApiaryStay + blank ApiaryLayout
  4. execute any HiveStay updates required by existing domain semantics
  5. persist relocation record
  6. commit

After commit:
  open current map; all active hives initially unplaced
```

A deferred *Use previous layout* operation will later copy eligible positions through its **own authorized transaction**. If it fails, the already completed relocation remains valid.

### Other membership operations

Creating/deactivating/reactivating a hive must also maintain current layout version validity; when membership ends, remove current placement synchronously. Coordinate with the relevant module's established lifecycle handler and transaction boundary.

## 7.4 Concurrency rules

- `ApiaryLayout.Version` starts at `1` and changes after successful writes and relevant membership changes.
- A `PUT` must perform a transactionally atomic check against the client-supplied `expectedVersion` before replacing positions.
- Save and membership-changing workflows must use compatible locking/serialization strategy, so a save cannot resurrect a hive's invalid position after relocation.
- Protect against two requests creating simultaneously active HiveStays via existing constraints plus transactional checks; return a business conflict rather than corrupt data.
- Acquire locks in a documented stable order to reduce deadlocks; use bounded retry handling for safe transient failures where appropriate.
- A stale editor receives `409`, retains its draft, and must explicitly reload or recover manually. **No silent merge or overwrite.**
- Do not keep a DB transaction open while the beekeeper drags markers or configures the editor.

## 7.5 Commit uncertainty and retries

A mobile client may lose the HTTP response after the database committed. The frontend should refetch the layout before assuming a retry conflict means the earlier update failed. The layout PUT is version-conditional, not an invitation to blindly retry with the new version. For relocation commands, consider request-level idempotency keys during final API planning to prevent duplicate business operations.

---

# 8. Backend HTTP API contracts

## 8.1 GET current map

```http
GET /api/apiaries/{apiaryId}/layout
Authorization: Bearer <access_token>
```

**`200 OK`** (representative response):

```json
{
  "layoutId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "apiaryStayId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "version": 3,
  "hives": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "label": "F-01",
      "colorHex": "#E5A339",
      "x": 120,
      "y": 160
    },
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "label": "F-02",
      "colorHex": "#568AC1",
      "x": null,
      "y": null
    }
  ]
}
```

- All **active** hives belonging to the apiary are included, even if unplaced.
- `x` and `y` are either both integers or both `null`; mixed nullability is invalid.
- Read-only query projections should use `AsNoTracking` where applicable.
- Owner-specific authorization is performed on the backend; no owner/beekeeper ID is accepted as proof from the client.
- Apiary with no active stay: define a stable no-active-stay response per error section instead of inventing a layout. A new active stay should always have a layout.
- The GET handler should return membership and layout data from a sufficiently consistent database view for the intended read use case; writes always revalidate regardless of the read snapshot.

## 8.2 PUT replace all placed positions

```http
PUT /api/apiaries/{apiaryId}/layout
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "expectedVersion": 3,
  "positions": [
    { "hiveId": "11111111-1111-4111-8111-111111111111", "x": 120, "y": 160 },
    { "hiveId": "22222222-2222-4222-8222-222222222222", "x": 205, "y": 160 }
  ]
}
```

`positions` is the **entire replacement set** for the current layout; it is not a partial update. Missing current active hive IDs become unplaced. `positions: []` is valid and removes every current position.

**`200 OK`:**

```json
{
  "layoutId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "apiaryStayId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "version": 4,
  "positions": [
    { "hiveId": "11111111-1111-4111-8111-111111111111", "x": 120, "y": 160 },
    { "hiveId": "22222222-2222-4222-8222-222222222222", "x": 205, "y": 160 }
  ]
}
```

The backend performs owner-scoped resolution, active-stay check, transactional concurrency guard, authoritative Hives membership resolution, duplicate/geometry validation, complete position replacement, version increment, and commit. No partial result can be stored.

**API boundary detail:** `PUT` targets the *current* stay obtained from the apiary ID. A request based on the previous stay must fail instead of accidentally writing into a new current stay. `expectedVersion` alone is not an identity check if a new layout also happens to have the same version. Therefore, **the API must bind the save to the originally loaded `apiaryStayId` (or `layoutId`) as an additional precondition**. The exact request representation can be finalized during implementation planning; an explicit `expectedApiaryStayId` in the JSON body is the recommended extension. The canonical JSON above illustrates the previously agreed fields, not a reason to omit this safety requirement. For clarity, the preferred final body is:

```json
{
  "expectedApiaryStayId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "expectedVersion": 3,
  "positions": []
}
```

This is an **implementation-critical safety refinement** for whole-apiary relocation: it prevents a stale editor from writing to a newly created stay whose version was reset to `1`. It does not change the agreed version-in-body strategy.

## 8.3 Status codes and stable errors

Follow project-wide DataAnnotations, semantic exceptions, `GlobalExceptionHandler`, and Problem Details. Example error code namespace: `apiaries.layout_*`; codes are lower-case, stable, dot-separated, with snake-case problem identifiers.

| HTTP | Code | Condition |
|---|---|---|
| `400` | `apiaries.layout_invalid_position` | Coordinates malformed, out of range or otherwise invalid |
| `400` | `apiaries.layout_duplicate_hive` | Same HiveId repeated |
| `400` | `apiaries.layout_collision` | Footprint overlap or insufficient gap |
| `409` | `apiaries.layout_version_conflict` | `expectedVersion` differs |
| `409` | `apiaries.layout_stay_changed` | Current stay differs from client's expected stay |
| `409` | `apiaries.layout_hive_not_in_apiary` | Hive not currently eligible to be placed here |
| `409` | `apiaries.layout_read_only` | Attempt to edit completed stay |
| `409` | `apiaries.layout_no_active_stay` | Apiary currently has no active stay to edit |
| `404` | `apiaries.layout_not_found` | Layout/apiary missing or inaccessible |
| `401` | standard auth response | No valid access token |
| `500` | `server.unexpected_error` | Unexpected failure; no database/stack details leaked |

Follow current API ownership convention: return `404` for another beekeeper's resource without confirming that it exists. `403` remains available for genuinely forbidden operations where the resource is known and visible under established authorization rules.

## 8.4 Structured collision Problem Details

```json
{
  "type": "about:blank",
  "title": "Invalid apiary layout",
  "status": 400,
  "detail": "Hive positions violate the minimum spacing rule.",
  "instance": "/api/apiaries/{apiaryId}/layout",
  "code": "apiaries.layout_collision",
  "traceId": "request-trace-id",
  "violations": [
    {
      "hiveId": "11111111-1111-4111-8111-111111111111",
      "conflictingHiveId": "22222222-2222-4222-8222-222222222222"
    }
  ]
}
```

`code`, `traceId`, and `violations` are Problem Details **extensions**, not a replacement error envelope. Return a bounded number of pairs; the frontend highlights them, keeps the unsaved draft, and remains in the editor. Invalid request shapes use the shared validation behavior already configured in the API Host.

---

# 9. Frontend implementation architecture

## 9.1 Ownership boundaries

Three primary layers must be independent:

```text
HOST FEATURE SCREEN
  - navigation, action eligibility, statistics, data overlays
  - viewport sizing and action bar integration
                │ props/callbacks
                ▼
REUSABLE APIARY MAP ENGINE
  - logical camera, pan/zoom, hit testing and interactions
  - marker placement, drag preview, footprint geometry
  - no knowledge of syrup, Varroa, queen, or navigation paths
                │ renderer + footprint resolver
                ▼
HIVE MARKER COMPONENTS
  - existing colored hive icon + label (MVP)
  - future per-type variants and on-front overlays
```

Use `features/apiaries/layout` for the domain-specific map system. Extract pure generic geometry utilities to `shared` only if another unrelated feature requires them. Avoid an overly generic canvas framework before there is a concrete use case.

## 9.2 Suggested feature structure

```text
src/
  app/(app)/apiaries/[apiaryId]/layout-editor.tsx  # thin Expo Router route, adjust actual path
  features/apiaries/
    api/
      apiary-layout-api.ts
    layout/
      components/
        apiary-map.tsx
        map-viewport.tsx
        hive-marker.tsx
        unplaced-hive-tray.tsx
        map-controls.tsx
      markers/
        hive-marker-registry.ts
        existing-hive-marker.tsx
      geometry/
        coordinates.ts
        collision.ts
        snapping.ts
        footprints.ts
      gestures/
        ...
      hooks/
        use-map-camera.ts
        use-layout-editor.ts
        use-apiary-layout.ts
        use-save-apiary-layout.ts
      types.ts
    screens/
      apiary-layout-editor-screen.tsx
```

This is an organizational guideline, **not** a directive to add empty folders/files or duplicate existing components. Follow the project's one-Expo-codebase, thin-router, NativeWind token, and feature-owned hook conventions.

## 9.3 Map composability contract

The map may accept screen-provided marker rendering, state descriptors, and interaction callbacks, conceptually:

```tsx
<ApiaryMap
  hives={hives}
  positions={positions}
  renderHive={renderHive}
  resolveFootprint={resolveFootprint}
  onHivePress={onHivePress}
  onHiveLongPress={onHiveLongPress}
  interactionMode={interactionMode}
/>
```

This is an illustrative API, not the final prop schema. Crucial design principles:

- **No** `mode="syrup"`, `mode="varroa"`, `mode="queen"` branches in the map engine.
- A host screen owns navigation and business selection/configuration.
- Variant footprint and renderer must correspond consistently.
- A map can be readonly for positions while still interactive for selection/navigation.
- Support disabled/selected/invalid display states without forcing a particular feature model.
- On-front overlays must preserve the underlying hive's visible physical color.

## 9.4 State separation

| State | Owner | Persistence |
|---|---|---|
| Saved layout, current hive metadata, version | TanStack Query | Backend |
| Working positions and dirty state | Editor reducer/hook | Local draft until save |
| Camera, active pointer/drag, live snap guide | Reanimated shared values/map hooks | Not persisted |
| Tray collapse state, selection | Host screen | UI only |
| Future feeding percentages/doses | Feeding/treatment feature | Submitted to that action's API, not layout API |

A background refetch must not silently replace editor working positions. Editing the camera or changing a statistics overlay must not cause a layout PUT.

## 9.5 Local draft storage and recovery

Suggested versioned structure:

```ts
type ApiaryLayoutDraft = {
  schemaVersion: number;
  apiaryId: string;
  apiaryStayId: string;
  baseLayoutVersion: number;
  positions: Array<{ hiveId: string; x: number; y: number }>;
  updatedAtUtc: string;
};
```

- Namespace keys by authenticated identity (and `apiaryStayId`); avoid exposing one account's draft to another on a shared device.
- Restore only after fetching current server data and validating owner/stay/version correspondence.
- `baseLayoutVersion` is the version used to start the editor, not an auto-incrementing local counter.
- On mismatch: preserve the draft for recovery but do not auto-apply or auto-submit it.
- On explicit discard: remove draft; on successful save: remove draft; on failed save: retain draft.
- Schedule writes after completed edits, not on every frame; serialize/debounce pending writes so an older write cannot resurrect a cleared draft.
- On logout/account switch: enforce isolation and appropriate clearing or inaccessibility of the prior account's local draft.
- Preserve working data across transient navigation but do not create an unnecessary global Redux store.

## 9.6 Loading and rendering efficiency

- Retrieve active hives and positions in one GET; derive placed/unplaced once with memoized transformations.
- Use stable marker keys (`hiveId`), stable footprint descriptors, and avoid rerendering every marker during pan/zoom.
- Keep camera and drag animation on the UI thread through Reanimated where practical.
- Use batch metadata queries (not one backend query per hive).
- Keep geometry operations deterministic and separately reusable by editor and renderer.
- Test manually on representative low/mid-range Android hardware, landscape, tablet, and eventually web, without making automated tests part of the initial delivery.

---

# 10. User journeys and screen contracts

## 10.1 Apiary Details (MVP)

```text
[Existing apiary header, stay/location and domain details]
[Raspored košnica                      Uredi raspored]
[        interactive map, width 100%, height ~50vh       ]
[Nepostavljene košnice (N)             Expand/Collapse]
[ <F-08>  <F-12>  <F-19>  ... horizontal scroll       ]
[Other existing Apiary Details content / contextual actions]
```

- Tap placed marker or unplaced tray card → Hive Details.
- Map pan/zoom, no placement edits on this screen.
- App's shared contextual action bar remains responsible for entity actions; editor may be accessed through that established mechanism or an appropriate map-section action.

## 10.2 Layout editor (MVP)

```text
[Screen header: Uredi raspored                  Cancel]
[Toolbar: number placed / total; snapping toggle; controls]
[          interactive map, width 100%, ~60vh          ]
[Nepostavljene košnice (N)            Expand/Collapse]
[ <F-08>  <F-12>  <F-19> ... horizontal drag tray ]
[             Otkaži             Sačuvaj               ]
```

- Editor occupies its own route/screen; map is not full height.
- Tray is separate from the map region and never obscures map markers.
- Full-width map receives its height from host screen.
- Save/Cancel and tray controls respect safe areas and touch targets.
- Screen's long-press/drag semantics override normal details navigation.

## 10.3 Relocating selected hives (MVP)

```text
User submits relocation of selected hives
  → backend transfers membership + removes source current positions
  → versions for affected current layouts advance
  → transaction commits
  → destination map opens
  → GET returns destination active hives
  → transferred hives have x=null, y=null
  → beekeeper may arrange them later
```

No destination layout arrangement is required for relocation success.

## 10.4 Relocating whole apiary (MVP and deferred extension)

```text
Relocation confirmed → prior ApiaryStay closes
                     → historical layout frozen
                     → new ApiaryStay + empty layout
                     → destination map displays unplaced active hives

Later extension (NOT MVP):
"Koristi prethodni raspored" or "Kreiraj novi raspored"
  → copy eligible positions into an editable draft of new layout
  → save through normal versioned write path
```

## 10.5 Future bulk-action map (architectural contract)

```text
User opens Syrup Feeding
  → active hives + map layout loaded
  → hives without feeders shown as ineligible
  → tap eligible hive = select at 100% of its feeder capacity
  → tap selected hive = deselect, removing its action configuration
  → long-press = select if needed and open per-hive configuration
  → unplaced active hives also selectable in collapsible tray
  → confirm group action through Hives action API (NOT map PUT)
```

The map engine only renders/handles gestures; feeding, dosing, rules, totals and writes belong to action modules.

## 10.6 Future statistics map (architectural contract)

A screen selects an overlay mode (last inspection, queen color, feeding, treatment, etc.) and supplies relevant per-hive projection data to the existing map. The positions and camera behavior do not change. Overlay information appears on the **front face of the marker**, preserves the visible hive color, and fits the marker's reserved footprint. Different screens can maintain independent camera state.

---

# 11. Security, privacy, and authorization

1. All layout API endpoints require validated bearer authentication through the project's existing OpenIddict-based flow.
2. Resolve current authenticated Identity user and associated beekeeper context **server-side**. Never accept a frontend-provided owner ID as proof of ownership.
3. Scope Apiary and ApiaryStay queries by owner/beekeeper relationship; inaccessible IDs should follow the existing 404 convention to avoid resource existence leakage.
4. Hives module membership queries must also enforce the appropriate beekeeper scope; a layout PUT cannot place arbitrary known GUIDs belonging to other users.
5. Retain domain permission boundaries for future worker/manager roles, if introduced. Frontend disabled buttons are not authorization.
6. Do not expose raw database exceptions, stack traces, other users' hive labels, or internal module persistence details in Problem Details responses.
7. Local drafts are account-scoped; storage and logout behavior must prevent accidental cross-account recovery.
8. Keep collision violations limited to IDs of hives that the caller is authorized to see in the target apiary.

---

# 12. Reliability, performance, and operations

## 12.1 Scalability expectations

- Design for **1000+ distinct authenticated users** and normal concurrent API traffic.
- Typical layout size is expected to be tens to low hundreds of hives, not thousands of markers in one viewport by default.
- Whole-layout PUT is appropriate at this scale, with bounded payload and per-apiary authorization.
- Basic pairwise collision validation is acceptable initially for tens/low hundreds of positions; if extreme per-apiary counts emerge, profile and consider spatial partitioning.
- Use database constraints for uniqueness/integrity; do not replace them with query-before-insert checks.
- No X/Y spatial indexes are warranted until actual spatial query requirements exist.

## 12.2 Network and error states

- GET can be cached by TanStack Query; invalidate after layout save, relocation, deactivation/reactivation and relevant membership changes.
- No autosave of each drag to backend; explicit Save is the authoritative commit.
- Failed PUT preserves local changes; an offline/failed request does not pretend the layout was saved.
- 409 conflicts require user-visible recovery/reload, not silent overwrite.
- Read failures should preserve navigability of Apiary Details and provide retry UI.
- Log structured server errors and trace IDs per existing global error conventions.

## 12.3 Accessibility and mobile usability

- Ensure readable labels, sufficient contrast on colored hive bodies, and non-color-only selection feedback.
- Provide accessible names and state (selected, disabled, unplaced) for hive markers/cards.
- Long-press-only actions should have an alternative contextual control for accessibility; in the editor, **Ukloni sa rasporeda** already provides a non-drag removal path.
- Maintain comfortable touch targets and prevent accidental navigation during panning.
- Respect safe-area insets and parent action bar padding, as required by the project's contextual action bar guide.

---

# 13. Acceptance criteria (manual review for initial release)

Automated tests are **deferred at the user's request**. The following remain functional acceptance requirements to check during development or manual review.

## 13.1 Backend acceptance

- [ ] Creating a new `ApiaryStay` creates exactly one empty layout with version `1` in the same transaction.
- [ ] Migration backfills missing layouts without fabricating historical positions.
- [ ] GET returns all current active hives, including those without positions; both coordinates are null together.
- [ ] PUT saves a valid complete set, advances version, and returns authoritative response.
- [ ] PUT with `positions: []` leaves no placed hives.
- [ ] PUT rejects duplicate IDs, negative/invalid coordinates, collisions, and nonmember hives with consistent errors.
- [ ] PUT requires correct version **and current stay identity**.
- [ ] Concurrent stale saves cannot overwrite the committed layout.
- [ ] Hive transfer/deactivation removes source current positions and updates affected layout versions atomically.
- [ ] Whole-apiary relocation preserves the completed stay layout and creates an empty layout for the new stay.
- [ ] Unauthorized access does not reveal another beekeeper's data.
- [ ] Collision errors identify authorized conflicting hive pairs in `violations`.

## 13.2 Frontend acceptance

- [ ] Apiary Details renders existing hive icon in each hive's configured color and label, at stored logical coordinates.
- [ ] Tapping a placed hive opens Hive Details; panning does not accidentally navigate.
- [ ] Unplaced hives are accessible in a collapsible horizontal section beneath the map.
- [ ] Editor opens at camera `(0,0)` and zoom `1`, independent of details camera.
- [ ] Long-press from tray places a hive; long-press on map repositions it; dragging into tray unplaces it.
- [ ] Invalid drops revert correctly and show clear feedback; no other hive moves automatically.
- [ ] Magnetic alignment works with opt-out, guides, and collision precedence.
- [ ] Edge auto-pan works while dragging; simultaneous pinch is disabled during drag.
- [ ] Map uses full host width and appropriate responsive 50–60% viewport-height defaults.
- [ ] Panning, zooming, or tray expansion do not mark the layout dirty.
- [ ] Back navigation with unsaved changes offers Continue/Discard; Discard leaves backend unchanged.
- [ ] Local draft survives forced app termination and only restores when identity, stay and version are compatible.
- [ ] Successful save clears draft and refreshes map; failures keep draft.
- [ ] Relocated hives appear unplaced in destination without forcing immediate layout editing.

## 13.3 Deferred acceptance items (not MVP)

- [ ] Post-relocation layout copy using historical prior layout (future API).
- [ ] Historical layout display (future API).
- [ ] Nucleus marker visual variant and footprint switching (future).
- [ ] Bulk feeding/treatment map screens (future).
- [ ] Statistics overlay screens (future).
- [ ] Automated integration, concurrency, UI, and performance test suites (future).

---

# 14. Implementation planning handoff

This document is a **feature specification**, not the step-by-step implementation plan. Recommended planning workstreams, in dependency order:

1. **Backend persistence and API:** entity mapping; migrations/backfill; membership read contract; GET/PUT with transactional version/stay guards and Problem Details.
2. **Frontend shared map:** measured viewport/camera transformations, current marker renderer, pan/pinch, read-only Apiary Details integration, collapsible unplaced tray.
3. **Editor:** gestures, drag overlay across map/tray, variable-footprint collision abstraction, snapping, working copy and Save/Cancel.
4. **Draft recovery:** versioned per-account local persistence, restoration, conflict recovery, TanStack Query invalidation.
5. **Lifecycle integration:** create blank layouts with stays, source cleanup for transferred/deactivated hives, shared PostgreSQL transaction coordination, version invalidation and post-relocation navigation.
6. **Manual acceptance pass:** verify section 13 without making automated testing a release prerequisite for this requested phase.

Before coding, inspect existing repository structure, actual `ApiaryStay`/`HiveStay` semantics, Relocations transaction implementation, current hive icon asset, existing Apiary Details UI/action bar, and validation infrastructure. Extend existing modules/contracts rather than creating parallel abstractions.

## 14.1 Remaining implementation-level parameters

These do **not** reopen the product decisions above:

- Measured standard marker reserved footprint and minimum logical gap.
- Exact zoom limits and edge-auto-pan speed/activation boundary.
- Precise React Native gesture composition for drag crossing tray and map.
- Whether a collision violation returns first N pairs or a deterministically sorted bounded set.
- Actual existing route naming and existing module contract placement.
- Concrete EF Core transaction-coordinator implementation and lock acquisition order.
- Appropriate bounded PUT payload size after observing expected maximum apiary size.
- The exact safe-area-aware screen sizing rules for small phones and tablets.

## 14.2 Post-MVP extension contracts

| Extension | Reuse | New responsibility |
|---|---|---|
| Nucleus hive | Map camera, drag, geometry engine | Variant catalog, footprint + renderer, safe type-change policy |
| Syrup feeding | Marker selection callbacks, unplaced tray | Feeder eligibility, default 100%, quantity calculations and action API |
| Patty feeding | Same selection UX | Patty mass/type and per-hive controls |
| Varroa treatments | Same selection UX | Product/method/dose eligibility and action API |
| Widgets/statistics | Same positions and marker renderer boundary | Batched per-hive read projections, overlay selector |
| Copy prior layout | Same versioned PUT/save workflow | Authorized historical-source read and copy workflow |
| Layout history | Existing current layout kept intact | Revision/snapshot model with timestamps and retention policy |

**Never implement these as action-specific branches inside the shared camera/map engine.** The consuming feature owns business state and passes rendering/interaction configuration into reusable presentation components.

---

# 15. Final decision register

| Topic | Approved decision |
|---|---|
| Placement ownership | Apiaries module; one layout per `ApiaryStay` |
| Position storage | One row per placed hive; unplaced derived |
| Coordinates | Integer logical X/Y, nonnegative, top-left origin |
| Canvas | No fixed logical extent; grows right/down |
| History | Final layout per completed stay only; no intra-stay revision history |
| Initial marker | Reuse existing hive icon for every hive |
| Future marker dimensions | Variant-specific footprint; nucleus narrower |
| Geometry | Prevent collisions and minimum-gap violations |
| Alignment | Default-on magnetic edge alignment, optional disable |
| Camera | New screen initializes `(0,0)`, zoom `1`; no camera passing |
| Gestures | Long-press drag in editor, pinch/pan normally; edge auto-pan only while dragging |
| Map size | Full width, ~50% height in Details, ~60% in editor, configurable elsewhere |
| Tray | Collapsible, horizontal, separate region beneath map |
| Details tap | Direct navigation to Hive Details |
| Map engine | Configurable marker rendering and interaction callbacks; no action-specific business modes |
| Save API | Full replacement `PUT`; `expectedVersion` in body; atomic |
| Conflict | Reject outdated write, HTTP 409, preserve local draft |
| Local drafts | Device-local, account/stay-scoped, recoverable |
| Errors | Project Problem Details plus structured collision pairs |
| Cross-module interaction | Explicit synchronous contracts, shared PostgreSQL transaction |
| Individual transfer | Remove source position; incoming destination hive unplaced |
| Entire apiary relocation | Preserve old stay layout, create blank new layout; no forced layout editing |
| Copy previous layout | After relocation in a **future** release, not part of MVP |
| Future bulk-action gesture | Tap toggle; long-press select-if-needed and configure |
| Initial automated tests | Deferred |

---

# 16. Reference conventions

This specification was reconciled against the supplied project materials:

1. **Pčelarski eDnevnik – Frontend Architecture** — Expo Router thin routes, feature ownership, TanStack Query, NativeWind, mobile-first and web reuse.
2. **Pčelarski eDnevnik — Validation and Error Handling Guide** — DataAnnotations, domain invariants, SharedKernel semantic conflicts, global `ProblemDetails`, stable codes, ownership-scoped queries.
3. **Current User Identification and Data Ownership** — backend-derived OpenIddict subject and beekeeper ownership; no trust in user IDs sent by frontend.
4. **Contextual Action Bar — Implementation Specification** — screen-owned contextual actions, safe areas, and avoiding duplication of entity action navigation.
5. **Feature design discussion (Steps 1–6.9)** — product decisions on layouts, relocation lifecycle, editing gestures, viewport behavior, drafts, and future action/statistics reuse.

**End of specification.**
