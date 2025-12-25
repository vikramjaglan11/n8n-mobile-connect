import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://vikramjaglan11.app.n8n.cloud/webhook/director-agent";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();
    
    console.log(`[Director Agent] Received message: ${message}`);
    console.log(`[Director Agent] Session ID: ${sessionId}`);

    if (!message) {
      throw new Error('Message is required');
    }

    // Build the payload for n8n webhook
    // The n8n webhook expects a structure similar to Google Chat
    const payload = {
      text: message,
      message: {
        text: message
      },
      chat: {
        user: {
          name: sessionId || 'mobile-app-user',
          displayName: 'Mobile App User',
          email: ''
        },
        messagePayload: {
          message: {
            text: message
          },
          space: {
            name: 'mobile-app'
          }
        }
      }
    };

    console.log(`[Director Agent] Sending to n8n: ${JSON.stringify(payload)}`);

    // Call the n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`[Director Agent] n8n response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Director Agent] n8n error: ${errorText}`);
      throw new Error(`n8n webhook returned ${response.status}: ${errorText}`);
    }

    // Parse the response from n8n
    // n8n returns: {"hostAppDataAction":{"chatDataAction":{"createMessageAction":{"message":{"text":"On it."}}}}}
    // The actual response comes later via the completion DM, but we get immediate acknowledgment
    const responseText_raw = await response.text();
    console.log(`[Director Agent] n8n raw response: ${responseText_raw}`);
    
    let n8nResponse: unknown = null;
    let responseText = "Processing your request...";
    
    // Try to parse as JSON if there's content
    if (responseText_raw && responseText_raw.trim()) {
      try {
        n8nResponse = JSON.parse(responseText_raw);
        console.log(`[Director Agent] n8n parsed response: ${JSON.stringify(n8nResponse)}`);
        
        // Extract the response text from various possible structures
        const parsed = n8nResponse as { 
          hostAppDataAction?: { chatDataAction?: { createMessageAction?: { message?: { text?: string } } } };
          text?: string;
        };
        
        if (parsed?.hostAppDataAction?.chatDataAction?.createMessageAction?.message?.text) {
          responseText = parsed.hostAppDataAction.chatDataAction.createMessageAction.message.text;
        } else if (parsed?.text) {
          responseText = parsed.text;
        }
      } catch {
        // If parsing fails, use the raw text as the response
        console.log(`[Director Agent] Response is not JSON, using raw text`);
        responseText = responseText_raw;
      }
    } else {
      console.log(`[Director Agent] Empty response from n8n, using default message`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        response: responseText,
        raw: n8nResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Director Agent] Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
