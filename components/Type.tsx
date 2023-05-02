import { PokemonTypes } from "@dex/constant/PokemonTypes";

type TypeProp = {
  item: string;
};

export default function Type({ item }: TypeProp) {
  const [{ name, color }] = PokemonTypes.filter((value) => value.name === item);

  return (
    <div
      className="rounded-lg p-1 my-2 flex items-center gap-1 justify-center"
      style={{ backgroundColor: color }}
    >
      <img src={`/pokemonTypes/${name}.svg`} alt={name} />
      <p className="text-center text-lg text-white">{name}</p>
    </div>
  );
}
