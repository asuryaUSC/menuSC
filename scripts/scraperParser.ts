import { JSDOM } from "jsdom";
import { DiningHall, MenuData } from "../lib/types.js";

// Helper function to normalize meal types
function normalizeMealType(mealAttribute: string): keyof MenuData | null {
  const t = mealAttribute.toLowerCase();
  if (t.includes("brunch")) return "brunch";
  if (t.includes("breakfast")) return "breakfast"; 
  if (t.includes("lunch")) return "lunch";
  if (t.includes("dinner")) return "dinner";
  return null;
}

// Helper function to extract allergens from data-allergens attribute
function extractAllergens(dataAllergens: string): string[] {
  try {
    if (!dataAllergens || dataAllergens === "[]") return [];
    const allergens = JSON.parse(dataAllergens);
    if (Array.isArray(allergens)) {
      // Capitalize first letter for consistency with existing data
      return allergens.map(allergen => {
        const normalized = allergen.toLowerCase();
        // Map USC's allergen names to our expected format
        const allergenMap: Record<string, string> = {
          'dairy': 'Dairy',
          'eggs': 'Eggs', 
          'fish': 'Fish',
          'gluten': 'Gluten/Wheat',
          'peanuts': 'Peanuts',
          'sesame': 'Sesame',
          'shellfish': 'Shellfish',
          'soy': 'Soy',
          'tree-nuts': 'Tree Nuts',
          'wheat': 'Wheat',
          'vegetarian': 'Vegetarian',
          'vegan': 'Vegan',
          'halal-ingredients': 'Halal',
          'gluten-free': 'Gluten Free'
        };
        return allergenMap[normalized] || allergen;
      });
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse allergens:', dataAllergens);
    return [];
  }
}

export function parseUSCMenu(html: string, diningHallName?: string): MenuData {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const menuData: MenuData = {
    date: new Date().toISOString().split("T")[0],
    breakfast: [],
    brunch: [],
    lunch: [],
    dinner: [],
  };

  // Get the dining hall name from the page if not provided
  let hallName = diningHallName;
  if (!hallName) {
    const hallNameElement = doc.querySelector("h2.title.js-venue-title");
    hallName = hallNameElement?.textContent?.trim() || "Unknown Dining Hall";
  }

  // Find all meal containers
  const mealContainers = doc.querySelectorAll(".meal-container[data-meal]");
  
  for (const container of mealContainers) {
    const mealType = container.getAttribute("data-meal");
    const normalizedMealType = normalizeMealType(mealType || "");
    
    if (!normalizedMealType) continue;

    const diningHall: DiningHall = {
      name: hallName,
      sections: [],
    };

    // Find all stations within this meal
    const stations = container.querySelectorAll(".station");
    
    for (const station of stations) {
      const stationNameElement = station.querySelector("p.title");
      const stationName = stationNameElement?.textContent?.trim() || "Station";
      
      // Get all menu items in this station
      const menuItems = station.querySelectorAll("li.js-menu-item");
      const items: { name: string; allergens: string[] }[] = [];
      
      for (const menuItem of menuItems) {
        // Get the food item name (text content without icons)
        const itemName = menuItem.childNodes[0]?.textContent?.trim();
        
        if (!itemName) continue;
        
        // Skip items that are just section headers or bars
        const skipPhrases = [
          "MADE TO ORDER",
          "BAR",
          "STATION OPENS",
          "*",
          "NUTS AND PEANUTS ARE USED HERE",
          "CHEF'S",
          "SALAD AND DELI BAR",
          "HOT CHICKEN SANDWICH BAR"
        ];

        if (skipPhrases.some((phrase) => itemName.toUpperCase().includes(phrase))) {
          continue;
        }

        // Extract allergens from data-allergens attribute
        const dataAllergens = menuItem.getAttribute("data-allergens") || "[]";
        const allergens = extractAllergens(dataAllergens);

        // Also extract preferences (vegetarian, vegan, etc.) from data-preferences
        const dataPreferences = menuItem.getAttribute("data-preferences") || "[]";
        const preferences = extractAllergens(dataPreferences); // Same parsing logic
        
        // Combine allergens and preferences
        const allTags = [...new Set([...allergens, ...preferences])];

        items.push({
          name: itemName,
          allergens: allTags,
        });
      }

      // Only add sections that have items
      if (items.length > 0) {
        diningHall.sections.push({
          name: stationName,
          items,
        });
      }
    }

    // Only add the dining hall to this meal if it has sections
    if (diningHall.sections.length > 0) {
      const mealArray = menuData[normalizedMealType];
      if (Array.isArray(mealArray)) {
        mealArray.push(diningHall);
      }
    }
  }

  return menuData;
}
