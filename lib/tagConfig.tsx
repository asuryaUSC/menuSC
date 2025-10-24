import { USCIcon } from "@/components/USCIcon";

// USC Tag configurations with official USC colors and SVG icons
export const tagConfig = {
  // Dietary Preferences
  Vegetarian: {
    icon: (props: { size?: number }) => <USCIcon allergen="Vegetarian" size={props.size || 14} />,
    textColor: "#265E3F",
    bgColor: "#e8f5e8",
  },
  Vegan: {
    icon: (props: { size?: number }) => <USCIcon allergen="Vegan" size={props.size || 14} />,
    textColor: "#009245",
    bgColor: "#e0f2e0",
  },
  Halal: {
    icon: (props: { size?: number }) => <USCIcon allergen="Halal" size={props.size || 14} />,
    textColor: "#CE7824",
    bgColor: "#fdf2e7",
  },
  "Halal Ingredients": {
    icon: (props: { size?: number }) => <USCIcon allergen="Halal" size={props.size || 14} />,
    textColor: "#CE7824",
    bgColor: "#fdf2e7",
  },
  
  // Allergens
  Dairy: {
    icon: (props: { size?: number }) => <USCIcon allergen="Dairy" size={props.size || 14} />,
    textColor: "#B21823",
    bgColor: "#fce8e8",
  },
  Eggs: {
    icon: (props: { size?: number }) => <USCIcon allergen="Eggs" size={props.size || 14} />,
    textColor: "#C1A814",
    bgColor: "#fdf8e0",
  },
  Fish: {
    icon: (props: { size?: number }) => <USCIcon allergen="Fish" size={props.size || 14} />,
    textColor: "#0071BC",
    bgColor: "#e6f4ff",
  },
  "Gluten/Wheat": {
    icon: (props: { size?: number }) => <USCIcon allergen="Gluten/Wheat" size={props.size || 14} />,
    textColor: "#AF612C",
    bgColor: "#f7f0e8",
  },
  "Gluten Free": {
    icon: (props: { size?: number }) => <USCIcon allergen="Gluten Free" size={props.size || 14} />,
    textColor: "#AF612C",
    bgColor: "#f7f0e8",
  },
  Wheat: {
    icon: (props: { size?: number }) => <USCIcon allergen="Wheat" size={props.size || 14} />,
    textColor: "#AF612C",
    bgColor: "#f7f0e8",
  },
  Peanuts: {
    icon: (props: { size?: number }) => <USCIcon allergen="Peanuts" size={props.size || 14} />,
    textColor: "#99762E",
    bgColor: "#f7f2e0",
  },
  Sesame: {
    icon: (props: { size?: number }) => <USCIcon allergen="Sesame" size={props.size || 14} />,
    textColor: "#B29C60",
    bgColor: "#f7f4e8",
  },
  Shellfish: {
    icon: (props: { size?: number }) => <USCIcon allergen="Shellfish" size={props.size || 14} />,
    textColor: "#E6E6E6",
    bgColor: "#f8f8f8",
  },
  Soy: {
    icon: (props: { size?: number }) => <USCIcon allergen="Soy" size={props.size || 14} />,
    textColor: "#347066",
    bgColor: "#e8f4f0",
  },
  "Tree Nuts": {
    icon: (props: { size?: number }) => <USCIcon allergen="Tree Nuts" size={props.size || 14} />,
    textColor: "#754C24",
    bgColor: "#f0ebe0",
  },
  
  // Special cases
  Pork: {
    icon: (props: { size?: number }) => <USCIcon allergen="Pork" size={props.size || 14} />,
    textColor: "#BC008B",
    bgColor: "#fce8f7",
  },
  "not-analyzed": {
    icon: (props: { size?: number }) => <USCIcon allergen="not-analyzed" size={props.size || 14} />,
    textColor: "#8B5CF6",
    bgColor: "#f3f0ff",
  },
  "Not Analyzed": {
    icon: (props: { size?: number }) => <USCIcon allergen="not-analyzed" size={props.size || 14} />,
    textColor: "#8B5CF6",
    bgColor: "#f3f0ff",
  },
} as const;

export type TagLabel = keyof typeof tagConfig;

export function getTagConfig(label: string) {
  return (
    tagConfig[label as TagLabel] || {
      icon: (props: { size?: number }) => <USCIcon allergen="not-analyzed" size={props.size || 14} />,
      textColor: "#616161",
      bgColor: "#f5f5f5",
    }
  );
}
