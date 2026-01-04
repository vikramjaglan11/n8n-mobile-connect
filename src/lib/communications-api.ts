// Communications Inbox API Client

const BASE_URL = 'https://vikramjaglan11.app.n8n.cloud/webhook';

export interface CommunicationCard {
  id: string;
  platform: 'whatsapp' | 'telegram' | 'slack' | 'google_chat' | 'email';
  sender_name: string;
  sender_phone?: string;
  content_preview: string;
  status: 'unread' | 'read' | 'watching' | 'replied' | 'ignored';
  is_watch_item: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  received_at: string;
  watch_status?: string;
  awaiting_from_name?: string;
  next_follow_up_at?: string;
}

export interface InboxSummary {
  platform: string;
  unread_count: number;
  watching_count: number;
  pending_response_count: number;
  latest_message_at: string;
}

export interface CommunicationsResponse {
  success: boolean;
  cards: CommunicationCard[];
  summary: InboxSummary[];
  timestamp: string;
}

// Get all communication cards and summary
export async function getCommunicationCards(): Promise<CommunicationsResponse> {
  const response = await fetch(`${BASE_URL}/communications/cards`);
  if (!response.ok) throw new Error('Failed to fetch communications');
  return response.json();
}

// Ignore a message (dismiss without responding)
export async function ignoreMessage(messageId: string): Promise<{success: boolean}> {
  const response = await fetch(`${BASE_URL}/communications/ignore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId })
  });
  if (!response.ok) throw new Error('Failed to ignore message');
  return response.json();
}

// Add message to watch list
export async function addToWatch(messageId: string, reason?: string): Promise<{success: boolean}> {
  const response = await fetch(`${BASE_URL}/communications/watch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, reason })
  });
  if (!response.ok) throw new Error('Failed to add to watch');
  return response.json();
}

// Resolve a watch item
export async function resolveWatchItem(messageId: string): Promise<{success: boolean}> {
  const response = await fetch(`${BASE_URL}/communications/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId })
  });
  if (!response.ok) throw new Error('Failed to resolve watch item');
  return response.json();
}
