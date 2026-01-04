// Communications Inbox API Client

const BASE_URL = 'https://vikramjaglan11.app.n8n.cloud/webhook';

// Email types
export interface EmailCard {
  id: string;
  account: string;
  sender_name: string;
  sender_email?: string;
  subject?: string;
  content_preview: string;
  content?: string;
  status: 'unread' | 'read' | 'replied' | 'ignored';
  is_watch_item: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  received_at: string;
}

export interface EmailsResponse {
  success: boolean;
  cards: EmailCard[];
  accounts: string[];
  timestamp: string;
}

// Chat types
export interface ChatCard {
  id: string;
  platform: 'whatsapp' | 'telegram' | 'slack' | 'google_chat';
  sender_name: string;
  sender_phone?: string;
  content_preview: string;
  content?: string;
  status: 'unread' | 'read' | 'watching' | 'replied' | 'ignored';
  is_watch_item: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  received_at: string;
  watch_status?: string;
  awaiting_from_name?: string;
}

export interface ChatsResponse {
  success: boolean;
  cards: ChatCard[];
  platforms: string[];
  timestamp: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  is_all_day?: boolean;
  calendar_name?: string;
}

export interface CalendarResponse {
  success: boolean;
  events: CalendarEvent[];
  timestamp: string;
}

// Task types
export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  due_date?: string;
  project?: string;
  tags?: string[];
}

export interface TasksResponse {
  success: boolean;
  tasks: TaskItem[];
  timestamp: string;
}

// Legacy type for backwards compatibility
export interface CommunicationCard {
  id: string;
  platform: 'whatsapp' | 'telegram' | 'slack' | 'google_chat' | 'email';
  sender_name: string;
  sender_phone?: string;
  content_preview: string;
  content?: string;
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

// API functions

// Get emails grouped by account
export async function getEmailCards(): Promise<EmailsResponse> {
  const response = await fetch(`${BASE_URL}/emails/cards`);
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
}

// Get chats grouped by platform
export async function getChatCards(): Promise<ChatsResponse> {
  const response = await fetch(`${BASE_URL}/chats/cards`);
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
}

// Get today's calendar events
export async function getCalendarEvents(): Promise<CalendarResponse> {
  const response = await fetch(`${BASE_URL}/calendar/today`);
  if (!response.ok) throw new Error('Failed to fetch calendar');
  return response.json();
}

// Get pending tasks
export async function getPendingTasks(): Promise<TasksResponse> {
  const response = await fetch(`${BASE_URL}/tasks/pending`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

// Legacy: Get all communication cards (for backwards compatibility)
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
