# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Кино-галерея (movie gallery) — a learning project: a Kinopoisk-style movie catalog built with
React + TypeScript + React Router + TanStack Query + Zustand + Tailwind CSS, backed by the TMDB
API. It was generated step by step (todo → spec brainstorm → code); the planning docs are in
`docs/`. `spec.md` is the up-to-date architecture reference — read it before making structural
changes; this file only summarizes what's needed to be productive day to day.

Comments throughout the codebase are written in Russian and explain the *why*, not the *what* —
follow that convention when editing existing files.

## Commands

```
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build      # type-check (tsc -b) then production build
npm run lint       # oxlint
npm run preview    # preview the production build
```

There is no test suite yet (planned for "phase 2" per README — Vitest + React Testing Library).

### Local setup requirement

The app needs a TMDB API key to do anything: copy `.env.example` to `.env` and set
`VITE_TMDB_API_KEY`. Without it, `tmdbFetch` (`src/shared/api/client.ts`) throws immediately with
a Russian error message rather than making a request.

## Architecture: Feature-Sliced Design

The codebase is organized as FSD layers, each importing only from layers strictly below it:

```
app → pages → widgets → features → entities → shared
```

```
src/
  app/          providers (QueryProvider, router), global styles, root App component
  pages/        home, movie-details, favorites, not-found — route-level compositions
  widgets/      layout (Header+Footer+Outlet), header, footer, movie-grid
  features/     search-movies, filter-by-genre, toggle-favorite (Zustand store lives here)
  entities/     movie, genre, cast, video — domain types + TanStack Query hooks + display UI
  shared/       api/client.ts (tmdbFetch), api/images.ts, ui/ (Loader, ErrorMessage, EmptyState),
                lib/useDebouncedValue, config/env.ts
```

Every slice exposes a single `index.ts` public API (e.g. `@/entities/movie`) — import from that,
not from a slice's internal `ui/`/`api/`/`model/` files directly. Imports use the `@/` alias to
`src` (configured in `tsconfig.app.json` `paths` and `vite.config.ts` `resolve.alias`), not
relative paths that cross layers.

**Composition rule to know before touching `MovieCard`:** `entities/movie` must not import
`features/toggle-favorite` (entities sit below features). `MovieCard` instead accepts an `action`
slot (`ReactNode`); `widgets/movie-grid` is what wires `<FavoriteButton>` into it. If you need a
new entity+feature combo, compose it at the widget/page level the same way rather than importing
sideways.

Full rationale, the layer-by-layer breakdown, and the TMDB endpoint-to-slice mapping are in
`spec.md` — check it for anything not covered here.

### Data flow

- `shared/api/client.ts` — the only place that calls `fetch` against TMDB. Injects the API key and
  `language=ru-RU`, throws on missing key or non-OK response.
- `entities/*/api/queries.ts` — one `queryOptions()`-returning function per TMDB endpoint (e.g.
  `entities/movie/api/queries.ts` has `popularMoviesOptions`, `searchMoviesOptions`,
  `moviesByGenreOptions`, `movieDetailsOptions`), each with a matching query-key factory. Pages and
  features call these through `useQuery`/`useQueries`, never `tmdbFetch` directly.
- Genre-only filtering (no search text) goes through TMDB's `/discover/movie`, not
  `/search/movie` — the latter doesn't accept `with_genres`. `pages/home/ui/HomePage.tsx` handles
  the query+genre combination by post-filtering search results client-side.
- No page owns manual loading/error `useState` — that comes from `useQuery`'s `status`/`refetch`
  and is rendered via `shared/ui` (`Loader`, `ErrorMessage`, `EmptyState`).

### State: three sources, pick the right one

- **Server data → TanStack Query** (`entities/*/api/queries.ts`, `app/providers/QueryProvider.tsx`
  for the single `QueryClient`). Never copy `useQuery` results into `useState`/Zustand.
- **Shareable filters → URL** (`useSearchParams`) — search (`?q=`) and genre (`?genre=`) live in
  the address bar so results are linkable. See `features/search-movies`, `features/filter-by-genre`.
- **Favorites → Zustand** (`features/toggle-favorite/model/favoritesStore.ts`), the one case where
  the same client-only data (`favoriteIds: number[]`) is needed across unrelated components at
  once. Persisted via the `persist` middleware to `localStorage` (key: `movie-gallery-favorites`).
  It stores only IDs — `pages/favorites` re-fetches full movie data per ID with `useQueries`.

### Routing

`app/providers/router.tsx` defines all routes nested under `widgets/layout` (shared Header/Footer):
`/`, `/movie/:id`, `/favorites`, and `*` → `pages/not-found` (must stay last — React Router matches
top to bottom).

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` (no separate config file — see `vite.config.ts`). Styles
are written as utility classes in JSX; `app/styles/index.css` only carries font/base body setup.

### Linting

oxlint (`.oxlintrc.json`) with `react`, `typescript`, `oxc` plugins — notably enforces
`react/rules-of-hooks` and warns on `react/only-export-components`. oxlint does **not** enforce FSD
import-direction rules; `spec.md` documents adding [Steiger](https://github.com/feature-sliced/steiger)
for that, not yet wired into `npm run lint`.
