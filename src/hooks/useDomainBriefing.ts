import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BriefingItem {
  text: string;
  urgent?: boolean;
}

interface DomainData {
  items: BriefingItem[];
  count: number;
}

interface BriefingData {
  communications: DomainData;
  calendar: DomainData;
  tasks: DomainData;
  finance: DomainData;
  network: DomainData;
  research: DomainData;
}

const defaultBriefing: BriefingData = {
  communications: { items: [], count: 0 },
  calendar: { items: [], count: 0 },
  tasks: { items: [], count: 0 },
  finance: { items: [], count: 0 },
  network: { items: [], count: 0 },
  research: { items: [], count: 0 },
};

export function useDomainBriefing() {
  const [briefing, setBriefing] = useState<BriefingData>(defaultBriefing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Prevent multiple simultaneous fetches and auto-fetch loops
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchBriefing = useCallback(async (force: boolean = false) => {
    // Prevent duplicate calls and auto-refresh loops
    if (isFetchingRef.current) {
      console.log("[useDomainBriefing] Already fetching, skipping...");
      return;
    }

    // Only auto-fetch once unless forced
    if (hasFetchedRef.current && !force) {
      console.log("[useDomainBriefing] Already fetched, use refetch() to refresh");
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log("[useDomainBriefing] Fetching briefing data...");

      const { data, error: fnError } = await supabase.functions.invoke("domain-briefing", {
        body: { domain: "all" },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success && data?.data) {
        console.log("[useDomainBriefing] Received briefing data:", data.data);
        setBriefing(data.data);
        setLastFetched(new Date());
        hasFetchedRef.current = true;
      } else if (data?.data) {
        setBriefing(data.data);
        setLastFetched(new Date());
        hasFetchedRef.current = true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch briefing";
      console.error("[useDomainBriefing] Error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // NO AUTO-FETCH ON MOUNT - User must click refresh button
  // This prevents the infinite loop that was costing $40+

  const totalPending = Object.values(briefing).reduce((sum, domain) => sum + domain.count, 0);

  return {
    briefing,
    isLoading,
    error,
    lastFetched,
    totalPending,
    refetch: () => fetchBriefing(true), // Force refresh when user clicks
    initialFetch: () => fetchBriefing(false), // For manual initial load
  };
}
