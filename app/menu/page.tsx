'use client'

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNavBar } from "@/components/TopNavBar";
import { MealSection } from "@/components/MealSection";
import { getTodaysMenu } from "@/lib/firebase-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyMenu } from "@/lib/types";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState<any[]>([]);
  const [selectedHallIdx, setSelectedHallIdx] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Always compute today's date on the client
  const todayStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  }, []);

  // Fetch menu and handle initial state from search params
  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError("");
      try {
        const menu = await getTodaysMenu();
        // Process menu into halls structure (existing logic)
        const hallMap: Record<string, any> = {};
        ["Breakfast", "Lunch", "Dinner"].forEach((mealType) => {
          const mealKey = mealType.toLowerCase() as keyof DailyMenu;
          if (menu && menu[mealKey]) {
            (menu[mealKey] as any[]).forEach((hall: any) => {
              if (!hallMap[hall.name]) {
                hallMap[hall.name] = { name: hall.name, sections: [] };
              }
              hallMap[hall.name].sections.push({
                name: mealType,
                subSections: hall.sections?.map((sub: any) => ({
                  name: sub.name,
                  items: sub.items.map((item: any) => ({
                    ...item,
                    isVegetarian: item.isVegetarian || item.allergens?.includes("Vegetarian"),
                    isVegan: item.isVegan || item.allergens?.includes("Vegan"),
                  })),
                })) || [],
              });
            });
          }
        });
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

        let initialMeal = hallsArr[initialHallIdx]?.sections[0]?.name || "";
        if (mealParam && hallsArr[initialHallIdx]?.sections.some((s: any) => s.name === mealParam)) {
          initialMeal = mealParam;
        }
        setSelectedMeal(initialMeal);

      } catch (e) {
        setError("Could not load menu data.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [searchParams]); // Re-run only when searchParams change

  // Handle scrolling and highlighting after data is loaded and state is set
  useEffect(() => {
    // Don't run scroll logic if still loading or halls haven't been processed yet
    if (loading || halls.length === 0) return;

    const sectionParam = searchParams.get('section');
    const itemParam = searchParams.get('item');

    // Check if the currently selected meal and hall match the params
    // This ensures we scroll only after the correct content is potentially visible
    const currentSelectedHallName = halls[selectedHallIdx]?.name;
    const hallParam = searchParams.get('hall');
    const mealParam = searchParams.get('meal');

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
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedItemId(targetId);
          setTimeout(() => setHighlightedItemId(null), 2000);
        }, 150); // Increased delay slightly for safety
      } else {
        console.log("Target element not found for scroll:", targetId);
      }
    } else {
        // Clear highlight if params don't match current view
        setHighlightedItemId(null);
    }
  }, [loading, halls, selectedHallIdx, selectedMeal, searchParams]); // Re-run when view changes

  const currentHall = halls[selectedHallIdx] || halls[0];
  const mealNames = currentHall?.sections?.map((s: any) => s.name) || [];
  const currentSection = currentHall?.sections?.find((s: any) => s.name === selectedMeal) || currentHall?.sections?.[0];
  const today = new Date();

  // Scroll-to-top button logic
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
      {/* Highlight Style Injection - Apply temporary background */}
      <style>
        {`
          @keyframes highlight-item {
            0%, 100% { background-color: transparent; }
            25%, 75% { background-color: rgba(255, 223, 186, 0.4); } /* Softer highlight */
          }
          .highlighted-item > div > div {
             /* Target the inner Card or motion.div if needed */
             animation: highlight-item 1.8s ease-in-out;
          }
        `}
      </style>
      <TopNavBar />
      {/* Sticky Dining Hall Header */}
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 90,
          background: "#fff",
          boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
          padding: "16px 0 8px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
            {currentHall?.name || ""}
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
        <div style={{ fontSize: 14, color: "#888", fontFamily: "Outfit", marginTop: 4 }}>{formatDate(today)}</div>
      </div>
      {/* Sticky Meal Selector */}
      <div
        style={{
          position: "sticky",
          top: 116,
          zIndex: 80,
          background: "#fff",
          boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "0 0 0 0",
          marginBottom: 0,
        }}
      >
        <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
          {mealNames.map((meal: string) => (
            <motion.button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{
                border: 0,
                outline: 0,
                borderRadius: 9999,
                padding: "8px 24px",
                background:
                  selectedMeal === meal
                    ? meal === "Breakfast"
                      ? "#FFF9E5"
                      : meal === "Lunch"
                      ? "#F9F3EB"
                      : meal === "Dinner"
                      ? "#FFF4F4"
                      : "#f4f4f5"
                    : "#fff",
                fontWeight: selectedMeal === meal ? 700 : 500,
                fontSize: 15,
                color: selectedMeal === meal ? "#990000" : "#888",
                boxShadow: selectedMeal === meal ? "0 1px 6px rgba(0,0,0,0.04)" : undefined,
                transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
                cursor: "pointer",
                minWidth: 90,
                fontFamily: "Outfit",
                border: selectedMeal === meal ? "2px solid #990000" : "2px solid transparent",
              }}
              onMouseDown={e => e.currentTarget.style.background = "#ececec"}
              onMouseUp={e => (e.currentTarget.style.background = selectedMeal === meal
                ? meal === "Breakfast"
                  ? "#FFF9E5"
                  : meal === "Lunch"
                  ? "#F9F3EB"
                  : meal === "Dinner"
                  ? "#FFF4F4"
                  : "#f4f4f5"
                : "#fff")}
              onMouseLeave={e => (e.currentTarget.style.background = selectedMeal === meal
                ? meal === "Breakfast"
                  ? "#FFF9E5"
                  : meal === "Lunch"
                  ? "#F9F3EB"
                  : meal === "Dinner"
                  ? "#FFF4F4"
                  : "#f4f4f5"
                : "#fff")}
            >
              {meal}
            </motion.button>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px" }}>
        <div style={{ marginTop: 8 }}>
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
              {currentSection && currentSection.subSections && currentSection.subSections.map((sub: any, idx: number) => (
                <MealSection
                  key={sub.name + idx}
                  section={sub}
                  mealType={selectedMeal}
                  highlightedItemId={highlightedItemId}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
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
              bottom: 32,
              right: 24,
              zIndex: 200,
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 9999,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: 12,
              cursor: "pointer",
              fontSize: 18,
              color: "#990000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Scroll to top"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
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