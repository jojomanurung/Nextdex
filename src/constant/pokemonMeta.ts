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
