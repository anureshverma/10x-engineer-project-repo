# PromptLab Frontend

A Next.js 14 frontend for the **PromptLab** API. It provides a responsive web UI to manage AI prompts, collections, and tags with full CRUD, filtering, and a clean API integration layer.

## Project Overview

PromptLab Frontend connects to the FastAPI-based PromptLab backend and offers:

- **Prompts** — Create, view, edit, and delete prompts; filter by collection and tags; assign tags on the detail page.
- **Collections** — Create and delete collections; view prompt counts; open prompts filtered by collection.
- **Tags** — Create, edit, and delete tags; manage tags inline with color and description.

The app uses a production-oriented folder structure, shared UI components, loading skeletons, empty states, and user-friendly error handling. The UI is mobile-responsive and uses Tailwind CSS for styling.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **PromptLab backend** running (e.g. at `http://localhost:8000`)

## Setup

1. **From the repository root, go to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the API base URL** (optional; default is `http://localhost:8000`):
   - Copy `.env.local.example` to `.env.local` if you use the example file, or create `.env.local` with:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   - If `.env.local` is missing, the app still uses `http://localhost:8000` as the default.

## Running the Application

- **Development** (with hot reload):
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) (or the URL printed in the terminal).

- **Production build**:
  ```bash
  npm run build
  npm start
  ```

- **Lint**:
  ```bash
  npm run lint
  ```

Ensure the PromptLab backend is running (e.g. `uvicorn` on port 8000) so the frontend can load and mutate data. The navbar shows a green/red indicator for API connectivity.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the PromptLab API | `http://localhost:8000` |

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (Navbar + main)
│   │   ├── page.tsx            # Dashboard
│   │   ├── globals.css         # Global and Tailwind styles
│   │   ├── prompts/            # List, new, [id], [id]/edit
│   │   ├── collections/        # List, new
│   │   └── tags/               # List (inline create/edit/delete)
│   ├── components/
│   │   ├── ui/                  # Shared UI (Button, Spinner, Skeleton, etc.)
│   │   ├── layout/              # Navbar (with mobile menu)
│   │   ├── prompts/             # PromptCard, PromptForm, PromptFilters
│   │   ├── collections/         # CollectionCard, CollectionForm
│   │   └── tags/                # TagCard, TagForm
│   └── lib/
│       ├── api/                 # API client and resource modules
│       │   ├── client.ts        # Base fetch wrapper, ApiError
│       │   ├── prompts.ts      # Prompts + prompt-tag endpoints
│       │   ├── collections.ts
│       │   ├── tags.ts
│       │   └── health.ts
│       ├── types/               # TypeScript types (Prompt, Collection, Tag, etc.)
│       └── utils.ts             # Date formatting and helpers
├── .env.local                  # Local env (not committed)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Features

### CRUD and UI

- **Prompts**: List (grid + search, collection filter, tag filter), create, view, edit, delete. On the detail page you can add/remove tags.
- **Collections**: List (grid with prompt counts), create, delete. “View prompts” links to the prompts list filtered by that collection.
- **Tags**: List (grid), inline create form, inline edit and delete with confirmation.

### UX

- **Loading**: Skeleton cards on list/dashboard; spinner on buttons during submit/delete; “Loading…” in dropdowns while options are fetched.
- **Empty states**: Dedicated messages and primary CTAs when there is no data (or no results for the current filters).
- **Errors**: Page-level error banner with optional Retry; inline validation and API error messages on forms; 404 handled with “Not found” and a back link.
- **Responsive**: Mobile-first layout; hamburger nav on small screens; stacked filters and single-column grids on mobile; touch-friendly targets.

### API Integration

- All backend routes from the PromptLab API are used via `src/lib/api/`:
  - **Health**: `GET /health`
  - **Prompts**: list, get, create, update, patch, delete, get/set/add/remove tags
  - **Collections**: list, get, create, delete
  - **Tags**: list, get, create, update (patch), delete

The base URL is taken from `NEXT_PUBLIC_API_URL`. The client throws `ApiError` (with status and message) for non-OK responses and maps network failures to a clear error message.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard: stats (prompts, collections, tags) and recent prompts |
| `/prompts` | List prompts with filters; links to create and to detail/edit |
| `/prompts/new` | Create prompt form |
| `/prompts/[id]` | View prompt; add/remove tags; link to collection |
| `/prompts/[id]/edit` | Edit prompt form |
| `/collections` | List collections with prompt counts; create; delete |
| `/collections/new` | Create collection form |
| `/tags` | List tags; inline create, edit, delete |

## Summary

PromptLab Frontend is a Next.js 14 (App Router) + TypeScript + Tailwind app that talks to the PromptLab FastAPI backend. It implements full CRUD for prompts, collections, and tags; uses a clear API layer under `src/lib/api/`; and provides loading states, empty states, and error handling. The UI is responsive and uses shared components (buttons, modals, skeletons, badges). Run `npm run dev` with the backend on port 8000 to use the app locally.
