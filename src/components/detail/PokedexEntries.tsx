"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@components/ui/button";
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
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {entry.generationLabel} · {entry.version}
          </p>
          <p className="max-w-prose leading-relaxed text-muted-foreground">
            &ldquo;{entry.text}&rdquo;
          </p>
        </div>
      ))}

      {entries.length > 1 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full px-4"
        >
          {expanded ? "Show less" : `Show all ${entries.length} entries`}
          <ChevronDown
            className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
