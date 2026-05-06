# Theme & Appearance Implementation Specification

> **Feature Scope:** Dark/Light Theme Toggle & Reader Appearance Settings
> **Target Architecture:** Next.js 14 App Router, TailwindCSS, Zustand, Prisma

---

## 1. Overview
This document specifies the implementation plan for the **Theme Switching (Dark/Light)** functionality and related **Reader Appearance Settings** for the LingoReader application. Since the core of the app involves reading articles, providing a customizable and comfortable reading experience is critical.

---

## 2. Feature Specifications

### 2.1 Theme Switching (Dark / Light Mode)
- **Supported Modes**: `Light`, `Dark`, and `System` (follows OS preference).
- **Behavior**: 
  - Toggling updates the UI instantly across the entire application.
  - Prevents FOUC (Flash of Unstyled Content) during initial page load.
- **Persistence**: Saved locally for guests, and synced to the database for authenticated users.

### 2.2 Reader Appearance Settings
To complement the dark mode, the following features will be added to the Reader interface:
- **Font Size**: Adjustable scale (e.g., Small, Normal, Large, Extra Large).
- **Font Family**: Options for Serif (default), Sans-serif, and a Dyslexia-friendly font.
- **Line Spacing**: Compact, Normal, Relaxed.

---

## 3. Technical Implementation Plan

### 3.1 Dependencies
We will use `next-themes` to handle the theme switching smoothly with Next.js SSR.
```bash
npm install next-themes
```

### 3.2 State Management (`src/stores/ui.store.ts`)
We will expand the existing `ui.store.ts` (Zustand) to manage the reader-specific appearance state. Theme state is managed by `next-themes`, but other settings live in Zustand.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily: 'sans' | 'serif' | 'mono';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  setFontSize: (size: UiState['fontSize']) => void;
  setFontFamily: (font: UiState['fontFamily']) => void;
  setLineHeight: (height: UiState['lineHeight']) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      fontSize: 'base',
      fontFamily: 'serif',
      lineHeight: 'relaxed',
      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setLineHeight: (height) => set({ lineHeight: height }),
    }),
    { name: 'lingoreader-ui-settings' }
  )
);
```

### 3.3 Theme Provider (`src/app/providers.tsx`)
Wrap the application in `ThemeProvider` to enable the `dark:` variant in TailwindCSS.

```tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```
*Note: Update `src/app/layout.tsx` to include `<Providers>` wrapping `{children}`.*

### 3.4 Tailwind Configuration (`tailwind.config.ts`)
Ensure Tailwind is configured to use class-based dark mode strategy.
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Critical for next-themes compatibility
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... rest of config
};
export default config;
```

---

## 4. UI Components to Create

### 4.1 `ThemeSwitcher.tsx`
A dropdown or toggle button placed in the top navigation bar.

```tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid Hydration Mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
```

### 4.2 `AppearanceSettings.tsx`
A popover/modal component on the Reader page that allows users to change text size, font family, and line spacing. This will read/write from `useUiStore`.

### 4.3 Update `ArticleRenderer.tsx`
Modify `ArticleRenderer.tsx` to dynamically apply classes based on `useUiStore` values.
```tsx
const { fontSize, fontFamily, lineHeight } = useUiStore();

<div className={`prose dark:prose-invert max-w-3xl mx-auto
                 text-${fontSize} font-${fontFamily} leading-${lineHeight}`}>
  {/* Article Content */}
</div>
```

---

## 5. Database Schema Update (Optional, for Auth Users)
To persist user preferences across different devices, we can add a JSONB column to the `users` table in `schema.prisma` or `migrations.sql`.

```sql
-- Add appearance_settings to users table
ALTER TABLE users ADD COLUMN appearance_settings JSONB DEFAULT '{"theme": "system", "fontSize": "base", "fontFamily": "serif", "lineHeight": "relaxed"}';
```
*When an authenticated user updates their settings, an API call `PATCH /api/user/settings` will sync the local Zustand/next-themes state to the DB.*
