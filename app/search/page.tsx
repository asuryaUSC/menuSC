"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, ChevronDown } from "lucide-react";
import { getUpcomingMenus } from "@/lib/firebase-utils";
import type { DailyMenu, DiningHall, FoodItem } from "@/lib/types";
import { SearchResultCard } from "@/components/SearchResultCard";

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date = new Date()) {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

// Define a type for the search results, including context
interface SearchResultItem extends FoodItem {
  mealType: string;
  hallName: string;
  sectionName: string;
  date: string;
}

// Helper to extract date from search query
function extractDateFromQuery(query: string): {
  date: string | null;
  rest: string;
} {
  // Match patterns like "Apr 17", "April 17", "4/17", or "2025-04-17"
  const dateRegex =
    /(?:\b(?:apr|april)\s+(\d{1,2})\b|\b(\d{1,2})\/(\d{1,2})\b|\b(\d{4}-\d{2}-\d{2})\b)/i;
  const match = query.match(dateRegex);

  if (match) {
    let date: string | null = null;
    const now = new Date();
    const year = now.getFullYear();

    if (match[1]) {
      // "Apr 17" or "April 17"
      const day = match[1].padStart(2, "0");
      date = `${year}-04-${day}`;
    } else if (match[2] && match[3]) {
      // "4/17"
      const month = match[2].padStart(2, "0");
      const day = match[3].padStart(2, "0");
      date = `${year}-${month}-${day}`;
    } else if (match[4]) {
      // "2025-04-17"
      date = match[4];
    }

    if (date) {
      const rest = query.replace(dateRegex, "").trim();
      return { date, rest };
    }
  }

  return { date: null, rest: query };
}

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuDataMap, setMenuDataMap] = useState<Record<string, DailyMenu>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  // Load 4 days of menus
  useEffect(() => {
    async function load() {
      setLoading(true);
      const menus = await getUpcomingMenus();
      setMenuDataMap(menus);
      setLoading(false);
      inputRef.current?.focus();
    }
    load();
  }, []);

  // Search all dates
  const searchResults = useMemo(() => {
    if (!searchQuery || Object.keys(menuDataMap).length === 0) return [];

    const { date: filterDate, rest: refinedQuery } =
      extractDateFromQuery(searchQuery);
    const query = refinedQuery.toLowerCase().trim();
    const mealTypes: Array<keyof DailyMenu> = [
      "breakfast",
      "brunch",
      "lunch",
      "dinner",
    ];
    const results: SearchResultItem[] = [];
    const today = getLocalDateString();

    for (const [date, menu] of Object.entries(menuDataMap)) {
      // Skip dates in the past
      if (date < today) continue;

      // Skip if date filter is specified and doesn't match
      if (filterDate && date !== filterDate) continue;

      for (const meal of mealTypes) {
        const mealName = meal.charAt(0).toUpperCase() + meal.slice(1);
        const halls = (menu[meal] as DiningHall[] | undefined) || [];
        for (const hall of halls) {
          for (const section of hall.sections) {
            for (const item of section.items) {
              if (item.name.toLowerCase().includes(query)) {
                results.push({
                  ...item,
                  mealType: mealName,
                  hallName: hall.name,
                  sectionName: section.name,
                  date,
                });
              }
            }
          }
        }
      }
    }

    // Sort by soonest date first
    return results.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [searchQuery, menuDataMap]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setVisibleCount(20); // Reset visible count when search changes
    // Re-focus if cleared via default clear button (value becomes empty)
    if (!value && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(250, 250, 250, 0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "15vh",
        overflowY: "auto",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#f4f4f5",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#e4e4e7";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "#f4f4f5";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        }}
      >
        <ArrowLeft size={20} color="#555" />
      </button>

      {/* Search Input Container */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        style={{
          position: "relative",
          width: "min(90%, 600px)",
          marginBottom: 24,
        }}
      >
        <Search
          size={20}
          color="#aaa"
          style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={handleInputChange}
          style={{
            width: "100%",
            padding: "16px 24px 16px 60px",
            fontSize: "20px",
            borderRadius: "9999px",
            backgroundColor: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            outline: "none",
            border: "none",
            color: "#222",
            fontFamily: "Outfit, sans-serif",
            letterSpacing: "-0.2px",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
      </motion.div>

      {/* Results Area */}
      <div style={{ width: "min(90%, 600px)", flexGrow: 1 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            Loading menu...
          </p>
        ) : searchQuery && searchResults.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            No results found.
          </p>
        ) : searchQuery ? (
          <>
            <AnimatePresence>
              {searchResults.slice(0, visibleCount).map((item, index) => (
                <SearchResultCard
                  key={`${item.date}-${item.name}-${item.hallName}-${item.sectionName}-${index}`}
                  item={item}
                  index={index}
                />
              ))}
            </AnimatePresence>
            {searchResults.length > visibleCount && (
              <motion.button
                onClick={handleLoadMore}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  marginTop: 12,
                  background: "white",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  color: "#666",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                whileHover={{ background: "#f9f9f9" }}
                whileTap={{ scale: 0.98 }}
              >
                Load more results
                <ChevronDown size={16} />
              </motion.button>
            )}
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
