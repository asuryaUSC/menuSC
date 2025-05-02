import { useState } from "react";
import { motion } from "framer-motion";

export function MealTabs({
  meals,
  onChange,
  value,
}: {
  meals: string[];
  onChange?: (meal: string) => void;
  value?: string;
}) {
  const [selected, setSelected] = useState(value || meals[0]);
  const handleChange = (name: string) => {
    setSelected(name);
    onChange?.(name);
  };
  return (
    <div
      style={{
        position: "sticky",
        top: 104,
        zIndex: 40,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "0 0 0 0",
        marginBottom: 0,
      }}
    >
      <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
        {meals.map((meal) => (
          <motion.button
            key={meal}
            onClick={() => handleChange(meal)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              border: 0,
              outline: 0,
              borderRadius: 9999,
              padding: "8px 24px",
              background: selected === meal ? "#f5faff" : "#fff",
              fontWeight: selected === meal ? 700 : 500,
              fontSize: 15,
              color: selected === meal ? "#111" : "#888",
              boxShadow:
                selected === meal ? "0 1px 6px rgba(0,0,0,0.04)" : undefined,
              transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
              cursor: "pointer",
              minWidth: 90,
              fontFamily: "Outfit",
              borderBottom:
                selected === meal
                  ? "2px solid #e0e0e0"
                  : "2px solid transparent",
            }}
            onMouseDown={(e) => (e.currentTarget.style.background = "#ececec")}
            onMouseUp={(e) =>
              (e.currentTarget.style.background =
                selected === meal ? "#f5faff" : "#fff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                selected === meal ? "#f5faff" : "#fff")
            }
          >
            {meal}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
