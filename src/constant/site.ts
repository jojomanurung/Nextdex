// Single source of truth for the site's public origin. Open Graph / Twitter
// cards require ABSOLUTE urls — social crawlers ignore relative ones — so both
// the canonical page url and the share image are resolved against this.
//
// The value is wired up in next.config.js: it prefers NEXT_PUBLIC_SITE_URL, then
// falls back to Vercel's production domain, then to localhost for local dev.
export const SITE_NAME = "Nextdex";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

// Optional X/Twitter @handle for card attribution (twitter:site / twitter:creator).
// Set NEXT_PUBLIC_TWITTER_HANDLE (with or without a leading "@") to enable those
// tags; left unset they're simply omitted. NEXT_PUBLIC_ vars are inlined by Next.
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE
  ? `@${process.env.NEXT_PUBLIC_TWITTER_HANDLE.trim().replace(/^@+/, "")}`
  : "";

// Resolve a path against SITE_URL. Already-absolute http(s) urls (e.g. PokeAPI
// artwork) are returned untouched.
export function absoluteUrl(path = ""): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
