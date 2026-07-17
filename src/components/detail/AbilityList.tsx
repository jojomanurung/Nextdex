import Link from "next/link";
import { Badge } from "@components/ui/badge";
import { AbilityInfo } from "@interfaces/pokemon";

// A flowing list of abilities — each a linked name (+ Hidden badge) over its
// effect, divided by hairline rules. Reads down the page, not a tile grid.
export function AbilityList({ abilities }: { abilities: AbilityInfo[] }) {
  return (
    <div className="divide-y divide-border">
      {abilities.map((ability) => (
        <div key={ability.name} className="py-4 first:pt-0 last:pb-0">
          <div className="mb-1 flex items-center gap-2">
            <Link
              href={`/abilities/${ability.name}`}
              className="rounded-sm font-display font-semibold capitalize text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ability.name.replace(/-/g, " ")}
            </Link>
            {ability.isHidden && (
              <Badge
                variant="outline"
                className="border-violet-400/50 bg-violet-400/15 uppercase tracking-wide text-violet-700 dark:text-violet-200"
              >
                Hidden
              </Badge>
            )}
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {ability.effect || "No description available."}
          </p>
        </div>
      ))}
    </div>
  );
}
