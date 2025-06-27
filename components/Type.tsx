import { PokemonTypes } from "@dex/constant/PokemonTypes";
import Image from "next/image";

type TypeProp = {
  type: string;
};

export default function Type({ type }: TypeProp) {
  const [{ name, color }] = PokemonTypes.filter((value) => value.name === type);

  return (
    <div
      className="rounded-lg px-2 py-1 flex items-center gap-2 justify-center"
      style={{ backgroundColor: color }}
    >
      <Image src={`/pokemonTypes/${name}.svg`} alt={name} width={15} height={15}/>
      <p className="text-center text-lg text-white">{name.toUpperCase()}</p>
    </div>
  );
}
