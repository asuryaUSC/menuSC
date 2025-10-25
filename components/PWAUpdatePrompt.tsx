"use client";

import { useEffect, useState } from "react";

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // Add event listener to detect when a new service worker is waiting
      wb.addEventListener("waiting", () => {
        setShowPrompt(true);
      });

      // Register the service worker
      wb.register();
    }

    // Alternative approach: Check for updates on page load
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every 60 seconds when app is active
        const interval = setInterval(() => {
          reg.update();
        }, 60000);

        return () => clearInterval(interval);
      });

      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Reload the page to load the new version
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    setShowPrompt(false);

    if (window.workbox) {
      // Tell the waiting service worker to activate
      window.workbox.messageSkipWaiting();
    } else if (registration?.waiting) {
      // Fallback: manually tell the waiting SW to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-lg bg-[#990000] p-4 text-white shadow-lg">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Update Available</h3>
            <p className="mt-1 text-sm text-white/90">
              A new version of MenuSC is available with the latest features and fixes.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-[#990000] transition hover:bg-white/90"
          >
            Update Now
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    workbox: {
      register: () => void;
      addEventListener: (event: string, callback: () => void) => void;
      messageSkipWaiting: () => void;
    };
  }
}
