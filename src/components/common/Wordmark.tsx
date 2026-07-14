import { Pokeball } from "@components/common/Pokeball";

type WordmarkProps = {
  className?: string;
  /** Glyph accent. Defaults to a display-tuned Signal Blue that clears the 3:1
   *  non-text contrast bar on the translucent nav. Exposed so a type-context
   *  surface could later tint the mark. */
  accent?: string;
  /** Render only the pokéball glyph (e.g. a tight/compact slot). */
  glyphOnly?: boolean;
};

// The Nextdex mark: a flat pokéball glyph + the "Nextdex" logotype.
export function Wordmark({
  className,
  accent = "#5B8CFF",
  glyphOnly = false,
}: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
        {/* Radar ping — two rings, the second staggered a half-cycle for a
            denser sweep. Behind the ball, only while the nav link is hovered. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-full border border-[#5B8CFF] opacity-0 group-hover:animate-ping-soft motion-reduce:group-hover:animate-none"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-full border border-[#5B8CFF] opacity-0 group-hover:animate-ping-soft-delayed motion-reduce:group-hover:animate-none"
        />
        <Pokeball
          accent={accent}
          className="relative z-10 h-7 w-7 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>

      {!glyphOnly && (
        <span className="text-lg font-extrabold leading-none tracking-tight text-white sm:text-xl">
          Nextdex
        </span>
      )}
    </span>
  );
}
