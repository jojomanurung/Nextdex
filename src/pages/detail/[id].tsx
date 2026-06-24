import { ReactNode } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { Card } from "@dex/components/common/Card";
import { DetailHero } from "@dex/components/detail/DetailHero";
import { DetailNav } from "@dex/components/detail/DetailNav";
import { AboutPanel } from "@dex/components/detail/AboutPanel";
import { StatBars } from "@dex/components/detail/StatBars";
import { EvolutionChainView } from "@dex/components/detail/EvolutionChainView";
import { AbilityList } from "@dex/components/detail/AbilityList";
import { TypeMatchups } from "@dex/components/detail/TypeMatchups";
import { PokemonDetailData } from "@dex/interfaces/pokemon";
import { primaryTypeColor, typeColor } from "@dex/constant/PokemonTypes";
import { getPokemonDetail } from "@dex/lib/pokemon";

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

export default function Id(pokemon: PokemonDetailData) {
  const accent = primaryTypeColor(pokemon.types);
  const secondary = pokemon.types[1] ? typeColor(pokemon.types[1]) : accent;

  return (
    <>
      {/* Ambient type-tinted aurora, full-bleed behind the page content. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${accent}33, transparent 70%), radial-gradient(45% 45% at 85% 25%, ${secondary}22, transparent 70%)`,
        }}
      />

      <div className="mx-auto max-w-5xl space-y-6">
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
      </div>
    </>
  );
}

// Generate detail pages on demand, then cache them. Pokémon data is
// effectively immutable, so a long revalidate window is fine.
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // don't prebuild ~1300 pages; generate on first request
  fallback: "blocking", // first hit renders + caches, later hits are static
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;
  if (!id) {
    return { notFound: true };
  }

  try {
    const pokemon = await getPokemonDetail(id);
    return { props: pokemon, revalidate: 60 * 60 * 24 }; // refresh daily
  } catch (error) {
    return { notFound: true };
  }
};
