import { ReactNode, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@components/common/JsonLd";
import { DetailHero } from "@components/detail/DetailHero";
import { DetailPager } from "@components/detail/DetailPager";
import { AboutPanel } from "@components/detail/AboutPanel";
import { StatBars } from "@components/detail/StatBars";
import { EvolutionChainView } from "@components/detail/EvolutionChainView";
import { AbilityList } from "@components/detail/AbilityList";
import { TypeMatchups } from "@components/detail/TypeMatchups";
import { PokemonDetailData, PokemonNeighbors } from "@interfaces/pokemon";
import { primaryTypeColor } from "@constant/pokemonTypes";
import { dexNo } from "@constant/pokemonMeta";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@constant/site";
import { getPokemonDetail, getPokemonNeighbors } from "@lib/pokemonDetail";

type DetailPageProps = { params: Promise<{ name: string }> };

// Generate detail pages on demand, then cache them. Pokémon data is effectively
// immutable, so a long revalidate window is fine.
export const revalidate = 86400; // 60 * 60 * 24 — refresh daily

// Mirror the old getStaticPaths `{ paths: [], fallback: "blocking" }`: prebuild
// nothing, render + cache each page on its first request (dynamicParams stays
// true by default, so params not listed here are still rendered on demand).
export async function generateStaticParams() {
  return [];
}

// Wrapped in React cache() so generateMetadata and the page
// share a single aggregation per request rather than running it twice.
const loadPokemon = cache((name: string) => getPokemonDetail(name));

async function loadDetail(name: string): Promise<{
  pokemon: PokemonDetailData;
  neighbors: PokemonNeighbors;
}> {
  try {
    const pokemon = await loadPokemon(name);
    const neighbors = await getPokemonNeighbors(pokemon.id);
    return { pokemon, neighbors };
  } catch {
    notFound();
  }
}

// Title-case a hyphenated/spaced api name for share-card copy, where the UI's
// CSS `capitalize` isn't available: "mr-mime" → "Mr Mime", "pikachu" → "Pikachu".
function formatName(value: string): string {
  return value
    .split(/[-\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Build the share blurb from the newest Pokédex entry, falling back to a summary.
function detailDescription(pokemon: PokemonDetailData): string {
  const displayName = formatName(pokemon.name);
  const typeList = pokemon.types.map(formatName).join(" / ");
  return (
    pokemon.species.flavorEntries[0]?.text ||
    `${displayName} — ${typeList} type. Explore stats, abilities, type matchups and evolutions on Nextdex.`
  );
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { name } = await params;
  try {
    const pokemon = await loadPokemon(name);
    const displayName = formatName(pokemon.name);
    return buildMetadata({
      title: `#${dexNo(pokemon.id)} ${displayName} | Nextdex`,
      description: detailDescription(pokemon),
      image: pokemon.image,
      imageAlt: `${displayName} official artwork`,
      url: `/pokemon/${pokemon.name}`,
      type: "article",
    });
  } catch {
    return {}; // unknown mon — the page render itself calls notFound()
  }
}

// An editorial band in the reading column — a Clash heading over its content,
// separated from its neighbours by the column's hairline rules (no boxes).
function Band({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-8 first:pt-0 last:pb-0">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { name } = await params;
  const { pokemon, neighbors } = await loadDetail(name);

  const accent = primaryTypeColor(pokemon.types);

  const displayName = formatName(pokemon.name);
  const description = detailDescription(pokemon);
  const canonicalUrl = absoluteUrl(`/pokemon/${pokemon.name}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `#${dexNo(pokemon.id)} ${displayName}`,
      description,
      url: canonicalUrl,
      primaryImageOfPage: pokemon.image,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      about: { "@type": "Thing", name: displayName, image: pokemon.image },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pokédex", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: displayName,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <div className="relative">
      <JsonLd data={jsonLd} />

      {/* Ambient type glow at the page top — the specimen's element. Absolute,
          not fixed, so it scrolls with the content and can't bleed out above the
          navbar when you overscroll to the top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh]"
        style={{
          background: `radial-gradient(55% 60% at 50% -10%, ${accent}26, transparent 70%)`,
        }}
      />

      <div className="mx-auto max-w-6xl pt-2">
        <DetailPager neighbors={neighbors} />

        <div className="my-6 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          {/* Left: the specimen, pinned while the dossier scrolls. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <DetailHero pokemon={pokemon} />
          </div>

          {/* Right: the dossier — editorial bands divided by hairline rules. */}
          <div className="min-w-0 divide-y divide-border">
            <Band id="about" title="About">
              <AboutPanel species={pokemon.species} />
            </Band>

            <Band id="stats" title="Base stats">
              <StatBars stats={pokemon.stats} />
            </Band>

            <Band id="abilities" title="Abilities">
              <AbilityList abilities={pokemon.abilities} />
            </Band>

            <Band id="matchups" title="Type matchups">
              <TypeMatchups matchups={pokemon.matchups} />
            </Band>

            <Band id="evolution" title="Evolution">
              <EvolutionChainView
                stages={pokemon.evolution}
                currentId={pokemon.id}
                accent={accent}
              />
            </Band>
          </div>
        </div>

        <DetailPager neighbors={neighbors} />
      </div>
    </div>
  );
}
