import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@dex/components/Card";

// Pages Router custom 500 — statically generated and shown when the server hits
// an unexpected error. Mirrors the 404 page's layout.
export default function ServerError() {
  return (
    <>
      <Head>
        <title>500 · Something went wrong | Nextdex</title>
      </Head>

      <div className="mx-auto max-w-2xl py-12 sm:py-20">
        <Card>
          <div className="flex flex-col items-center gap-5 px-2 py-6 text-center">
            {/* Electrode, the Self-Destruct Pokémon — "the server blew up." */}
            <div className="relative h-40 w-40">
              <div
                aria-hidden
                className="absolute inset-6 rounded-full bg-[#fb7185] opacity-30 blur-3xl"
              />
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png"
                alt="Electrode about to self-destruct"
                fill
                sizes="160px"
                className="object-contain drop-shadow-2xl"
                placeholder="blur"
                blurDataURL="/images/placeholder.png"
              />
            </div>

            <p className="text-6xl font-black tracking-tight sm:text-7xl">500</p>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              Our server used Self-Destruct &mdash; that&rsquo;s on us, not you.
              Give it a moment and try again.
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
