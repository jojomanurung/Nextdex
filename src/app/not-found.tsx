import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { StatusScreen } from "@components/common/StatusScreen";
import { buttonVariants } from "@components/ui/button";
import { cn } from "@lib/utils";

export const metadata: Metadata = {
  title: "404 · Page not found | Nextdex",
};

// App Router custom 404 — rendered for unknown routes and whenever a page calls
// notFound() (e.g. an invalid Pokémon name on /pokemon/[name]).
export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Lost in the tall grass"
      description={
        <>
          The page you&rsquo;re looking for fled, evolved, or never existed
          &mdash; even Psyduck looks confused.
        </>
      }
      image={{
        src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png",
        alt: "A confused Psyduck",
      }}
      glow="#38bdf8"
      actions={
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "rounded-full px-5",
          )}
        >
          <ArrowLeft />
          Back to the Pokédex
        </Link>
      }
    />
  );
}
