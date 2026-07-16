import { ChangeEvent } from "react";
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
};

export function ControlDeck({
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
  isLoading,
  placeholder = "Search the collection…",
}: ControlDeckProps) {
  return (
    <div className="sticky top-12 z-10 mb-8 border-b border-border bg-background py-3">
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
          <p
            aria-live="polite"
            className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted-foreground"
          >
            {isLoading && (
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
            )}
            {resultCount.toLocaleString()} results
          </p>
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
    </div>
  );
}
