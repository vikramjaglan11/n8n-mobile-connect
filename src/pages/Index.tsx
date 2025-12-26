import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput, ChatInputRef } from "@/components/ChatInput";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { NeuralBackground } from "@/components/core/NeuralBackground";
import { useDirectorAgent } from "@/hooks/useDirectorAgent";

const Index = () => {
  const { messages, isLoading, sendMessage } = useDirectorAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputRef>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleInputFocus = (prefill?: string) => {
    inputRef.current?.focus(prefill);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Subtle background */}
      <NeuralBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header isConnected={true} />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  onSendMessage={handleSendMessage}
                  onInputFocus={handleInputFocus}
                />
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-32">
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <ChatInput
          ref={inputRef}
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
