import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@components/common/Wordmark";
import { SITE_NAME } from "@constant/site";

const REPO_URL = "https://github.com/jojomanurung/Nextdex";
const POKEAPI_URL = "https://pokeapi.co";

// De-boxed catalogue "colophon" — the chrome's closing bookend. Mirrors the
// Navbar's solid surface + hairline border (top instead of bottom) and speaks
// the Martian-Mono catalogue voice. Server component: no client JS.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand block */}
          <div className="max-w-xs">
            <Link
              href="/"
              aria-label={`${SITE_NAME} home`}
              className="group inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Wordmark />
            </Link>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              The national dex, presented as a curated gallery — Made with
              NextJS, TailwindCSS, Shadcn and a lot of childhood memories.
              Deployed to Vercel
            </p>
          </div>

          {/* Link groups */}
          <nav aria-label="Footer" className="flex gap-14 sm:gap-16">
            <FooterGroup label="Browse">
              <FooterLink href="/">Pokémon</FooterLink>
              <FooterLink href="/abilities">Abilities</FooterLink>
            </FooterGroup>

            <FooterGroup label="Project">
              <FooterExternalLink href={REPO_URL}>
                View source
              </FooterExternalLink>
              <FooterExternalLink href={POKEAPI_URL}>
                Data · PokéAPI
              </FooterExternalLink>
            </FooterGroup>
          </nav>
        </div>

        {/* Catalogue baseline */}
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="tabular-nums">No. 001 — 1025 · National Dex</span>
          <span className="normal-case tracking-normal">
            Pokémon © Nintendo · Unofficial fan project · © {year} {SITE_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {children}
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
        />
      </a>
    </li>
  );
}
