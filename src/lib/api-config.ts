// API Configuration for Communications Endpoints

export const API_BASE_URL = 'https://vikramjaglan11.app.n8n.cloud/webhook';

export const ENDPOINTS = {
  // Email endpoints
  emailReply: `${API_BASE_URL}/emails/reply`,
  emailArchive: `${API_BASE_URL}/emails/archive`,
  
  // Chat endpoints
  chatReply: `${API_BASE_URL}/chats/reply`,
  
  // Communications actions (works for emails, chats, tasks)
  commIgnore: `${API_BASE_URL}/communications/ignore`,
  commWatch: `${API_BASE_URL}/communications/watch`,
  
  // Task endpoints
  tasksComplete: `${API_BASE_URL}/tasks/complete`,
  
  // Calendar endpoints
  calendarEdit: `${API_BASE_URL}/calendar/edit`,
  
  // Read endpoints
  emailsCards: `${API_BASE_URL}/emails/cards`,
  chatsCards: `${API_BASE_URL}/chats/cards`,
  watchItems: `${API_BASE_URL}/watch-items`,
  calendarToday: `${API_BASE_URL}/calendar/today`,
  tasksPending: `${API_BASE_URL}/tasks/pending`,
};
