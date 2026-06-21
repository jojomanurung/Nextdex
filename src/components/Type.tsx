import { PokemonTypes } from "@dex/constant/PokemonTypes";
import Image from "next/image";

type TypeProp = {
  type: string;
};

export function Type({ type }: TypeProp) {
  const [{ name, color }] = PokemonTypes.filter((value) => value.name === type);

  return (
    <div
      className="rounded-lg px-2 py-1 flex items-center gap-2 justify-center"
      style={{ backgroundColor: color }}
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
