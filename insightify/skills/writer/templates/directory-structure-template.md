---
title: "Directory Structure"
description: "Feature-based modular folder architecture for navigation and onboarding"
audience: "developers"
sources:
  - directory-structure.md
---


## Overview

This project follows a **feature-based modular architecture** organized by domain rather than technology. This structure scales well for medium-to-large teams and promotes clear module boundaries.



## Complete Folder Tree

<details open>
<summary><strong>src/</strong> — Application source root</summary>

<details open>
<summary><strong>assets/</strong> — Static assets (images, fonts, icons, favicons)</summary>

```
assets/
├── images/         # Illustrations, photos, backgrounds
├── icons/          # SVG icons, favicon variants
└── fonts/          # Self-hosted web fonts
```
</details>

<details open>
<summary><strong>components/</strong> — Shared/global reusable components</summary>

```
components/
├── ui/             # Primitive UI components (Button, Input, Modal, Table, Card, etc.)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   ├── Table/
│   ├── Card/
│   ├── Toast/
│   ├── Dropdown/
│   ├── Tabs/
│   ├── Tooltip/
│   ├── Avatar/
│   ├── Badge/
│   ├── Spinner/
│   ├── Skeleton/
│   └── index.ts           # Barrel export
│
├── layout/         # Layout shell components
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Footer/
│   ├── TopHeader/
│   ├── MainWrapper/
│   ├── Breadcrumbs/
│   └── index.ts
│
└── feedback/       # Feedback/notification components
    ├── ToastContainer/
    ├── Alert/
    ├── ConfirmDialog/
    └── index.ts
```
</details>

<details open>
<summary><strong>features/</strong> — Domain-driven feature modules (core business logic)</summary>

```
features/
├── auth/           # Authentication feature
│   ├── components/     # LoginForm, RegisterForm, PasswordResetForm
│   ├── api/            # authApi.ts (login, register, refresh, logout)
│   ├── hooks/          # useAuth, usePermissions, useLogin
│   ├── types/          # Auth-specific types (Credentials, Tokens)
│   └── index.ts
│
├── users/          # User management feature
│   ├── components/     # UserList, UserCard, UserProfile, UserForm
│   ├── api/            # usersApi.ts (CRUD operations)
│   ├── hooks/          # useUsers, useUser, useUserMutations
│   ├── types/          # User, UserRole, UserFilters
│   └── index.ts
│
├── products/       # Product catalog feature
│   ├── components/     # ProductGrid, ProductCard, ProductDetail, ProductForm
│   ├── api/            # productsApi.ts
│   ├── hooks/          # useProducts, useProduct
│   ├── types/          # Product, Category, ProductFilters
│   └── index.ts
│
└── [featureName]/  # Additional features follow same pattern
    ├── components/
    ├── api/
    ├── hooks/
    ├── types/
    └── index.ts
```
</details>

<details open>
<summary><strong>hooks/</strong> — Global custom hooks (cross-feature)</summary>

```
hooks/
├── useFetchData.ts         # Generic data fetching hook
├── useMutation.ts          # Generic mutation hook
├── useInfiniteQuery.ts     # Pagination/infinite scroll
├── useDebounce.ts          # Debounced value hook
├── useLocalStorage.ts      # Persisted state hook
├── useMediaQuery.ts        # Responsive breakpoint hook
├── useTheme.ts             # Theme access hook
├── useAuth.ts              # Auth state hook (re-export from auth feature)
└── index.ts
```
</details>

<details open>
<summary><strong>pages/</strong> — Route-level components (page compositions)</summary>

```
pages/
├── public/         # Public pages (no auth required)
│   ├── LandingPage/
│   ├── AboutPage/
│   ├── PricingPage/
│   ├── ContactPage/
│   ├── NotFoundPage/
│   └── index.ts
│
├── auth/           # Authentication pages (guest only)
│   ├── LoginPage/
│   ├── RegisterPage/
│   ├── ForgotPasswordPage/
│   ├── ResetPasswordPage/
│   └── index.ts
│
└── dashboard/      # Protected pages (auth required)
    ├── DashboardHome/
    ├── UsersPage/
    ├── ProductsPage/
    ├── SettingsPage/
    ├── ProfilePage/
    └── index.ts
```
</details>

<details open>
<summary><strong>routes/</strong> — Routing configuration & guards</summary>

```
routes/
├── routes.tsx              # Main route configuration
├── guards/
│   ├── PublicRoute.tsx     # Redirects authenticated users away
│   ├── PrivateRoute.tsx    # Redirects unauthenticated users to login
│   └── RoleRoute.tsx       # Role-based access control
├── routeTree.ts            # Type-safe route definitions (if using TanStack Router)
└── index.ts
```
</details>

<details open>
<summary><strong>services/</strong> — API client & interceptors</summary>

```
services/
├── apiClient.ts        # Axios/Fetch instance with base config
├── interceptors/
│   ├── authInterceptor.ts      # Bearer token injection
│   ├── loggingInterceptor.ts   # Request/response logging
│   └── errorInterceptor.ts     # Global error normalization
├── endpoints.ts        # API endpoint constants
└── index.ts
```
</details>

<details open>
<summary><strong>stores/</strong> — Global state management (Zustand)</summary>

```
stores/
├── useAuthStore.ts     # Authentication state (user, tokens, permissions)
├── useAppStore.ts      # App-wide state (theme, sidebar, notifications)
├── useFeatureStore.ts  # Feature-specific stores (optional, per feature)
├── middleware/
│   ├── persist.ts      # Zustand persist middleware config
│   ├── logger.ts       # Development logging
│   └── immer.ts        # Immutable updates with Immer
└── index.ts
```
</details>

<details open>
<summary><strong>types/</strong> — Global TypeScript interfaces & types</summary>

```
types/
├── common.ts           # BaseEntity, ApiResponse, PaginatedResponse
├── user.ts             # User, UserRole, UserProfile
├── api.ts              # Request/Response types, Error types
├── config.ts           # Env config, feature flags, theme config
├── forms.ts            # Form validation schemas (Zod/Yup)
└── index.ts
```
</details>

<details open>
<summary><strong>utils/</strong> — Pure utility functions</summary>

```
utils/
├── formatters.ts       # Date, currency, number formatting
├── validators.ts       # Validation helpers
├── helpers.ts          # General helpers (clsx, classNames, etc.)
├── constants.ts        # App-wide constants
├── storage.ts          # LocalStorage/SessionStorage wrappers
└── index.ts
```
</details>

</details>

---

## Module Boundary Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Features don't import features** | `features/auth` cannot import `features/users` | ESLint rule: `no-restricted-imports` |
| **Features import from shared only** | `features/*` can import from `components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/` | Architecture decision |
| **Shared never imports features** | `components/ui`, `hooks`, `services` never import from `features/` | ESLint rule |
| **Pages compose features** | `pages/*` import from `features/*/components` and `features/*/hooks` | By convention |
| **Barrel exports only** | Import from `features/auth` not `features/auth/hooks/useAuth` | `index.ts` exports |



---

## Import Path Conventions

```typescript
// ✅ GOOD — Barrel exports
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useFetchData } from '@/hooks';
import { apiClient } from '@/services';

// ❌ AVOID — Deep imports
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

// ✅ GOOD — Relative for same feature
import { UserCard } from '../components/UserCard';
import { useUsers } from '../hooks/useUsers';
```



---

## Scaling Guidelines

| Project Size | Features | Shared Components | Recommendation |
|--------------|----------|-------------------|----------------|
| Small (<5 features) | 3-5 | 10-15 | Current structure works well |
| Medium (5-15 features) | 5-15 | 15-30 | Consider splitting `components/ui` into subfolders |
| Large (15+ features) | 15+ | 30+ | Extract shared components to separate package/library |

