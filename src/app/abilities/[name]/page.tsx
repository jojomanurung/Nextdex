import { ReactNode, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

// An editorial band — a Clash heading over its content, divided from the hero
// by a hairline rule. No boxes, matching the Pokémon detail dossier.
function Band({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
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
    <div className="relative">
      <JsonLd data={jsonLd} />

      {/* Faint brand wash at the page top (abilities carry no type color).
          Absolute, not fixed, so it scrolls with the content and can't bleed
          above the navbar on overscroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[50vh]"
        style={{
          background:
            "radial-gradient(55% 60% at 50% -10%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-4xl">
        <AbilityHero ability={ability} />

        <Band title="Pokémon with this ability">
          <AbilityPokemonGrid pokemon={ability.pokemon} />
        </Band>
      </div>

      <ScrollToTop reveal="near-bottom" />
    </div>
  );
}
