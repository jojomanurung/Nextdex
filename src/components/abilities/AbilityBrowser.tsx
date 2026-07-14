"use client";

import {
  AbilityRow,
  AbilityRowSkeleton,
} from "@components/abilities/AbilityRow";
import { ControlDeck } from "@components/home/ControlDeck";
import { VirtualScroll } from "@components/common/VirtualScroll";
import { ScrollToTop } from "@components/common/ScrollToTop";
import { AbilityData, AbilityQueryResult } from "@interfaces/ability";
import { useResourceBrowser } from "@hooks/useResourceBrowser";

type AbilityBrowserProps = {
  initial: AbilityQueryResult;
};

export function AbilityBrowser({ initial }: AbilityBrowserProps) {
  const {
    query,
    setQuery,
    sort,
    setSort,
    rows,
    resultCount,
    isLast,
    isEmpty,
    isLoading,
    isAppending,
    onIntersect,
  } = useResourceBrowser<AbilityData>({
    initial,
    endpoint: "/api/ability",
    snapshotKey: "abilities",
  });

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={resultCount}
        isLoading={isLoading}
        placeholder="Search abilities…"
      />

      <div
        className={`flex flex-col gap-3 transition-opacity duration-200 ${
          isLoading ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {rows.map((ability) => (
          <AbilityRow key={ability.name} ability={ability} />
        ))}
        {isAppending && <AbilityRowSkeleton />}
      </div>

      {isEmpty && (
        <p className="py-8 text-center text-ink-muted">
          {query ? `No abilities match "${query}".` : "Nothing to show."}
        </p>
      )}

      <ScrollToTop threshold={1000} />

      <VirtualScroll intersectCallback={onIntersect} isLast={isLast} />
    </>
  );
}
