import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BASE_URL = "https://vikramjaglan11.app.n8n.cloud/webhook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedActions: Record<string, { path: string }> = {
  "communications/ignore": { path: "communications/ignore" },
  "communications/watch": { path: "communications/watch" },
  "communications/resolve": { path: "communications/resolve" },

  "emails/archive": { path: "emails/archive" },
  "emails/reply": { path: "emails/reply" },

  "chats/reply": { path: "chats/reply" },

  "tasks/complete": { path: "tasks/complete" },

  "calendar/edit": { path: "calendar/edit" },
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, payload } = await req.json();

    const config = allowedActions[action];
    if (!config) {
      return new Response(JSON.stringify({ success: false, error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(`${BASE_URL}/${config.path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": contentType },
    });
  } catch (error) {
    console.error("communications-actions error", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
