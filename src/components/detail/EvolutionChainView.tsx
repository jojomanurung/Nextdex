import Link from "next/link";
import Image from "next/image";
import { EvolutionStage } from "@dex/interfaces/pokemon";
import { dexNo } from "@dex/constant/pokemonMeta";

type EvolutionChainViewProps = {
  stages: EvolutionStage[];
  currentId: number;
  accent: string;
};

// Renders the evolution line as one column per stage depth, so a branched chain
// (e.g. Eevee) fans its options out in a single column. Each stage links to its
// own detail page; the current Pokémon is highlighted.
export function EvolutionChainView({
  stages,
  currentId,
  accent,
}: EvolutionChainViewProps) {
  if (stages.length <= 1) {
    return <p className="text-zinc-400">This Pokémon does not evolve.</p>;
  }

  const maxStage = Math.max(...stages.map((s) => s.stage));
  const columns = Array.from({ length: maxStage + 1 }, (_, depth) =>
    stages.filter((s) => s.stage === depth),
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      {columns.map((column, index) => (
        <div key={index} className="flex items-center gap-2 sm:gap-4">
          {index > 0 && (
            <span aria-hidden className="text-2xl text-zinc-600">
              →
            </span>
          )}
          <div className="flex flex-col items-center gap-2">
            {column.map((stage) => {
              const isCurrent = stage.id === currentId;
              return (
                <Link
                  key={stage.id}
                  href={`/detail/${stage.name}`}
                  className={`group flex w-28 flex-col items-center gap-1 rounded-2xl border p-2 text-center transition ${
                    isCurrent
                      ? "border-white/20 bg-white/10"
                      : "border-white/5 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="relative h-20 w-20">
                    <div
                      aria-hidden
                      className="absolute inset-3 rounded-full opacity-40 blur-xl"
                      style={{
                        backgroundColor: isCurrent ? accent : "transparent",
                      }}
                    />
                    <Image
                      src={stage.image}
                      alt={stage.name}
                      fill
                      sizes="80px"
                      className="object-contain transition-transform group-hover:scale-110"
                      placeholder="blur"
                      blurDataURL="/images/placeholder.png"
                    />
                  </div>
                  <span className="text-[10px] tracking-widest text-zinc-500">
                    #{dexNo(stage.id)}
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {stage.name}
                  </span>
                  {stage.condition && (
                    <span className="text-[11px] leading-tight text-zinc-500">
                      {stage.condition}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
