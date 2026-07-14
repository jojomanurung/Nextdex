import Link from "next/link";
import Image from "next/image";
import { AbilityPokemonRef } from "@interfaces/ability";

function PokemonTile({ pokemon }: { pokemon: AbilityPokemonRef }) {
  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className="group flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10"
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
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="w-full truncate text-center text-xs capitalize text-zinc-300">
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
      <h3 className="mb-3 text-sm font-semibold text-ink-muted">
        {title} <span className="text-ink-muted">({pokemon.length})</span>
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
      <p className="text-sm text-ink-muted">No Pokémon have this ability.</p>
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
