const API_URL = "https://vikramjaglan11.app.n8n.cloud/webhook/lovable-director";

export interface DirectorResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

function getSessionId(): string {
  let sessionId = localStorage.getItem("director_session_id");
  if (!sessionId) {
    sessionId = `lovable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("director_session_id", sessionId);
  }
  return sessionId;
}

export async function sendMessage(message: string): Promise<DirectorResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        message: message,
        sessionId: getSessionId(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: data.success ?? true,
      response: data.response || data.text || "Done.",
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      response: "Sorry, I could not connect. Please try again.",
      timestamp: new Date().toISOString(),
    };
  }
}
