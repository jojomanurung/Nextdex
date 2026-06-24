import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@dex/components/common/Card";

// Pages Router custom 404 — statically generated and auto-rendered for unknown
// routes and for any page that returns { notFound: true } (e.g. an invalid
// Pokémon name on /detail/[id]).
export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 · Page not found | Nextdex</title>
      </Head>

      <div className="mx-auto max-w-2xl py-12 sm:py-20">
        <Card>
          <div className="flex flex-col items-center gap-5 px-2 py-6 text-center">
            {/* A confused Psyduck on a glow — the universal "I'm lost" mascot. */}
            <div className="relative h-40 w-40">
              <div
                aria-hidden
                className="absolute inset-6 rounded-full bg-[#38bdf8] opacity-30 blur-3xl"
              />
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
                alt="A confused Psyduck"
                fill
                sizes="160px"
                className="object-contain drop-shadow-2xl"
                placeholder="blur"
                blurDataURL="/images/placeholder.png"
              />
            </div>

            <p className="text-6xl font-black tracking-tight sm:text-7xl">404</p>
            <h1 className="text-xl font-semibold">Lost in the tall grass</h1>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              The page you&rsquo;re looking for fled, evolved, or never existed
              &mdash; even Psyduck looks confused.
            </p>

            <Link
              href="/"
              className="mt-1 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-white/25 hover:bg-white/10"
            >
              &larr; Back to the Pokédex
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
