import { ChangeEvent, ReactNode } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { SortKey, SORT_OPTIONS } from "@constant/sort";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@components/ui/input-group";

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
        <InputGroup>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onQueryChange(e.target.value)
            }
            placeholder={placeholder}
            aria-label="Search Pokémon by name or number"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                size="icon-xs"
              >
                <X className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

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
                <Button
                  key={f.key}
                  type="button"
                  variant="outline"
                  onClick={f.onRemove}
                  aria-label={`Remove ${f.label} filter`}
                  className="text-xs"
                >
                  {f.label}
                  <X aria-hidden className="size-3 text-muted-foreground" />
                </Button>
              ))}
              {onClearFilters && (
                <Button
                  type="button"
                  variant="link"
                  onClick={onClearFilters}
                  className="ml-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:underline"
                >
                  Clear all
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
