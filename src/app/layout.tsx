import "@styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";
import { Martian_Mono } from "next/font/google";
import { Navbar } from "@components/common/Navbar";
import { Insights } from "@components/common/Insights";
import { ThemeSync } from "@components/common/ThemeSync";
import { ScrollToTop } from "@components/common/ScrollToTop";
import { BrowseSnapshotProvider } from "@context/BrowseSnapshotContext";
import { SITE_NAME, SITE_URL } from "@constant/site";

// Display / brand voice — Clash Display (self-hosted).
const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
});

// Body / UI — Satoshi (self-hosted).
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

// Set the initial theme class before paint (no flash) from the device theme,
// falling back to dark. Kept in sync with live OS changes by <ThemeSync/>.
const themeInit = `(function(){try{document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches);}catch(e){document.documentElement.classList.add('dark');}})();`;

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
          <main className="px-4 pb-4 md:px-6 lg:px-8">
            {children}
            <ScrollToTop threshold={1000} />
            <Insights />
          </main>
        </BrowseSnapshotProvider>
      </body>
    </html>
  );
}
