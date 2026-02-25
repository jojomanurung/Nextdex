import Card from "@dex/components/Card";
import Type from "@dex/components/Type";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { PokemonData } from "@dex/interfaces/pokemon";

export default function Detail(pokemon: PokemonData) {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* HERO */}
      <Card types={pokemon.types}>
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative w-full h-80">
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
            <p className="text-zinc-400 font-medium">
              #{pokemon.id.toString().padStart(3, "0")}
            </p>
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

// To pre-render the page on each request from server
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (query) {
    const name = query.name as string;

    const resp = await fetch(`http://localhost:3000/api/pokemon/${name}`, {
      next: { revalidate: 60 }, // ISR (optional)
    });

    if (!resp.ok) {
      return {
        notFound: true,
      };
    }

    const { data } = await resp.json();

    return { props: data };
  } else {
    return {
      notFound: true,
    };
  }
};
