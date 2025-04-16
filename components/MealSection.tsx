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
  mealType?: string
  highlightedItemId?: string | null
}

export function MealSection({ section, mealType, highlightedItemId }: MealSectionProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        padding: '16px 16px 8px 16px',
        marginBottom: '24px',
        maxWidth: '640px',
        marginInline: 'auto',
      }}
    >
      {/* Section Title */}
      <div
        style={{
          borderLeft: '4px solid #990000',
          paddingLeft: '12px',
          fontWeight: '600',
          fontSize: '16px',
          color: '#990000',
          marginBottom: '12px',
          fontFamily: 'Outfit, sans-serif'
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
              className={isHighlighted ? 'highlighted-item' : ''}
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
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: item.allergens?.length || item.isVegan || item.isVegetarian ? 8 : 0
                }}>
                  <div style={{ 
                    fontSize: 15, 
                    fontWeight: 500, 
                    fontFamily: "Outfit, sans-serif",
                    color: "#333"
                  }}>
                    {item.name}
                  </div>
                </div>

                {/* Allergen and Dietary Tags */}
                {(item.allergens && item.allergens.length > 0) || item.isVegan || item.isVegetarian ? (
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 8,
                    borderTop: "1px solid #EEE",
                    paddingTop: 8
                  }}>
                    {item.isVegan && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.22 }}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 4, 
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          color: "#2E7D32",
                          background: "rgba(46, 125, 50, 0.1)",
                          padding: "4px 8px",
                          borderRadius: 6
                        }}
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
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 4, 
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          color: "#81C784",
                          background: "rgba(129, 199, 132, 0.1)",
                          padding: "4px 8px",
                          borderRadius: 6
                        }}
                      >
                        {getAllergenIcon("Vegetarian").icon}
                        Vegetarian
                      </motion.span>
                    )}
                    {item.allergens?.map((a, i) => {
                      const colorMap: Record<string, { color: string, bg: string }> = {
                        Vegan: { color: "#2E7D32", bg: "rgba(46, 125, 50, 0.1)" },
                        Vegetarian: { color: "#81C784", bg: "rgba(129, 199, 132, 0.1)" },
                        Halal: { color: "#009688", bg: "rgba(0, 150, 136, 0.1)" },
                        Dairy: { color: "#FBC02D", bg: "rgba(251, 192, 45, 0.1)" },
                        Eggs: { color: "#FFB74D", bg: "rgba(255, 183, 77, 0.1)" },
                        Soy: { color: "#8D6E63", bg: "rgba(141, 110, 99, 0.1)" },
                        "Wheat/Gluten": { color: "#AB47BC", bg: "rgba(171, 71, 188, 0.1)" },
                        Wheat: { color: "#AB47BC", bg: "rgba(171, 71, 188, 0.1)" },
                        Gluten: { color: "#AB47BC", bg: "rgba(171, 71, 188, 0.1)" },
                        Pork: { color: "#E53935", bg: "rgba(229, 57, 53, 0.1)" },
                        Sesame: { color: "#FB8C00", bg: "rgba(251, 140, 0, 0.1)" },
                      }
                      const { icon } = getAllergenIcon(a)
                      const { color, bg } = colorMap[a] || { color: "#888", bg: "rgba(136, 136, 136, 0.1)" }
                      return (
                        <motion.span
                          key={a}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.22, delay: 0.06 + i * 0.03 }}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 4, 
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            color,
                            background: bg,
                            padding: "4px 8px",
                            borderRadius: 6
                          }}
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
    </div>
  )
} 