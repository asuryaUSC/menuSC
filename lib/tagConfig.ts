import {
  Leaf,
  Sprout,
  Moon,
  GlassWater,
  Egg,
  Wheat,
  Bean,
  Nut,
  PiggyBank,
  FlaskConical,
} from "lucide-react";

export const tagConfig = {
  "Vegetarian": {
    icon: Leaf,
    textColor: "#388e3c",
    bgColor: "#eaf5ea"
  },
  "Vegan": {
    icon: Sprout,
    textColor: "#2e7d32",
    bgColor: "#e3f2e1"
  },
  "Halal Ingredients": {
    icon: Moon,
    textColor: "#00796b",
    bgColor: "#e0f2f1"
  },
  "Dairy": {
    icon: GlassWater,
    textColor: "#0288d1",
    bgColor: "#e1f5fe"
  },
  "Eggs": {
    icon: Egg,
    textColor: "#f9a825",
    bgColor: "#fff8e1"
  },
  "Wheat / Gluten": {
    icon: Wheat,
    textColor: "#c49b63",
    bgColor: "#f8f1e7"
  },
  "Soy": {
    icon: Bean,
    textColor: "#6d4c41",
    bgColor: "#efebe9"
  },
  "Sesame": {
    icon: Nut,
    textColor: "#f57c00",
    bgColor: "#fff3e0"
  },
  "Nuts": {
    icon: Nut,
    textColor: "#5d4037",
    bgColor: "#efebe9"
  },
  "Pork": {
    icon: PiggyBank,
    textColor: "#d81b60",
    bgColor: "#fde4ec"
  },
  "Food Not Analyzed for Allergens": {
    icon: FlaskConical,
    textColor: "#616161",
    bgColor: "#f5f5f5"
  }
} as const;

export type TagLabel = keyof typeof tagConfig;

export function getTagConfig(label: string) {
  return tagConfig[label as TagLabel] || {
    icon: FlaskConical,
    textColor: "#616161",
    bgColor: "#f5f5f5"
  };
} 