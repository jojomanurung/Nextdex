import { POKEMON_TYPES } from "@constant/pokemonTypes";

type TypeProp = { type: string };

export function Type({ type }: TypeProp) {
  const match = POKEMON_TYPES.find((value) => value.name === type);
  const name = match?.name ?? type;
  const color = match?.color ?? "#9fa39d";
  const iconUrl = match ? `url(/images/types/${name}.svg)` : undefined;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize text-foreground"
      style={{ backgroundColor: `${color}1f`, borderColor: `${color}59` }}
    >
      {iconUrl && (
        <span
          aria-hidden
          className="size-3 shrink-0"
          style={{
            backgroundColor: color,
            maskImage: iconUrl,
            WebkitMaskImage: iconUrl,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      )}
      {name}
    </span>
  );
}
