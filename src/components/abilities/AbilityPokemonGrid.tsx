import Link from "next/link";
import Image from "next/image";
import { AbilityPokemonRef } from "@interfaces/ability";

function PokemonTile({ pokemon }: { pokemon: AbilityPokemonRef }) {
  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className="group flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 outline-none transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-16 w-16">
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={0}
          height={0}
          sizes="64px"
          loading="lazy"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
          className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgb(0_0_0/0.15)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <span className="w-full truncate text-center text-xs capitalize text-muted-foreground transition-colors group-hover:text-primary">
        {pokemon.name.replace(/-/g, " ")}
      </span>
    </Link>
  );
}

function Group({
  title,
  pokemon,
}: {
  title: string;
  pokemon: AbilityPokemonRef[];
}) {
  if (pokemon.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        {title}{" "}
        <span className="font-mono tabular-nums text-muted-foreground">
          ({pokemon.length})
        </span>
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {pokemon.map((p) => (
          <PokemonTile key={`${p.id}-${p.name}`} pokemon={p} />
        ))}
      </div>
    </div>
  );
}

export function AbilityPokemonGrid({
  pokemon,
}: {
  pokemon: AbilityPokemonRef[];
}) {
  if (pokemon.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No Pokémon have this ability.</p>
    );
  }

  const standard = pokemon.filter((p) => !p.isHidden);
  const hidden = pokemon.filter((p) => p.isHidden);

  return (
    <div className="space-y-6">
      <Group title="Standard" pokemon={standard} />
      <Group title="Hidden ability" pokemon={hidden} />
    </div>
  );
}
