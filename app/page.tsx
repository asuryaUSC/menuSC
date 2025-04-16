'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Utensils, Share, ListPlus, CheckCircle, X, Download, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type PromptType = 'ios' | 'android' | 'macos' | 'none' | 'standalone';

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Augment the WindowEventMap to include 'beforeinstallprompt'
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function LandingPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [promptType, setPromptType] = useState<PromptType>('none');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Redirect if running as PWA
  useEffect(() => {
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setPromptType('standalone');
      router.replace("/menu");
      return;
    }

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroidChrome = /Android/i.test(userAgent) && /Chrome\/\d+/.test(userAgent) && !/OPR|SamsungBrowser|EdgA/i.test(userAgent);
    const isMacOS = platform.toUpperCase().indexOf('MAC') >= 0 && !isIOS;

    if (isIOS) {
      setPromptType('ios');
    } else if (isAndroidChrome) {
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPromptType('android');
        console.log("'beforeinstallprompt' event caught.");
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    } else if (isMacOS) {
      setPromptType('macos');
    } else {
      setPromptType('none');
    }
  }, [router]);

  const handlePrimaryActionClick = () => {
    if (promptType === 'ios') {
      setIsModalOpen(true);
    } else if (promptType === 'android' && deferredPrompt) {
      (deferredPrompt as BeforeInstallPromptEvent).prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setPromptType('none');
      });
    } else if (promptType === 'macos') {
      setIsModalOpen(true);
    } else {
      console.log('Primary action clicked for type:', promptType);
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

  // Prevent rendering landing content if redirecting (optional, but cleaner)
  // Note: This requires checking isStandalone *outside* the useEffect
  const isStandaloneInitialCheck = typeof window !== 'undefined' && 
    (window.matchMedia("(display-mode: standalone)").matches ||
     (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

  if (isStandaloneInitialCheck) {
    // Optionally return a minimal loading state or null while redirect happens
    return <div style={{ background: '#FAFBFC', minHeight: '100vh' }}></div>; 
  }

  let primaryButtonText = "Install App";
  let showPrimaryButton = true;
  if (promptType === 'android' && deferredPrompt) {
    primaryButtonText = "Install MenuSC App";
  } else if (promptType === 'ios' || promptType === 'macos') {
    primaryButtonText = "Install App";
  } else if (promptType === 'none') {
    showPrimaryButton = false;
  }

  return (
    <>
      <div
        style={{
          background: '#FAFBFC',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Outfit, sans-serif',
          padding: '16px',
          filter: isModalOpen ? 'blur(5px)' : 'none',
          transition: 'filter 0.2s ease-in-out',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          maxWidth: 440, 
          width: '100%', 
          marginTop: 0, 
          marginBottom: 0,
          padding: '8px',
        }}>
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
          {showPrimaryButton && (
            <button
              onClick={handlePrimaryActionClick}
              style={{
                backgroundColor: '#990000',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                padding: '14px 28px',
                borderRadius: '9999px',
                border: 'none',
                marginBottom: '16px',
                boxShadow: '0 4px 14px rgba(153, 0, 0, 0.2)',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
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
              {primaryButtonText}
              <Download size={18} style={{ marginTop: '1px' }} />
            </button>
          )}

          {/* Secondary Action Button */}
          <button
            onClick={() => router.push('/menu')}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(153, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Use Web App
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Install Instructions Modal */}
      <AnimatePresence>
        {isModalOpen && (promptType === 'ios' || promptType === 'macos') && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1010,
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: 450,
                padding: '20px 24px',
                fontFamily: 'Outfit, sans-serif',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
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

              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#333' }}>
                {promptType === 'ios' && "Install on iPhone/iPad"}
                {promptType === 'macos' && "Install on Mac"}
              </h2>

              {promptType === 'ios' && (
                <>
                  <p style={{ fontSize: 14, marginBottom: 12, color: '#555', lineHeight: 1.5 }}>
                    To add MenuSC to your Home Screen:
                  </p>
                  <ol style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 0, listStyleType: 'none', margin: 0 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ background: '#fcebeb', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600, fontSize: 12 }}>1</span>
                      <span style={{ color: '#333' }}>Tap the <Share size={16} style={{ display: 'inline', marginBottom: -3, color: '#555' }} /> Share button</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ background: '#fcebeb', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600, fontSize: 12 }}>2</span>
                      <span style={{ color: '#333' }}>Select <b>"Add to Home Screen"</b></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <span style={{ background: '#fcebeb', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#990000', fontWeight: 600, fontSize: 12 }}>3</span>
                      <span style={{ color: '#333' }}>Tap <b>"Add"</b> to install</span>
                    </li>
                  </ol>
                  <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle size={15} color="#22c55e" /> Creates an app shortcut!
                  </p>
                </>
              )}

              {promptType === 'macos' && (
                <>
                  <p style={{ fontSize: 14, marginBottom: 12, color: '#555', lineHeight: 1.5 }}>
                    To install this app on your Mac:
                  </p>
                  <ul style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 20, listStyleType: 'disc', margin: 0 }}>
                    <li style={{ marginBottom: 8, color: '#333' }}>
                      In <b>Safari:</b> Click File → <b>"Add to Dock..."</b>
                    </li>
                    <li style={{ color: '#333' }}>
                      In <b>Chrome:</b> Click the <Download size={15} style={{ display: 'inline', marginBottom: -3 }}/> icon → <b>"Install MenuSC..."</b>
                    </li>
                  </ul>
                  <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle size={15} color="#22c55e" /> Adds the app to your Applications folder.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 