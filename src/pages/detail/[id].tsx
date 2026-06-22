import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";
import { Card } from "@dex/components/Card";
import { Type } from "@dex/components/Type";
import { PokemonData } from "@dex/interfaces/pokemon";
import { primaryTypeColor } from "@dex/constant/PokemonTypes";
import { dexNo } from "@dex/constant/pokemonMeta";
import { getPokemon } from "@dex/lib/pokemon";

export default function Id(pokemon: PokemonData) {
  const typeColor = primaryTypeColor(pokemon.types);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* HERO */}
      <Card>
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative w-full h-80">
            {/* type-colored glow halo behind the artwork */}
            <div
              aria-hidden
              className="absolute inset-8 rounded-full blur-3xl opacity-50"
              style={{ backgroundColor: typeColor }}
            />
            <Image
              src={pokemon?.image}
              alt={pokemon.name}
              fill
              className="object-contain"
              width={0}
              height={0}
              sizes="100%"
              loading="lazy"
              placeholder="blur"
              blurDataURL="/images/placeholder.png"
            />
          </div>
          <div className="space-y-4">
            <p className="text-zinc-400 font-medium">#{dexNo(pokemon.id)}</p>
            <h1 className="text-5xl font-bold capitalize">{pokemon.name}</h1>
            <h2>Type</h2>
            <div className="flex gap-3 flex-wrap">
              {pokemon?.types.map((type) => (
                <Type key={type} type={type}></Type>
              ))}
            </div>
            <div className="flex gap-6 text-sm text-zinc-400 pt-2">
              <p>Height: {pokemon.height / 10} m</p>
              <p>Weight: {pokemon.weight / 10} kg</p>
            </div>
          </div>
        </section>
        {/* STATS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Base Stats</h2>

          <div className="space-y-4">
            {pokemon.stats.map((stat) => (
              <div key={stat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">
                    {stat.name.replace("-", " ")}
                  </span>
                  <span>{stat.value}</span>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full">
                  <div
                    className="bg-white h-2 rounded-full"
                    style={{
                      width: `${(stat.value / 150) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </Card>
    </div>
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
    const pokemon = await getPokemon(id);
    return { props: pokemon, revalidate: 60 * 60 * 24 }; // refresh daily
  } catch (error) {
    return { notFound: true };
  }
};
