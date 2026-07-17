"use client";

import { SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@components/ui/popover";
import { POKEMON_TYPES } from "@constant/pokemonTypes";
import { GENERATION_LIST } from "@constant/pokemonMeta";
import { cn } from "@lib/utils";

// Shared filter control for both browse families: a calm trigger (with an
// active-count badge) opening a popover of type chips + generation toggles.
// Type color lives on the chips — the one place the design system allows it.
// Abilities pass no `types`, so only the Generation section renders.
type FilterMenuProps = {
  types?: string[];
  onTypesChange?: (next: string[]) => void;
  gens: number[];
  onGensChange: (next: number[]) => void;
  clearFilter: () => void;
};

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterMenu({
  types,
  onTypesChange,
  gens,
  onGensChange,
  clearFilter
}: FilterMenuProps) {
  const hasTypeFacet = Boolean(types && onTypesChange);
  const activeCount = (types?.length ?? 0) + gens.length;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Filter${activeCount ? `, ${activeCount} active` : ""}`}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <SlidersHorizontal
          aria-hidden
          className="size-4 text-muted-foreground"
        />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[11px] tabular-nums text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-[min(23rem,calc(100vw-2rem))] space-y-4">
        {hasTypeFacet && (
          <section>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              Type
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {POKEMON_TYPES.map((t) => {
                const selected = types!.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onTypesChange!(toggleValue(types!, t.name))}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium capitalize text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    style={{
                      backgroundColor: selected ? `${t.color}33` : `${t.color}14`,
                      borderColor: selected ? t.color : `${t.color}59`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0"
                      style={{
                        backgroundColor: t.color,
                        maskImage: `url(/images/types/${t.name}.svg)`,
                        WebkitMaskImage: `url(/images/types/${t.name}.svg)`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                      }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">
            Generation
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {GENERATION_LIST.map((g) => {
              const selected = gens.includes(g.gen);
              return (
                <button
                  key={g.gen}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Generation ${g.roman} · ${g.region}`}
                  title={g.region}
                  onClick={() => onGensChange(toggleValue(gens, g.gen))}
                  className={cn(
                    "h-8 min-w-9 rounded-md border px-2 font-mono text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {g.roman}
                </button>
              );
            })}
          </div>
        </section>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => clearFilter()}
            className="text-xs text-muted-foreground underline-offset-2 outline-none transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"
          >
            Clear all
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
