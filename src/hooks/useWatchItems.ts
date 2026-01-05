import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage, Task, WatchItem } from "@/lib/communications-api";

const STORAGE_KEY = "watched_items_v1";

type WatchedState = {
  chats: WatchItem[];
  tasks: Task[];
};

const emptyState = (): WatchedState => ({ chats: [], tasks: [] });

function toWatchItem(chat: ChatMessage): WatchItem {
  return {
    id: chat.id,
    sender_name: chat.sender_name,
    content_preview: chat.content_preview,
    content: chat.content,
    received_at: chat.received_at,
    platform: chat.platform,
  };
}

export function useWatchItems() {
  const [state, setState] = useState<WatchedState>(emptyState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setState(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load watched items:", error);
    }
  }, []);

  const persist = useCallback((next: WatchedState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to save watched items:", error);
    }
  }, []);

  const watchChat = useCallback(
    (chat: ChatMessage) => {
      setState((prev) => {
        if (prev.chats.some((c) => c.id === chat.id)) return prev;
        const next = { ...prev, chats: [toWatchItem(chat), ...prev.chats] };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const unwatchChat = useCallback(
    (id: string) => {
      setState((prev) => {
        if (!prev.chats.some((c) => c.id === id)) return prev;
        const next = { ...prev, chats: prev.chats.filter((c) => c.id !== id) };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const watchTask = useCallback(
    (task: Task) => {
      setState((prev) => {
        if (prev.tasks.some((t) => t.id === task.id)) return prev;
        const next = { ...prev, tasks: [task, ...prev.tasks] };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const unwatchTask = useCallback(
    (id: string) => {
      setState((prev) => {
        if (!prev.tasks.some((t) => t.id === id)) return prev;
        const next = { ...prev, tasks: prev.tasks.filter((t) => t.id !== id) };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isChatWatched = useCallback((id: string) => state.chats.some((c) => c.id === id), [state.chats]);
  const isTaskWatched = useCallback((id: string) => state.tasks.some((t) => t.id === id), [state.tasks]);

  const watchedChats = state.chats;
  const watchedTasks = state.tasks;

  const watchedChatCount = useMemo(() => watchedChats.length, [watchedChats]);
  const watchedTaskCount = useMemo(() => watchedTasks.length, [watchedTasks]);

  return {
    watchedChats,
    watchedTasks,
    watchedChatCount,
    watchedTaskCount,
    watchChat,
    unwatchChat,
    watchTask,
    unwatchTask,
    isChatWatched,
    isTaskWatched,
  };
}
