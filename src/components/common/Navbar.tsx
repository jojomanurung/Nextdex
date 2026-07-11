import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export function Navbar() {
  // The logo always links home; off the home route we also surface an explicit
  // left-aligned "Back" button on phones (sm:hidden) — a clearer way back to the
  // Pokédex than the centered logo. The logo stays centered (button is offset).
  const { pathname } = useRouter();
  const isHome = pathname === "/";

  return (
    <nav className="sticky top-0 left-0 right-0 w-full backdrop-blur-xs z-10">
      <div className="relative flex items-center justify-center py-2">
        {!isHome && (
          <Link
            href="/"
            aria-label="Back to Pokédex"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-900/50 p-3 text-sm text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:hidden"
          >
            <BackArrow />
          </Link>
        )}

        <Link href={"/"}>
          <Image
            src="/images/Pokemon.svg"
            alt="Nextdex"
            width={0}
            height={0}
            className="w-full h-auto max-w-36"
          />
        </Link>
      </div>
    </nav>
  );
}

function BackArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
