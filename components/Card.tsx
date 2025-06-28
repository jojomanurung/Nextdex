import { PokemonSprites, PokemonType } from "pokenode-ts";
import { PokemonTypes } from "@dex/constant/PokemonTypes";
import Type from "./Type";
import Image from "next/image";
import Placeholder from "@dex/public/images/pokemon_placeholder.png";

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
    else if (id >= 10 && id <= 99) return `#0${id}`;
    else return `#${id}`;
  };

  return (
    <div className="relative rounded-xl px-16 py-4 shadow-md bg-slate-50/5 backdrop-blur-sm border border-white/5">
      <div className="absolute top-0 left-0 overflow-hidden -z-[1] w-full h-full rounded-xl">
        <div
          className="h-2/4 w-2/4 absolute blur-3xl top-0 left-1/2 -translate-x-1/2"
          style={{ backgroundColor: `${color}80` }}
        ></div>
      </div>
      <div className="flex justify-center">
        <Image
          src={sprites.other?.["official-artwork"].front_default ?? Placeholder}
          alt={name}
          width={0}
          height={0}
          sizes="100%"
          priority
          placeholder="blur"
          blurDataURL="/images/pokemon_placeholder.png"
          className="w-full h-auto"
        />
      </div>
      <div className="flex items-center justify-center flex-col gap-2">
        <div className="w-full">
          <h1 className="m-0 text-center text-2xl">{formatPokemonId(id)}</h1>
          <h2 className="text-2xl text-center">{name.toUpperCase()}</h2>
        </div>
        <div className="w-full">
          <div className="flex justify-center item-center gap-2">
            {types.map((type: PokemonType, index: any) => (
              <Type key={index} type={type.type.name}></Type>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
