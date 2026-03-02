/**
 * Chat Context - Global State Management for Persistent Chat Popup
 * 
 * Manages chat popup state, connection, messages, and agent selection
 * across the entire application.
 */

import { createContext, useContext, useState, useCallback, ReactNode, Dispatch, SetStateAction } from "react";
import { type ParsedOption } from "../lib/parseAgentOptions";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  options?: ParsedOption[];
}

interface ChatContextType {
  // Popup state
  isOpen: boolean;
  isMinimized: boolean;
  openChat: (agentId?: string) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;

  // Agent selection
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  clearMessages: () => void;

  // Input state
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // Popup state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Agent selection
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Input state
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const openChat = useCallback((agentId?: string) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (agentId) {
      setSelectedAgentId(agentId);
    }
  }, []);

  const closeChat = useCallback(async () => {
    setIsOpen(false);
    setIsMinimized(false);
    setMessages([]);
    setInputText("");
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: ChatContextType = {
    isOpen,
    isMinimized,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    selectedAgentId,
    setSelectedAgentId,
    messages,
    addMessage,
    setMessages,
    clearMessages,
    inputText,
    setInputText,
    isSending,
    setIsSending,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

