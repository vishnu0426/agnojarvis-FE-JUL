/**
 * Agent Preview Component
 *
 * Provides a LiveKit-based agent testing component with browser audio.
 * Uses official LiveKit client library for WebRTC connections.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Info } from "lucide-react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  RoomOptions,
  VideoPresets
} from "livekit-client";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { ChatInterface } from "./ChatInterface";

interface AgentPreviewProps {
  agentId: string;
  onClose?: () => void;
}

export function AgentPreview({ agentId, onClose }: AgentPreviewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [roomName, setRoomName] = useState<string>("");
  const audioContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const startCall = async () => {
    try {
      setIsConnecting(true);

      // Get access token from backend
      const response = await apiClient.createPreviewToken(agentId);

      setRoomName(response.room_name);

      // Create LiveKit room with options
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      };

      const newRoom = new Room(roomOptions);

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log("Connected to room");
        setIsConnected(true);
        setIsConnecting(false);
        toast.success("Connected to agent!");
      });

      newRoom.on(RoomEvent.Disconnected, (reason) => {
        console.log("Disconnected from room:", reason);
        setIsConnected(false);
        setRoom(null);
        if (reason) {
          toast.info(`Call ended: ${reason}`);
        } else {
          toast.info("Call ended");
        }
      });

      newRoom.on(RoomEvent.Reconnecting, () => {
        console.log("Reconnecting to room...");
        toast.info("Reconnecting...");
      });

      newRoom.on(RoomEvent.Reconnected, () => {
        console.log("Reconnected to room");
        toast.success("Reconnected!");
      });

      newRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        console.log("Connection quality:", quality, "for", participant.identity);
      });

      newRoom.on(RoomEvent.TrackSubscribed, (
        track: RemoteTrack,
        _publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log("Track subscribed:", track.kind, "from", participant.identity);
        if (track.kind === Track.Kind.Audio) {
          // Attach audio track to DOM
          const audioElement = track.attach();
          audioElement.autoplay = true;
          if (audioContainerRef.current) {
            audioContainerRef.current.appendChild(audioElement);
          }
          toast.success("Agent audio connected");
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (
        track: RemoteTrack,
        _publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log("Track unsubscribed:", track.kind, "from", participant.identity);
        track.detach();
      });

      // Connect to room with ICE server configuration
      console.log("Connecting to LiveKit:", response.url);
      console.log("Room name:", response.room_name);

      await newRoom.connect(response.url, response.token, {
        rtcConfig: {
          iceServers: [
            {
              urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
              ],
            },
            // Add TURN server for NAT traversal
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },
          ],
          iceCandidatePoolSize: 10,
          iceTransportPolicy: 'all',
        },
        autoSubscribe: true,
      });

      console.log("Connected! Local participant:", newRoom.localParticipant.identity);

      // Enable microphone
      await newRoom.localParticipant.setMicrophoneEnabled(true);

      setRoom(newRoom);

    } catch (error: any) {
      console.error("Failed to start call:", error);

      // Provide helpful error messages
      let errorMessage = error.message;
      if (error.message?.includes("could not establish pc connection") ||
          error.message?.includes("connection")) {
        errorMessage = "Cannot connect to LiveKit server. Please ensure:\n" +
                      "1. LiveKit server is running and accessible\n" +
                      "2. Check LIVEKIT_URL in .env file\n" +
                      "3. Verify network connectivity to LiveKit server";
      }

      toast.error(`Failed to start call: ${errorMessage}`, {
        duration: 10000,
      });
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setRoomName("");
      toast.info("Call ended");
    }
  };

  const toggleMute = async () => {
    if (room) {
      const newMutedState = !isMuted;
      await room.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
      toast.info(newMutedState ? "Microphone muted" : "Microphone unmuted");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Agent Preview & Testing
            </CardTitle>
            {isConnected && (
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>💬 Text Chat Testing Available</strong>
              <br /><br />
              Connect to the agent and use the text chat interface to send messages.
              The agent will respond using voice (text-to-speech).
              <br /><br />
              <strong>Note:</strong> Voice input requires LiveKit agent dispatch configuration.
              Use text chat for testing without additional setup.
            </AlertDescription>
          </Alert>

          {/* Hidden audio container for remote tracks */}
          <div ref={audioContainerRef} style={{ display: 'none' }} />

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={startCall}
                disabled={isConnecting}
              >
                <Phone className="w-5 h-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect to Agent"}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endCall}
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  Disconnect
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 mr-2" />
                  ) : (
                    <Mic className="w-5 h-5 mr-2" />
                  )}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </>
            )}
          </div>

          {/* Room Info */}
          {isConnected && roomName && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium mb-2">Active Session</p>
              <p className="text-xs text-muted-foreground">
                Room: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{roomName}</code>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Use the chat interface below to send text messages. The agent will respond with voice.
              </p>
            </div>
          )}

          {onClose && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="h-[600px]">
        <ChatInterface room={room} isConnected={isConnected} />
      </div>
    </div>
  );
}