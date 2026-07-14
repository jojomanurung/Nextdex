import { ChangeEvent } from "react";
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

// The device "control panel": sticky glass toolbar with search + sort. Docks
// just below the fixed Navbar.
export function ControlDeck({
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
  isLoading,
  placeholder = "Search name or number…",
}: ControlDeckProps) {
  return (
    <div className="sticky z-9 top-[72px] rounded-2xl bg-slate-950/60 p-3 shadow-lg backdrop-blur-md sm:p-4">
      <div className="flex gap-2 flex-row items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onQueryChange(e.target.value)
            }
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-hidden transition-colors placeholder:text-ink-muted focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="hidden sm:block text-xs tracking-wider text-ink-muted"
          >
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-hidden transition-colors focus:border-white/30"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                className="bg-slate-900 text-white"
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs text-ink-muted">{resultCount} results</p>
        {isLoading && (
          <span
            aria-hidden
            className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white/70"
          />
        )}
      </div>
    </div>
  );
}
