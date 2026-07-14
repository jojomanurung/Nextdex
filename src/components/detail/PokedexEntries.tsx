"use client";

import { useState } from "react";
import { FlavorEntry } from "@interfaces/pokemon";

// Pokédex flavor text across generations. Shows the most recent entry, with a
// button to reveal the rest (one representative entry per generation).
export function PokedexEntries({ entries }: { entries: FlavorEntry[] }) {
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) return null;

  const shown = expanded ? entries : entries.slice(0, 1);

  return (
    <div className="space-y-3">
      {shown.map((entry) => (
        <div key={entry.generation} className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
            {entry.generationLabel} · {entry.version}
          </p>
          <p className="leading-relaxed text-zinc-300">
            &ldquo;{entry.text}&rdquo;
          </p>
        </div>
      ))}

      {entries.length > 1 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          {expanded ? "Show less" : `Show all ${entries.length} entries`}
        </button>
      )}
    </div>
  );
}
