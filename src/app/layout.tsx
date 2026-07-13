import "@styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Navbar } from "@components/common/Navbar";
import { Insights } from "@components/common/Insights";
import { PokemonListProvider } from "@context/PokemonListContext";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@constant/site";

const font = Inter({ weight: "400", subsets: ["latin"] });

const defaultDescription =
  "Browse, search, and sort every Pokémon by number or name. Dive into stats, types, abilities, and evolutions in a sleek modern Pokédex.";

// Site-wide metadata defaults. metadataBase lets any relative Open Graph /
// Twitter image url resolve to an absolute one (social crawlers require
// absolute); per-page metadata (see buildMetadata) overrides the rest.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — Explore every Pokémon`,
  description: defaultDescription,
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32", type: "image/png" }],
  },
  other: { "og:logo": absoluteUrl("/favicon.ico") },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-slate-900/90 text-white">
        <PokemonListProvider>
          <Navbar />
          <main className={`${font.className} px-3 md:px-7 lg:px-auto pb-10`}>
            {children}
            <Insights />
          </main>
        </PokemonListProvider>
      </body>
    </html>
  );
}
