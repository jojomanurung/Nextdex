import { PokemonType } from "pokenode-ts";
import Type from "./Type";
import { PokemonTypes } from "@dex/constant/PokemonTypes";

export type CardProps = {
  id: number;
  name: string;
  types: PokemonType[];
};

export default function Card({ id, name, types }: CardProps) {
  const [{ color }] = PokemonTypes.filter((value) => value.name === types[0].type.name);

  const formatPokemonId = (id: number) => {
    if (id < 10) return `#00${id}`;
    else if (id >= 10 && id < 99) return `#0${id}`;
    else return `#${id}`;
  };

  return (
    <div className="rounded-xl shadow-lg p-6" style={{backgroundColor: color}}>
      <div className="pb-5">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`}
          alt={name}
          width={`100%`}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="m-0">{formatPokemonId(id)}</p>
          <h2 className="text-2xl">{name}</h2>
        </div>
        <div>
          {types.map((type: PokemonType, index: any) => (
            <Type item={type.type.name} key={index}></Type>
          ))}
        </div>
      </div>
    </div>
  );
}
