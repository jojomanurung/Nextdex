import { ReactNode } from "react";
import { SpeciesMeta } from "@dex/interfaces/pokemon";
import { pct255 } from "@dex/constant/pokemonMeta";
import { PokedexEntries } from "@dex/components/detail/PokedexEntries";

type AboutPanelProps = {
  species: SpeciesMeta;
  height: number; // decimetres (PokeAPI unit)
  weight: number; // hectograms (PokeAPI unit)
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-2 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm font-medium capitalize text-zinc-200">
        {children}
      </dd>
    </div>
  );
}

// Pokédex entry (flavor text) + the species metadata grid.
export function AboutPanel({ species, height, weight }: AboutPanelProps) {
  return (
    <div className="space-y-4">
      <PokedexEntries entries={species.flavorEntries} />

      <dl className="grid gap-x-8 sm:grid-cols-2">
        <Row label="Height">{height / 10} m</Row>
        <Row label="Weight">{weight / 10} kg</Row>
        {species.habitat && (
          <Row label="Habitat">{species.habitat.replace(/-/g, " ")}</Row>
        )}
        <Row label="Growth rate">{species.growthRate.replace(/-/g, " ")}</Row>
        <Row label="Catch rate">
          {species.captureRate}{" "}
          <span className="text-zinc-500">
            ({pct255(species.captureRate)}%)
          </span>
        </Row>
        <Row label="Base happiness">
          {species.baseHappiness}{" "}
          <span className="text-zinc-500">
            ({pct255(species.baseHappiness)}%)
          </span>
        </Row>
        <Row label="Gender">
          <span className="normal-case">{species.genderRatio}</span>
        </Row>
        <Row label="Egg groups">
          {species.eggGroups.map((g) => g.replace(/-/g, " ")).join(", ") || "—"}
        </Row>
      </dl>
    </div>
  );
}
