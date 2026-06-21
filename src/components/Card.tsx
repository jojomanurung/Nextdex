import { PokemonTypes } from "@dex/constant/PokemonTypes";
import { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  types: string[];
};

export function Card({ children, types }: CardProps) {
  const [{ color }] = PokemonTypes.filter(
    (value) => value.name === types[0]
  );

  return (
    <div className="relative rounded-xl h-full px-4 py-4 lg:px-16 lg:py-8 shadow-md bg-slate-50/5 backdrop-blur-sm border border-white/5">
      <div className="absolute top-0 left-0 overflow-hidden -z-[1] w-full h-full rounded-xl">
        <div
          className="h-2/4 w-2/4 absolute blur-3xl top-0 left-1/2 -translate-x-1/2"
          style={{ backgroundColor: `${color}80` }}
        ></div>
      </div>
      <>{children}</>
    </div>
  );
}
