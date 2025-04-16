import { useState } from "react";
// import { motion } from "framer-motion"; // Removed unused import
import type { MealSection as MealSectionType } from "@/lib/types"; // Import MealSection type

interface DiningHallTabsProps {
  halls: Array<{
    name: string;
    sections: Array<MealSectionType>; // Replaced 'any' with MealSectionType
  }>;
  onChange?: (hall: string) => void;
  value?: string;
}

export function DiningHallTabs({ halls, onChange, value }: DiningHallTabsProps) {
  const [selected, setSelected] = useState(value || halls[0]?.name || "");
  const handleChange = (name: string) => {
    setSelected(name);
    onChange?.(name);
  };
  return (
    <div
      style={{
        position: "sticky",
        top: 56,
        zIndex: 40,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        padding: "0 0 0 0",
        marginBottom: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
        {halls.map(hall => (
          <button
            key={hall.name}
            onClick={() => handleChange(hall.name)}
            style={{
              border: 0,
              outline: 0,
              borderRadius: 9999,
              padding: "8px 24px",
              background: selected === hall.name ? "#f4f4f5" : "#fff",
              fontWeight: selected === hall.name ? 700 : 500,
              fontSize: 15,
              color: selected === hall.name ? "#111" : "#888",
              boxShadow: selected === hall.name ? "0 1px 6px rgba(0,0,0,0.04)" : undefined,
              transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
              cursor: "pointer",
              minWidth: 90,
              fontFamily: "Outfit",
              borderBottom: selected === hall.name ? "2px solid #e0e0e0" : "2px solid transparent",
            }}
            onMouseDown={e => e.currentTarget.style.background = "#ececec"}
            onMouseUp={e => e.currentTarget.style.background = selected === hall.name ? "#f4f4f5" : "#fff"}
            onMouseLeave={e => e.currentTarget.style.background = selected === hall.name ? "#f4f4f5" : "#fff"}
          >
            {hall.name}
          </button>
        ))}
      </div>
    </div>
  );
} 