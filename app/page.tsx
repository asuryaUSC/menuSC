'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Utensils, Share, ListPlus, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Detect Safari (iOS or macOS)
  const isSafari = typeof navigator !== 'undefined' && 
                   /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleInstallClick = () => {
    if (isSafari) {
      setIsModalOpen(true)
    } else {
      // For non-Safari, maybe show a different message or do nothing yet
      console.log('Install prompt for non-Safari browsers coming soon.')
    }
  }

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scroll on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  return (
    <>
      <div
        style={{
          background: '#FAFBFC', // Light background
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Outfit, sans-serif',
          padding: '24px', // Padding around the content
          filter: isModalOpen ? 'blur(5px)' : 'none', // Apply blur when modal is open
          transition: 'filter 0.2s ease-in-out',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            <Utensils size={28} color="#990000" style={{ marginBottom: -2 }} />
            <h1 style={{ color: '#990000', fontSize: '28px', fontWeight: 700, margin: 0 }}>
              MenuSC
            </h1>
          </div>

          <p style={{ color: '#555', marginBottom: '32px', fontSize: '16px', lineHeight: 1.6 }}>
            Get quick access to USC dining hall menus right from your home screen.
          </p>

          {/* Primary Action Button */}
          <button
            onClick={handleInstallClick}
            style={{
              backgroundColor: '#990000', // USC Red
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 28px',
              borderRadius: '9999px', // Pill shape
              border: 'none',
              marginBottom: '16px', // Space between buttons
              boxShadow: '0 4px 14px rgba(153, 0, 0, 0.2)', // Subtle red shadow
              cursor: 'pointer',
              width: '100%',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(153, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(153, 0, 0, 0.2)';
            }}
          >
            Install App
          </button>

          {/* Secondary Action Button */}
          <button
            onClick={() => router.push('/menu')}
            style={{
              backgroundColor: 'transparent',
              color: '#990000', // USC Red
              fontWeight: 600,
              fontSize: '16px',
              padding: '12px 28px', // Slightly less padding than primary
              borderRadius: '9999px', // Pill shape
              border: '2px solid #990000',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.15s ease',
            }}
             onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(153, 0, 0, 0.05)'; // Very light red background on hover
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Use Web App
          </button>
        </div>
      </div>

      {/* Install Instructions Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1010, // Ensure modal is above blurred background
              background: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
            }}
            onClick={() => setIsModalOpen(false)} // Close on overlay click
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              style={{
                position: 'relative', // For close button positioning
                background: 'white',
                borderRadius: 16,
                padding: '24px 28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                fontFamily: 'Outfit, sans-serif',
                maxWidth: 450,
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close instructions"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
              >
                <X size={18} color="#555" />
              </button>

              <h2 style={{ color: '#990000', fontSize: '20px', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
                How to Install MenuSC
              </h2>
              
              {/* Step-by-step instructions */}
              <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ background: '#fcebeb', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600 }}>1</span>
                  <span>Tap the <Share size={16} style={{ display: 'inline', marginBottom: -2, color: '#555' }} /> Share button in Safari.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ background: '#fcebeb', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600 }}>2</span>
                  <span>Scroll down and tap &quot;Add to Home Screen&quot; <ListPlus size={16} style={{ display: 'inline', marginBottom: -2, color: '#555' }} />.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ background: '#fcebeb', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600 }}>3</span>
                  <span>Tap &quot;Add&quot; in the top right.</span>
                </li>
              </ol>

              <p style={{ textAlign: 'center', fontSize: 14, color: '#666', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                 <CheckCircle size={16} color="#22c55e" /> This creates a shortcut to launch MenuSC like an app!
              </p>
              
              {/* Placeholder for future image */}
              {/* <div style={{ marginTop: 20, height: 100, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                [Optional Image Here]
              </div> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 