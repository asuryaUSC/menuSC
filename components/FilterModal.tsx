'use client'

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, ChevronLeft, ChevronRight, Filter as FilterIcon } from "lucide-react"
import { getAllergenIcon } from "@/lib/allergenIcons"
import React, { useState } from 'react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    dietary: string[]
    allergens: string[]
    meal: string | null
    halls: string[]
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    dietary: string[]
    allergens: string[]
    meal: string | null
    halls: string[]
  }>>
  selectedMeal: string
  setSelectedMeal: (meal: string) => void
  halls: Array<{
    name: string
    sections: Array<{
      name: string
      subSections: Array<{
        name: string
        items: Array<{
          name: string
          allergens?: string[]
        }>
      }>
    }>
  }>
  selectedHallIdx: number
  setSelectedHallIdx: (idx: number) => void
}

// Simple reusable pill button component for toggles
const TogglePillButton: React.FC<{
  label: string
  isSelected: boolean
  onClick: () => void
}> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      borderRadius: '9999px',
      fontSize: 14,
      fontWeight: isSelected ? 500 : 400,
      border: 'none',
      cursor: 'pointer',
      background: isSelected ? '#990000' : '#f4f4f5',
      color: isSelected ? 'white' : '#666',
      transition: 'all 0.18s',
    }}
  >
    {label}
  </button>
)

export function FilterModal({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  selectedMeal, 
  setSelectedMeal,
  halls,
  selectedHallIdx,
  setSelectedHallIdx
}: FilterModalProps) {
  const handleClear = () => {
    setFilters({
      dietary: [],
      allergens: [],
      meal: null,
      halls: [],
    })
    // Reset to the current meal tab when clearing
    setSelectedMeal(selectedMeal)
  }

  const toggleFilter = (type: 'dietary' | 'allergens' | 'meal' | 'halls', value: string) => {
    setFilters(prev => {
      if (type === 'meal') {
        // Update both the filter and the selected meal
        const newMeal = prev.meal === value ? null : value
        if (newMeal) {
          setSelectedMeal(newMeal)
        }
        return {
          ...prev,
          meal: newMeal,
        }
      }
      
      if (type === 'halls') {
        // Handle hall selection
        const newHalls = prev.halls.includes(value)
          ? prev.halls.filter(h => h !== value)
          : [...prev.halls, value]
        
        // If we're selecting a hall, update the selectedHallIdx
        if (newHalls.length === 1) {
          const hallIndex = halls.findIndex(h => h.name === newHalls[0])
          if (hallIndex !== -1) {
            setSelectedHallIdx(hallIndex)
            
            // Check if the current meal exists in the new hall
            const newHall = halls[hallIndex]
            const mealExists = newHall.sections.some(s => s.name === selectedMeal)
            if (!mealExists && newHall.sections.length > 0) {
              setSelectedMeal(newHall.sections[0].name)
            }
          }
        }
        
        return {
          ...prev,
          halls: newHalls,
        }
      }
      
      return {
        ...prev,
        [type]: prev[type].includes(value)
          ? prev[type].filter(v => v !== value)
          : [...prev[type], value],
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              background: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
              width: '100%',
              maxWidth: 480,
              padding: '24px 24px 32px 24px',
              fontFamily: 'Outfit, sans-serif',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FilterIcon size={20} color="#990000" />
                <h2 style={{ fontWeight: 700, fontSize: 20, color: '#333' }}>Filters</h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 8,
                  borderRadius: 9999,
                  cursor: 'pointer',
                }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            {/* Dining Halls */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Dining Halls</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {halls.map(hall => (
                  <TogglePillButton 
                    key={hall.name} 
                    label={hall.name} 
                    isSelected={filters.halls.includes(hall.name)} 
                    onClick={() => toggleFilter('halls', hall.name)} 
                  />
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Dietary Preferences</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {["Vegetarian", "Vegan", "Halal"].map(pref => (
                  <TogglePillButton 
                    key={pref} 
                    label={pref} 
                    isSelected={filters.dietary.includes(pref)} 
                    onClick={() => toggleFilter('dietary', pref)} 
                  />
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Allergens</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {["Dairy", "Eggs", "Gluten", "Soy", "Sesame", "Nuts"].map(allergen => (
                   <TogglePillButton 
                     key={allergen} 
                     label={allergen} 
                     isSelected={filters.allergens.includes(allergen)} 
                     onClick={() => toggleFilter('allergens', allergen)} 
                   />
                ))}
              </div>
            </div>

            {/* Meal Type */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Meal Type</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                 {["Breakfast", "Lunch", "Dinner"].map(meal => (
                   <TogglePillButton 
                     key={meal} 
                     label={meal} 
                     isSelected={filters.meal === meal} 
                     onClick={() => toggleFilter('meal', meal)} 
                   />
                 ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#990000',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '16px',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Apply Filters
              </button>
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: 'transparent',
                  color: '#990000',
                  fontWeight: 600,
                  fontSize: '16px',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  border: '2px solid #990000',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(153, 0, 0, 0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 