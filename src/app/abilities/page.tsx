import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AbilityBrowser } from "@components/abilities/AbilityBrowser";
import { JsonLd } from "@components/common/JsonLd";
import { queryAbilities } from "@lib/ability";
import { AbilityQueryResult } from "@interfaces/ability";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL } from "@constant/site";

export const revalidate = 3600;

const description =
  "Browse, search, and sort every Pokémon ability. See what each ability does and which Pokémon can have it.";

export const metadata: Metadata = buildMetadata({
  title: "Abilities — Nextdex",
  description,
  image: "/images/pokeball.png",
  imageAlt: "Nextdex",
  url: "/abilities",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Pokémon Abilities",
  url: `${SITE_URL}/abilities`,
  description,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

async function loadAbilitiesData(): Promise<AbilityQueryResult> {
  try {
    return await queryAbilities();
  } catch {
    notFound();
  }
}

export default async function AbilitiesPage() {
  const initial = await loadAbilitiesData();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3">
      <JsonLd data={jsonLd} />
      <AbilityBrowser initial={initial} />
    </div>
  );
}
