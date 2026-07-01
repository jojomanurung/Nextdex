import { ReactNode } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { Card } from "@dex/components/common/Card";
import { ScrollToTop } from "@dex/components/common/ScrollToTop";
import { DetailHero } from "@dex/components/detail/DetailHero";
import { DetailNav } from "@dex/components/detail/DetailNav";
import { DetailPager } from "@dex/components/detail/DetailPager";
import { AboutPanel } from "@dex/components/detail/AboutPanel";
import { StatBars } from "@dex/components/detail/StatBars";
import { EvolutionChainView } from "@dex/components/detail/EvolutionChainView";
import { AbilityList } from "@dex/components/detail/AbilityList";
import { TypeMatchups } from "@dex/components/detail/TypeMatchups";
import { PokemonDetailData } from "@dex/interfaces/pokemon";
import { primaryTypeColor, typeColor } from "@dex/constant/PokemonTypes";
import { dexNo } from "@dex/constant/pokemonMeta";
import { Meta } from "@dex/components/common/Meta";
import {
  getPokemonDetail,
  getPokemonNeighbors,
  PokemonNeighbors,
} from "@dex/lib/pokemon";

type DetailPageProps = {
  pokemon: PokemonDetailData;
  neighbors: PokemonNeighbors;
};

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

// Title-case a hyphenated/spaced api name for share-card copy, where the UI's
// CSS `capitalize` isn't available: "mr-mime" → "Mr Mime", "pikachu" → "Pikachu".
function formatName(value: string): string {
  return value
    .split(/[-\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Id({ pokemon, neighbors }: DetailPageProps) {
  const accent = primaryTypeColor(pokemon.types);
  const secondary = pokemon.types[1] ? typeColor(pokemon.types[1]) : accent;

  const displayName = formatName(pokemon.name);
  const typeList = pokemon.types.map(formatName).join(" / ");
  // Prefer the newest Pokédex entry for the share blurb; fall back to a summary.
  const description =
    pokemon.species.flavorEntries[0]?.text ||
    `${displayName} — ${typeList} type. Explore stats, abilities, type matchups and evolutions on Nextdex.`;

  return (
    <>
      <Meta
        title={`#${dexNo(pokemon.id)} ${displayName} | Nextdex`}
        description={description}
        image={pokemon.image}
        imageAlt={`${displayName} official artwork`}
        url={`/detail/${pokemon.name}`}
        type="article"
      />

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

// Generate detail pages on demand, then cache them. Pokémon data is
// effectively immutable, so a long revalidate window is fine.
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // don't prebuild ~1300 pages; generate on first request
  fallback: "blocking", // first hit renders + caches, later hits are static
});

export const getStaticProps: GetStaticProps<DetailPageProps> = async ({
  params,
}) => {
  const id = params?.id as string;
  if (!id) {
    return { notFound: true };
  }

  try {
    const pokemon = await getPokemonDetail(id);
    const neighbors = await getPokemonNeighbors(pokemon.id);
    return { props: { pokemon, neighbors }, revalidate: 60 * 60 * 24 }; // refresh daily
  } catch (error) {
    return { notFound: true };
  }
};
