"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="sticky top-0 left-0 right-0 w-full backdrop-blur-xs z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-2">
        <Link href="/" aria-label="Nextdex home">
          <Image
            src="/images/Pokemon.svg"
            alt="Nextdex"
            width={0}
            height={0}
            className="h-auto w-full max-w-28 sm:max-w-36"
          />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-sm font-medium transition-colors ${
                  active
                    ? "text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white/80"
                    : "text-zinc-400 hover:text-white"
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
