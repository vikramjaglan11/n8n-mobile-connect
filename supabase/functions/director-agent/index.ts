import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://vikramjaglan11.app.n8n.cloud/webhook/director-agent";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();
    
    console.log(`[Director Agent] Received message: ${message}`);

    if (!message) {
      throw new Error('Message is required');
    }

    // SIMPLIFIED payload - explicit source identifier
    const payload = {
      text: message,
      source: 'mobile-app',
      sessionId: sessionId || 'mobile-app-user'
    };

    console.log(`[Director Agent] Sending to n8n: ${JSON.stringify(payload)}`);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`[Director Agent] n8n response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Director Agent] n8n error: ${errorText}`);
      throw new Error(`n8n webhook returned ${response.status}: ${errorText}`);
    }

    const responseText_raw = await response.text();
    console.log(`[Director Agent] n8n raw response: ${responseText_raw}`);
    
    let responseText = "Processing your request...";
    
    if (responseText_raw && responseText_raw.trim()) {
      try {
        const n8nResponse = JSON.parse(responseText_raw);
        // n8n returns: { success: true, response: "actual response" }
        if (n8nResponse?.response) {
          responseText = n8nResponse.response;
        } else if (n8nResponse?.text) {
          responseText = n8nResponse.text;
        }
      } catch {
        responseText = responseText_raw;
      }
    }

    return new Response(
      JSON.stringify({ success: true, response: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Director Agent] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
