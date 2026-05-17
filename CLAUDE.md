# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run `next lint` (extends `next/core-web-vitals`)

There is no test runner configured.

## Architecture

Nextdex is a Next.js **Pages Router** app (under `src/pages/`) that browses Pokémon data. The app talks to PokeAPI through two layers:

- **`pokenode-ts` client (`PokemonClient`)** — used directly in `getServerSideProps` of `src/pages/index.tsx` to SSR the first page of the list, and to fetch additional pages client-side as the user scrolls.
- **Internal API route `src/pages/api/pokemon/[name].ts`** — wraps `PokemonClient.getPokemonByName`, reshapes the raw response into the flat `PokemonData` shape defined in `src/interfaces/pokemon.ts` (just `id`, `name`, `image`, `types: string[]`, `stats`, `height`, `weight`), and is consumed by the detail page via `fetch('http://localhost:3000/api/pokemon/...')` inside `src/pages/detail/[id].tsx`'s `getServerSideProps`.

Note the asymmetry: the list page does NOT go through the internal API route and works with the full `pokenode-ts` `Pokemon` type; the detail page does and works with the trimmed `PokemonData` type. Shared UI like `Card` accepts a plain `types: string[]` so both shapes can pass it in.

### Infinite scroll

`src/pages/index.tsx` paginates with `PAGE_LIMIT = 12`. `src/components/VirtualScroll.tsx` uses `IntersectionObserver` on a sentinel `<div>` and reports visibility back via `intersectCallback`; the page reacts in a `useEffect` and calls `fetchPokemon` to append the next batch. `isLast` is computed by comparing accumulated results length to the total `count` returned by PokeAPI.

### Styling and theming

- TailwindCSS 3, configured in `tailwind.config.js` (content globs include `src/pages`, `src/components`, `src/app`). Global styles live in `src/styles/globals.css`.
- `src/constant/PokemonTypes.ts` is the single source of truth for type → color mapping. `Card.tsx` looks up the color for `types[0]` and uses it for the blurred backdrop, so any new Pokémon type must be added there or the lookup (`PokemonTypes.filter(...)[0]`) will throw.
- Layout/font setup is in `src/components/Layout.tsx`, applied globally via `_app.tsx`. Fonts use `next/font/google` (VT323).

### TypeScript path alias

`tsconfig.json` defines `@dex/*` → `./src/*`. Use `@dex/components/...`, `@dex/interfaces/...`, `@dex/constant/...` for intra-`src` imports rather than relative paths.

### Next.js image config

`next.config.js` only whitelists `raw.githubusercontent.com` under `images.remotePatterns`. Adding image sources from other hosts (e.g., other PokeAPI sprite CDNs) requires updating this list, otherwise `next/image` will refuse to load them.
