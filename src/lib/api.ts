const API_URL = "https://vikramjaglan11.app.n8n.cloud/webhook/director-agent";

export interface DirectorResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

export async function sendMessage(message: string): Promise<DirectorResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Network error");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      response: "Sorry, I could not connect. Please try again.",
      timestamp: new Date().toISOString(),
    };
  }
}
