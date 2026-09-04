---
title: "Design System"
description: "Reusable UI primitives, component inventory, design tokens, and accessibility"
audience: "developers, designers"
sources:
  - design-system.md
---

## Overview

The application uses a **design system** of reusable UI primitives built with React and Tailwind. Components are grouped by scope — primitives, composites, feedback, and data display — and are styled via design tokens (CSS variables) so theming stays consistent across light and dark modes.

---

## 1. Component Categories

| Category | Components |
|----------|------------|
| Primitive | Button, Input, Modal, Badge, Card |
| Composite | Dropdown Menu, Tabs, Table |
| Feedback | Toast, Alert, Spinner |
| Data Display | DataTable, StatCard |

---

## 2. Primitive Components

### Button
```tsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-text hover:bg-primary-hover',
        secondary: 'bg-surface-2 text-foreground hover:bg-surface-3',
        ghost: 'text-foreground hover:bg-surface-2',
        danger: 'bg-error text-white hover:bg-error-hover',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export function Button({ variant, size, isLoading, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {isLoading ? <Spinner className="h-4 w-4" /> : children}
    </button>
  );
}
```

### Input
```tsx

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, hint, leftIcon, rightIcon, className, id, ...props }: InputProps) {
  const inputId = id || useId();
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full h-10 rounded-md border bg-surface px-3 text-sm',
            leftIcon && 'pl-10',
            error ? 'border-error' : 'border-border',
            className
          )}
          {...props}
        />
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
```

### Modal
```tsx

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-lg bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
```

---

## 3. Composite Components

### Dropdown Menu
- Trigger-controlled popover with keyboard navigation (arrow keys, Enter/Escape).
- `@headlessui`/Radix Menu primitives for accessible behavior.

### Tabs
- Accessible tab list with `role="tablist"`, `aria-selected`, and keyboard arrow support.
- Lazy-mount inactive panels to keep bundle slim.

---

## 4. Feedback Components

### Toast System
- Global `Toaster` mounted once in the root layout; `useAppStore.pushToast()` dispatches notifications.
- Variants: success, error, warning, info; auto-dismiss after a configurable duration.

---

## 5. Data Display Components

### DataTable (TanStack Table Wrapper)
- Wraps `@tanstack/react-table` for sorting, filtering, and pagination with a consistent visual style.

---

## 6. Component Registry Table

| Component | Type | Variants | Status |
|-----------|------|----------|--------|
| Button | Primitive | primary, secondary, ghost, danger | ✅ |
| Input | Primitive | default, error, with-icon | ✅ |
| Modal | Primitive | base, with-footer | ✅ |
| Badge | Primitive | neutral, success, warning, error | ✅ |
| Dropdown Menu | Composite | base, command | ✅ |
| Tabs | Composite | underline, boxed | ✅ |
| Toast | Feedback | success, error, warning, info | ✅ |
| DataTable | Data Display | sortable, paginated | ✅ |

---

## 7. Design Token References

Design tokens are exposed as CSS variables on `:root` (light) and `[data-theme="dark"]` (dark), defined in `styles.css`.

```css

:root {
  --color-surface: #ffffff;
  --color-foreground: #1a1a1a;
  --color-primary: #60a5fa;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --font-sans: 'IBM Plex Sans', -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
}
```

### Spacing & Typography
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48` (Tailwind default).
- Type scale: `text-xs` → `text-4xl`; headings use `IBM Plex Sans` (sans-serif), code uses `IBM Plex Mono`.

---

## 8. Accessibility Checklist

- [ ] Every interactive component has an accessible name (visible label or `aria-label`).
- [ ] Focus is visible and managed on modal/dialog open and close.
- [ ] Color is never the sole conveyer of state (add icon/text alongside success/error colors).
- [ ] Text and interactive targets meet WCAG AA contrast and touch-target (≥ 44px) sizing.
- [ ] Keyboard: all components operable via Tab/Enter/Space/Arrows; Escape closes overlays.

---

## 9. Usage Guidelines

- Use components from the registry instead of ad-hoc markup where a primitive already exists.
- Apply design tokens (CSS variables) rather than hard-coded color/type values.
- Do not invent new utility classes; extend the design system through the token layer.
