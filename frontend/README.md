# LingoReader — Frontend

This is the **Next.js 14 App Router** frontend for LingoReader.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS + @tailwindcss/typography |
| State | Zustand (with Immer + persist) |
| Data Fetching | TanStack React Query v5 |
| HTTP | Axios (with JWT auto-refresh) |
| Theme | next-themes (Dark / Light / System) |
| Animations | Framer Motion |
| Fonts | Google Fonts: Inter (sans) + Lora (serif) |

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp ../.env.example .env.local
# Edit NEXT_PUBLIC_API_URL, etc.
```

### 3. Start infrastructure (Docker)

```bash
cd ..
docker-compose up -d
```

### 4. Start dev server

```bash
npm run dev
# App runs on http://localhost:3000
```

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (public)/         # Guest-accessible routes
│   ├── (auth)/           # Login / Register
│   ├── (dashboard)/      # Authenticated user routes
│   └── admin/            # Admin panel
├── components/           # React components
│   ├── ui/               # Design system primitives
│   ├── reader/           # Article reader
│   ├── translation/      # Translation overlays
│   ├── vocabulary/       # Vocabulary management
│   ├── flashcard/        # Spaced repetition
│   └── layout/           # Navbar, Sidebar
├── hooks/                # Custom React hooks
├── stores/               # Zustand global state
├── lib/                  # API client, utils, auth
└── types/                # TypeScript types
```

## Theme System

Theme switching is implemented with **next-themes**:

- `ThemeSwitcher` component — place anywhere in the app
  - `variant="icon"` — single toggle button (Light ↔ Dark)
  - `variant="segmented"` — 3-way picker (Light / Dark / System)
- `AppearanceSettings` component — full panel with font/size/line height controls
- `useUiStore` — Zustand store persisting reader appearance to localStorage
- DB column `users.appearance_settings` — syncs settings for logged-in users

## Key Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run type-check  # TypeScript check only
npm run lint        # ESLint
```
