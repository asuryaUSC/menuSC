import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { FoodItem } from '@/lib/types'

interface SearchResultItem extends FoodItem {
  mealType: string
  hallName: string
  sectionName: string
}

interface SearchResultCardProps {
  item: SearchResultItem
  index: number
}

// Helper to create URL-friendly slugs
const slugify = (str: string) => 
  encodeURIComponent(str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));

export function SearchResultCard({ item, index }: SearchResultCardProps) {
  const router = useRouter()

  const handleClick = () => {
    const params = new URLSearchParams({
      hall: item.hallName,
      meal: item.mealType,
      section: item.sectionName,
      item: item.name, // Pass item name for potential highlight
    });
    router.push(`/menu?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }} // Stagger animation
      onClick={handleClick}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: '#333', marginBottom: 4 }}>{item.name}</div>
      <div style={{ fontSize: 14, color: '#777' }}>
        {item.mealType} • {item.hallName} • {item.sectionName}
      </div>
      {/* Optional: Add allergen icons here if needed */}
    </motion.div>
  )
} 