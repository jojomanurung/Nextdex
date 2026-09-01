"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@components/ui/button";
import { MoveLearner } from "@interfaces/move";

const INITIAL_COUNT = 24;

function LearnerTile({ pokemon }: { pokemon: MoveLearner }) {
  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className="group flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 outline-none transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-16 w-16">
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={0}
          height={0}
          sizes="64px"
          loading="lazy"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
          className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgb(0_0_0/0.15)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <span className="w-full truncate text-center text-xs capitalize text-muted-foreground transition-colors group-hover:text-primary">
        {pokemon.name.replace(/-/g, " ")}
      </span>
    </Link>
  );
}

// The Pokémon that learn this move. The list can run into the hundreds, so it
// caps the initial render and reveals the rest on demand.
export function MoveLearnersGrid({ learners }: { learners: MoveLearner[] }) {
  const [expanded, setExpanded] = useState(false);

  if (learners.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No Pokémon learn this move.
      </p>
    );
  }

  const shown = expanded ? learners : learners.slice(0, INITIAL_COUNT);
  const remaining = learners.length - shown.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {shown.map((p) => (
          <LearnerTile key={`${p.id}-${p.name}`} pokemon={p} />
        ))}
      </div>

      {learners.length > INITIAL_COUNT && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full px-4"
        >
          {expanded ? "Show less" : `Show all ${learners.length}`}
          <ChevronDown
            className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
          {!expanded && (
            <span className="sr-only">, {remaining} more</span>
          )}
        </Button>
      )}
    </div>
  );
}
