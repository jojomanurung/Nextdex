import "@styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Navbar } from "@components/common/Navbar";
import { Insights } from "@components/common/Insights";
import { BrowseSnapshotProvider } from "@context/BrowseSnapshotContext";
import { SITE_NAME, SITE_URL } from "@constant/site";

const font = Inter({ subsets: ["latin"], display: "swap" });

const defaultDescription =
  "Browse, search, and sort every Pokémon by number or name. Dive into stats, types, abilities, and evolutions in a sleek modern Pokédex.";

// Site-wide metadata defaults. metadataBase lets any relative Open Graph /
// Twitter image url resolve to an absolute one (social crawlers require
// absolute); per-page metadata (see buildMetadata) overrides the rest.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — Explore every Pokémon`,
  description: defaultDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${font.className} bg-slate-900/90 text-white`}>
        <BrowseSnapshotProvider>
          <Navbar />
          <main className="px-3 md:px-7 lg:px-auto pb-10">
            {children}
            <Insights />
          </main>
        </BrowseSnapshotProvider>
      </body>
    </html>
  );
}
