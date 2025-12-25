import { useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions } from "@/components/QuickActions";
import { EmptyState } from "@/components/EmptyState";
import { useDirectorAgent } from "@/hooks/useDirectorAgent";
import { toast } from "sonner";

const Index = () => {
  const { messages, isLoading, sendMessage } = useDirectorAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
    toast.success("Quick action sent!");
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <Header isConnected={true} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyState />
            <QuickActions onAction={handleQuickAction} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <ChatMessage content="" role="assistant" isLoading />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;
