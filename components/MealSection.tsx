import { Card } from "@nextui-org/react"
import { motion } from "framer-motion"
import { getAllergenIcon } from "@/lib/allergenIcons"

// Helper to create URL-friendly IDs
const generateItemId = (sectionName: string, itemName: string) => {
  const sectionSlug = sectionName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const itemSlug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `${sectionSlug}-${itemSlug}`;
};

interface MealSectionProps {
  section: {
    name: string
    items: Array<{
      name: string
      allergens?: string[]
      isVegetarian?: boolean
      isVegan?: boolean
    }>
  }
  mealType?: string // For pastel backgrounds
  highlightedItemId?: string | null
}

function getPastelBg(mealType?: string) {
  if (!mealType) return "#fff"
  if (mealType === "Breakfast") return "#FFF9E5" // creamy soft yellow
  if (mealType === "Lunch") return "#F9F3EB" // warm beige
  if (mealType === "Dinner") return "#FFF4F4" // light rose
  return "#fff"
}

export function MealSection({ section, mealType, highlightedItemId }: MealSectionProps) {
  return (
    <div style={{ marginBottom: 32, background: getPastelBg(mealType), borderRadius: 16, padding: 8 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          fontFamily: "Outfit",
          background: "#f5f5f7",
          borderRadius: 12,
          padding: "8px 16px",
          color: "#222",
          letterSpacing: -0.2,
        }}
      >
        {section.name}
      </div>
      {section.items.map((item, idx) => {
        const itemId = generateItemId(section.name, item.name);
        const isHighlighted = itemId === highlightedItemId;
        return (
          <motion.div
            id={itemId}
            key={itemId}
            className={isHighlighted ? 'highlighted-item' : ''}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
          >
            <Card
              shadow="sm"
              className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]"
              style={{
                padding: 16,
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                background: "white",
                border: "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "Outfit" }}>{item.name}</div>
              </div>
              {(item.allergens && item.allergens.length > 0) || item.isVegan || item.isVegetarian ? (
                <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {item.isVegan && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#2E7D32" }}
                    >
                      {getAllergenIcon("Vegan").icon}
                      Vegan
                    </motion.span>
                  )}
                  {item.isVegetarian && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22, delay: 0.03 }}
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#81C784" }}
                    >
                      {getAllergenIcon("Vegetarian").icon}
                      Vegetarian
                    </motion.span>
                  )}
                  {item.allergens?.map((a, i) => {
                    const colorMap: Record<string, string> = {
                      Vegan: "#2E7D32",
                      Vegetarian: "#81C784",
                      Halal: "#009688",
                      Dairy: "#FBC02D",
                      Eggs: "#FFB74D",
                      Soy: "#8D6E63",
                      "Wheat/Gluten": "#AB47BC",
                      Wheat: "#AB47BC",
                      Gluten: "#AB47BC",
                      Pork: "#E53935",
                      Sesame: "#FB8C00",
                    }
                    const { icon } = getAllergenIcon(a)
                    const color = colorMap[a] || "#888"
                    return (
                      <motion.span
                        key={a}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.22, delay: 0.06 + i * 0.03 }}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color }}
                      >
                        {icon}
                        {a}
                      </motion.span>
                    )
                  })}
                </div>
              ) : null}
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
} 