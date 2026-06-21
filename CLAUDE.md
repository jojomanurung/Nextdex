# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run `next lint` (extends `next/core-web-vitals`)

There is no test runner configured.

## Architecture

Nextdex is a Next.js **Pages Router** app (under `src/pages/`) that browses Pokémon data from PokeAPI.

### Data layer (`src/lib/pokemon.ts`)

All PokeAPI access goes through this single module. It holds **one shared `pokenode-ts` `PokemonClient`** instance (created once at module load, with a 1h response cache via `cacheOptions.ttl`) so repeat lookups skip the network. It exposes:

- `getPokemon(name)` — fetches one Pokémon and maps it into the trimmed `PokemonData` shape from `src/interfaces/pokemon.ts` (`id`, `name`, `image`, `types: string[]`, `stats`, `height`, `weight`).
- `getPokemonList(offset, limit)` — lists Pokémon, then resolves each entry through `getPokemon` in parallel, returning `PokemonListResult` (`count`, `next`, `previous`, `results: PokemonData[]`).

Both pages and the API route consume `PokemonData` — there is no longer any asymmetry between full `pokenode-ts` types and the trimmed shape. The raw `Pokemon` type only appears inside `mapPokemon` in this file.

### Rendering & data flow

- **List page (`src/pages/index.tsx`)** — `getStaticProps` (ISR, `revalidate: 60`) calls `getPokemonList(0, PAGE_LIMIT)` to statically generate the first page. Further pages are fetched client-side as the user scrolls.
- **Detail page (`src/pages/detail/[id].tsx`)** — `getStaticProps` + `getStaticPaths` (`fallback: "blocking"`, `paths: []` so pages generate on first request and then cache, `revalidate: 60 * 60 * 24`) calls `getPokemon(id)` directly. **Note: the `[id]` param is actually the Pokémon _name_** — `PokemonCard` links to `detail/${pokemon.name}`, and `getPokemonByName` is name-based. The detail page does NOT go through the API route.
- **Internal API route `src/pages/api/pokemon/index.ts`** — a **list** endpoint taking `?offset=&limit=` query params, wrapping `getPokemonList`. It is consumed only by the list page for client-side pagination, via the relative URL `fetch('/api/pokemon?offset=...&limit=...')` (relative, so port-agnostic — no hard-coded host).

### List state persistence (`src/context/PokemonListContext.tsx`)

`PokemonListProvider` wraps the app in `_app.tsx`, so the accumulated list (`pokemons`), current `page`, and `isLast` survive client-side navigation (home ↔ detail) for the whole session; a full browser refresh starts fresh. `index.tsx` seeds this context from the SSG `results` on first visit and reuses it on return navigation instead of resetting to page 1. Combined with `experimental.scrollRestoration` in `next.config.js`, back-navigation restores both the list and scroll position. Consume it via the `usePokemonList()` hook (throws if used outside the provider).

### Infinite scroll

`index.tsx` paginates with `PAGE_LIMIT = 12`. `src/components/VirtualScroll.tsx` puts an `IntersectionObserver` on a sentinel `<div>` and reports visibility back via `intersectCallback` (debounced ~1s); the page reacts in a `useEffect` and calls `fetchPokemon` to append the next batch. `isLast` is computed by comparing accumulated results length to the total `count`. Note: despite the name, `VirtualScroll` does NOT window the DOM — every loaded card stays mounted.

### Components

- `PokemonCard` (`src/components/PokemonCard.tsx`) — the list-item card, `memo`-wrapped so already-rendered cards skip re-render when the next batch is appended. Wraps the shared `Card`.
- `Card` (`src/components/Card.tsx`) — generic card shell that accepts `types: string[]` and renders a blurred backdrop colored by `types[0]`. Used by both `PokemonCard` and the detail page.

### Styling and theming

- TailwindCSS, configured in `tailwind.config.js` (content globs cover `src/pages`, `src/components`, `src/app`). Global styles live in `src/styles/globals.css`.
- `src/constant/PokemonTypes.ts` is the single source of truth for type → color mapping. `Card.tsx` destructures the match for `types[0]` (`const [{ color }] = PokemonTypes.filter(...)`), so any new Pokémon type must be added there or the lookup will throw on an empty array.
- Layout/font setup is in `src/components/Layout.tsx` (Navbar + `<main>`), applied globally via `_app.tsx`. Fonts use `next/font/google` (Inter).

### TypeScript path alias

`tsconfig.json` defines `@dex/*` → `./src/*`. Use `@dex/components/...`, `@dex/lib/...`, `@dex/context/...`, `@dex/interfaces/...`, `@dex/constant/...` for intra-`src` imports rather than relative paths.

### Next.js image config

`next.config.js` only whitelists `raw.githubusercontent.com` under `images.remotePatterns`. Adding image sources from other hosts (e.g., other PokeAPI sprite CDNs) requires updating this list, otherwise `next/image` will refuse to load them.
