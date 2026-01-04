import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, RefreshCw, Settings } from 'lucide-react';
import { CommunicationCard } from './CommunicationCard';
import { 
  getCommunicationCards, 
  ignoreMessage, 
  addToWatch, 
  resolveWatchItem,
  CommunicationCard as CardType,
  InboxSummary 
} from '@/lib/communications-api';
import { useToast } from '@/hooks/use-toast';

// Platform icons
const platformIcons: Record<string, string> = {
  whatsapp: '💬',
  telegram: '✈️',
  slack: '🔷',
  google_chat: '💭',
  email: '📧'
};

export function CommunicationsInbox() {
  const [messages, setMessages] = useState<CardType[]>([]);
  const [summary, setSummary] = useState<InboxSummary[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getCommunicationCards();
      setMessages(data.cards || []);
      setSummary(data.summary || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: "Error",
        description: "Failed to load communications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleIgnore = async (id: string) => {
    try {
      await ignoreMessage(id);
      setMessages(msgs => msgs.filter(m => m.id !== id));
      toast({ title: "Message ignored" });
    } catch (error) {
      toast({ title: "Failed to ignore", variant: "destructive" });
    }
  };

  const handleWatch = async (id: string) => {
    try {
      await addToWatch(id);
      setMessages(msgs => msgs.map(m => 
        m.id === id ? { ...m, is_watch_item: true, status: 'watching' as const } : m
      ));
      toast({ title: "Added to watch list" });
    } catch (error) {
      toast({ title: "Failed to add to watch", variant: "destructive" });
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveWatchItem(id);
      setMessages(msgs => msgs.filter(m => m.id !== id));
      toast({ title: "Watch item resolved" });
    } catch (error) {
      toast({ title: "Failed to resolve", variant: "destructive" });
    }
  };

  const handleReply = async (id: string, content: string) => {
    // For now, just show a message - we'll implement actual reply later
    toast({ 
      title: "Reply sent", 
      description: `Message: ${content.substring(0, 50)}...` 
    });
    // Remove the card after reply
    setMessages(msgs => msgs.filter(m => m.id !== id));
  };

  // Filter messages based on active tab
  const filteredMessages = messages.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'watching') return m.is_watch_item;
    return m.platform === activeTab;
  });

  // Get unique platforms that have messages
  const activePlatforms = [...new Set(messages.map(m => m.platform))];

  const totalUnread = summary.reduce((acc, s) => acc + (s.unread_count || 0), 0);
  const totalWatching = summary.reduce((acc, s) => acc + (s.watching_count || 0), 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Communications</h2>
            {totalUnread > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={fetchMessages}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-xs">
              All
              {totalUnread > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 rounded-full">{totalUnread}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="watching" className="text-xs">
              👁️ Watching
              {totalWatching > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 rounded-full">{totalWatching}</span>
              )}
            </TabsTrigger>
            {activePlatforms.map(platform => (
              <TabsTrigger key={platform} value={platform} className="text-xs">
                {platformIcons[platform]} {platform}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Message cards */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages to show</p>
            <p className="text-sm">You're all caught up! 🎉</p>
          </div>
        ) : (
          filteredMessages.map(message => (
            <CommunicationCard
              key={message.id}
              message={message}
              onIgnore={handleIgnore}
              onWatch={handleWatch}
              onResolve={handleResolve}
              onReply={handleReply}
            />
          ))
        )}
      </div>

      {/* Last refresh indicator */}
      <div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}
