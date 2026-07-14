// Shared text helpers for the PokeAPI detail aggregators (Pokémon + ability).

// Collapse the hard newlines/form-feeds PokeAPI uses to fit in-game text boxes.
export function cleanText(text: string): string {
  return (
    text
      // A soft hyphen (U+00AD) + line break marks a word split across a line in
      // older games; strip it so the word rejoins ("pleasant") not "pleas ant".
      .replace(/­[\n\f\r]?/g, "")
      .replace(/[\n\f\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function prettify(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function englishOf<T extends { language: { name: string } }>(
  entries: T[],
): T | undefined {
  return entries.find((e) => e.language.name === "en");
}

export function idFromUrl(url: string, segment: string): number {
  return Number(url.match(new RegExp(`/${segment}/(\\d+)/?$`))?.[1]);
}
