import Link from "next/link";
import { AbilityInfo } from "@interfaces/pokemon";

export function AbilityList({ abilities }: { abilities: AbilityInfo[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {abilities.map((ability) => (
        <Link
          key={ability.name}
          href={`/abilities/${ability.name}`}
          className="group block rounded-2xl border border-white/5 bg-white/3 p-3 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10"
        >
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold capitalize group-hover:underline">
              {ability.name.replace(/-/g, " ")}
            </h3>
            {ability.isHidden && (
              <span className="rounded-full border border-violet-300/40 bg-violet-300/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-200">
                Hidden
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            {ability.effect || "No description available."}
          </p>
        </Link>
      ))}
    </div>
  );
}
