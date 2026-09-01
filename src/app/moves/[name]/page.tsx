import { ReactNode, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@components/common/JsonLd";
import { MoveHero } from "@components/moves/MoveHero";
import { MoveStats } from "@components/moves/MoveStats";
import { MoveTypeMatchups } from "@components/moves/MoveTypeMatchups";
import { MoveMetaPanel } from "@components/moves/MoveMetaPanel";
import { MoveFlavor } from "@components/moves/MoveFlavor";
import { MoveLearnersGrid } from "@components/moves/MoveLearnersGrid";
import { MoveDetailData } from "@interfaces/move";
import { buildMetadata } from "@lib/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@constant/site";
import { prettify } from "@lib/text";
import { getMoveDetail } from "@lib/moveDetail";
import { primaryTypeColor } from "@constant/pokemonTypes";

type MoveDetailPageProps = { params: Promise<{ name: string }> };

export const revalidate = 86400; // refresh daily — move data is ~immutable

export async function generateStaticParams() {
  return [];
}

// Shared by generateMetadata + the page so the aggregation runs once per request.
const loadMove = cache((name: string) => getMoveDetail(name));

export async function generateMetadata({
  params,
}: MoveDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  try {
    const move = await loadMove(name);
    const displayName = prettify(move.name);
    return buildMetadata({
      title: `${displayName} | Nextdex Moves`,
      description:
        move.shortEffect ||
        `${displayName} — a Pokémon move. See its power, accuracy, effect, and which Pokémon learn it on Nextdex.`,
      image: "/images/pokeball.png",
      imageAlt: `${displayName} move`,
      url: `/moves/${move.name}`,
      type: "article",
    });
  } catch {
    return {}; // unknown move — the render itself calls notFound()
  }
}

async function loadDetail(name: string): Promise<MoveDetailData> {
  try {
    return await loadMove(name);
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

export default async function MoveDetailPage({ params }: MoveDetailPageProps) {
  const { name } = await params;
  const move = await loadDetail(name);

  const displayName = prettify(move.name);
  const canonicalUrl = absoluteUrl(`/moves/${move.name}`);
  const typeColor = primaryTypeColor([move.type]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${displayName} — Move`,
      description: move.effect || move.shortEffect,
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
          name: "Moves",
          item: `${SITE_URL}/moves`,
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

  const showFullEffect = move.effect && move.effect !== move.shortEffect;

  return (
    <div className="relative">
      <JsonLd data={jsonLd} />

      {/* Faint type-tinted wash at the page top. Absolute, not fixed, so it
          scrolls with the content and can't bleed above the navbar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[50vh]"
        style={{
          background: `radial-gradient(55% 60% at 50% -10%, color-mix(in oklch, ${typeColor} 16%, transparent), transparent 70%)`,
        }}
      />

      <div className="mx-auto max-w-4xl">
        <MoveHero move={move} />

        <Band title="Battle stats">
          <MoveStats move={move} />
        </Band>

        {move.matchups.length > 0 && (
          <Band title="Type effectiveness">
            <MoveTypeMatchups matchups={move.matchups} />
          </Band>
        )}

        {showFullEffect && (
          <Band title="Effect">
            <p className="max-w-2xl text-pretty leading-relaxed text-foreground/90">
              {move.effect}
            </p>
          </Band>
        )}

        <Band title="Details">
          <MoveMetaPanel move={move} />
        </Band>

        {move.flavorEntries.length > 0 && (
          <Band title="In the games">
            <MoveFlavor entries={move.flavorEntries} />
          </Band>
        )}

        <Band title={`Pokémon that learn ${displayName}`}>
          <MoveLearnersGrid learners={move.learners} />
        </Band>
      </div>
    </div>
  );
}
