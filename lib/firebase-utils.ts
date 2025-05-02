import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DailyMenu, DiningHall, MealSection, FoodItem } from "./types";
import { getFirestore } from "firebase/firestore";

export async function getTodaysMenu(): Promise<DailyMenu | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedDate = today.toISOString().split("T")[0];
    console.log("Looking for menu date:", formattedDate);
    const menuDocRef = doc(db, "menus", formattedDate);
    const menuDoc = await getDoc(menuDocRef);
    if (!menuDoc.exists()) {
      console.log("No menu found for date:", formattedDate);
      return null;
    }
    return menuDoc.data() as DailyMenu;
  } catch (error) {
    console.error("Error fetching today's menu:", error);
    return null;
  }
}

export async function getAllergenFilteredMenu(
  allergensToExclude: string[],
): Promise<DailyMenu | null> {
  try {
    const menu = await getTodaysMenu();
    if (!menu) return null;

    // Create a deep copy of the menu to avoid mutating the original
    const filteredMenu = JSON.parse(JSON.stringify(menu)) as DailyMenu;

    // Filter out items containing excluded allergens for each meal period
    const mealPeriods: Array<
      keyof Pick<DailyMenu, "breakfast" | "lunch" | "dinner">
    > = ["breakfast", "lunch", "dinner"];
    mealPeriods.forEach((period) => {
      const halls = filteredMenu[period] as DiningHall[] | undefined;
      if (halls) {
        filteredMenu[period] = halls.map((hall) => ({
          ...hall,
          sections: hall.sections.map((section: MealSection) => ({
            ...section,
            items: section.items.filter(
              (item: FoodItem) =>
                !item.allergens?.some((allergen) =>
                  allergensToExclude.includes(allergen),
                ),
            ),
          })),
        }));
      }
    });

    return filteredMenu;
  } catch (error: unknown) {
    console.error("Error filtering menu by allergens:", error);
    return null;
  }
}

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date = new Date()) {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

// Get menus for today + next 3 days
export async function getUpcomingMenus(): Promise<Record<string, DailyMenu>> {
  const db = getFirestore();
  const today = new Date();

  const dates = [...Array(4)].map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return getLocalDateString(date);
  });

  const result: Record<string, DailyMenu> = {};

  for (const date of dates) {
    const ref = doc(db, "menus", date);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      result[date] = snapshot.data() as DailyMenu;
    }
  }

  return result;
}
