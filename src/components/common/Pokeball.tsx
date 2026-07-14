type PokeballProps = {
  /** Stroke/fill color. */
  accent?: string;
  /** Stroke weight in the 32-unit viewBox (favicon bumps this for 16px legibility). */
  strokeWidth?: number;
  /** Explicit pixel size; omit in the DOM and size via className instead. */
  size?: number;
  className?: string;
};

// The Nextdex mark's core geometry — a pokéball rendered as a flat instrument icon.
export function Pokeball({
  accent = "#5B8CFF",
  strokeWidth = 2,
  size,
  className,
}: PokeballProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Top-half tonal wash — reads as a pokéball without red/white coding */}
      <path d="M5 16 A11 11 0 0 1 27 16 Z" fill={accent} fillOpacity="0.16" />
      {/* Shell */}
      <circle cx="16" cy="16" r="11" stroke={accent} strokeWidth={strokeWidth} />
      {/* Equator band, split around the button */}
      <g stroke={accent} strokeWidth={strokeWidth} strokeLinecap="round">
        <line x1="5" y1="16" x2="12.5" y2="16" />
        <line x1="19.5" y1="16" x2="27" y2="16" />
      </g>
      {/* Release button */}
      <circle cx="16" cy="16" r="3.5" stroke={accent} strokeWidth={strokeWidth} />
      <circle cx="16" cy="16" r="1.3" fill={accent} />
    </svg>
  );
}
