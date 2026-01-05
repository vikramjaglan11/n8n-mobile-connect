import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'acknowledged_items';

interface AcknowledgedData {
  emails: string[];
  chats: string[];
  calendar: string[];
  tasks: string[];
}

const getEmptyData = (): AcknowledgedData => ({
  emails: [],
  chats: [],
  calendar: [],
  tasks: [],
});

export function useAcknowledgedItems() {
  const [acknowledged, setAcknowledged] = useState<AcknowledgedData>(getEmptyData);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAcknowledged(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load acknowledged items:', error);
    }
  }, []);

  // Save to localStorage when state changes
  const saveToStorage = useCallback((data: AcknowledgedData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save acknowledged items:', error);
    }
  }, []);

  const acknowledgeEmail = useCallback((id: string) => {
    setAcknowledged((prev) => {
      if (prev.emails.includes(id)) return prev;
      const updated = { ...prev, emails: [...prev.emails, id] };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const acknowledgeChat = useCallback((id: string) => {
    setAcknowledged((prev) => {
      if (prev.chats.includes(id)) return prev;
      const updated = { ...prev, chats: [...prev.chats, id] };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const acknowledgeCalendarEvent = useCallback((id: string) => {
    setAcknowledged((prev) => {
      if (prev.calendar.includes(id)) return prev;
      const updated = { ...prev, calendar: [...prev.calendar, id] };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const acknowledgeTask = useCallback((id: string) => {
    setAcknowledged((prev) => {
      if (prev.tasks.includes(id)) return prev;
      const updated = { ...prev, tasks: [...prev.tasks, id] };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const isEmailAcknowledged = useCallback((id: string) => acknowledged.emails.includes(id), [acknowledged.emails]);
  const isChatAcknowledged = useCallback((id: string) => acknowledged.chats.includes(id), [acknowledged.chats]);
  const isCalendarAcknowledged = useCallback((id: string) => acknowledged.calendar.includes(id), [acknowledged.calendar]);
  const isTaskAcknowledged = useCallback((id: string) => acknowledged.tasks.includes(id), [acknowledged.tasks]);

  return {
    acknowledgeEmail,
    acknowledgeChat,
    acknowledgeCalendarEvent,
    acknowledgeTask,
    isEmailAcknowledged,
    isChatAcknowledged,
    isCalendarAcknowledged,
    isTaskAcknowledged,
  };
}
