import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokedexBrowser } from "@dex/components/home/PokedexBrowser";
import { JsonLd } from "@dex/components/common/JsonLd";
import { PokemonData } from "@dex/interfaces/pokemon";
import {
  getPokemonList,
  getPokemonIndex,
  PokemonIndexEntry,
} from "@dex/lib/pokemon";
import { PAGE_LIMIT } from "@dex/constant/pagination";
import { buildMetadata } from "@dex/lib/metadata";
import { SITE_NAME, SITE_URL } from "@dex/constant/site";

// ISR: rebuild the first page + the full search/sort index at most once an
// hour. Row details beyond the first page are fetched client-side on scroll
// (see PokedexBrowser / usePokedexBrowser).
export const revalidate = 3600;

const description =
  "Browse, search, and sort every Pokémon by number or name. Dive into stats, types, abilities, and evolutions in a sleek modern Pokédex.";

export const metadata: Metadata = buildMetadata({
  title: "Nextdex — Explore every Pokémon",
  description,
  image: "/images/pokeball.png",
  imageAlt: "Nextdex",
  url: "/",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description,
};

// Statically fetch the seed data; a failure renders the 404 page, mirroring the
// old getStaticProps `{ notFound: true }`.
async function loadHomeData(): Promise<{
  results: PokemonData[];
  index: PokemonIndexEntry[];
}> {
  try {
    const [list, index] = await Promise.all([
      getPokemonList(0, PAGE_LIMIT),
      getPokemonIndex(),
    ]);
    return { results: list.results, index };
  } catch {
    notFound();
  }
}

export default async function Home() {
  const { results, index } = await loadHomeData();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <JsonLd data={jsonLd} />
      <PokedexBrowser results={results} index={index} />
    </div>
  );
}
