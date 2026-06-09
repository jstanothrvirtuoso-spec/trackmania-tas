# TrackMania TAS Website

A community-driven TrackMania tool-assisted speedrun site built with Next.js, Supabase, and React Query.

## What this project does

This repo powers a TrackMania TAS website with:

- Public leaderboards for TAS and RTA records
- Per-game record pages with filters for authors, categories, and environments
- A highlight page for daily picks
- User authentication and profile preferences
- TAS submission flow with replay upload and admin review
- Admin tools for pending TAS submissions and moderation

## Tech stack

- Next.js App Router (React 19)
- TypeScript
- Tailwind CSS
- Supabase for auth, database, and storage
- React Query for client-side data fetching
- Lucide icons, react-icons

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm or compatible package manager
- A Supabase project for database/auth/storage

### Install dependencies

```bash
npm install
```

### Environment

Create a local environment file (`.env.local`) with your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

### Build

```bash
npm run build
```

## Key folders

- `app/` - Next.js route and layout files
- `components/` - UI components used across the app
- `lib/` - client-side data queries and helpers
- `utils/` - shared constants, formatting, Supabase clients, and types
- `public/` - static assets like inputs, icons, wallpapers, and files

## Notes

- `utils/supabase/client.ts` is used for browser-based Supabase queries.
- `utils/supabase/server.ts` and `utils/supabase/middleware.ts` handle server-side session-aware Supabase access.

## Useful commands

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint
