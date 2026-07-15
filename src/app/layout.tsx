import "@styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";
import { Martian_Mono } from "next/font/google";
import { Navbar } from "@components/common/Navbar";
import { Insights } from "@components/common/Insights";
import { ThemeSync } from "@components/common/ThemeSync";
import { BrowseSnapshotProvider } from "@context/BrowseSnapshotContext";
import { SITE_NAME, SITE_URL } from "@constant/site";

// Display / brand voice — Clash Display (self-hosted). Product names, headings,
// the wordmark. Not Inter; not a reflex sans.
const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
});

// Body / UI — Satoshi (self-hosted). Clean humanist grotesque; carries controls,
// labels, and prose.
const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
});

// Numeric "SKU" + technical readouts (dex #, stat/sort labels).
const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-martian",
  display: "swap",
});

const defaultDescription =
  "Browse, search, and sort every Pokémon by number or name. Dive into stats, types, abilities, and evolutions in a sleek modern Pokédex.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — Explore every Pokémon`,
  description: defaultDescription,
};

// Set the initial theme class before paint (no flash). Migrated routes follow
// the device theme; everything else is dark until migrated. Kept in sync after
// hydration by <ThemeSync/>.
const themeInit = `(function(){try{var t=location.pathname==='/';var d=t?matchMedia('(prefers-color-scheme: dark)').matches:true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${clash.variable} ${satoshi.variable} ${martianMono.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeSync />
        <BrowseSnapshotProvider>
          <Navbar />
          <main className="px-4 pb-16 md:px-6 lg:px-8">
            {children}
            <Insights />
          </main>
        </BrowseSnapshotProvider>
      </body>
    </html>
  );
}
