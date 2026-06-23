// National-dex id ranges → generation + origin region (upper bound inclusive).
const GENERATIONS = [
  { max: 151, label: "Gen I · Kanto" },
  { max: 251, label: "Gen II · Johto" },
  { max: 386, label: "Gen III · Hoenn" },
  { max: 493, label: "Gen IV · Sinnoh" },
  { max: 649, label: "Gen V · Unova" },
  { max: 721, label: "Gen VI · Kalos" },
  { max: 809, label: "Gen VII · Alola" },
  { max: 905, label: "Gen VIII · Galar" },
  { max: 1025, label: "Gen IX · Paldea" },
];

export function genLabel(id: number): string {
  return GENERATIONS.find((g) => id <= g.max)?.label ?? "Unknown";
}

// Zero-padded national-dex number, e.g. 25 → "025".
export function dexNo(id: number): string {
  return id.toString().padStart(3, "0");
}

// gender_rate is the chance of being female in eighths; -1 means genderless.
export function genderRatioLabel(genderRate: number): string {
  if (genderRate < 0) return "Genderless";
  const female = (genderRate / 8) * 100;
  const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));
  return `♀ ${fmt(female)}%  ·  ♂ ${fmt(100 - female)}%`;
}

// Percentage of the 0–255 scale PokeAPI uses for capture rate / base happiness.
export function pct255(value: number): number {
  return Math.round((value / 255) * 100);
}

// Game version → generation number (1–9), for grouping Pokédex flavor text by
// generation. PokeAPI flavor entries carry a `version`, not a generation.
const VERSION_GENERATION: Record<string, number> = {
  red: 1, blue: 1, yellow: 1,
  gold: 2, silver: 2, crystal: 2,
  ruby: 3, sapphire: 3, emerald: 3, firered: 3, leafgreen: 3,
  diamond: 4, pearl: 4, platinum: 4, heartgold: 4, soulsilver: 4,
  black: 5, white: 5, "black-2": 5, "white-2": 5,
  x: 6, y: 6, "omega-ruby": 6, "alpha-sapphire": 6,
  sun: 7, moon: 7, "ultra-sun": 7, "ultra-moon": 7, "lets-go-pikachu": 7, "lets-go-eevee": 7,
  sword: 8, shield: 8, "brilliant-diamond": 8, "shining-pearl": 8, "legends-arceus": 8,
  scarlet: 9, violet: 9,
};

export function versionGeneration(version: string): number {
  return VERSION_GENERATION[version] ?? 0;
}

// Generation number (1–9) → "Gen III · Hoenn" label, reusing GENERATIONS order.
export function generationLabel(gen: number): string {
  return GENERATIONS[gen - 1]?.label ?? "Unknown";
}
