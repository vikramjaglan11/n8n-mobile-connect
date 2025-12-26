import { useState, useEffect, useCallback } from "react";
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

  const fetchBriefing = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[useDomainBriefing] Fetching briefing data...");
      
      const { data, error: fnError } = await supabase.functions.invoke('domain-briefing', {
        body: { domain: 'all' }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success && data?.data) {
        console.log("[useDomainBriefing] Received briefing data:", data.data);
        setBriefing(data.data);
        setLastFetched(new Date());
      } else if (data?.data) {
        // Even on error, we might have fallback data
        setBriefing(data.data);
        setLastFetched(new Date());
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch briefing';
      console.error("[useDomainBriefing] Error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  // Calculate total pending items
  const totalPending = Object.values(briefing).reduce((sum, domain) => sum + domain.count, 0);

  return {
    briefing,
    isLoading,
    error,
    lastFetched,
    totalPending,
    refetch: fetchBriefing,
  };
}
