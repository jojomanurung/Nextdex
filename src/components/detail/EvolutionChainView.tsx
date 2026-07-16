import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { EvolutionStage } from "@interfaces/pokemon";
import { dexNo } from "@constant/pokemonMeta";

type EvolutionChainViewProps = {
  stages: EvolutionStage[];
  currentId: number;
  accent: string;
};

// Renders the evolution line grouped by stage depth. Flows horizontally with
// right-arrows on sm+, and stacks vertically with down-arrows on mobile; a
// branched chain (e.g. Eevee) fans its options into a column (sm+) or a wrapped
// row (mobile). Each stage links to its own detail page; current one highlighted.
export function EvolutionChainView({
  stages,
  currentId,
  accent,
}: EvolutionChainViewProps) {
  if (stages.length <= 1) {
    return <p className="text-muted-foreground">This Pokémon does not evolve.</p>;
  }

  const maxStage = Math.max(...stages.map((s) => s.stage));
  const columns = Array.from({ length: maxStage + 1 }, (_, depth) =>
    stages.filter((s) => s.stage === depth),
  );

  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
      {columns.map((column, index) => {
        // Linear stage → show its condition on the connecting arrow. Branched
        // stages keep their condition under each card (they differ per branch).
        const branched = column.length > 1;
        const linearCondition = branched ? null : column[0].condition;
        return (
          <div
            key={index}
            className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3"
          >
            {index > 0 && (
              <div className="flex flex-row items-center gap-1 sm:flex-col sm:gap-0.5">
                <ChevronRight
                  aria-hidden
                  className="order-1 size-6 rotate-90 text-muted-foreground sm:order-2 sm:rotate-0"
                />
                {linearCondition && (
                  <span className="order-2 max-w-[120px] text-center text-[11px] leading-tight text-muted-foreground sm:order-1 sm:max-w-[90px]">
                    {linearCondition}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-row flex-wrap items-center justify-center gap-2 sm:flex-col">
              {column.map((stage) => {
                const isCurrent = stage.id === currentId;
                return (
                  <Link
                    key={stage.id}
                    href={`/pokemon/${stage.name}`}
                    className={`group flex w-36 flex-col items-center gap-1 rounded-2xl p-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isCurrent ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative h-28 w-28">
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
                        sizes="112px"
                        className="object-contain transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        placeholder="blur"
                        blurDataURL="/images/placeholder.png"
                      />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest tabular-nums text-muted-foreground">
                      #{dexNo(stage.id)}
                    </span>
                    <span className="text-sm font-medium capitalize text-foreground">
                      {stage.name}
                    </span>
                    {branched && stage.condition && (
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {stage.condition}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
