import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PokemonNeighbors } from "@interfaces/pokemon";
import { dexNo } from "@constant/pokemonMeta";

type DetailPagerProps = {
  neighbors: PokemonNeighbors;
};

// Prev/next pager across the national dex. Each side links to the adjacent
// Pokémon's detail page, labelled "#dex Name". An empty placeholder keeps a
// lone neighbor pinned to its edge at the ends of the dex (#1, the last entry).
export function DetailPager({ neighbors }: DetailPagerProps) {
  if (!neighbors.prev && !neighbors.next) return null;

  return (
    <nav
      aria-label="Browse adjacent Pokémon"
      className="flex items-center justify-between gap-3"
    >
      {neighbors.prev ? (
        <PagerLink direction="prev" neighbor={neighbors.prev} />
      ) : (
        <span aria-hidden />
      )}
      {neighbors.next ? (
        <PagerLink direction="next" neighbor={neighbors.next} />
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}

function PagerLink({
  direction,
  neighbor,
}: {
  direction: "prev" | "next";
  neighbor: NonNullable<PokemonNeighbors["prev"]>;
}) {
  const isPrev = direction === "prev";

  return (
    <Link
      href={`/pokemon/${neighbor.name}`}
      aria-label={`${isPrev ? "Previous" : "Next"}: ${neighbor.name}`}
      className={`group flex min-w-0 items-center gap-0.5 rounded-full px-2 py-2 pointer-coarse:py-3 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 ${
        isPrev ? "" : "flex-row-reverse"
      }`}
    >
      {isPrev ? (
        <ChevronLeft className="size-4 shrink-0 text-muted-foreground transition duration-200 ease-out group-hover:-translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      )}
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="shrink-0 font-mono text-[11px] font-medium tracking-widest tabular-nums text-muted-foreground">
          #{dexNo(neighbor.id)}
        </span>
        <span className="min-w-0 truncate text-sm font-medium capitalize text-foreground">
          {neighbor.name}
        </span>
      </span>
    </Link>
  );
}
