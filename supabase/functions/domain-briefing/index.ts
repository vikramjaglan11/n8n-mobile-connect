import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://vikramjaglan11.app.n8n.cloud/webhook/director-agent";

interface DomainBriefing {
  id: string;
  label: string;
  items: Array<{
    id: string;
    text: string;
    urgent?: boolean;
  }>;
  count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    
    console.log(`[Domain Briefing] Fetching briefing for domain: ${domain || 'all'}`);

    // Create a briefing request prompt based on domain
    let prompt = "";
    
    switch (domain) {
      case 'communications':
        prompt = "Give me a brief summary of pending emails and messages that need my attention. Return only the key points in a concise format. Format as JSON with fields: items (array of {text, urgent boolean})";
        break;
      case 'calendar':
        prompt = "What are my upcoming events and meetings for today and tomorrow? Return only the key points in a concise format. Format as JSON with fields: items (array of {text, urgent boolean})";
        break;
      case 'tasks':
        prompt = "What are my pending tasks and action items? Return only the key points in a concise format. Format as JSON with fields: items (array of {text, urgent boolean})";
        break;
      case 'finance':
        prompt = "Give me a brief financial overview - any pending payments, inflows, or outflows I should know about? Return only the key points in a concise format. Format as JSON with fields: items (array of {text, urgent boolean})";
        break;
      case 'network':
        prompt = "Who should I follow up with or connect with soon? Any birthdays or important dates coming up? Return only the key points in a concise format. Format as JSON with fields: items (array of {text, urgent boolean})";
        break;
      default:
        // Get a full briefing across all domains
        prompt = `Give me a quick briefing across all domains. Return as JSON with this exact structure:
{
  "communications": { "items": [{"text": "...", "urgent": true/false}], "count": number },
  "calendar": { "items": [{"text": "...", "urgent": true/false}], "count": number },
  "tasks": { "items": [{"text": "...", "urgent": true/false}], "count": number },
  "finance": { "items": [{"text": "...", "urgent": true/false}], "count": number },
  "network": { "items": [{"text": "...", "urgent": true/false}], "count": number },
  "research": { "items": [], "count": 0 }
}
Keep each item text under 50 characters. Maximum 3 items per domain.`;
    }

    const payload = {
      text: prompt,
      source: 'mobile-app-briefing',
      sessionId: 'briefing-session',
      responseFormat: 'json'
    };

    console.log(`[Domain Briefing] Sending request to n8n`);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`[Domain Briefing] n8n response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Domain Briefing] n8n error: ${errorText}`);
      throw new Error(`n8n webhook returned ${response.status}`);
    }

    const responseText = await response.text();
    console.log(`[Domain Briefing] n8n raw response: ${responseText}`);

    let briefingData = null;

    // Try to parse the response as JSON
    try {
      const n8nResponse = JSON.parse(responseText);
      const content = n8nResponse?.response || n8nResponse?.text || responseText;
      
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        briefingData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log(`[Domain Briefing] Could not parse as JSON, using fallback`);
    }

    // If we couldn't parse, return fallback data
    if (!briefingData) {
      briefingData = {
        communications: { items: [{ text: "Unable to fetch - check connection", urgent: false }], count: 0 },
        calendar: { items: [{ text: "Unable to fetch - check connection", urgent: false }], count: 0 },
        tasks: { items: [{ text: "Unable to fetch - check connection", urgent: false }], count: 0 },
        finance: { items: [], count: 0 },
        network: { items: [], count: 0 },
        research: { items: [], count: 0 }
      };
    }

    return new Response(
      JSON.stringify({ success: true, data: briefingData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Domain Briefing] Error:', errorMessage);
    
    // Return fallback data on error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        data: {
          communications: { items: [{ text: "Connection error", urgent: false }], count: 0 },
          calendar: { items: [{ text: "Connection error", urgent: false }], count: 0 },
          tasks: { items: [{ text: "Connection error", urgent: false }], count: 0 },
          finance: { items: [], count: 0 },
          network: { items: [], count: 0 },
          research: { items: [], count: 0 }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
