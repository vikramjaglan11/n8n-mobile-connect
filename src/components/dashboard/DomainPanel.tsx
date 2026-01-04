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
  Plus,
  ArrowDown,
} from "lucide-react";
import { EmailCard } from "@/components/communications/EmailCard";
import { ChatCard } from "@/components/communications/ChatCard";
import { CalendarCard } from "@/components/communications/CalendarCard";
import { TaskCard } from "@/components/communications/TaskCard";
import { ReplyInput } from "@/components/communications/ReplyInput";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
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

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    emails: false,
    chats: false,
    calendar: false,
    tasks: false,
  });

  // Data states
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [totalUnreadEmails, setTotalUnreadEmails] = useState(0);

  const [chatPlatforms, setChatPlatforms] = useState<ChatPlatform[]>([]);
  const [watchItemPlatforms, setWatchItemPlatforms] = useState<WatchItemPlatform[]>([]);
  const [totalWatchItems, setTotalWatchItems] = useState(0);

  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([]);

  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);

  // UI states
  const [calendarCommandOpen, setCalendarCommandOpen] = useState(false);

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
      setTotalUnreadEmails(data.total_unread || 0);
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
      setTotalWatchItems(watchData.total_items || 0);
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
      const calendarsWithEvents = (data.calendars || []).filter((c) => c.event_count > 0);
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
  const handleArchiveEmail = async (id: string) => {
    try {
      await archiveEmail(id);
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
      toast({ title: "Email archived" });
    } catch {
      toast({ title: "Failed to archive", variant: "destructive" });
    }
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
      toast({ title: "Reply sent" });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
      throw new Error("Failed to send");
    }
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

  const handleSendCalendarCommand = async (command: string) => {
    try {
      onSelectDomain(command);
      toast({ title: "Command sent" });
      setCalendarCommandOpen(false);
    } catch {
      toast({ title: "Failed to send command", variant: "destructive" });
      throw new Error("Failed to send");
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

  // Derived counts
  const totalEmails = useMemo(() => emailAccounts.reduce((sum, acc) => sum + acc.total, 0), [emailAccounts]);
  const totalChats = useMemo(() => chatPlatforms.reduce((sum, p) => sum + p.total, 0), [chatPlatforms]);
  const totalEvents = useMemo(() => calendarAccounts.reduce((sum, c) => sum + c.event_count, 0), [calendarAccounts]);
  const totalTasks = useMemo(() => taskSections.reduce((sum, s) => sum + s.count, 0), [taskSections]);

  const totalUnreadChats = useMemo(
    () => chatPlatforms.reduce((sum, p) => sum + p.unread_count, 0),
    [chatPlatforms],
  );

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
                {emailAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No emails</p>
                ) : (
                  emailAccounts.map((account) => (
                    <div key={account.account_name} className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                        <span>{account.account_name}</span>
                        {account.unread_count > 0 && <span className="text-primary">{account.unread_count} unread</span>}
                      </p>
                      {account.emails.map((email) => (
                        <EmailCard key={email.id} email={email} onArchive={handleArchiveEmail} onReply={handleReplyEmail} />
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
                watchCount={totalWatchItems}
                isLoading={loadingChats}
                isExpanded={expandedSections.chats}
                onToggle={() => toggleSection("chats")}
              >
                {chatPlatforms.length === 0 && watchItemPlatforms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No chats</p>
                ) : (
                  <>
                    {/* Watch items from dedicated endpoint */}
                    {watchItemPlatforms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Watch items
                          </span>
                          <span className="text-muted-foreground">{totalWatchItems} watching</span>
                        </p>
                        {watchItemPlatforms.map((platform) => (
                          <div key={platform.platform_name} className="mb-2">
                            <p className="text-xs text-muted-foreground/70 mb-1 px-1 capitalize">
                              {platform.platform_name.replace(/_/g, " ")}
                            </p>
                            {platform.items.map((item) => (
                              <ChatCard
                                key={item.id}
                                chat={{
                                  id: item.id,
                                  sender_name: item.sender_name,
                                  content_preview: item.content_preview,
                                  content: item.content,
                                  received_at: item.received_at,
                                  platform: item.platform,
                                  status: "watching",
                                  is_watch_item: true,
                                }}
                                onReply={handleReplyChat}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Platform lists */}
                    {chatPlatforms
                      .filter((platform) => platform.messages.length > 0)
                      .map((platform) => (
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
                <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                  {!calendarCommandOpen ? (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setCalendarCommandOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" /> New calendar command
                    </Button>
                  ) : (
                    <ReplyInput
                      onSend={handleSendCalendarCommand}
                      onCancel={() => setCalendarCommandOpen(false)}
                      placeholder='Try: "Create meeting tomorrow 3pm"'
                    />
                  )}
                </div>

                {calendarAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events today</p>
                ) : (
                  calendarAccounts.map((calendar) => (
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
                {taskSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
                ) : (
                  taskSections.map((section) => (
                    <div key={section.name} className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
                        <span>{section.name}</span>
                        <span>{section.count} tasks</span>
                      </p>
                      {section.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
                      ))}
                    </div>
                  ))
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
