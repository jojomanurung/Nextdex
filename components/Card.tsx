import { PokemonSprites, PokemonType } from "pokenode-ts";
import { PokemonTypes } from "@dex/constant/PokemonTypes";
import Type from "./Type";
import Image from "next/image";

export type CardProps = {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
};

export default function Card({ id, name, types, sprites }: CardProps) {
  const [{ color }] = PokemonTypes.filter(
    (value) => value.name === types[0].type.name
  );

  const formatPokemonId = (id: number) => {
    if (id < 10) return `#00${id}`;
    else if (id >= 10 && id < 99) return `#0${id}`;
    else return `#${id}`;
  };

  return (
    <div
      className="rounded-xl shadow-lg p-6 bg-gradient-to-br from-slate-200/40 to-slate-50/30"
    >
      <div className="pb-5 flex justify-center">
        <Image
          src={sprites.other!["official-artwork"].front_default!}
          alt={name}
          width={300}
          height={200}
          priority={true}
        />
      </div>
      <div className="flex items-center justify-center flex-col gap-2">
        <div>
          <p className="m-0">{formatPokemonId(id)}</p>
          {types.map((type: PokemonType, index: any) => (
            <Type item={type.type.name} key={index}></Type>
          ))}
        </div>
        <div>
          <h2 className="text-2xl">{name}</h2>
        </div>
      </div>
    </div>
  );
}
