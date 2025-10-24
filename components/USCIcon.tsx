import Image from "next/image";

interface USCIconProps {
  allergen: string;
  size?: number;
  className?: string;
}

// Map allergen names to USC SVG file names
const allergenToSVG: Record<string, string> = {
  'Dairy': 'dairy',
  'Eggs': 'eggs',
  'Fish': 'fish',
  'Gluten/Wheat': 'gluten',
  'Gluten Free': 'gluten',
  'Wheat': 'gluten',
  'Halal': 'halal-ingredients',
  'Halal Ingredients': 'halal-ingredients',
  'Peanuts': 'peanuts',
  'Pork': 'pork',
  'Sesame': 'sesame',
  'Shellfish': 'shellfish',
  'Soy': 'soy',
  'Tree Nuts': 'tree-nuts',
  'Vegan': 'vegan',
  'Vegetarian': 'vegetarian',
  'not-analyzed': 'not-analyzed'
};

export function USCIcon({ allergen, size = 16, className = "" }: USCIconProps) {
  const svgName = allergenToSVG[allergen];
  
  if (!svgName) {
    // Fallback for unknown allergens
    return (
      <div 
        className={className}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: '#ccc', 
          borderRadius: '50%' 
        }} 
      />
    );
  }

  return (
    <Image
      src={`/icons/${svgName}.svg`}
      alt={allergen}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
  );
}