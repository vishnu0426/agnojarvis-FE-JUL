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

/** Masks credential-looking parts of an error message (query keys, bearer tokens, long tokens). */
function maskCredentials(text: string): string {
  return text
    .replace(/([?&](?:key|api_key|apikey|access_token|token)=)[^&\s'"]+/gi, "$1***")
    .replace(/bearer\s+\S+/gi, "Bearer ***")
    .replace(/\bAQ\.[A-Za-z0-9_-]{10,}/g, "***")
    .replace(/[A-Za-z0-9_-]{32,}/g, "***");
}

export function useDirectChat({ agentId, onMessageReceived, onConnected, isOpen }: UseDirectChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ApiChatMessage[]>([]);
  const [agentName, setAgentName] = useState("AI Assistant");
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
  // Set when connecting fails. Without it the auto-connect effect below re-runs as soon as
  // `isConnecting` flips back to false and retries (and toasts) forever.
  const [connectError, setConnectError] = useState<string | null>(null);

  // Reset connection state when agentId changes
  useEffect(() => {
    if (agentId) {
      setIsConnected(false);
      setAgentName("AI Assistant");
      setConversationHistory([]);
      setManuallyDisconnected(false);
      setConnectError(null);
    }
  }, [agentId]);

  // Connect and get initial greeting
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      setConnectError(null);
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
      const message = maskCredentials(error?.message || "Unknown error");
      console.error("Failed to connect:", message);
      // Fixed id: a repeat replaces the toast instead of stacking a new one.
      toast.error(`Failed to connect: ${message}`, { id: "direct-chat-connect-error" });
      setConnectError(message);
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

      // What the agent actually did (callback saved, transfer requested, ...). Fixed ids: a repeat replaces
      // the toast instead of stacking.
      for (const call of response.tool_calls ?? []) {
        const label = call.name.replace(/_/g, " ");
        if (call.status === "error") {
          toast.error(`Tool failed: ${label}`, { id: `tool-${call.name}`, description: call.result });
        } else if (call.status === "handoff") {
          toast.info(`Human hand-off requested${response.handoff?.department ? `: ${response.handoff.department}` : ""}`, {
            id: "tool-handoff",
            description: response.handoff?.reason,
          });
        } else if (call.status === "dry_run") {
          toast.message(`Tool skipped (dry run): ${label}`, { id: `tool-${call.name}` });
        } else if (call.name === "schedule_callback") {
          toast.success("Callback scheduled", { id: "tool-schedule_callback", description: call.result });
        } else if (call.status === "ended") {
          toast.info("The agent ended the conversation", { id: "tool-ended" });
        }
      }

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
    if (agentId && !isConnected && !isConnecting && !manuallyDisconnected && !connectError) {
      connect();
    }
  }, [agentId, isConnected, isConnecting, manuallyDisconnected, connectError, connect]);

  // Reset manual disconnect flag when agent changes
  useEffect(() => {
    setManuallyDisconnected(false);
  }, [agentId]);

  // Reset manual disconnect flag when chat is opened
  useEffect(() => {
    if (isOpen) {
      setManuallyDisconnected(false);
      setConnectError(null);
    }
  }, [isOpen]);

  return {
    isConnected,
    isConnecting,
    connectError,
    agentName,
    connect,
    disconnect,
    sendMessage,
  };
}

