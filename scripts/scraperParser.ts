import { JSDOM } from "jsdom";
import { DiningHall, MenuData } from "../lib/types.js";

// Helper function to normalize meal types
function normalizeMealType(title: string): keyof MenuData | null {
  const t = title.toLowerCase();
  if (t.includes("brunch")) return "brunch";
  if (t.includes("breakfast")) return "breakfast";
  if (t.includes("lunch")) return "lunch";
  if (t.includes("dinner")) return "dinner";
  return null;
}

export function parseUSCMenu(html: string): MenuData {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const mealHeaders = doc.querySelectorAll("h2.fw-accordion-title");
  const mealBlocks = doc.querySelectorAll(
    "div.fw-accordion-content.dining-location-accordion.row",
  );

  const menuData: MenuData = {
    date: new Date().toISOString().split("T")[0],
    breakfast: [],
    brunch: [],
    lunch: [],
    dinner: [],
  };

  for (let i = 0; i < mealHeaders.length; i++) {
    const header = mealHeaders[i];
    const block = mealBlocks[i];
    const mealTitle = header.textContent?.trim() || "";

    const mealType = normalizeMealType(mealTitle);
    if (!mealType) continue;

    const diningHalls = block.querySelectorAll("div.col-sm-6.col-md-4");

    for (const hall of diningHalls) {
      const hallNameTag = hall.querySelector("h3.menu-venue-title");
      if (!hallNameTag) continue;

      const hallName = hallNameTag.textContent?.trim() || "";
      const diningHall: DiningHall = {
        name: hallName,
        sections: [],
      };

      let currentCategory: string | null = null;
      let items: { name: string; allergens: string[] }[] = [];

      hall.querySelectorAll("h4, li").forEach((element) => {
        if (element.tagName === "H4") {
          if (currentCategory && items.length > 0) {
            diningHall.sections.push({
              name: currentCategory,
              items,
            });
          }
          currentCategory = element.textContent?.trim() || "";
          items = [];
        } else if (element.tagName === "LI" && currentCategory) {
          const foodNameOnly = Array.from(element.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent?.trim())
            .join(" ")
            .trim();

          const allergens = Array.from(element.querySelectorAll(".fa-allergen"))
            .map((icon) => icon.textContent?.trim())
            .filter(Boolean) as string[];

          const skipPhrases = [
            "MADE TO ORDER",
            "BAR",
            "STATION OPENS",
            "*",
            "NUTS AND PEANUTS ARE USED HERE",
            "CHEF'S",
          ];

          if (
            !allergens.length &&
            ((foodNameOnly.toUpperCase() === foodNameOnly &&
              foodNameOnly.split(" ").length >= 3) ||
              skipPhrases.some((phrase) =>
                foodNameOnly.toUpperCase().includes(phrase),
              ))
          ) {
            return;
          }

          items.push({
            name: foodNameOnly,
            allergens,
          });
        }
      });

      if (currentCategory && items.length > 0) {
        diningHall.sections.push({
          name: currentCategory,
          items,
        });
      }

      const mealArray = menuData[mealType];
      if (Array.isArray(mealArray)) {
        mealArray.push(diningHall);
      }
    }
  }

  return menuData;
}
