/**
 * Chat Interface Component
 * 
 * Provides a text-based chat interface for testing agents.
 * Messages are sent via LiveKit data channel and agent responds with voice.
 * Supports interactive button options for package selection.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { Room } from "livekit-client";
import { cn } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";
import { parseAgentOptions, type ParsedOption } from "@/lib/parseAgentOptions";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  options?: ParsedOption[]; // Array of parsed option objects
}

interface ChatInterfaceProps {
  room: Room | null;
  isConnected: boolean;
}

export function ChatInterface({ room, isConnected }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAgentMuted, setIsAgentMuted] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Apply mute state to new audio tracks when they're added
  useEffect(() => {
    if (!room || !isAgentMuted) return;

    const handleTrackSubscribed = (
      track: any,
      publication: any,
      participant: any
    ) => {
      // Only mute agent audio tracks
      if (
        participant.identity &&
        participant.identity.includes("agent") &&
        publication.kind === "audio"
      ) {
        // Mute attached audio elements
        track.attachedElements.forEach((element: HTMLElement) => {
          if (element instanceof HTMLAudioElement) {
            element.muted = true;
            console.log("Auto-muted new agent audio track (agent is muted)");
          }
        });
      }
    };

    room.on("trackSubscribed", handleTrackSubscribed);

    return () => {
      room.off("trackSubscribed", handleTrackSubscribed);
    };
  }, [room, isAgentMuted]);

  // Listen for transcription messages from the agent (agent's TTS responses)
  // Using LiveKit's registerTextStreamHandler for proper text stream handling
  useEffect(() => {
    if (!room) return;

    console.log("Registering text stream handler for lk.transcription");

    // Register handler for transcription text streams
    const handleTextStream = async (reader: any, participantInfo: any) => {
      try {
        // Show typing indicator when agent starts responding
        if (participantInfo.identity && participantInfo.identity.includes("agent")) {
          setIsAgentTyping(true);
        }

        // Read the complete transcription text
        const text = await reader.readAll();

        // Check if this is a final transcription (not interim)
        const isFinal = reader.info.attributes['lk.transcription_final'] === 'true';
        const transcribedTrackId = reader.info.attributes['lk.transcribed_track_id'];
        const segmentId = reader.info.attributes['lk.segment_id'];

        console.log(`Transcription received from ${participantInfo.identity}:`, {
          text,
          isFinal,
          transcribedTrackId,
          segmentId,
        });

        // Only show final transcriptions from the agent
        if (isFinal && text && text.trim()) {
          // Check if this is from the agent (not from user)
          if (participantInfo.identity && participantInfo.identity.includes("agent")) {
            // Hide typing indicator
            setIsAgentTyping(false);

            // Parse options from the text using shared utility
            const options = parseAgentOptions(text);

            const newMessage: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random()}`,
              text: text.trim(),
              sender: "agent",
              timestamp: new Date(),
              options, // Include parsed options if found
            };

            console.log("Adding agent message to chat:", newMessage);
            if (options) {
              console.log("Parsed options:", options);
            }
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      } catch (error) {
        console.error("Error handling transcription stream:", error);
        setIsAgentTyping(false);
      }
    };

    // Register the handler
    room.registerTextStreamHandler?.('lk.transcription', handleTextStream);

    return () => {
      console.log("Cleaning up text stream handler");
      // No unregister function needed - handler will be cleaned up when room disconnects
    };
  }, [room]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();

    if (!room || !textToSend || !isConnected || isSending) return;

    try {
      setIsSending(true);

      // Add user message to UI
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message via LiveKit text streams (standard topic for agent text input)
      // The agent listens on "lk.chat" topic when text_input=True
      await room.localParticipant.sendText(textToSend, {
        topic: "lk.chat",
      });

      console.log(`Sent text message to agent: "${textToSend}"`);

      // Only clear input if sending from the text input (not from button click)
      if (!messageText) {
        setInputText("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptionClick = async (option: ParsedOption) => {
    if (!room || !isConnected || isSending) return;

    try {
      setIsSending(true);

      // Add user message to UI with the display text (package name)
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        text: option.text,  // Show full package name to user
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send just the number (option.value) to the agent
      await room.localParticipant.sendText(option.value, {
        topic: "lk.chat",
      });

      console.log(`Sent option to agent - Display: "${option.text}", Value: "${option.value}"`);
    } catch (error) {
      console.error("Failed to send option:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleTextOnlyMode = async () => {
    if (!room || !isConnected) return;

    try {
      const newTextOnlyMode = !isAgentMuted; // If agent is currently unmuted, we're enabling text-only mode

      // Update both states
      setIsAgentMuted(newTextOnlyMode);
      setIsMicrophoneEnabled(!newTextOnlyMode);

      // 1. Disable/enable user microphone
      await room.localParticipant.setMicrophoneEnabled(!newTextOnlyMode);
      console.log(`User microphone ${newTextOnlyMode ? 'disabled' : 'enabled'}`);

      // 2. Mute/unmute all remote audio tracks (agent's voice)
      // Note: We keep agent audio ENABLED even in text-only mode so user can still hear agent
      // Only mute if user explicitly wants text-only mode
      const remoteParticipants = Array.from(room.remoteParticipants.values());

      for (const participant of remoteParticipants) {
        // Check if this is the agent participant
        if (participant.identity && participant.identity.includes("agent")) {
          const audioTracks = Array.from(participant.audioTrackPublications.values());

          for (const publication of audioTracks) {
            if (publication.track && publication.kind === "audio") {
              // Mute/unmute attached audio elements
              publication.track.attachedElements.forEach((element) => {
                if (element instanceof HTMLAudioElement) {
                  element.muted = newTextOnlyMode;
                  console.log(`${newTextOnlyMode ? 'Muted' : 'Unmuted'} agent audio element`);
                }
              });
            }
          }
        }
      }

      sonnerToast.success(
        newTextOnlyMode
          ? "Text-only mode enabled - microphone disabled, agent audio muted"
          : "Voice mode enabled - microphone and agent audio active"
      );

      console.log(`Text-only mode: ${newTextOnlyMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Failed to toggle text-only mode:", error);
      sonnerToast.error("Failed to toggle text-only mode");
      // Revert state on error
      setIsAgentMuted(!isAgentMuted);
      setIsMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            Text Chat
          </CardTitle>
          {isConnected && (
            <Button
              variant={isAgentMuted ? "default" : "outline"}
              size="sm"
              onClick={toggleTextOnlyMode}
              className="gap-2"
              title={isAgentMuted ? "Switch to voice mode (enable microphone and agent audio)" : "Switch to text-only mode (disable microphone and agent audio)"}
            >
              {isAgentMuted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  Text Only Mode
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Voice Mode
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                {isConnected
                  ? "Start a conversation by typing a message below"
                  : "Connect to the agent to start chatting"}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {/* Show condensed text when options are available, full text otherwise */}
                  {message.sender === "agent" && message.options && message.options.length > 0 ? (
                    // Extract just the intro/question before the list
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text.split(/\n(?=\d+\.)/)[0].trim() || "Please select an option:"}
                    </p>
                  ) : (
                    // Show full text for user messages or agent messages without options
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  )}
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Interactive Option Buttons */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={`${message.id}-option-${index}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionClick(option)}
                          disabled={isSending || !isConnected}
                          className="justify-between text-left h-auto py-2 px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2 hover:border-primary hover:shadow-lg hover:scale-[1.01] group cursor-pointer"
                        >
                          <span className="flex items-center gap-2 flex-1">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary-foreground/20 flex items-center justify-center text-xs font-bold transition-colors">
                              {index + 1}
                            </span>
                            <span className="text-xs font-medium whitespace-normal flex-1">
                              {option.text}
                            </span>
                          </span>
                          <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isAgentTyping && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected
                ? "Type a message..."
                : "Connect to start chatting"
            }
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!isConnected || !inputText.trim() || isSending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}