import { POKEMON_TYPES } from "@dex/constant/pokemonTypes";
import Image from "next/image";

type TypeProp = {
  type: string;
};

export function Type({ type }: TypeProp) {
  // Tolerate an unmapped type (e.g. a future/unknown type from the API) instead
  // of crashing on an empty destructure: fall back to the raw name + a neutral
  // color, and skip the icon (its SVG won't exist).
  const match = POKEMON_TYPES.find((value) => value.name === type);
  const name = match?.name ?? type;
  const color = match?.color ?? "#9fa39d";

  return (
    <div
      className="rounded-lg px-2 py-1 flex items-center gap-2 justify-center border backdrop-blur-xs"
      style={{ backgroundColor: `${color}26`, borderColor: `${color}99` }}
    >
      {match && (
        <Image
          src={`/images/types/${name}.svg`}
          alt={name}
          width={0}
          height={0}
          className="w-3 md:w-3.5 h-auto"
        />
      )}
      <p className="text-center text-[10px] md:text-xs text-white">
        {name.toUpperCase()}
      </p>
    </div>
  );
}
