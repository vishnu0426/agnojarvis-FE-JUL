/**
 * Bidirectional Transcription Component
 * 
 * Displays real-time transcriptions in a chat-like interface:
 * - Left side: User inputs (text typed and speech transcribed)
 * - Right side: Agent responses (generated text and TTS transcription)
 */

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Bot, User, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptionMessage {
  id: string;
  speaker: 'caller' | 'ai_agent';
  text: string;
  timestamp: Date;
  is_final: boolean;
  metadata?: {
    provider?: string;
    language?: string;
    voice?: string;
  };
}

interface BidirectionalTranscriptionProps {
  roomName: string;
  className?: string;
}

export function BidirectionalTranscription({ roomName, className }: BidirectionalTranscriptionProps) {
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomName) return;

    // Connect to WebSocket
    const wsUrl = `ws://localhost:8000/ws/transcriptions/${roomName}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for transcriptions');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transcription' && data.is_final) {
          const newMessage: TranscriptionMessage = {
            id: `${data.speaker}-${Date.now()}-${Math.random()}`,
            speaker: data.speaker,
            text: data.text,
            timestamp: new Date(data.timestamp),
            is_final: data.is_final,
            metadata: data.metadata,
          };
          
          setMessages((prev) => [...prev, newMessage]);
        } else if (data.type === 'connected') {
          console.log('Transcription stream connected:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message: TranscriptionMessage) => {
    const isAgent = message.speaker === 'ai_agent';
    
    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2',
          isAgent ? 'justify-end' : 'justify-start'
        )}
      >
        {!isAgent && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        )}
        
        <div className={cn('flex flex-col gap-1 max-w-[70%]', isAgent && 'items-end')}>
          <div
            className={cn(
              'rounded-lg px-4 py-2',
              isAgent
                ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            )}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{message.timestamp.toLocaleTimeString()}</span>
            {message.metadata?.provider && (
              <Badge variant="outline" className="text-xs">
                {message.metadata.provider}
              </Badge>
            )}
            {message.metadata?.language && (
              <Badge variant="outline" className="text-xs">
                {message.metadata.language}
              </Badge>
            )}
          </div>
        </div>
        
        {isAgent && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-600 dark:text-green-300" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Live Transcription
          </CardTitle>
          <Badge
            variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
            className={cn(
              connectionStatus === 'connected' && 'bg-green-500'
            )}
          >
            {connectionStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Mic className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Waiting for conversation to start...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map(renderMessage)}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

