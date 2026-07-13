import Link from "next/link";
import { PokemonNeighbors } from "@dex/interfaces/pokemon";
import { dexNo } from "@dex/constant/pokemonMeta";

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
      className={`group flex min-w-0 items-center gap-0.5 rounded-full p-2 hover:backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 sm:px-4 ${
        isPrev ? "" : "flex-row-reverse"
      }`}
    >
      <Chevron
        direction={isPrev ? "left" : "right"}
        className={`h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-200 ${
          isPrev ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        }`}
      />
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="shrink-0 text-[11px] font-medium tracking-widest text-zinc-500">
          #{dexNo(neighbor.id)}
        </span>
        <span className="min-w-0 truncate text-sm font-medium capitalize text-zinc-200">
          {neighbor.name}
        </span>
      </span>
    </Link>
  );
}

function Chevron({
  direction,
  className,
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}
