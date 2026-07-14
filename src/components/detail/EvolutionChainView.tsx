import Link from "next/link";
import Image from "next/image";
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
    return <p className="text-ink-muted">This Pokémon does not evolve.</p>;
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
                <span
                  aria-hidden
                  className="order-1 rotate-90 text-2xl leading-none text-ink-muted sm:order-2 sm:rotate-0"
                >
                  →
                </span>
                {linearCondition && (
                  <span className="order-2 max-w-[120px] text-center text-[11px] leading-tight text-ink-muted sm:order-1 sm:max-w-[90px]">
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
                    className={`group flex w-36 flex-col items-center gap-1 rounded-2xl border p-2 text-center transition ${
                      isCurrent
                        ? "border-white/20 bg-white/10"
                        : "border-white/5 bg-white/3 hover:bg-white/[0.07]"
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
                        className="object-contain transition-transform group-hover:scale-110"
                        placeholder="blur"
                        blurDataURL="/images/placeholder.png"
                      />
                    </div>
                    <span className="text-[10px] tracking-widest text-ink-muted">
                      #{dexNo(stage.id)}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {stage.name}
                    </span>
                    {branched && stage.condition && (
                      <span className="text-[11px] leading-tight text-ink-muted">
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
