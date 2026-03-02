/**
 * Direct LLM Chat Hook
 * 
 * Provides functionality for text-only chat that directly communicates with
 * the LLM API without creating a LiveKit session.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import apiClient, { ChatMessage as ApiChatMessage } from "@/services/api";
import { ChatMessage } from "@/contexts/ChatContext";

interface UseDirectChatProps {
  agentId: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onConnected?: () => void;
  isOpen?: boolean; // Add isOpen prop to reset manual disconnect when chat reopens
}

export function useDirectChat({ agentId, onMessageReceived, onConnected, isOpen }: UseDirectChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ApiChatMessage[]>([]);
  const [agentName, setAgentName] = useState("AI Assistant");
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  // Reset connection state when agentId changes
  useEffect(() => {
    if (agentId) {
      setIsConnected(false);
      setAgentName("AI Assistant");
      setConversationHistory([]);
      setManuallyDisconnected(false);
    }
  }, [agentId]);

  // Connect and get initial greeting
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      setManuallyDisconnected(false); // Reset manual disconnect flag

      // Get initial greeting from agent
      const greetingResponse = await apiClient.getAgentGreeting(agentId);

      setAgentName(greetingResponse.agent_name);
      setIsConnected(true);

      // Add greeting to conversation
      const greetingMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: greetingResponse.greeting,
        sender: "agent",
        timestamp: new Date(greetingResponse.timestamp),
      };

      onMessageReceived?.(greetingMessage);
      onConnected?.();

      toast.success(`Connected to ${greetingResponse.agent_name}`);
    } catch (error: any) {
      console.error("Failed to connect:", error);
      toast.error(`Failed to connect: ${error.message || "Unknown error"}`);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, isConnected, isConnecting, onMessageReceived, onConnected]);

  // Send message to agent
  const sendMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!isConnected || !message.trim()) {
      return false;
    }

    try {
      // Send message to API
      const response = await apiClient.sendChatMessage(agentId, {
        message: message.trim(),
        conversation_history: conversationHistory,
      });

      // Update conversation history
      const newHistory: ApiChatMessage[] = [
        ...conversationHistory,
        { role: "user", content: message.trim() },
        { role: "assistant", content: response.message },
      ];
      setConversationHistory(newHistory);

      // Notify about agent response
      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: response.message,
        sender: "agent",
        timestamp: new Date(response.timestamp),
      };

      onMessageReceived?.(agentMessage);

      return true;
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
      return false;
    }
  }, [agentId, isConnected, conversationHistory, onMessageReceived]);

  // Disconnect
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConversationHistory([]);
    setManuallyDisconnected(true); // Mark as manually disconnected
    toast.info("Disconnected from agent");
  }, []);

  // Auto-connect when agent ID changes (but not if manually disconnected)
  useEffect(() => {
    if (agentId && !isConnected && !isConnecting && !manuallyDisconnected) {
      connect();
    }
  }, [agentId, isConnected, isConnecting, manuallyDisconnected, connect]);

  // Reset manual disconnect flag when agent changes
  useEffect(() => {
    setManuallyDisconnected(false);
  }, [agentId]);

  // Reset manual disconnect flag when chat is opened
  useEffect(() => {
    if (isOpen) {
      setManuallyDisconnected(false);
    }
  }, [isOpen]);

  return {
    isConnected,
    isConnecting,
    agentName,
    connect,
    disconnect,
    sendMessage,
  };
}

