# Pčelarski eDnevnik – Frontend Architecture

## 1. Core approach

The frontend will be built as **one Expo + React Native + TypeScript codebase** for:

- Android
- iOS
- Web

The application is **mobile-first**. Android/iOS are the primary targets during development. Web should initially reuse the same screens and logic, with more advanced desktop-specific layouts added later only where needed.

## 2. Main frontend stack

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- TanStack Query
- React Hook Form
- Zod

Authentication remains based on the existing OpenIddict flow.

## 3. Recommended project structure

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── (auth)/
│   │   └── ...
│   │
│   ├── auth/
│   │   ├── callback.tsx
│   │   └── logout-callback.tsx
│   │
│   └── (app)/
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── apiaries/
│       ├── hives/
│       ├── profile/
│       └── ...
│
├── features/
│   ├── auth/
│   ├── apiaries/
│   ├── locations/
│   ├── apiary-stays/
│   ├── hives/
│   ├── colonies/
│   ├── queens/
│   ├── inspections/
│   └── ...
│
├── providers/
│   ├── auth-provider.tsx
│   └── query-provider.tsx
│
└── shared/
    ├── api/
    ├── components/
    ├── config/
    ├── errors/
    ├── hooks/
    ├── storage/
    ├── theme/
    ├── types/
    └── utils/
```

## 4. Responsibilities

### `src/app`
Contains **routing and layouts only**.

Route files should stay thin and forward rendering to feature screens.

Example:

```tsx
export { ApiariesListScreen as default }
  from '@/features/apiaries/screens/apiaries-list-screen';
```

### `src/features`
Contains business functionality.

Typical feature:

```text
features/apiaries/
├── api/
├── components/
├── hooks/
├── schemas/
├── screens/
└── types/
```

Do not create empty folders unnecessarily. Add them as the feature grows.

### `src/shared`
Contains reusable application-wide code:

- API client
- generic UI components
- storage
- theme
- utilities
- shared hooks
- common types

### `src/providers`
Contains application-level providers such as:

- authentication
- TanStack Query
- later theme/localization if needed

## 5. NativeWind and design system

NativeWind will be the main styling approach.

Use semantic design tokens such as:

```text
primary
secondary
background
surface
foreground
muted
border
success
warning
error
```

Avoid scattering raw colors such as `yellow-500` or `red-600` throughout feature code.

Create reusable components such as:

```text
shared/components/
├── button/
├── input/
├── card/
├── badge/
├── screen/
├── modal/
├── loading-indicator/
└── error-state/
```

Example usage:

```tsx
<Button variant="primary">
  Sačuvaj
</Button>
```

instead of rebuilding the same Pressable styling on every screen.

## 6. Mobile-first rule

Design every feature for native first:

```text
Android / iOS
      ↓
primary implementation
      ↓
Web reuses same feature
```

Initial priorities:

- touch-friendly controls
- mobile navigation
- responsive forms
- readable cards/lists
- safe areas
- keyboard handling
- loading/error/empty states
- good performance on slower phones

Do not delay native development to perfect desktop layouts.

## 7. Web strategy

Initially, web should reuse the native-oriented screens wherever practical.

Later, improve desktop UX with:

- wider content containers
- tables instead of cards where useful
- sidebars instead of bottom tabs
- multi-column layouts
- larger forms
- desktop-specific navigation

Only create platform-specific files when the UX genuinely needs to differ.

Examples:

```text
app-navigation.native.tsx
app-navigation.web.tsx

location-picker.native.tsx
location-picker.web.tsx
```

Most business logic, API code, validation, types, hooks and feature logic should remain shared.

## 8. Data flow

Typical feature flow:

```text
Expo Router
    ↓
Feature Screen
    ↓
Feature Hook
    ↓
TanStack Query
    ↓
Feature API Function
    ↓
Shared API Client
    ↓
ASP.NET Core API
```

Example:

```text
/apiaries
    ↓
ApiariesListScreen
    ↓
useApiaries()
    ↓
getApiaries()
    ↓
apiClient
    ↓
GET /api/apiaries
```

## 9. State management

Use the appropriate tool for each state type:

```text
Authentication/session → AuthProvider

Backend/server data     → TanStack Query

Form state              → React Hook Form

Validation              → Zod

Local UI state          → useState / useReducer
```

Do not introduce Redux or another global store unless a concrete need appears.

## 10. Platform-specific code

Prefer shared code.

Use platform-specific implementations only when necessary:

```text
secure-storage.native.ts
secure-storage.ts

query-online-manager.native.ts
query-online-manager.ts
```

Avoid filling normal screens with many `Platform.OS` checks.

## 11. Routing

Expo Router uses file-based routing.

Examples:

```text
src/app/(app)/apiaries/index.tsx
→ /apiaries

src/app/(app)/apiaries/[apiaryId]/index.tsx
→ /apiaries/:apiaryId

src/app/(app)/apiaries/[apiaryId]/edit.tsx
→ /apiaries/:apiaryId/edit
```

Route groups such as `(app)` and `(auth)` organize routes without becoming part of the URL.

## 12. Development order

After authentication:

1. Finalize folder conventions.
2. Configure NativeWind and design tokens.
3. Build core shared UI components.
4. Finalize authenticated navigation.
5. Build Apiaries List.
6. Build Apiary Details.
7. Build Create/Edit Apiary.
8. Add Location and Apiary Stay UI.
9. Continue feature-by-feature.

The goal is to build complete vertical slices rather than large amounts of disconnected frontend infrastructure.

## Final rule

The project should follow this principle:

```text
ONE EXPO CODEBASE
       ↓
MOBILE-FIRST UI
       ↓
SHARED BUSINESS LOGIC
       ↓
WEB REUSES THE SAME CODE
       ↓
DESKTOP-SPECIFIC UX ADDED LATER WHERE NEEDED
```

This keeps the frontend scalable while preserving Android/iOS as the primary product experience.
