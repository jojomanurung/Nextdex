import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@components/common/Card";
import { ScrollToTop } from "@components/common/ScrollToTop";
import { JsonLd } from "@components/common/JsonLd";
import { AbilityHero } from "@components/abilities/AbilityHero";
import { AbilityPokemonGrid } from "@components/abilities/AbilityPokemonGrid";
import { AbilityDetailData } from "@interfaces/ability";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@constant/site";
import { prettify } from "@lib/text";
import { getAbilityDetail } from "@lib/abilityDetail";

type AbilityDetailPageProps = { params: Promise<{ name: string }> };

export const revalidate = 86400; // refresh daily — ability data is ~immutable

export async function generateStaticParams() {
  return [];
}

// Shared by generateMetadata + the page so the aggregation runs once per request.
const loadAbility = cache((name: string) => getAbilityDetail(name));

export async function generateMetadata({
  params,
}: AbilityDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  try {
    const ability = await loadAbility(name);
    const displayName = prettify(ability.name);
    return buildMetadata({
      title: `${displayName} | Nextdex Abilities`,
      description:
        ability.effect ||
        `${displayName} — a Pokémon ability. See what it does and which Pokémon can have it on Nextdex.`,
      image: "/images/pokeball.png",
      imageAlt: `${displayName} ability`,
      url: `/abilities/${ability.name}`,
      type: "article",
    });
  } catch {
    return {}; // unknown ability — the render itself calls notFound()
  }
}

async function loadDetail(name: string): Promise<AbilityDetailData> {
  try {
    return await loadAbility(name);
  } catch {
    notFound();
  }
}

export default async function AbilityDetailPage({
  params,
}: AbilityDetailPageProps) {
  const { name } = await params;
  const ability = await loadDetail(name);

  const displayName = prettify(ability.name);
  const canonicalUrl = absoluteUrl(`/abilities/${ability.name}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${displayName} — Ability`,
      description: ability.description || ability.effect,
      url: canonicalUrl,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Abilities",
          item: `${SITE_URL}/abilities`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: displayName,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Neutral ambient wash (abilities carry no type color). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(148,163,184,0.15), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <AbilityHero ability={ability} />

        <Card>
          <h2 className="mb-3 text-xl font-semibold">Effect</h2>
          <p className="leading-relaxed text-zinc-300">
            {ability.description || "No effect description available."}
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">
            Pokémon with this ability
          </h2>
          <AbilityPokemonGrid pokemon={ability.pokemon} />
        </Card>
      </div>

      <ScrollToTop reveal="near-bottom" />
    </>
  );
}
