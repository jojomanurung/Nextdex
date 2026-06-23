# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run `next lint` (extends `next/core-web-vitals`)

There is no test runner configured.

## Architecture

Nextdex is a Next.js **Pages Router** app (under `src/pages/`) that browses Pokémon data from PokeAPI, styled as a glassy "Pokédex device": a sticky search/sort control deck above a single scrolling list of glass entry rows (no card grid).

### Data layer (`src/lib/pokemon.ts`)

All PokeAPI access goes through this single module. It holds **shared `pokenode-ts` clients** — a `PokemonClient` plus an `EvolutionClient` (for evolution chains) — created once at module load, with a 1h response cache via `cacheOptions.ttl`. It exposes:

- `getPokemon(name)` — fetches one Pokémon and maps it into the trimmed `PokemonData` shape from `src/interfaces/pokemon.ts` (`id`, `name`, `image`, `types: string[]`, `stats`, `height`, `weight`). The raw `Pokemon` type only appears inside `mapPokemon` here.
- `getPokemonList(offset, limit)` — lists Pokémon, resolves each through `getPokemon` in parallel, returns `PokemonListResult`.
- `getPokemonIndex()` — a **lightweight full-dex index** of `{ id, name }` only (no detail fetches), used for client-side search/sort. One request; parses the id from each result URL and drops alternate forms (`id >= FORM_ID_START`, 10000).
- `getPokemonDetail(name)` — **richer detail-page aggregator**, deliberately separate from the lean `getPokemon` so the list path never pays for it. Composes the species, evolution-chain (via the `EvolutionClient`), ability, and type endpoints into `PokemonDetailData`: base + shiny art, `abilities` (name/effect/`isHidden`), `evolution` stages (sprite built straight from the species id — no per-stage fetch), defensive `matchups` (combined type damage relations → ×4…×0), and `species` meta — genus, habitat, capture/happiness, gender, egg groups, rarity flags, and `flavorEntries` (English Pokédex text grouped **one entry per generation, newest first**; `cleanText` strips the soft-hyphen + line-break hyphenation older games embed mid-word; pokenode-ts omits the entries' `version`, so it's read via a narrow cast). Fetches are parallelized and run only in the detail page's `getStaticProps`.

### Rendering & data flow

- **List page (`src/pages/index.tsx`)** — thin/presentational. `getStaticProps` (ISR, `revalidate: 60`) fetches **both** the first page of details (`getPokemonList(0, PAGE_LIMIT)`) and the full `getPokemonIndex()`, passing `results` + `index` as props. All search, sort, and pagination happen client-side in the `usePokedexBrowser` hook (below); the page just renders `ControlDeck` + `PokemonRow`s + `VirtualScroll`.
- **Detail page (`src/pages/detail/[id].tsx`)** — `getStaticProps` + `getStaticPaths` (`fallback: "blocking"`, `paths: []`, `revalidate: 60 * 60 * 24`) calls `getPokemonDetail(id)` directly (NOT through any API route). **Note: the `[id]` param is actually the Pokémon _name_** — rows link to `detail/${pokemon.name}`. Renders the immersive, type-themed layout described under _Detail page composition_ below.
- **API route `src/pages/api/pokemon/[name].ts`** — the only API route; returns a single `PokemonData` by name (`{ data }`), wrapping `getPokemon`. The list page calls it (relative URL `fetch('/api/pokemon/<name>')`) to **lazy-load row details on scroll** — the index only carries `id`/`name`.

### Detail page composition (`src/components/detail/`)

The detail page is presentational — `getPokemonDetail` does the data work. It renders a fixed, full-bleed type-tinted gradient behind an oversized `DetailHero`, a sticky in-page sub-nav (`DetailNav`, which docks under the navbar via the shared `--navbar-height` CSS var), then five frosted `Card` sections — **About · Base Stats · Abilities · Type Matchups · Evolution**:

- `DetailHero` — artwork (no glow halo), shiny toggle (`useState`), dex/name/genus/generation, type chips, rarity badges.
- `AboutPanel` → `PokedexEntries` — Pokédex flavor text with a "Show all N entries" button that reveals one entry per generation (newest first), above a species-metadata grid.
- `StatBars` — segmented HUD meter: 20 notches scaled to `STAT_MAX` (150, treated as "elite"; lower it for fuller bars), tier-colored per level (red→amber→green→blue), with the value tinted to its tier.
- `TypeMatchups` — splits the computed defensive multipliers into Weak to / Resists / Immune to.
- `EvolutionChainView` — one column per evolution depth (branched lines like Eevee fan out); each stage links to `/detail/<name>`.

Detail-only components live in `src/components/detail/` and reuse `Type`, `Card`, `primaryTypeColor`/`typeColor`, and `genLabel`/`dexNo`.

### Browser engine (`src/hooks/usePokedexBrowser.ts`)

Owns all list behavior so the page stays presentational. Given `{ results, index }`, it returns `{ query, setQuery, sort, setSort, pokemons, resultCount, isLoading, isLast, isEmpty, onIntersect }`. Core model: **filter + sort the full index, then "ensure the visible window's details are loaded and render the loaded ones."**

- **Search** is debounced (`src/hooks/useDebouncedValue.ts`) and matches name or zero-padded number over the whole index.
- **Sort** (`number` | `name`) re-orders the index; on a sort change it resets the window to one page and scrolls to top (ref-guarded so it skips mount and preserves a restored depth on back-navigation).
- **Load-then-reveal pagination**: a `useEffect` fetches details (capped at `PAGE_LIMIT` per pass via `/api/pokemon/[name]`) for any visible row not yet cached, then `pokemons` renders only the loaded ones (so the list never shows placeholders and the bottom "Loading…" stays visible). A failed fetch leaves a row missing and retried later, never skipped; `setDetails` returns the same reference when nothing new arrived, so failures can't loop.
- **Browse vs. search windows**: browse depth (`count`) lives in context; search has its own local `searchCount`, so clearing the query restores the browse list.

### List state persistence (`src/context/PokemonListContext.tsx`)

`PokemonListProvider` wraps the app in `_app.tsx`, holding a **`details` cache (`Record<name, PokemonData>`)** and the browse **`count`** (reveal depth). Both survive client-side navigation (home ↔ detail) for the session; a full refresh starts fresh. Combined with `experimental.scrollRestoration` in `next.config.js`, back-navigation restores the list and scroll position. Consume via `usePokemonList()` (throws if used outside the provider).

### Infinite scroll (`src/components/VirtualScroll.tsx`)

A **persistent** `IntersectionObserver` on an **always-mounted** sentinel `<div>` reports visibility via `intersectCallback` (debounced ~300ms). `usePokedexBrowser` **consumes** each intersection (grows the window by one page, then waits for the sentinel to re-enter) so a batch can't run away. The sentinel stays mounted even at the end (shows "End of content") so the observer never orphans. Note: despite the name, `VirtualScroll` does NOT window the DOM — every loaded row stays mounted (a deferred perf consideration).

### Components

- `PokemonRow` (`src/components/PokemonRow.tsx`) — `memo`-wrapped glass "entry capsule": sprite on a type-colored glow halo, dex number, name, generation label (`genLabel`), type chips, and an oversized ghost dex number. Responsive: chips hide below `sm`, centered at `sm+`.
- `ControlDeck` (`src/components/ControlDeck.tsx`) — sticky glass toolbar with the search input and sort `<select>` (exports the `SortKey` type).
- `Card` (`src/components/Card.tsx`) — a plain frosted-glass shell (`children` only); used as the wrapper for each detail-page section (see _Detail page composition_).

### Styling and theming

- TailwindCSS, configured in `tailwind.config.js`. Global styles in `src/styles/globals.css` (which also sets `html { scroll-behavior: smooth }` for the detail sub-nav's anchor jumps).
- `src/constant/PokemonTypes.ts` is the single source of truth for type → color, via `typeColor(name)` (and `primaryTypeColor(types)` for `types[0]`). `Type.tsx` looks it up with `.find(...)` and falls back to a neutral color (and skips the icon) for an unmapped type, so an unknown type won't crash.
- `src/constant/pokemonMeta.ts` holds `genLabel(id)` (national-dex id → generation + region) and `dexNo(id)`, plus detail-page helpers `genderRatioLabel`, `pct255`, and `versionGeneration`/`generationLabel` (game version → generation, used to group flavor text by generation).
- Layout/font setup is in `src/components/Layout.tsx` (Navbar + `<main>`), applied via `_app.tsx`. Fonts use `next/font/google` (Inter).

### TypeScript path alias

`tsconfig.json` defines `@dex/*` → `./src/*`. Use `@dex/components/...`, `@dex/lib/...`, `@dex/hooks/...`, `@dex/context/...`, `@dex/interfaces/...`, `@dex/constant/...` for intra-`src` imports rather than relative paths.

### Next.js image config

`next.config.js` only whitelists `raw.githubusercontent.com` under `images.remotePatterns`. Adding image sources from other hosts requires updating this list, otherwise `next/image` will refuse to load them.
