'use client'

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { TopNavBar } from "@/components/TopNavBar";
import { MealSection } from "@/components/MealSection";
import { FilterModal } from "@/components/FilterModal";
import { getTodaysMenu } from "@/lib/firebase-utils";
import { ChevronLeft, ChevronRight, Filter as FilterIcon, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyMenu, DiningHall as DiningHallType, MealSection as MealSectionType, FoodItem as FoodItemType } from "@/lib/types";

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
  const sectionSlug = sectionName?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'section';
  const itemSlug = itemName?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'item';
  return `${sectionSlug}-${itemSlug}`;
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState<ProcessedHall[]>([]);
  const [selectedHallIdx, setSelectedHallIdx] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<string>("Breakfast");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dietary: [] as string[],
    allergens: [] as string[],
    meal: null as string | null,
    halls: [] as string[],
  });

  // Helper function to filter food items
  function filterFoodItems(items: FoodItemType[]): FoodItemType[] {
    return items.filter(item => {
      const tags = item.allergens || [];

      // Dietary (must include at least one selected dietary tag)
      if (filters.dietary.length && !filters.dietary.some(tag => 
        tags.some(t => t.toLowerCase() === tag.toLowerCase())
      )) return false;

      // Allergens (must not include any selected allergens)
      if (filters.allergens.length && filters.allergens.some(a => 
        tags.some(t => t.toLowerCase() === a.toLowerCase())
      )) return false;

      return true;
    });
  }

  // Handle hall selection from filters
  useEffect(() => {
    if (filters.halls.length === 1) {
      const hallIndex = halls.findIndex(h => h.name === filters.halls[0]);
      if (hallIndex !== -1 && hallIndex !== selectedHallIdx) {
        setSelectedHallIdx(hallIndex);
        
        // Check if the current meal exists in the new hall
        const newHall = halls[hallIndex];
        const mealExists = newHall.sections.some(s => s.name === selectedMeal);
        if (!mealExists && newHall.sections.length > 0) {
          setSelectedMeal(newHall.sections[0].name);
        }
      }
    }
  }, [filters.halls, halls, selectedHallIdx, selectedMeal]);

  // Fetch menu and handle initial state from search params
  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError("");
      try {
        const menu = await getTodaysMenu();
        const hallMap: Record<string, ProcessedHall> = {};

        if (menu) {
          const mealTypes: Array<keyof Pick<DailyMenu, 'breakfast' | 'lunch' | 'dinner'>> = ['breakfast', 'lunch', 'dinner'];
          mealTypes.forEach((mealKey) => {
            const mealName = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
            const diningHalls = menu[mealKey] as DiningHallType[] | undefined;

            diningHalls?.forEach((hall) => {
              if (!hallMap[hall.name]) {
                hallMap[hall.name] = { name: hall.name, sections: [] };
              }
              hallMap[hall.name].sections.push({
                name: mealName,
                subSections: hall.sections?.map((sub: MealSectionType) => ({
                  name: sub.name,
                  items: sub.items.map((item: FoodItemType): ProcessedFoodItem => ({
                    ...item,
                    isVegetarian: item.allergens?.includes("Vegetarian"),
                    isVegan: item.allergens?.includes("Vegan"),
                  })),
                })) || [],
              });
            });
          });
        }
        const hallsArr = Object.values(hallMap);
        setHalls(hallsArr);

        // Set initial state based on search params
        const hallParam = searchParams.get('hall');
        const mealParam = searchParams.get('meal');

        let initialHallIdx = 0;
        if (hallParam && hallsArr.length > 0) {
          const foundIndex = hallsArr.findIndex(h => h.name === hallParam);
          if (foundIndex !== -1) {
            initialHallIdx = foundIndex;
          }
        }
        setSelectedHallIdx(initialHallIdx);

        let initialMeal = hallsArr[initialHallIdx]?.sections[0]?.name || "Breakfast";
        if (mealParam && hallsArr[initialHallIdx]?.sections.some((s: ProcessedSection) => s.name === mealParam)) {
          initialMeal = mealParam;
        }
        setSelectedMeal(initialMeal);

      } catch (fetchError: unknown) {
        console.error("Fetch Menu Error:", fetchError);
        setError("Could not load menu data.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [searchParams]);

  // Handle scrolling and highlighting
  useEffect(() => {
    if (loading || halls.length === 0) return;
    const sectionParam = searchParams.get('section');
    const itemParam = searchParams.get('item');
    const hallParam = searchParams.get('hall');
    const mealParam = searchParams.get('meal');
    const currentSelectedHallName = halls[selectedHallIdx]?.name;

    if (
      sectionParam && itemParam &&
      currentSelectedHallName === hallParam &&
      selectedMeal === mealParam
    ) {
      const targetId = generateItemId(sectionParam, itemParam);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const currentHall = halls[selectedHallIdx];
  const currentSection = currentHall?.sections?.find((s: ProcessedSection) => 
    s.name === (filters.meal || selectedMeal)
  );
  const today = useMemo(() => new Date(), []);

  // Scroll-to-top button logic
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > window.innerHeight * 0.75);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ 
      background: "#fafbfc", 
      minHeight: "100vh", 
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Highlight Style Injection */}
      <style>
        {`
          @keyframes highlight-item {
            0%, 100% { background-color: transparent; }
            25%, 75% { background-color: rgba(255, 223, 186, 0.4); }
          }
          .highlighted-item > div > div {
            animation: highlight-item 1.8s ease-in-out;
          }
          /* iOS Safari specific fixes */
          @supports (-webkit-touch-callout: none) {
            html {
              height: -webkit-fill-available;
            }
            body {
              /* Prevent overscroll bounce effect common on iOS */
              overscroll-behavior-y: none;
              /* Prevent content from going under safe areas */
              padding-top: env(safe-area-inset-top, 0px);
              padding-bottom: env(safe-area-inset-bottom, 0px);
              /* Fix for full viewport height on iOS */
              min-height: -webkit-fill-available;
              /* Prevent pull-to-refresh */
              overflow-y: scroll;
              -webkit-overflow-scrolling: touch;
            }
            /* Fix for sticky elements */
            .ios-sticky-fix {
              position: -webkit-sticky;
              position: sticky;
            }
          }
        `}
      </style>

      {/* TopNavBar - Fixed at top */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        height: "60px",
        width: "100%",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }} className="ios-sticky-fix">
        <TopNavBar />
      </div>

      {/* Sticky Header Container - Positioned below TopNavBar */}
      <div
        className="ios-sticky-fix"
        style={{
          position: "sticky",
          top: 60,
          zIndex: 90,
          background: "white",
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
          width: "100%",
        }}
      >
        {/* Dining Hall Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <button
            aria-label="Previous Hall"
            onClick={() => setSelectedHallIdx(i => Math.max(0, i - 1))}
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
          <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "Outfit", color: "#990000", textAlign: "center", minWidth: 180 }}>
            {currentHall?.name || "Loading Hall..."}
          </div>
          <button
            aria-label="Next Hall"
            onClick={() => setSelectedHallIdx(i => Math.min(halls.length - 1, i + 1))}
            disabled={selectedHallIdx === halls.length - 1}
            style={{
              background: "#f4f4f5",
              border: "none",
              borderRadius: 9999,
              padding: 8,
              cursor: selectedHallIdx === halls.length - 1 ? "not-allowed" : "pointer",
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

        {/* Date */}
        <div style={{ fontSize: 14, color: "#888", fontFamily: "Outfit" }}>
          {formatDate(today)}
        </div>

        {/* Meal Selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: 14,
                border: selectedMeal === meal ? 'none' : '2px solid #990000',
                backgroundColor: selectedMeal === meal ? '#990000' : 'transparent',
                color: selectedMeal === meal ? '#ffffff' : '#990000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Outfit, sans-serif',
              }}
              onMouseOver={(e) => {
                if (selectedMeal !== meal) {
                  e.currentTarget.style.backgroundColor = 'rgba(153, 0, 0, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedMeal !== meal) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Main content container - Add padding to ensure content starts below navbar */}
      <div style={{ 
        maxWidth: 640,
        margin: "0 auto",
        padding: "16px", 
        paddingTop: "16px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 10,
      }}>
        <style>
          {`
            @supports (-webkit-touch-callout: none) {
              /* Additional iOS-specific fixes for main content */
              #menu-content-container {
                padding-top: calc(16px + env(safe-area-inset-top, 0px));
                padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
              }
            }
          `}
        </style>
        <div id="menu-content-container" style={{ marginTop: 8 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <div style={{ fontSize: 18, color: "#888" }}>Loading menu…</div>
            </div>
          ) : error ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <div style={{ fontSize: 18, color: "#c00" }}>{error}</div>
            </div>
          ) : halls.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <div style={{ fontSize: 18, color: "#888" }}>No menu available for today.</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentSection && currentSection.subSections && currentSection.subSections.map((sub: MealSectionType, idx: number) => (
                <MealSection
                  key={sub.name + idx}
                  section={{
                    ...sub,
                    items: filters.dietary.length || filters.allergens.length ? filterFoodItems(sub.items) : sub.items
                  }}
                  highlightedItemId={highlightedItemId}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Filter Trigger Button (Fixed Position) */}
      <button
        onClick={() => setIsFilterModalOpen(true)}
        aria-label="Open filters"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 24,
          zIndex: 200,
          background: '#f4f4f5',
          border: 'none',
          borderRadius: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
      >
        <FilterIcon size={20} color="#990000" />
      </button>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              position: "fixed",
              bottom: 88,
              right: 24,
              zIndex: 190,
              background: '#f4f4f5',
              border: 'none',
              borderRadius: 9999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            aria-label="Scroll to top"
          >
            <ChevronUp size={20} color="#990000" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Render the Filter Modal */}
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