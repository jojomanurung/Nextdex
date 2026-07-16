"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@components/common/Wordmark";

const LINKS = [
  {
    href: "/",
    label: "Pokémon",
    match: (p: string) => p === "/" || p.startsWith("/pokemon"),
  },
  {
    href: "/abilities",
    label: "Abilities",
    match: (p: string) => p.startsWith("/abilities"),
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-background px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5">
        <Link
          href="/"
          aria-label="Nextdex home"
          className="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-sm font-medium transition-colors before:absolute before:inset-x-0 before:-top-3 before:-bottom-3 before:content-[''] ${
                  active
                    ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
