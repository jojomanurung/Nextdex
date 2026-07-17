import { NextResponse } from "next/server";
import { queryPokemon } from "@lib/pokemon";
import { DEFAULT_SORT, isSortKey } from "@constant/sort";
import { PAGE_LIMIT } from "@constant/pagination";
import { POKEMON_TYPES } from "@constant/pokemonTypes";

const MAX_LIMIT = 60;
const TYPE_NAMES = new Set(POKEMON_TYPES.map((t) => t.name));

function toInt(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
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
    types: toList(searchParams.get("types")).filter((t) => TYPE_NAMES.has(t)),
    gens: toList(searchParams.get("gens"))
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9),
  };

  try {
    return NextResponse.json(await queryPokemon(params));
  } catch {
    return NextResponse.json({ error: "failed to load" }, { status: 500 });
  }
}
