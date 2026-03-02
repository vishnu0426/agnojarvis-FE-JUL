import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { useAgents } from "@/hooks/use-agents";
import { useDirectChat } from "@/hooks/useDirectChat";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Settings,
  Bot,
  Loader2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parseAgentOptions, type ParsedOption } from "@/lib/parseAgentOptions";
import "./ChatPopup.css";

// Extended message interface with options support
export interface ChatMessageWithOptions {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  options?: ParsedOption[];
}

// Helper to determine text color based on background
const getContrastColor = (hexColor: string) => {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

function MessageOptionsList({
  options,
  onOptionClick
}: {
  options: ParsedOption[],
  onOptionClick: (option: ParsedOption) => void
}) {
  const [visibleCount, setVisibleCount] = useState(5);

  const visibleOptions = options.slice(0, visibleCount);
  const hasMore = visibleCount < options.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const handleButtonClick = (option: ParsedOption) => {
    console.log('=== Button Clicked ===');
    console.log('Option:', option);
    console.log('Display text:', option.text);
    console.log('Sending value:', option.value);
    console.log('====================');

    onOptionClick(option);  // Pass full option object
  };

  return (
    <div className="cp-message-buttons" style={{ marginTop: 0 }}>
      {visibleOptions.map((option, idx) => {
        const fullText = option.text;
        const parenIndex = fullText.indexOf('(');
        const hasDetails = parenIndex !== -1;
        const mainText = hasDetails ? fullText.substring(0, parenIndex).trim() : fullText;
        const detailsText = hasDetails ? fullText.substring(parenIndex) : "";

        return (
          <TooltipProvider key={`opt-${idx}`}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  className="cp-message-button w-full text-left truncate"
                  onClick={() => handleButtonClick(option)}
                >
                  {mainText}
                </button>
              </TooltipTrigger>
              {hasDetails && (
                <TooltipContent side="top" className="max-w-[300px] break-words">
                  <p>{detailsText}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
      {hasMore && (
        <button
          className="cp-message-button hover:bg-muted font-medium text-center justify-center"
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}
    </div>
  );
}

export function ChatPopup() {
  const {
    isOpen,
    closeChat,
    selectedAgentId,
    setSelectedAgentId,
    isMinimized,
    minimizeChat,
    maximizeChat,
    messages: contextMessages,
    addMessage: contextAddMessage,
    inputText,
    setInputText,
    isSending,
    setIsSending,
    setMessages: setContextMessages,
  } = useChatContext();

  const { data: agents } = useAgents();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New UI states
  const [sidebarMode, setSidebarMode] = useState<'none' | 'theme'>('none');
  const [previewSettings, setPreviewSettings] = useState({
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    chatBackground: "#ffffff",
    botBubbleBg: "#ffffff",
    userBubbleBg: "#0ea5e9", // Blue gradient start in CSS
    accentColor: "#0ea5e9",
    botAvatar: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
    activeTheme: "Custom", // Track active theme
  });

  const resetToDefaults = () => {
    setPreviewSettings({
      fontSize: 13,
      fontFamily: "'Inter', sans-serif",
      chatBackground: "#ffffff",
      botBubbleBg: "#ffffff",
      userBubbleBg: "#0ea5e9",
      accentColor: "#0ea5e9",
      botAvatar: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
      activeTheme: "Custom",
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewSettings(prev => ({ ...prev, botAvatar: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [messagesWithOptions, setMessagesWithOptions] = useState<ChatMessageWithOptions[]>([]);

  // Parse options from agent messages and update local state
  useEffect(() => {
    const enhanced = contextMessages.map(msg => {
      if (msg.sender === "agent") {
        // Always parse options from agent text
        const options = parseAgentOptions(msg.text);
        return { ...msg, options } as ChatMessageWithOptions;
      }
      return msg as ChatMessageWithOptions;
    });
    setMessagesWithOptions(enhanced);
  }, [contextMessages]);

  // Handle click outside to minimize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !isMinimized &&
        messagesEndRef.current &&
        // traversing up from the generated DOM node to find the container
        !event.composedPath().some((el) => (el as Element).classList?.contains('cp-window-container')) &&
        !event.composedPath().some((el) => (el as Element).classList?.contains('cp-sidebar-pane')) &&
        // Don't minimize if clicking the toggle button itself (handled by its own logic) or standard UI elements
        !(event.target as Element).closest('button')
      ) {
        // Logic to determine if we should minimize.
        // Actually, standard behavior: if I click outside, I want to minimize.
        // But I need to be careful not to conflict with "Open Chat" buttons in the app.
        // For now, let's just minimize. Using a slight delay to avoid drag-interactions.
        minimizeChat();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMinimized, minimizeChat]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesWithOptions, isOpen, isMinimized]);

  // Use direct LLM chat hook
  const {
    isConnected,
    isConnecting,
    sendMessage: sendDirectMessage,
    disconnect,
  } = useDirectChat({
    agentId: selectedAgentId,
    onMessageReceived: contextAddMessage,
    isOpen,
  });

  // Auto-connect if not connected and window opens
  useEffect(() => {
    if (isOpen && !isConnected && !selectedAgentId && agents?.length) {
      const active = agents.find(a => a.is_active);
      if (active) setSelectedAgentId(active.agent_id);
    }
  }, [isOpen, isConnected, selectedAgentId, agents, setSelectedAgentId]);


  const handleClose = () => {
    closeChat();
  };



  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || !isConnected || isSending) return;

    try {
      setIsSending(true);
      contextAddMessage({
        id: `msg-${Date.now()}-${Math.random()}`,
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      });
      const success = await sendDirectMessage(textToSend);
      if (success && !messageText) setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptionClick = async (option: ParsedOption) => {
    if (!isConnected || isSending) return;

    try {
      setIsSending(true);

      // Add user message with display text (package name)
      contextAddMessage({
        id: `msg-${Date.now()}-${Math.random()}`,
        text: option.text,  // Show full package name to user
        sender: "user",
        timestamp: new Date(),
      });

      // Send just the number (option.value) to agent
      const success = await sendDirectMessage(option.value);

      console.log(`Sent option - Display: "${option.text}", Value: "${option.value}"`);

      if (success) {
        setInputText("");
      }
    } catch (error) {
      console.error("Failed to send option:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedAgent = agents?.find(a => a.agent_id === selectedAgentId);

  // If not open, don't render or hide via CSS class
  // Returning null completely unmounts it, which might reset the "Settings" state if not careful.
  // But usually popup state (messages) is in context, so unmounting UI state (sidebar open/close) is fine.
  if (!isOpen) return null;

  // Minimized View
  if (isMinimized) {
    return (
      <div className={cn("cp-floating-wrapper visible compiled-minimized")}>
        <button
          className="cp-minimized-trigger"
          onClick={maximizeChat}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 shadow-sm border border-white"></div>
              <MessageCircle size={20} className="text-white" />
            </div>
            <span className="font-medium text-white text-sm">Chat</span>
            <ChevronUp size={16} className="text-white/80" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={cn("cp-floating-wrapper visible")}>

      {/* Main Chat Window */}
      <div className={cn("cp-window-container", sidebarMode !== 'none' && "with-sidebar")} style={{ boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.25)" }}>
        {/* Header */}
        <div className="cp-modal-title">
          <div className="cp-title-left">
            <div className="cp-header-icon">
              <MessageCircle size={18} />
            </div>
            <span className="cp-title-text">{selectedAgent?.name || "Chat Support"}</span>
          </div>

          <div className="cp-title-actions">


            <button
              onClick={() => setSidebarMode(sidebarMode === 'theme' ? 'none' : 'theme')}
              className={cn("cp-action-btn", sidebarMode === 'theme' && "active")}
              title="Theme Settings"
            >
              <Settings size={18} />
            </button>



            <button
              onClick={handleClose}
              className="cp-action-btn close"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Split Pane: Chat + Sidebar */}
        <div className="cp-container">

          {/* Chat Pane */}
          <div className="cp-chat-pane">
            {/* Messages Area */}
            <div
              className="cp-chat-window"
              style={{
                backgroundColor: previewSettings.chatBackground,
                fontFamily: previewSettings.fontFamily,
              }}
            >
              {/* Welcome / Empty States */}
              {!isConnected && isConnecting && (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground opacity-70">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm">Connecting...</span>
                </div>
              )}

              {isConnected && messagesWithOptions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-50">
                  <Bot className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">Start a conversation</p>
                </div>
              )}

              {messagesWithOptions.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "cp-message-row cp-with-tail",
                    m.sender === 'agent' ? "cp-bot" : "cp-user"
                  )}
                >
                  {m.sender === 'agent' && (
                    <div className="cp-bot-avatar">
                      <img src={previewSettings.botAvatar} alt="Bot" />
                    </div>
                  )}

                  <div
                    className={cn("cp-message-bubble")}
                    style={{
                      backgroundColor: m.sender === 'agent' ? previewSettings.botBubbleBg : previewSettings.userBubbleBg,
                      color: m.sender === 'user'
                        ? getContrastColor(previewSettings.userBubbleBg)
                        : getContrastColor(previewSettings.botBubbleBg),
                    }}
                  >

                    {m.sender === "agent" && m.options && m.options.length > 0 ? (
                      // Show intro text and buttons for agent messages with options
                      <>
                        <div className="cp-message-text">
                          <p className="whitespace-pre-wrap break-words">
                            {m.text.split(/\n(?=\d+\.)/)[0].trim() || "Please select an option:"}
                          </p>
                        </div>
                        <MessageOptionsList
                          options={m.options}
                          onOptionClick={handleOptionClick}
                        />
                      </>
                    ) : (
                      // Show full text for user messages or agent messages without options
                      <div className="cp-message-text">
                        <p className="whitespace-pre-wrap break-words">
                          {m.text}
                        </p>
                      </div>
                    )}

                    <div className="cp-message-meta">
                      <div className="cp-message-time">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isSending && (
                <div className="cp-message-row cp-BOT cp-with-tail">
                  <div className="cp-bot-avatar">
                    <img src={previewSettings.botAvatar} alt="Bot" />
                  </div>
                  <div className="cp-message-bubble" style={{ backgroundColor: previewSettings.botBubbleBg }}>
                    <div className="flex gap-1 h-5 items-center px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="cp-input-bar">
              <div className="cp-input-wrapper">
                <Input
                  className="cp-chat-input focus-visible:ring-0"
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected || isSending}
                />
                <button
                  className="cp-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!isConnected || isSending || !inputText.trim()}
                  style={{
                    backgroundColor: previewSettings.accentColor,
                    color: '#ffffff'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Pane (Theme/Settings) */}
          <div className={cn("cp-sidebar-pane", sidebarMode)}>
            <div className="cp-sidebar-header">
              <h3>Theme Settings</h3>
              <button className="cp-action-btn" onClick={() => setSidebarMode('none')}>
                <X size={18} />
              </button>
            </div>

            <div className="cp-sidebar-body">
              {sidebarMode === 'theme' && (
                <div className="cp-theme-settings-content">

                  {/* Font Size */}
                  <div className="cp-setting-item">
                    <div className="flex justify-between mb-2">
                      <Label>Font Size</Label>
                      <span className="text-xs text-muted-foreground">{previewSettings.fontSize}px</span>
                    </div>
                    <Slider
                      defaultValue={[previewSettings.fontSize]}
                      max={20}
                      min={10}
                      step={1}
                      value={[previewSettings.fontSize]}
                      onValueChange={(vals) => setPreviewSettings({ ...previewSettings, fontSize: vals[0] })}
                    />
                    <style>{`
                        .cp-chat-window { --cp-font-size: ${previewSettings.fontSize}px; }
                    `}</style>
                  </div>

                  {/* Font Family */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">Font Family</Label>
                    <Select
                      value={previewSettings.fontFamily}
                      onValueChange={(val) => setPreviewSettings({ ...previewSettings, fontFamily: val })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select Font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                        <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                        <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  {/* Appearance - Bot Avatar */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">Bot Avatar</Label>
                    <div className="cp-avatar-selector">
                      <div className="cp-avatar-options">
                        {[
                          "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
                          "https://cdn-icons-png.flaticon.com/512/4712/4712139.png",
                          "https://cdn-icons-png.flaticon.com/512/8943/8943377.png",
                          "https://cdn-icons-png.flaticon.com/512/2040/2040946.png"
                        ].map(url => (
                          <div
                            key={url}
                            className={cn("cp-avatar-option", previewSettings.botAvatar === url && "active")}
                            onClick={() => setPreviewSettings({ ...previewSettings, botAvatar: url })}
                          >
                            <img src={url} alt="Bot Icon" />
                          </div>
                        ))}
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                        <Button size="sm" variant="outline" className="h-8 px-2" asChild>
                          <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-1">
                            <Plus size={14} /> Upload
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Colors - Chat Background */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">Chat Background</Label>
                    <div className="cp-setting-control-row">
                      <Input
                        type="color"
                        value={previewSettings.chatBackground}
                        onChange={(e) => setPreviewSettings({ ...previewSettings, chatBackground: e.target.value })}
                        className="w-12 h-8 p-1 px-1"
                      />
                      <div className="cp-color-presets">
                        {["#f3f4f6", "#ffffff", "#0f172a", "#e5e7eb", "#fef3c7"].map(c => (
                          <div
                            key={c}
                            className={cn("cp-color-dot", previewSettings.chatBackground === c && "active")}
                            style={{ background: c }}
                            onClick={() => setPreviewSettings({ ...previewSettings, chatBackground: c })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Colors - Bot Bubble */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">Bot Bubble</Label>
                    <div className="cp-setting-control-row">
                      <Input
                        type="color"
                        value={previewSettings.botBubbleBg}
                        onChange={(e) => setPreviewSettings({ ...previewSettings, botBubbleBg: e.target.value })}
                        className="w-12 h-8 p-1 px-1"
                      />
                    </div>
                  </div>

                  {/* Colors - User Bubble */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">User Bubble</Label>
                    <div className="cp-setting-control-row">
                      <Input
                        type="color"
                        value={previewSettings.userBubbleBg}
                        onChange={(e) => setPreviewSettings({ ...previewSettings, userBubbleBg: e.target.value })}
                        className="w-12 h-8 p-1 px-1"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Presets */}
                  <div className="cp-setting-item">
                    <Label className="mb-2 block">Presets</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={previewSettings.activeTheme === 'Agno Light' ? "default" : "outline"}
                        onClick={() => setPreviewSettings({
                          ...previewSettings,
                          botBubbleBg: "#f3f4f6",
                          userBubbleBg: "#f97316", // Orange-500
                          chatBackground: "#ffffff",
                          accentColor: "#f97316",
                          activeTheme: "Agno Light"
                        })}
                      >Agno Light</Button>
                      <Button
                        size="sm"
                        variant={previewSettings.activeTheme === 'Agno Dark' ? "default" : "outline"}
                        onClick={() => setPreviewSettings({
                          ...previewSettings,
                          botBubbleBg: "#27272a", // Zinc-800
                          userBubbleBg: "#f97316",
                          chatBackground: "#09090b", // Zinc-950
                          accentColor: "#f97316",
                          activeTheme: "Agno Dark"
                        })}
                      >Agno Dark</Button>
                      <Button
                        size="sm"
                        variant={previewSettings.activeTheme === 'WhatsApp' ? "default" : "outline"}
                        onClick={() => setPreviewSettings({
                          ...previewSettings,
                          botBubbleBg: "#ffffff",
                          userBubbleBg: "#22c55e",
                          chatBackground: "#ebe5de",
                          accentColor: "#22c55e",
                          activeTheme: "WhatsApp"
                        })}
                      >WhatsApp</Button>
                      <Button
                        size="sm"
                        variant={previewSettings.activeTheme === 'Messenger' ? "default" : "outline"}
                        onClick={() => setPreviewSettings({
                          ...previewSettings,
                          botBubbleBg: "#e9ecef",
                          userBubbleBg: "#0084ff",
                          chatBackground: "#ffffff",
                          accentColor: "#0084ff",
                          activeTheme: "Messenger"
                        })}
                      >Messenger</Button>
                      <Button
                        size="sm"
                        variant={previewSettings.activeTheme === 'Dark Mode' ? "default" : "outline"}
                        onClick={() => setPreviewSettings({
                          ...previewSettings,
                          botBubbleBg: "#334155",
                          userBubbleBg: "#3b82f6",
                          chatBackground: "#0f172a",
                          accentColor: "#3b82f6",
                          activeTheme: "Dark Mode"
                        })}
                      >Dark Mode</Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={resetToDefaults}>
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}