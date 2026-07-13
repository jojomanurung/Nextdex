import { ReactNode, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@dex/components/common/Card";
import { ScrollToTop } from "@dex/components/common/ScrollToTop";
import { JsonLd } from "@dex/components/common/JsonLd";
import { DetailHero } from "@dex/components/detail/DetailHero";
import { DetailNav } from "@dex/components/detail/DetailNav";
import { DetailPager } from "@dex/components/detail/DetailPager";
import { AboutPanel } from "@dex/components/detail/AboutPanel";
import { StatBars } from "@dex/components/detail/StatBars";
import { EvolutionChainView } from "@dex/components/detail/EvolutionChainView";
import { AbilityList } from "@dex/components/detail/AbilityList";
import { TypeMatchups } from "@dex/components/detail/TypeMatchups";
import { PokemonDetailData, PokemonNeighbors } from "@dex/interfaces/pokemon";
import { primaryTypeColor, typeColor } from "@dex/constant/PokemonTypes";
import { dexNo } from "@dex/constant/pokemonMeta";
import { buildMetadata } from "@dex/lib/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@dex/constant/site";
import { getPokemonDetail, getPokemonNeighbors } from "@dex/lib/pokemonDetail";

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

// Anchored, scroll-padded frosted section so the sticky sub-nav doesn't cover
// the heading when jumped to.
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[140px]">
      <Card>
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        {children}
      </Card>
    </section>
  );
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { name } = await params;
  const { pokemon, neighbors } = await loadDetail(name);

  const accent = primaryTypeColor(pokemon.types);
  const secondary = pokemon.types[1] ? typeColor(pokemon.types[1]) : accent;

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
    <>
      <JsonLd data={jsonLd} />

      {/* Ambient type-tinted aurora, full-bleed behind the page content. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${accent}33, transparent 70%), radial-gradient(45% 45% at 85% 25%, ${secondary}22, transparent 70%)`,
        }}
      />

      <div className="mx-auto max-w-5xl space-y-6">
        <DetailPager neighbors={neighbors} />
        <DetailHero pokemon={pokemon} />
        <DetailNav />

        <Section id="about" title="About">
          <AboutPanel
            species={pokemon.species}
            height={pokemon.height}
            weight={pokemon.weight}
          />
        </Section>

        <Section id="stats" title="Base Stats">
          <StatBars stats={pokemon.stats} />
        </Section>

        <Section id="abilities" title="Abilities">
          <AbilityList abilities={pokemon.abilities} />
        </Section>

        <Section id="matchups" title="Type Matchups">
          <TypeMatchups matchups={pokemon.matchups} />
        </Section>

        <Section id="evolution" title="Evolution">
          <EvolutionChainView
            stages={pokemon.evolution}
            currentId={pokemon.id}
            accent={accent}
          />
        </Section>

        <DetailPager neighbors={neighbors} />
      </div>

      <ScrollToTop reveal="near-bottom" />
    </>
  );
}
