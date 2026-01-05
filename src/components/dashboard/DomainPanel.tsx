import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Calendar,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Eye,
  ArrowDown,
} from "lucide-react";
import { EmailCard } from "@/components/communications/EmailCard";
import { ChatCard } from "@/components/communications/ChatCard";
import { CalendarCard } from "@/components/communications/CalendarCard";
import { TaskCard } from "@/components/communications/TaskCard";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAcknowledgedItems } from "@/hooks/useAcknowledgedItems";
import { useWatchItems } from "@/hooks/useWatchItems";
import {
  getEmails,
  getChats,
  getWatchItems,
  getCalendarToday,
  getTasks,
  EmailAccount,
  ChatPlatform,
  CalendarAccount,
  TaskSection,
  WatchItemPlatform,
  archiveEmail,
  replyToEmail,
  replyToChat,
  completeTask,
  editCalendarEvent,
} from "@/lib/communications-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface DomainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (prompt: string) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  unreadCount?: number;
  watchCount?: number;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({
  title,
  icon,
  count,
  unreadCount,
  watchCount,
  isLoading,
  isExpanded,
  onToggle,
  children,
}: SectionProps) {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
          {isLoading ? <Loader2 className="w-5 h-5 text-foreground/50 animate-spin" /> : icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${count} items`}</p>
        </div>
        <div className="flex items-center gap-2">
          {watchCount !== undefined && watchCount > 0 && !isLoading && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {watchCount} watch
            </span>
          )}
          {unreadCount !== undefined && unreadCount > 0 && !isLoading && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 max-h-80 overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DomainPanel({ isOpen, onClose, onSelectDomain }: DomainPanelProps) {
  const { toast } = useToast();
  const {
    acknowledgeEmail,
    acknowledgeChat,
    acknowledgeCalendarEvent,
    acknowledgeTask,
    isEmailAcknowledged,
    isChatAcknowledged,
    isCalendarAcknowledged,
    isTaskAcknowledged,
  } = useAcknowledgedItems();

  const {
    watchedChats,
    watchedTasks,
    watchChat,
    unwatchChat,
    watchTask,
    unwatchTask,
    isChatWatched,
    isTaskWatched,
  } = useWatchItems();

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    emails: false,
    chats: false,
    calendar: false,
    tasks: false,
  });

  // Data states
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);

  const [chatPlatforms, setChatPlatforms] = useState<ChatPlatform[]>([]);
  const [watchItemPlatforms, setWatchItemPlatforms] = useState<WatchItemPlatform[]>([]);

  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([]);

  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);

  // Loading states
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch functions
  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const data = await getEmails();
      setEmailAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const [chatsData, watchData] = await Promise.all([getChats(), getWatchItems()]);
      setChatPlatforms(chatsData.platforms || []);
      setWatchItemPlatforms(watchData.watch_items || []);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const data = await getCalendarToday();
      // Only include calendars that have actual events with titles
      const calendarsWithEvents = (data.calendars || [])
        .map((c) => ({
          ...c,
          events: c.events.filter((e) => e.title && e.title.trim() !== "" && e.title !== "No title"),
        }))
        .map((c) => ({ ...c, event_count: c.events.length }))
        .filter((c) => c.events.length > 0);
      setCalendarAccounts(calendarsWithEvents);
    } catch (error) {
      console.error("Failed to fetch calendar:", error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await getTasks();
      setTaskSections(data.sections || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchEmails(), fetchChats(), fetchCalendar(), fetchTasks()]);
    setLastFetched(new Date());
  };

  useEffect(() => {
    if (isOpen) {
      fetchAll();
    }
  }, [isOpen]);

  // Email action handlers
  const handleIgnoreEmail = (id: string) => {
    acknowledgeEmail(id);
    setEmailAccounts((prev) =>
      prev
        .map((account) => ({
          ...account,
          emails: account.emails.filter((e) => e.id !== id),
          total: account.total - 1,
          unread_count:
            account.emails.find((e) => e.id === id)?.status === "unread"
              ? account.unread_count - 1
              : account.unread_count,
        }))
        .filter((account) => account.emails.length > 0),
    );
    toast({ title: "Ignored" });
  };

  const handleReplyEmail = async (id: string, message: string) => {
    try {
      await replyToEmail(id, message);
      toast({ title: "Reply sent" });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
      throw new Error("Failed to send");
    }
  };

  // Chat action handlers
  const handleReplyChat = async (id: string, message: string) => {
    try {
      await replyToChat(id, message);
      // Reply => treated as handled, remove from inbox
      unwatchChat(id);
      acknowledgeChat(id);
      setChatPlatforms((prev) =>
        prev
          .map((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== id) }))
          .filter((p) => p.messages.length > 0),
      );
      setWatchItemPlatforms((prev) => prev.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })));
      toast({ title: "Reply sent" });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
      throw new Error("Failed to send");
    }
  };

  const handleIgnoreChat = (id: string) => {
    unwatchChat(id);
    acknowledgeChat(id);
    setChatPlatforms((prev) =>
      prev
        .map((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== id) }))
        .filter((p) => p.messages.length > 0),
    );
    setWatchItemPlatforms((prev) => prev.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })));
    toast({ title: "Ignored" });
  };

  const handleWatchChat = (chat: import("@/lib/communications-api").ChatMessage) => {
    watchChat(chat);
    setChatPlatforms((prev) =>
      prev
        .map((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== chat.id) }))
        .filter((p) => p.messages.length > 0),
    );
    toast({ title: "Added to watch list" });
  };

  // Calendar action handler
  const handleEditCalendar = async (eventId: string, action: "delete" | "update", message?: string) => {
    try {
      await editCalendarEvent(eventId, action, message);
      if (action === "delete") {
        setCalendarAccounts((prev) =>
          prev
            .map((calendar) => ({
              ...calendar,
              events: calendar.events.filter((e) => e.id !== eventId),
              event_count: calendar.event_count - 1,
            }))
            .filter((calendar) => calendar.events.length > 0),
        );
        toast({ title: message ? "Event deleted & attendees notified" : "Event deleted" });
      }
    } catch {
      toast({ title: "Failed to update event", variant: "destructive" });
    }
  };


  // Task action handler
  const handleCompleteTask = async (id: string) => {
    try {
      await completeTask(id);
      setTaskSections((prev) =>
        prev
          .map((section) => ({
            ...section,
            tasks: section.tasks.filter((t) => t.id !== id),
            count: section.count - 1,
          }))
          .filter((section) => section.tasks.length > 0),
      );
      toast({ title: "Task completed" });
    } catch {
      toast({ title: "Failed to complete task", variant: "destructive" });
    }
  };

  const handleIgnoreTask = (id: string) => {
    unwatchTask(id);
    acknowledgeTask(id);
    setTaskSections((prev) =>
      prev
        .map((section) => ({ ...section, tasks: section.tasks.filter((t) => t.id !== id) }))
        .filter((section) => section.tasks.length > 0),
    );
    toast({ title: "Ignored" });
  };

  const handleWatchTask = (task: import("@/lib/communications-api").Task) => {
    watchTask(task);
    setTaskSections((prev) =>
      prev
        .map((section) => ({ ...section, tasks: section.tasks.filter((t) => t.id !== task.id) }))
        .filter((section) => section.tasks.length > 0),
    );
    toast({ title: "Added to watch list" });
  };

  // Filter out acknowledged/watched items and compute derived counts
  const filteredEmailAccounts = useMemo(() => {
    return emailAccounts
      .map((account) => ({
        ...account,
        emails: account.emails.filter((e) => !isEmailAcknowledged(e.id)),
      }))
      .map((account) => ({
        ...account,
        total: account.emails.length,
        unread_count: account.emails.filter((e) => e.status === "unread").length,
      }))
      .filter((account) => account.emails.length > 0);
  }, [emailAccounts, isEmailAcknowledged]);

  const filteredChatPlatforms = useMemo(() => {
    return chatPlatforms
      .map((platform) => ({
        ...platform,
        messages: platform.messages.filter((m) => !isChatAcknowledged(m.id) && !isChatWatched(m.id)),
      }))
      .map((platform) => ({
        ...platform,
        total: platform.messages.length,
        unread_count: platform.messages.filter((m) => m.status === "unread").length,
      }))
      .filter((platform) => platform.messages.length > 0);
  }, [chatPlatforms, isChatAcknowledged, isChatWatched]);

  const filteredWatchItemPlatforms = useMemo(() => {
    return watchItemPlatforms
      .map((platform) => ({
        ...platform,
        items: platform.items.filter((item) => !isChatAcknowledged(item.id)),
      }))
      .map((platform) => ({
        ...platform,
        count: platform.items.length,
      }))
      .filter((platform) => platform.items.length > 0);
  }, [watchItemPlatforms, isChatAcknowledged]);

  const filteredLocalWatchedChats = useMemo(
    () => watchedChats.filter((item) => !isChatAcknowledged(item.id)),
    [watchedChats, isChatAcknowledged],
  );

  const combinedWatchItemPlatforms = useMemo(() => {
    const map = new Map<string, { platform_name: string; items: typeof filteredLocalWatchedChats }>();

    const addItems = (platformName: string, items: any[]) => {
      const existing = map.get(platformName);
      if (!existing) {
        map.set(platformName, { platform_name: platformName, items: [...items] });
        return;
      }
      existing.items.push(...items);
    };

    for (const p of filteredWatchItemPlatforms) {
      addItems(p.platform_name, p.items as any[]);
    }
    for (const item of filteredLocalWatchedChats) {
      addItems(item.platform, [item] as any[]);
    }

    return Array.from(map.values())
      .map((p) => ({
        platform_name: p.platform_name,
        items: p.items,
        count: p.items.length,
      }))
      .filter((p) => p.items.length > 0);
  }, [filteredWatchItemPlatforms, filteredLocalWatchedChats]);

  const filteredCalendarAccounts = useMemo(() => {
    return calendarAccounts
      .map((calendar) => ({
        ...calendar,
        events: calendar.events.filter((e) => !e.id || !isCalendarAcknowledged(e.id)),
      }))
      .map((calendar) => ({
        ...calendar,
        event_count: calendar.events.length,
      }))
      .filter((calendar) => calendar.events.length > 0);
  }, [calendarAccounts, isCalendarAcknowledged]);

  const filteredTaskSections = useMemo(() => {
    return taskSections
      .map((section) => ({
        ...section,
        tasks: section.tasks.filter((t) => !isTaskAcknowledged(t.id) && !isTaskWatched(t.id)),
      }))
      .map((section) => ({
        ...section,
        count: section.tasks.length,
      }))
      .filter((section) => section.tasks.length > 0);
  }, [taskSections, isTaskAcknowledged, isTaskWatched]);

  const filteredWatchedTasks = useMemo(
    () => watchedTasks.filter((t) => !isTaskAcknowledged(t.id)),
    [watchedTasks, isTaskAcknowledged],
  );

  // Derived counts from filtered data
  const totalEmails = useMemo(() => filteredEmailAccounts.reduce((sum, acc) => sum + acc.total, 0), [filteredEmailAccounts]);
  const totalUnreadEmails = useMemo(
    () => filteredEmailAccounts.reduce((sum, acc) => sum + acc.unread_count, 0),
    [filteredEmailAccounts],
  );

  const totalChats = useMemo(() => filteredChatPlatforms.reduce((sum, p) => sum + p.total, 0), [filteredChatPlatforms]);
  const totalUnreadChats = useMemo(
    () => filteredChatPlatforms.reduce((sum, p) => sum + p.unread_count, 0),
    [filteredChatPlatforms],
  );

  const totalWatchChats = useMemo(
    () => combinedWatchItemPlatforms.reduce((sum, p) => sum + p.count, 0),
    [combinedWatchItemPlatforms],
  );

  const totalEvents = useMemo(() => filteredCalendarAccounts.reduce((sum, c) => sum + c.event_count, 0), [filteredCalendarAccounts]);
  const totalTasks = useMemo(() => filteredTaskSections.reduce((sum, s) => sum + s.count, 0), [filteredTaskSections]);

  const totalItems = totalEmails + totalChats + totalEvents + totalTasks;
  const isLoadingAny = loadingEmails || loadingChats || loadingCalendar || loadingTasks;

  // Pull-to-refresh
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh: fetchAll,
    threshold: 80,
  });

  const getLastFetchedText = () => {
    if (!lastFetched) return "Never";
    const diff = Math.floor((Date.now() - lastFetched.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">Inbox</h2>
                <p className="text-xs text-muted-foreground">{isLoadingAny ? "Fetching latest..." : `${totalItems} items total`}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAll}
                  disabled={isLoadingAny}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoadingAny ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Pull-to-refresh indicator */}
            <div 
              className="overflow-hidden transition-all duration-200 flex items-center justify-center"
              style={{ height: pullDistance > 0 ? pullDistance : 0 }}
            >
              {pullDistance > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  {isRefreshing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowDown 
                      className="w-5 h-5 transition-transform" 
                      style={{ 
                        transform: pullDistance >= 80 ? "rotate(180deg)" : "rotate(0deg)",
                        opacity: Math.min(pullDistance / 80, 1)
                      }} 
                    />
                  )}
                  <span className="text-xs">
                    {isRefreshing ? "Refreshing..." : pullDistance >= 80 ? "Release to refresh" : "Pull to refresh"}
                  </span>
                </div>
              )}
            </div>

            {/* Sections */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3"
              onTouchStart={handlers.onTouchStart}
              onTouchMove={handlers.onTouchMove}
              onTouchEnd={handlers.onTouchEnd}
            >
              {/* Emails Section */}
              <Section
                title="Emails"
                icon={<Mail className="w-5 h-5 text-red-500" />}
                count={totalEmails}
                unreadCount={totalUnreadEmails}
                isLoading={loadingEmails}
                isExpanded={expandedSections.emails}
                onToggle={() => toggleSection("emails")}
              >
                {filteredEmailAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No emails</p>
                ) : (
                  filteredEmailAccounts.map((account) => (
                    <div key={account.account_name} className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                        <span>{account.account_name}</span>
                        {account.unread_count > 0 && <span className="text-primary">{account.unread_count} unread</span>}
                      </p>
                      {account.emails.map((email) => (
                        <EmailCard 
                          key={email.id} 
                          email={email} 
                          onIgnore={handleIgnoreEmail} 
                          onReply={handleReplyEmail}
                          onOpen={acknowledgeEmail}
                        />
                      ))}
                    </div>
                  ))
                )}
              </Section>

              {/* Chats Section */}
              <Section
                title="Chats"
                icon={<MessageSquare className="w-5 h-5 text-green-500" />}
                count={totalChats}
                unreadCount={totalUnreadChats}
                watchCount={totalWatchChats}
                isLoading={loadingChats}
                isExpanded={expandedSections.chats}
                onToggle={() => toggleSection("chats")}
              >
                {filteredChatPlatforms.length === 0 && combinedWatchItemPlatforms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No chats</p>
                ) : (
                  <>
                    {/* Watch items (remote + device-local) */}
                    {combinedWatchItemPlatforms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Watch items
                          </span>
                          <span className="text-muted-foreground">{totalWatchChats} watching</span>
                        </p>
                        {combinedWatchItemPlatforms.map((platform) => (
                          <div key={platform.platform_name} className="mb-2">
                            <p className="text-xs text-muted-foreground/70 mb-1 px-1 capitalize">
                              {platform.platform_name.replace(/_/g, " ")}
                            </p>
                            {platform.items.map((item) => (
                              <ChatCard
                                key={item.id}
                                chat={{
                                  id: item.id,
                                  sender_name: (item as any).sender_name,
                                  content_preview: (item as any).content_preview,
                                  content: (item as any).content,
                                  received_at: (item as any).received_at,
                                  platform: (item as any).platform,
                                  status: "watching",
                                  is_watch_item: true,
                                }}
                                onReply={handleReplyChat}
                                onIgnore={handleIgnoreChat}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Platform lists */}
                    {filteredChatPlatforms.map((platform) => (
                      <div key={platform.platform} className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                          <span>{platform.display_name}</span>
                          {platform.unread_count > 0 && <span className="text-primary">{platform.unread_count} unread</span>}
                        </p>
                        {platform.messages.map((chat) => (
                          <ChatCard
                            key={chat.id}
                            chat={chat}
                            onReply={handleReplyChat}
                            onWatch={handleWatchChat}
                            onIgnore={handleIgnoreChat}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </Section>

              {/* Calendar Section */}
              <Section
                title="Calendar"
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                count={totalEvents}
                isLoading={loadingCalendar}
                isExpanded={expandedSections.calendar}
                onToggle={() => toggleSection("calendar")}
              >
                {filteredCalendarAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events today</p>
                ) : (
                  filteredCalendarAccounts.map((calendar) => (
                    <div key={calendar.calendar_name} className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">{calendar.calendar_name}</p>
                      {calendar.events.map((event, idx) => (
                        <CalendarCard key={event.id || idx} event={event} onEdit={handleEditCalendar} />
                      ))}
                    </div>
                  ))
                )}
              </Section>

              {/* Tasks Section */}
              <Section
                title="Tasks"
                icon={<CheckSquare className="w-5 h-5 text-primary" />}
                count={totalTasks}
                isLoading={loadingTasks}
                isExpanded={expandedSections.tasks}
                onToggle={() => toggleSection("tasks")}
              >
                {filteredWatchedTasks.length === 0 && filteredTaskSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
                ) : (
                  <>
                    {filteredWatchedTasks.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Watch items
                          </span>
                          <span className="text-muted-foreground">{filteredWatchedTasks.length} watching</span>
                        </p>
                        {filteredWatchedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onIgnore={handleIgnoreTask} />
                        ))}
                      </div>
                    )}

                    {filteredTaskSections.map((section) => (
                      <div key={section.name} className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                          <span>{section.name}</span>
                          <span>{section.count} tasks</span>
                        </p>
                        {section.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={handleCompleteTask}
                            onWatch={handleWatchTask}
                            onIgnore={handleIgnoreTask}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </Section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                  </span>
                  <span>Connected</span>
                </div>
                <span>Updated {getLastFetchedText()}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
