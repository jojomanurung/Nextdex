import { NextResponse } from "next/server";
import { queryAbilities } from "@lib/ability";
import { DEFAULT_SORT, isSortKey } from "@constant/sort";
import { PAGE_LIMIT } from "@constant/pagination";

const MAX_LIMIT = 60;

function toInt(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "";

  const params = {
    query: searchParams.get("q") ?? "",
    sort: isSortKey(sort) ? sort : DEFAULT_SORT,
    offset: Math.max(0, toInt(searchParams.get("offset"), 0)),
    limit: Math.min(
      MAX_LIMIT,
      Math.max(1, toInt(searchParams.get("limit"), PAGE_LIMIT)),
    ),
    gens: toList(searchParams.get("gens"))
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9),
  };

  try {
    return NextResponse.json(await queryAbilities(params));
  } catch {
    return NextResponse.json({ error: "failed to load" }, { status: 500 });
  }
}
