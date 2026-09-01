import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoveBrowser } from "@components/moves/MoveBrowser";
import { JsonLd } from "@components/common/JsonLd";
import { queryMoves } from "@lib/move";
import { MoveQueryResult } from "@interfaces/move";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL } from "@constant/site";

export const revalidate = 3600;

const description =
  "Browse, search, and sort every Pokémon move. Filter by type, damage class, and generation, and see each move's power, accuracy, effect, and which Pokémon learn it.";

export const metadata: Metadata = buildMetadata({
  title: "Moves — Nextdex",
  description,
  image: "/images/pokeball.png",
  imageAlt: "Nextdex",
  url: "/moves",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Pokémon Moves",
  url: `${SITE_URL}/moves`,
  description,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

async function loadMovesData(): Promise<MoveQueryResult> {
  try {
    return await queryMoves();
  } catch {
    notFound();
  }
}

export default async function MovesPage() {
  const initial = await loadMovesData();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3">
      <JsonLd data={jsonLd} />
      <MoveBrowser initial={initial} />
    </div>
  );
}
