import { NextResponse } from "next/server";
import { getPokemon } from "@dex/lib/pokemon";

type RouteContext = { params: Promise<{ name: string }> };

// Single-Pokémon detail by name, used by the home page to lazily load rows the
// user scrolls to (the search/sort index only carries id + name).
export async function GET(_request: Request, { params }: RouteContext) {
  const { name } = await params;

  try {
    const data = await getPokemon(name);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
