import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokedexBrowser } from "@components/home/PokedexBrowser";
import { JsonLd } from "@components/common/JsonLd";
import { queryPokemon } from "@lib/pokemon";
import { PokemonQueryResult } from "@interfaces/pokemon";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL } from "@constant/site";

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

async function loadHomeData(): Promise<PokemonQueryResult> {
  try {
    return await queryPokemon();
  } catch {
    notFound();
  }
}

export default async function Home() {
  const initial = await loadHomeData();

  return (
    <div className="mx-auto max-w-6xl">
      <JsonLd data={jsonLd} />
      <PokedexBrowser initial={initial} />
    </div>
  );
}
