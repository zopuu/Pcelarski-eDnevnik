# Contextual Action Bar — Implementation Specification

## 1. Purpose

Implement a reusable `ContextualActionBar` for entity/detail screens.

It is not application navigation. It contains actions related to the entity currently being viewed.

Examples:

- Apiary → add hive, edit, more
- Hive → inspection, actions, edit, more
- Forage profile → observation, edit, more
- Queen / colony / relocation → equivalent context-specific actions

Forms such as Create/Edit screens do not display the contextual action bar.

## 2. Mobile layout

The mobile action bar contains a maximum of five positions:

`Secondary | Secondary | PRIMARY | Edit/Secondary | More`

The center action is visually dominant:

- raised above the action bar,
- hexagonal shape,
- honey/orange primary color,
- icon inside,
- short label underneath.

Other actions:

- normal icons without surrounding circles,
- short text label,
- consistent spacing,
- sufficiently large invisible touch area.

The rightmost action should normally be:

`Više / More → ...`

for less common operations.

## 3. Primary action

The hexagonal button represents the most important/frequent contextual action, not necessarily Create.

Examples:

- Hive → Pregled
- Apiary → Košnica
- Forage → Zapažanje
- Relocation → Završi
- Harvest → Vrcanje

Visible labels should remain short.

For complex actions:

- Visible: `Zapažanje`
- Accessibility label: `Dodaj zapažanje paše`

The icon supports recognition, but the text label remains the main explanation.

## 4. Reusable component

Place it in shared UI infrastructure, for example:

```text
src/shared/components/contextual-action-bar/
    contextual-action-bar.tsx
    action-overflow-sheet.tsx
    types.ts
```

The component must contain no Apiary/Hive/Queen-specific business logic.

Individual feature screens provide the actions they require.

Conceptually:

```ts
type ContextualAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;

  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
  loading?: boolean;
};
```

Usage should resemble:

```tsx
<ContextualActionBar
  primaryAction={primaryAction}
  leftActions={leftActions}
  rightActions={rightActions}
/>
```

Avoid APIs such as `button1Text`, `button2Icon`, `button3Press`, etc.

## 5. Safe-area handling

The bar must never overlap Android system navigation.

Use `react-native-safe-area-context` and `useSafeAreaInsets()`.

The bar should account for:

```text
action bar height
+
device bottom safe-area inset
```

Do not use a fixed `bottom: 20` or assume a particular Android navigation-bar height.

Screen content must also receive sufficient bottom padding so the final content item cannot be hidden underneath the action bar.

This should eventually be handled by the shared `Screen` layout rather than independently by every feature screen.

## 6. More menu

`... More` opens a bottom sheet on mobile.

It contains:

- uncommon actions,
- lifecycle actions,
- administrative actions,
- destructive actions.

Example structure:

```text
More
────────────────
Move
Deactivate
History
Other options
────────────────
Delete
```

Dangerous operations such as Delete should normally not occupy a permanent action-bar position.

They should have:

- danger styling,
- confirmation where necessary,
- appropriate backend validation.

## 7. Domain action menu

For screens with many operational actions, a normal secondary button may open a second action sheet.

Example Hive:

```text
History | Actions | [INSPECTION] | Edit | More
```

`Actions` could contain:

```text
Feeding
Treatment
Add/remove super
Move colony
...
```

`More` remains for entity-management operations:

```text
Stay history
Deactivate
Delete
...
```

This prevents one overflow menu from becoming a mixture of unrelated operations.

## 8. Dynamic behavior

Actions may depend on entity state.

For example:

```text
Active relocation
→ Complete available

Completed relocation
→ Complete hidden

Active hive
→ Deactivate available

Inactive hive
→ Deactivate hidden
```

The component therefore needs to support `hidden` and `disabled`.

Later the same mechanism can support owner/manager/worker permissions. Hiding an action is only frontend UX; backend authorization must still enforce access.

## 9. Hexagonal visual system

The center hexagon should become a recognizable Pčelarski eDnevnik design element.

Use the hexagonal/honeycomb motif primarily for:

- contextual primary action,
- selected/highlighted elements,
- occasional decorative patterns,
- badges/illustrations where appropriate.

Do not turn every card, input and button into a hexagon.

Normal UI components should remain conventional:

- rectangular/rounded cards,
- normal forms,
- standard lists,
- standard dialogs.

The honeycomb motif should provide identity without reducing usability.

## 10. Web behavior

Reuse the same action definitions, but render them differently on desktop.

Mobile:

```text
History | Actions | [HEX PRIMARY] | Edit | More
```

Desktop/web:

```text
Page title

[History] [Actions]       [Primary Action] [Edit] [More]
────────────────────────────────────────────────────────
Content
```

The web version should normally be a contextual toolbar near the page heading rather than a large fixed footer.

Business/action configuration stays shared; only presentation changes.

## 11. Accessibility and touch behavior

Every action should have:

- visible text whenever practical,
- accessibility label,
- minimum comfortable touch target,
- pressed/disabled/loading feedback.

The visual icon can remain relatively small while its Pressable area is approximately 44–48 px or larger.

The raised primary hexagon can use a larger target, roughly 56–64 px.

## 12. Initial implementation scope

Build the component generically and initially validate it on only a few screens:

- Apiary Details
- Hive Details
- Forage Profile

Once those work correctly, Queen, Colony, Relocation, Harvest and other screens should mainly require new action configuration, not new footer implementations.

The key architectural rule is:

```text
Feature screen decides WHAT actions exist
                ↓
ContextualActionBar decides HOW they look
                ↓
Mobile and Web render the same actions differently
```

That keeps it reusable, responsive and easy to extend as the application grows.
