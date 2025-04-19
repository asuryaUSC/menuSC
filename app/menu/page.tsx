"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopNavBar } from "@/components/TopNavBar";
import { MealSection } from "@/components/MealSection";
import { FilterModal } from "@/components/FilterModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  DailyMenu,
  DiningHall as DiningHallType,
  MealSection as MealSectionType,
  FoodItem as FoodItemType,
} from "@/lib/types";
import { useRef } from "react";
import { formatDate } from "@/lib/date-utils";

// Define the structure we expect after processing
interface ProcessedSection {
  name: string; // e.g., "Breakfast", "Lunch", "Dinner"
  subSections: MealSectionType[];
}
interface ProcessedHall {
  name: string;
  sections: ProcessedSection[];
}

// Define a food item type that includes the added boolean flags
interface ProcessedFoodItem extends FoodItemType {
  isVegetarian?: boolean;
  isVegan?: boolean;
}

// Helper to create URL-friendly IDs (must match MealSection.tsx)
const generateItemId = (sectionName: string, itemName: string) => {
  const sectionSlug =
    sectionName
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "") || "section";
  const itemSlug =
    itemName
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "") || "item";
  return `${sectionSlug}-${itemSlug}`;
};

// Helper to format date for display
function formatDateForDisplay(date: Date) {
  return {
    dayOfWeek: date.toLocaleDateString(undefined, { weekday: "short" }),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    day: date.getDate().toString(),
  };
}

// Helper to get array of dates (today + next 3 days)
function getDateRange() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState<ProcessedHall[]>([]);
  const [selectedHallIdx, setSelectedHallIdx] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<string>("Breakfast");
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<DailyMenu | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState({
    dietary: [] as string[],
    allergens: [] as string[],
    meal: null as string | null,
    halls: [] as string[],
  });

  const dates = useMemo(() => getDateRange(), []);
  const selectedDate = useMemo(
    () => dates[selectedDateIdx].toISOString().split("T")[0],
    [dates, selectedDateIdx],
  );

  // Define meal options
  const mealOptions = useMemo(
    () => ["Breakfast", "Brunch", "Lunch", "Dinner"],
    [],
  );

  // Handle date parameter from URL
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && dates.length > 0) {
      const idx = dates.findIndex((d) => formatDate(d) === dateParam);
      if (idx !== -1) {
        setSelectedDateIdx(idx);
      }
    }
  }, [searchParams, dates]);

  // Helper function to filter food items
  function filterFoodItems(items: FoodItemType[]): FoodItemType[] {
    return items.filter((item) => {
      const tags = item.allergens || [];

      // Dietary (must include at least one selected dietary tag)
      if (
        filters.dietary.length &&
        !filters.dietary.some((tag) =>
          tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
        )
      )
        return false;

      // Allergens (must not include any selected allergens)
      if (
        filters.allergens.length &&
        filters.allergens.some((a) =>
          tags.some((t) => t.toLowerCase() === a.toLowerCase()),
        )
      )
        return false;

      return true;
    });
  }

  // Handle hall selection from filters
  useEffect(() => {
    if (filters.halls.length === 1) {
      const hallIndex = halls.findIndex((h) => h.name === filters.halls[0]);
      if (hallIndex !== -1 && hallIndex !== selectedHallIdx) {
        setSelectedHallIdx(hallIndex);

        // Check if the current meal exists in the new hall
        const newHall = halls[hallIndex];
        const mealExists = newHall.sections.some(
          (s) => s.name === selectedMeal,
        );
        if (!mealExists && newHall.sections.length > 0) {
          setSelectedMeal(newHall.sections[0].name);
        }
      }
    }
  }, [filters.halls, halls, selectedHallIdx, selectedMeal]);

  // Fetch menu data when selected date changes
  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError("");
      try {
        const menuDoc = await getDoc(doc(db, "menus", selectedDate));
        if (!menuDoc.exists()) {
          setError("No menu available for this date.");
          setHalls([]);
          setSelectedMenu(null);
          return;
        }

        const menu = menuDoc.data() as DailyMenu;
        if (!menu) {
          setError("This menu hasn&rsquo;t been posted yet.");
          setHalls([]);
          setSelectedMenu(null);
          return;
        }
        setSelectedMenu(menu);
        const hallMap: Record<string, ProcessedHall> = {};

        if (menu) {
          const mealTypes = ["breakfast", "brunch", "lunch", "dinner"] as const;
          mealTypes.forEach((mealKey) => {
            const mealName = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
            const diningHalls = menu[mealKey] as DiningHallType[] | undefined;

            diningHalls?.forEach((hall) => {
              if (!hallMap[hall.name]) {
                hallMap[hall.name] = { name: hall.name, sections: [] };
              }
              hallMap[hall.name].sections.push({
                name: mealName,
                subSections:
                  hall.sections?.map((sub: MealSectionType) => ({
                    name: sub.name,
                    items: sub.items.map(
                      (item: FoodItemType): ProcessedFoodItem => {
                        const allergens = item.allergens || [];
                        const isVegan = allergens.includes("Vegan");
                        const isVegetarian = allergens.includes("Vegetarian");

                        return {
                          ...item,
                          allergens,
                          isVegan,
                          isVegetarian,
                        };
                      },
                    ),
                  })) || [],
              });
            });
          });
        }
        const hallsArr = Object.values(hallMap);
        setHalls(hallsArr);

        // Set initial state based on search params
        const hallParam = searchParams.get("hall");
        const mealParam = searchParams.get("meal");

        let initialHallIdx = 0;
        if (hallParam && hallsArr.length > 0) {
          const foundIndex = hallsArr.findIndex((h) => h.name === hallParam);
          if (foundIndex !== -1) {
            initialHallIdx = foundIndex;
          }
        }
        setSelectedHallIdx(initialHallIdx);

        let initialMeal =
          hallsArr[initialHallIdx]?.sections[0]?.name || "Breakfast";
        if (
          mealParam &&
          hallsArr[initialHallIdx]?.sections.some(
            (s: ProcessedSection) => s.name === mealParam,
          )
        ) {
          initialMeal = mealParam;
        }
        setSelectedMeal(initialMeal);
      } catch (fetchError: unknown) {
        console.error("Fetch Menu Error:", fetchError);
        setError("Could not load menu data.");
        setSelectedMenu(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [selectedDate, searchParams]);

  // Handle scrolling and highlighting
  useEffect(() => {
    if (loading || halls.length === 0) return;
    const sectionParam = searchParams.get("section");
    const itemParam = searchParams.get("item");
    const hallParam = searchParams.get("hall");
    const mealParam = searchParams.get("meal");
    const currentSelectedHallName = halls[selectedHallIdx]?.name;

    if (
      sectionParam &&
      itemParam &&
      currentSelectedHallName === hallParam &&
      selectedMeal === mealParam
    ) {
      const targetId = generateItemId(sectionParam, itemParam);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedItemId(targetId);
          setTimeout(() => setHighlightedItemId(null), 2000);
        }, 150);
      } else {
        console.log("Target element not found:", targetId);
      }
    } else {
      setHighlightedItemId(null);
    }
  }, [loading, halls, selectedHallIdx, selectedMeal, searchParams]);

  // Add effect to scroll to highlighted item
  useEffect(() => {
    if (highlightedItemId) {
      const element = document.getElementById(highlightedItemId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        element.style.backgroundColor = "#fff8e1";
        setTimeout(() => {
          element.style.backgroundColor = "";
        }, 2000);
      }
    }
  }, [highlightedItemId]);

  const onScroll = () =>
    setShowScrollTop(window.scrollY > window.innerHeight * 0.75);

  const currentHall = halls[selectedHallIdx];
  const currentHallName = currentHall?.name;

  // Get available meals for current hall and date
  const availableMeals = useMemo(() => {
    if (!selectedMenu || !currentHallName) return [];

    return mealOptions.filter((meal) => {
      const key = meal.toLowerCase() as keyof DailyMenu;
      const halls = selectedMenu[key];
      if (!halls || !Array.isArray(halls)) return false;

      const hall = halls.find(
        (h: DiningHallType) => h.name === currentHallName,
      );
      if (!hall) return false;

      // Only include if at least one section has items
      return hall.sections.some(
        (section: MealSectionType) => section.items?.length > 0,
      );
    });
  }, [selectedMenu, currentHallName, mealOptions]);

  // Auto-select first available meal when date or hall changes
  useEffect(() => {
    if (availableMeals.length > 0 && !availableMeals.includes(selectedMeal)) {
      setSelectedMeal(availableMeals[0]);
    }
  }, [availableMeals, selectedMeal]);

  // Get current section with filtered items
  const currentSection = useMemo(() => {
    if (!currentHall) return null;
    return currentHall.sections.find(
      (s) => s.name.toLowerCase() === selectedMeal.toLowerCase(),
    );
  }, [currentHall, selectedMeal]);

  // Scroll-to-top button logic
  // const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      // show after scrolling 75% of viewport height
      setShowScrollTop(el.scrollTop > window.innerHeight * 0.75);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        // position: "relative",
        // width: "100vw",
        // height: "100vh",
        // overflow: "hidden",              // prevent body‐level scroll
        // overscrollBehaviorY: "contain",  // contain bounce to the inner <main>
        // background: "#fafbfc",
        // boxSizing: "border-box",
        background: "#fafbfc",
        minHeight: "100vh",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* highlight animation and iOS safe‐area fixes */}
      <style>{`
        @keyframes highlight-item {
          0%,100% { background-color: transparent; }
          25%,75% { background-color: rgba(255,223,186,0.4); }
        }
        .highlighted-item > div > div {
          animation: highlight-item 1.8s ease-in-out;
        }
        @supports (-webkit-touch-callout: none) {
          html { height: -webkit-fill-available; }
          body {
            overscroll-behavior-y: contain;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            min-height: -webkit-fill-available;
          }
        }
      `}</style>

      {/* fixed, safe‐area‐aware header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "white",
          height: "60px",
          width: "100%",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* TopNavBar */}
        <div style={{ height: "60px", display: "flex", alignItems: "center" }}>
          <TopNavBar />
        </div>

        {/* Dining Hall Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "16px 0",
            background: "#fff",
          }}
        >
          <button
            aria-label="Previous Hall"
            onClick={() => setSelectedHallIdx((i) => Math.max(0, i - 1))}
            disabled={selectedHallIdx === 0}
            style={{
              background: "#f4f4f5",
              border: "none",
              borderRadius: 9999,
              padding: 8,
              cursor: selectedHallIdx === 0 ? "not-allowed" : "pointer",
              opacity: selectedHallIdx === 0 ? 0.4 : 1,
              transition: "background 0.18s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#990000" />
          </button>

          <div
            style={{
              color: "#990000",
              fontWeight: 700,
              fontSize: 20,
              textAlign: "center",
              minWidth: 180,
            }}
          >
            {currentHall?.name || "Loading…"}
          </div>

          <button
            aria-label="Next Hall"
            onClick={() =>
              setSelectedHallIdx((i) => Math.min(halls.length - 1, i + 1))
            }
            disabled={selectedHallIdx === halls.length - 1}
            style={{
              background: "#f4f4f5",
              border: "none",
              borderRadius: 9999,
              padding: 8,
              cursor:
                selectedHallIdx === halls.length - 1
                  ? "not-allowed"
                  : "pointer",
              opacity: selectedHallIdx === halls.length - 1 ? 0.4 : 1,
              transition: "background 0.18s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={20} color="#990000" />
          </button>
        </div>

        {/* Date selector */}
        <div style={{ padding: "4px 0", background: "#fff" }}>
          <div
            style={{
              display: "flex",
              gap: 24,
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            {dates.map((date, idx) => {
              const { dayOfWeek, month, day } = formatDateForDisplay(date);
              const isSelected = idx === selectedDateIdx;
              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => setSelectedDateIdx(idx)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "0px 0",
                    cursor: "pointer",
                    minWidth: 56,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    flexShrink: 0,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#990000" : "#999999",
                      fontFamily: "Outfit",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {dayOfWeek}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#990000" : "#999999",
                      fontFamily: "Outfit",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {month} {day}
                  </div>
                  {isSelected && (
                    <motion.div
                      style={{
                        height: 2,
                        width: "100%",
                        background: "#990000",
                        borderRadius: 1,
                        marginTop: 2,
                      }}
                      layoutId="dateUnderline"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Meal selector */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            background: "#fff",
            padding: "20px",
            maxWidth: "90%",
            justifyContent: "center",
            margin: "auto",
          }}
        >
          {mealOptions.map((meal) => {
            const isAvailable = availableMeals.includes(meal);
            const isSelected = selectedMeal === meal;

            return (
              <motion.button
                key={meal}
                onClick={() => isAvailable && setSelectedMeal(meal)}
                disabled={!isAvailable}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: 14,
                  border: isSelected
                    ? "none"
                    : `2px solid ${isAvailable ? "#990000" : "#ccc"}`,
                  backgroundColor: isSelected ? "#990000" : "#fff",
                  color: isSelected ? "#fff" : isAvailable ? "#990000" : "#999",
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  opacity: isSelected || isAvailable ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}
                whileTap={isAvailable ? { scale: 0.98 } : undefined}
                title={!isAvailable ? "Not available on this date" : undefined}
              >
                {meal}
              </motion.button>
            );
          })}
        </div>
      </header>

      {/* Main scrollable content */}
      <main
        ref={mainRef}
        style={{
          position: "absolute",
          top: "calc(220px + env(safe-area-inset-top))",
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: 48,
          boxSizing: "border-box",
        }}
      >
        {/* content container */}
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            position: "relative",
            zIndex: 10,
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <div style={{ fontSize: 18, color: "#888" }}>Loading menu…</div>
            </div>
          ) : error ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <div style={{ fontSize: 18, color: "#c00" }}>{error}</div>
            </div>
          ) : !currentSection?.subSections.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                gap: 12,
              }}
            >
              <div style={{ fontSize: 24 }}>🥄</div>
              <div
                style={{
                  fontSize: 18,
                  color: "#666",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                This menu hasn’t been posted yet.
                <br />
                Check back soon!
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {currentSection.subSections.map((sub, idx) => (
                <MealSection
                  key={sub.name + idx}
                  section={{
                    ...sub,
                    items:
                      filters.dietary.length || filters.allergens.length
                        ? filterFoodItems(sub.items)
                        : sub.items,
                  }}
                  highlightedItemId={highlightedItemId}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* fixed Filter button */}
      <button
        onClick={() => setIsFilterModalOpen(true)}
        aria-label="Open filters"
        style={{
          position: "fixed",
          bottom: 32,
          right: 24,
          zIndex: 200,
          background: "#f4f4f5",
          border: "none",
          borderRadius: 9999,
          padding: 12,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <FilterIcon size={20} color="#990000" />
      </button>

      {/* scroll-to-top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              position: "fixed",
              bottom: 88,
              right: 24,
              zIndex: 190,
              background: "#f4f4f5",
              border: "none",
              borderRadius: 9999,
              padding: 12,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <ChevronUp size={20} color="#990000" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FilterModal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        selectedMeal={selectedMeal}
        setSelectedMeal={setSelectedMeal}
        halls={halls}
        selectedHallIdx={selectedHallIdx}
        setSelectedHallIdx={setSelectedHallIdx}
        dates={dates}
        selectedDateIdx={selectedDateIdx}
        setSelectedDateIdx={setSelectedDateIdx}
      />
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
