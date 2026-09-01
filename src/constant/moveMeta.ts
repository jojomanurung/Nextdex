import { Sparkles, Swords, Wand2, type LucideIcon } from "lucide-react";

// The three damage classes, with the classic conventions: physical = amber,
// special = indigo, status = slate. Backs the class filter facet + the badges
// on move tiles and the dossier hero.
export type DamageClass = {
  name: string;
  label: string;
  color: string;
  icon: LucideIcon;
};

export const MOVE_DAMAGE_CLASSES: DamageClass[] = [
  { name: "physical", label: "Physical", color: "#f59e0b", icon: Swords },
  { name: "special", label: "Special", color: "#6366f1", icon: Sparkles },
  { name: "status", label: "Status", color: "#64748b", icon: Wand2 },
];

export function damageClass(name: string): DamageClass | undefined {
  return MOVE_DAMAGE_CLASSES.find((c) => c.name === name);
}

export function damageClassLabel(name: string): string {
  return damageClass(name)?.label ?? name;
}

export function damageClassColor(name: string): string {
  return damageClass(name)?.color ?? "#64748b";
}
