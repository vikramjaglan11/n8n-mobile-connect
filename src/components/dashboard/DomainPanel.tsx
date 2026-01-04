import { useState, useEffect } from "react";
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
} from "lucide-react";
import { EmailCard } from "@/components/communications/EmailCard";
import { ChatCard } from "@/components/communications/ChatCard";
import { CalendarCard } from "@/components/communications/CalendarCard";
import { TaskCard } from "@/components/communications/TaskCard";
import {
  getEmailCards,
  getChatCards,
  getCalendarEvents,
  getPendingTasks,
  EmailCard as EmailCardType,
  ChatCard as ChatCardType,
  CalendarEvent,
  TaskItem,
  ignoreMessage,
  addToWatch,
} from "@/lib/communications-api";
import { useToast } from "@/hooks/use-toast";

interface DomainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (prompt: string) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, count, isLoading, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-foreground/50 animate-spin" />
          ) : (
            icon
          )}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${count} items`}
          </p>
        </div>
        {count > 0 && !isLoading && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
            {count}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
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
            <div className="p-3 pt-0 max-h-80 overflow-y-auto">
              {children}
            </div>
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
  const [emails, setEmails] = useState<EmailCardType[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatCardType[]>([]);
  const [chatPlatforms, setChatPlatforms] = useState<string[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Loading states
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch functions
  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const data = await getEmailCards();
      setEmails(data.cards || []);
      setEmailAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const data = await getChatCards();
      setChats(data.cards || []);
      setChatPlatforms(data.platforms || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const data = await getCalendarEvents();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await getPendingTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
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

  // Action handlers
  const handleIgnoreChat = async (id: string) => {
    try {
      await ignoreMessage(id);
      setChats(prev => prev.filter(c => c.id !== id));
      toast({ title: "Message ignored" });
    } catch {
      toast({ title: "Failed to ignore", variant: "destructive" });
    }
  };

  const handleWatchChat = async (id: string) => {
    try {
      await addToWatch(id);
      setChats(prev => prev.map(c => 
        c.id === id ? { ...c, is_watch_item: true } : c
      ));
      toast({ title: "Added to watch list" });
    } catch {
      toast({ title: "Failed to add to watch", variant: "destructive" });
    }
  };

  // Group functions
  const emailsByAccount = emailAccounts.length > 0 
    ? emailAccounts.reduce((acc, account) => {
        acc[account] = emails.filter(e => e.account === account);
        return acc;
      }, {} as Record<string, EmailCardType[]>)
    : { "All": emails };

  const chatsByPlatform = chatPlatforms.length > 0
    ? chatPlatforms.reduce((acc, platform) => {
        acc[platform] = chats.filter(c => c.platform === platform);
        return acc;
      }, {} as Record<string, ChatCardType[]>)
    : chats.reduce((acc, chat) => {
        if (!acc[chat.platform]) acc[chat.platform] = [];
        acc[chat.platform].push(chat);
        return acc;
      }, {} as Record<string, ChatCardType[]>);

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  const getLastFetchedText = () => {
    if (!lastFetched) return "Never";
    const diff = Math.floor((Date.now() - lastFetched.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const totalItems = emails.length + chats.length + events.length + tasks.length;
  const isLoadingAny = loadingEmails || loadingChats || loadingCalendar || loadingTasks;

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
                <p className="text-xs text-muted-foreground">
                  {isLoadingAny ? "Fetching latest..." : `${totalItems} items total`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAll}
                  disabled={isLoadingAny}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoadingAny ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Emails Section */}
              <Section
                title="Emails"
                icon={<Mail className="w-5 h-5 text-red-500" />}
                count={emails.length}
                isLoading={loadingEmails}
                isExpanded={expandedSections.emails}
                onToggle={() => toggleSection('emails')}
              >
                {Object.entries(emailsByAccount).map(([account, accountEmails]) => (
                  <div key={account}>
                    {emailAccounts.length > 0 && (
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">{account}</p>
                    )}
                    {accountEmails.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No emails</p>
                    ) : (
                      accountEmails.map(email => (
                        <EmailCard key={email.id} email={email} />
                      ))
                    )}
                  </div>
                ))}
              </Section>

              {/* Chats Section */}
              <Section
                title="Chats"
                icon={<MessageSquare className="w-5 h-5 text-green-500" />}
                count={chats.length}
                isLoading={loadingChats}
                isExpanded={expandedSections.chats}
                onToggle={() => toggleSection('chats')}
              >
                {Object.entries(chatsByPlatform).map(([platform, platformChats]) => (
                  <div key={platform}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-1 capitalize">
                      {platform.replace('_', ' ')}
                    </p>
                    {platformChats.map(chat => (
                      <ChatCard 
                        key={chat.id} 
                        chat={chat}
                        onIgnore={handleIgnoreChat}
                        onWatch={handleWatchChat}
                      />
                    ))}
                  </div>
                ))}
                {chats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No chats</p>
                )}
              </Section>

              {/* Calendar Section */}
              <Section
                title="Calendar"
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                count={events.length}
                isLoading={loadingCalendar}
                isExpanded={expandedSections.calendar}
                onToggle={() => toggleSection('calendar')}
              >
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events today</p>
                ) : (
                  events.map(event => (
                    <CalendarCard key={event.id} event={event} />
                  ))
                )}
              </Section>

              {/* Tasks Section */}
              <Section
                title="Tasks"
                icon={<CheckSquare className="w-5 h-5 text-primary" />}
                count={tasks.length}
                isLoading={loadingTasks}
                isExpanded={expandedSections.tasks}
                onToggle={() => toggleSection('tasks')}
              >
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <div key={status}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-1 capitalize">
                      {status.replace('_', ' ')}
                    </p>
                    {statusTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
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
