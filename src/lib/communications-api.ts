// Communications Inbox API Client

import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://vikramjaglan11.app.n8n.cloud/webhook";

type ActionResponse = { success: boolean };

async function invokeAction<T = ActionResponse>(action: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("communications-actions", {
    body: { action, payload },
  });

  if (error) throw error;
  return data as T;
}

// === EMAIL TYPES ===
export interface Email {
  id: string;
  sender_name: string;
  sender_email: string | null;
  subject: string;
  content_preview: string;
  content: string;
  status: "unread" | "read" | "watching";
  priority: string;
  category: string | null;
  is_watch_item: boolean;
  received_at: string;
  email_account: string;
}

export interface EmailAccount {
  account_name: string;
  emails: Email[];
  unread_count: number;
  total: number;
}

export interface EmailsResponse {
  success: boolean;
  accounts: EmailAccount[];
  total_emails: number;
  total_unread: number;
  timestamp: string;
}

// === CHAT TYPES ===
export interface ChatMessage {
  id: string;
  sender_name: string;
  sender_phone?: string;
  sender_id?: string;
  content_preview: string;
  content: string;
  status: string;
  priority?: string;
  is_watch_item?: boolean;
  awaiting_response?: boolean;
  received_at: string;
  platform: string;
}

export interface ChatPlatform {
  platform: string;
  display_name: string;
  messages: ChatMessage[];
  unread_count: number;
  total: number;
}

export interface ChatsResponse {
  success: boolean;
  platforms: ChatPlatform[];
  total_messages: number;
  total_unread: number;
  timestamp: string;
}

// === CALENDAR TYPES ===
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
  attendees: string[];
  calendar_account: string;
  is_all_day: boolean;
}

export interface CalendarAccount {
  calendar_name: string;
  events: CalendarEvent[];
  event_count: number;
}

export interface CalendarResponse {
  success: boolean;
  date: string;
  calendars: CalendarAccount[];
  total_events: number;
  timestamp: string;
}

// === TASK TYPES ===
export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface TaskSection {
  name: string;
  tasks: Task[];
  count: number;
  priority?: number;
}

export interface TasksResponse {
  success: boolean;
  sections: TaskSection[];
  total_tasks: number;
  overdue_count?: number;
  timestamp: string;
}

// === READ (GET) FUNCTIONS ===
export async function getEmails(): Promise<EmailsResponse> {
  const response = await fetch(`${BASE_URL}/emails/cards`);
  if (!response.ok) throw new Error("Failed to fetch emails");
  return response.json();
}

export async function getChats(): Promise<ChatsResponse> {
  const response = await fetch(`${BASE_URL}/chats/cards`);
  if (!response.ok) throw new Error("Failed to fetch chats");
  return response.json();
}

export async function getCalendarToday(): Promise<CalendarResponse> {
  const response = await fetch(`${BASE_URL}/calendar/today`);
  if (!response.ok) throw new Error("Failed to fetch calendar");
  return response.json();
}

export async function getTasks(): Promise<TasksResponse> {
  const response = await fetch(`${BASE_URL}/tasks/pending`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
}

// === ACTION (POST) FUNCTIONS (proxied through backend function to avoid CORS) ===
export async function ignoreMessage(messageId: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("communications/ignore", { messageId });
}

export async function addToWatch(messageId: string, reason?: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("communications/watch", { messageId, reason });
}

export async function resolveWatchItem(messageId: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("communications/resolve", { messageId });
}

export async function archiveEmail(emailId: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("emails/archive", { emailId });
}

export async function replyToEmail(emailId: string, message: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("emails/reply", { emailId, message });
}

export async function replyToChat(chatId: string, message: string, platform: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("chats/reply", { chatId, message, platform });
}

export async function completeTask(taskId: string): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("tasks/complete", { taskId });
}

export async function editCalendarEvent(
  eventId: string,
  action: "delete" | "update",
  message?: string,
  updates?: Partial<CalendarEvent>,
): Promise<ActionResponse> {
  return invokeAction<ActionResponse>("calendar/edit", { eventId, action, message, updates });
}
