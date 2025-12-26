import { supabase } from "@/integrations/supabase/client";

// Edge function endpoints
export const ENDPOINTS = {
  DIRECTOR_AGENT: "director-agent",
  DOMAIN_BRIEFING: "domain-briefing",
} as const;

// Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface DirectorAgentRequest {
  message: string;
  sessionId: string;
}

export interface DirectorAgentResponse {
  response?: string;
  text?: string;
  error?: string;
}

export interface DomainBriefingResponse {
  communications: { items: BriefingItem[]; count: number };
  calendar: { items: BriefingItem[]; count: number };
  tasks: { items: BriefingItem[]; count: number };
  notifications: { items: BriefingItem[]; count: number };
}

export interface BriefingItem {
  id: string;
  title: string;
  preview?: string;
  time?: string;
  priority?: "high" | "medium" | "low";
}

// API helper functions
export async function invokeEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return { data: null, error: error.message };
    }

    return { data: data as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Exception calling ${functionName}:`, message);
    return { data: null, error: message };
  }
}

// Typed API calls
export async function sendDirectorMessage(
  message: string,
  sessionId: string
): Promise<ApiResponse<DirectorAgentResponse>> {
  return invokeEdgeFunction<DirectorAgentResponse>(ENDPOINTS.DIRECTOR_AGENT, {
    message,
    sessionId,
  });
}

export async function fetchDomainBriefing(): Promise<ApiResponse<DomainBriefingResponse>> {
  return invokeEdgeFunction<DomainBriefingResponse>(ENDPOINTS.DOMAIN_BRIEFING);
}
