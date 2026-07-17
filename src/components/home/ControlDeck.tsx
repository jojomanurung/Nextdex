import { ChangeEvent, ReactNode } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { SortKey, SORT_OPTIONS } from "@constant/sort";

type ControlDeckProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  resultCount: number;
  isLoading?: boolean;
  placeholder?: string;
  filterSlot?: ReactNode;
  activeFilters?: { key: string; label: string; onRemove: () => void }[];
  onClearFilters?: () => void;
};

export function ControlDeck({
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
  isLoading,
  placeholder = "Search the collection…",
  filterSlot,
  activeFilters,
  onClearFilters,
}: ControlDeckProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background py-3">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onQueryChange(e.target.value)
            }
            placeholder={placeholder}
            aria-label="Search Pokémon by name or number"
            className="h-11 pr-9 pl-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5 pointer-coarse:before:content-['']"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {filterSlot}
          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as SortKey)}
          >
            <SelectTrigger aria-label="Sort" className="h-11 w-44">
              <SelectValue>
                {(value) =>
                  SORT_OPTIONS.find((o) => o.value === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p
          aria-live="polite"
          className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted-foreground"
        >
          {resultCount.toLocaleString()} results
          {/* Reserved slot keeps loading from popping the line's width. */}
          <span className="inline-flex size-3.5 shrink-0 items-center justify-center">
            {isLoading && (
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
            )}
          </span>
        </p>

        {activeFilters && activeFilters.length > 0 && (
          <>
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={f.onRemove}
                  aria-label={`Remove ${f.label} filter`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted py-0.5 pr-1.5 pl-2 text-xs text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {f.label}
                  <X aria-hidden className="size-3 text-muted-foreground" />
                </button>
              ))}
              {onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="ml-0.5 text-xs text-muted-foreground underline-offset-2 outline-none transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
