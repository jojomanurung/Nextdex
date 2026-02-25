import { TypeColors } from "@dex/constant/TypeColors";
import Image from "next/image";

type TypeProp = {
  type: string;
};

export default function Type({ type }: TypeProp) {
  const color = TypeColors[type];

  return (
    <div
      className="rounded-lg px-2 py-1 flex items-center gap-2 justify-center"
      style={{ backgroundColor: `${color}80` }}
    >
      <Image
        src={`/images/types/${type}.svg`}
        alt={type}
        width={15}
        height={15}
      />
      <p className="text-center text-sm md:text-lg text-white">
        {type.toUpperCase()}
      </p>
    </div>
  );
}
