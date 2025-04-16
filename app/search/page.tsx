'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, X } from 'lucide-react'
import { getTodaysMenu } from '@/lib/firebase-utils'
import type { DailyMenu, DiningHall, MealSection, FoodItem } from '@/lib/types'
import { SearchResultCard } from '@/components/SearchResultCard'

// Define a type for the search results, including context
interface SearchResultItem extends FoodItem {
  mealType: string
  hallName: string
  sectionName: string
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuData, setMenuData] = useState<DailyMenu | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch menu data on mount
  useEffect(() => {
    async function loadMenu() {
      setLoading(true)
      const data = await getTodaysMenu()
      setMenuData(data)
      setLoading(false)
      inputRef.current?.focus() // Autofocus after loading
    }
    loadMenu()
  }, [])

  // Filter menu data based on search query
  const searchResults = useMemo((): SearchResultItem[] => {
    if (!searchQuery || !menuData) {
      return []
    }

    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return []
    }

    const results: SearchResultItem[] = []
    const mealTypes: Array<keyof DailyMenu> = ['breakfast', 'lunch', 'dinner']

    mealTypes.forEach((mealKey) => {
      const mealName = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
      const halls = menuData[mealKey] as DiningHall[] | undefined

      halls?.forEach((hall) => {
        hall.sections.forEach((section) => {
          section.items.forEach((item) => {
            if (item.name.toLowerCase().includes(query)) {
              results.push({
                ...item,
                mealType: mealName,
                hallName: hall.name,
                sectionName: section.name,
              })
            }
            // Bonus: Check allergens
            // else if (item.allergens?.some(a => a.toLowerCase().includes(query))) {
            //   results.push({ ...item, mealType: mealName, hallName: hall.name, sectionName: section.name });
            // }
          })
        })
      })
    })

    return results
  }, [searchQuery, menuData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // Re-focus if cleared via default clear button (value becomes empty)
    if (!value && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 0); 
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(250, 250, 250, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '15vh', // Push content down a bit
        overflowY: 'auto', // Allow scrolling for results
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#f4f4f5',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#e4e4e7'
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#f4f4f5'
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
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
          position: 'relative',
          width: 'min(90%, 600px)', // Responsive width
          marginBottom: 24, // Space before results
        }}
      >
        <Search
          size={20}
          color="#aaa"
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '16px 24px 16px 60px', // Make space for icon
            fontSize: '20px',
            borderRadius: '9999px',
            backgroundColor: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            outline: 'none',
            border: 'none',
            color: '#222',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.2px',
            WebkitAppearance: 'none', // Remove default mobile styling
            appearance: 'none',
          }}
        />
        {/* Custom Clear Button (optional, styling default is tricky) */}
        {/* <button
          onClick={() => {
            setSearchQuery('');
            inputRef.current?.focus();
          }}
          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          hidden={!searchQuery}
        >
          <X size={18} color="#888" />
        </button> */}
      </motion.div>

      {/* Results Area */}
      <div style={{ width: 'min(90%, 600px)', flexGrow: 1 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Loading menu...</p>
        ) : searchQuery && searchResults.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No results found.</p>
        ) : searchQuery ? (
          <AnimatePresence>
            {searchResults.map((item, index) => (
              <SearchResultCard key={`${item.name}-${item.hallName}-${index}`} item={item} index={index} />
            ))}
          </AnimatePresence>
        ) : null /* Don't show anything if query is empty */}
      </div>
    </motion.div>
  )
} 