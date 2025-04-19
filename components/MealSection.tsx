import { Card } from "@nextui-org/react";
import { motion } from "framer-motion";
import { getTagConfig } from "@/lib/tagConfig";

// Helper to create URL-friendly IDs
const generateItemId = (sectionName: string, itemName: string) => {
  const sectionSlug = sectionName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  const itemSlug = itemName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  return `${sectionSlug}-${itemSlug}`;
};

interface MealSectionProps {
  section: {
    name: string;
    items: Array<{
      name: string;
      allergens?: string[];
      isVegetarian?: boolean;
      isVegan?: boolean;
    }>;
  };
  highlightedItemId?: string | null;
}

export function MealSection({ section, highlightedItemId }: MealSectionProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
        padding: "16px 16px 8px 16px",
        marginBottom: "24px",
        maxWidth: "640px",
        marginInline: "auto",
      }}
    >
      {/* Section Title */}
      <div
        style={{
          borderLeft: "4px solid #990000",
          paddingLeft: "12px",
          fontWeight: "600",
          fontSize: "16px",
          color: "#990000",
          marginBottom: "12px",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        {section.name}
      </div>

      {/* Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {section.items.map((item, idx) => {
          const itemId = generateItemId(section.name, item.name);
          const isHighlighted = itemId === highlightedItemId;
          return (
            <motion.div
              id={itemId}
              key={itemId}
              className={isHighlighted ? "highlighted-item" : ""}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Card
                shadow="sm"
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  padding: 16,
                  borderRadius: 12,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  background: "white",
                  border: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom:
                      item.allergens?.length ||
                      item.isVegan ||
                      item.isVegetarian
                        ? 8
                        : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      fontFamily: "Outfit, sans-serif",
                      color: "#333",
                    }}
                  >
                    {item.name}
                  </div>
                </div>

                {/* Allergen and Dietary Tags */}
                {item.allergens && item.allergens.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      borderTop: "1px solid #EEE",
                      paddingTop: 8,
                    }}
                  >
                    {item.allergens.map((a, i) => {
                      const {
                        icon: Icon,
                        textColor,
                        bgColor,
                      } = getTagConfig(a);
                      return (
                        <motion.span
                          key={a}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.22,
                            delay: 0.06 + i * 0.03,
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            color: textColor,
                            background: bgColor,
                            padding: "4px 12px",
                            borderRadius: 9999,
                          }}
                        >
                          <Icon size={14} />
                          {a}
                        </motion.span>
                      );
                    })}
                  </div>
                ) : null}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
