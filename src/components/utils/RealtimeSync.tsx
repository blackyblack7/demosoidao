"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface RealtimeSyncProps {
  intervalMs?: number;
  label?: string;
}

/**
 * Smart Real-time Sync component.
 * Uses router.refresh() to update server components when:
 * 1. The tab becomes visible again.
 * 2. On a periodic interval (only if the tab is visible).
 */
export default function RealtimeSync({ intervalMs = 30000, label = "Sync" }: RealtimeSyncProps) {
  const router = useRouter();
  const lastSyncRef = useRef<number>(Date.now());

  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        // Only refresh if at least 5 seconds passed since last sync to prevent double firing
        // when switching tabs rapidly
        const now = Date.now();
        if (now - lastSyncRef.current > 5000) {
          console.log(`[RealtimeSync:${label}] Refreshing data...`);
          router.refresh();
          lastSyncRef.current = now;
        }
      }
    };

    // Setup interval polling
    const interval = setInterval(() => {
      handleSync();
    }, intervalMs);

    // Sync immediately when tab becomes visible
    document.addEventListener("visibilitychange", handleSync);

    // Initial sync check
    handleSync();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [router, intervalMs, label]);

  return null; // Invisible component
}
