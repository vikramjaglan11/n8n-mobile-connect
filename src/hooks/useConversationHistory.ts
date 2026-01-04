import { useState, useCallback, useEffect } from 'react';

export interface Conversation {
  id: string;
  title: string;
  messages: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'director-conversation-history';

function generateTitle(messages: { content: string; role: string }[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Conversation';
  
  const content = firstUserMessage.content;
  // Truncate to first 40 chars or first sentence
  const truncated = content.length > 40 
    ? content.substring(0, 40) + '...' 
    : content;
  
  return truncated || 'New Conversation';
}

export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const hydrated = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setConversations(hydrated);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, []);

  // Save to localStorage when conversations change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }, [conversations]);

  const saveConversation = useCallback((messages: Conversation['messages']) => {
    if (messages.length === 0) return;

    const title = generateTitle(messages);
    const now = new Date();

    if (currentConversationId) {
      // Update existing conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages, title, updatedAt: now }
            : conv
        )
      );
    } else {
      // Create new conversation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title,
        messages,
        createdAt: now,
        updatedAt: now,
      };
      setCurrentConversationId(newConversation.id);
      setConversations(prev => [newConversation, ...prev]);
    }
  }, [currentConversationId]);

  const loadConversation = useCallback((id: string): Conversation | undefined => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
    }
    return conversation;
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  return {
    conversations,
    currentConversationId,
    saveConversation,
    loadConversation,
    deleteConversation,
    startNewConversation,
  };
}
