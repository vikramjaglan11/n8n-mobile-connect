import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput, ChatInputRef } from "@/components/ChatInput";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { NeuralBackground } from "@/components/core/NeuralBackground";
import { useDirectorAgent } from "@/hooks/useDirectorAgent";
import { useConversationHistory } from "@/hooks/useConversationHistory";

const Index = () => {
  const { messages, isLoading, sendMessage, clearMessages, setMessages } = useDirectorAgent();
  const { 
    conversations, 
    currentConversationId,
    saveConversation, 
    loadConversation, 
    deleteConversation,
    startNewConversation 
  } = useConversationHistory();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputRef>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save conversation when messages change (debounced effect)
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        saveConversation(messages);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages, saveConversation]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleInputFocus = (prefill?: string) => {
    inputRef.current?.focus(prefill);
  };

  const handleBackToHome = () => {
    clearMessages();
    startNewConversation();
  };

  const handleSelectConversation = (id: string) => {
    const conversation = loadConversation(id);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (currentConversationId === id) {
      clearMessages();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Subtle background */}
      <NeuralBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header 
          isConnected={true}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />

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
                {/* Back button */}
                <motion.button
                  className="fixed top-16 left-4 z-40 w-11 h-11 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors shadow-sm"
                  onClick={handleBackToHome}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowLeft className="w-5 h-5 text-foreground/70" />
                </motion.button>

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
