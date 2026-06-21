import { PokemonTypes } from "@dex/constant/PokemonTypes";
import Image from "next/image";

type TypeProp = {
  type: string;
  /** "solid" (default) keeps the original filled pill; "frosted" matches the glass UI. */
  variant?: "solid" | "frosted";
};

export function Type({ type, variant = "solid" }: TypeProp) {
  const [{ name, color }] = PokemonTypes.filter((value) => value.name === type);

  const frosted = variant === "frosted";

  return (
    <div
      className="rounded-lg px-2 py-1 flex items-center gap-2 justify-center border backdrop-blur-sm"
      style={
        frosted
          ? { backgroundColor: `${color}26`, borderColor: `${color}99` }
          : { backgroundColor: color, borderColor: color }
      }
    >
      <Image
        src={`/images/types/${name}.svg`}
        alt={name}
        width={0}
        height={0}
        className="w-1/4 h-auto"
      />
      <p className="text-center text-xs md:text-lg text-white">{name.toUpperCase()}</p>
    </div>
  );
}
