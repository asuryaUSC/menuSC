import {
  Egg,
  Milk,
  PiggyBank,
  Sprout,
  Wheat,
  Leaf,
  ShieldCheck,
  Sun,
  Bean,
  Fish,
} from "lucide-react";
import { ReactNode } from "react";

export const allergenIconMap: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  Dairy: { icon: Milk, color: "#fbbf24" }, // Yellow
  Eggs: { icon: Egg, color: "#facc15" }, // Lighter yellow
  "Halal Ingredients": { icon: ShieldCheck, color: "#10b981" }, // Teal
  Pork: { icon: PiggyBank, color: "#ef4444" }, // Red
  "Wheat / Gluten": { icon: Wheat, color: "#c084fc" }, // Purple
  Vegan: { icon: Sprout, color: "#22c55e" }, // Green
  Vegetarian: { icon: Leaf, color: "#4ade80" }, // Lighter green
  Sesame: { icon: Sun, color: "#f97316" }, // Orange
  Soy: { icon: Bean, color: "#8D6E63" }, // Brown
  Fish: { icon: Fish, color: "#3b82f6" }, // Blue
};

export function getAllergenIcon(allergen: string): { icon: ReactNode; color: string } {
  const entry = allergenIconMap[allergen];
  if (entry) {
    const Icon = entry.icon;
    return { icon: <Icon size={14} color={entry.color} />, color: entry.color };
  }
  // fallback
  return { icon: <Sun size={14} color="#bbb" />, color: "#bbb" };
} 