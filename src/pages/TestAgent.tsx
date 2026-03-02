import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/services/api";
import { ChatInterface } from "@/components/agent/ChatInterface";
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
import { toast as sonnerToast } from "sonner";

const DEFAULT_AGENT_ID = import.meta.env.VITE_DEFAULT_AGENT_ID || '00000000-0000-0000-0000-000000000001';

export default function TestAgent() {
  const { agentId: urlAgentId } = useParams<{ agentId: string }>();

  // Use URL parameter if available, otherwise fall back to default
  const agentId = urlAgentId || DEFAULT_AGENT_ID;

  // LiveKit connection state
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
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

  const connectToAgent = async () => {
    try {
      setIsConnecting(true);

      // Get access token from backend using the selected agent
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
        sonnerToast.success("Connected to agent!");
      });

      newRoom.on(RoomEvent.Disconnected, (reason) => {
        console.log("Disconnected from room:", reason);
        setIsConnected(false);
        setRoom(null);
        if (reason) {
          sonnerToast.info(`Disconnected: ${reason}`);
        } else {
          sonnerToast.info("Disconnected");
        }
      });

      newRoom.on(RoomEvent.Reconnecting, () => {
        console.log("Reconnecting to room...");
        sonnerToast.info("Reconnecting...");
      });

      newRoom.on(RoomEvent.Reconnected, () => {
        console.log("Reconnected to room");
        sonnerToast.success("Reconnected!");
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
          sonnerToast.success("Agent audio connected");
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

      // Connect to room
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
      console.error("Failed to connect:", error);

      let errorMessage = error.message;
      if (error.message?.includes("could not establish pc connection") ||
          error.message?.includes("connection")) {
        errorMessage = "Cannot connect to LiveKit server. Please ensure:\n" +
                      "1. LiveKit server is running and accessible\n" +
                      "2. Check LIVEKIT_URL in .env file\n" +
                      "3. Verify network connectivity to LiveKit server";
      }

      sonnerToast.error(`Failed to connect: ${errorMessage}`, {
        duration: 10000,
      });
      setIsConnecting(false);
    }
  };

  const disconnectFromAgent = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setRoomName("");
      sonnerToast.info("Disconnected from agent");
    }
  };

  return (
    <DashboardLayout title="Chat Room">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chat Room</h2>
              <p className="text-sm text-muted-foreground">
                Connect and chat with your voice agent
              </p>
            </div>
          </div>
        </div>

        {/* Connection Controls & Chat Interface */}
        <div className="grid grid-cols-1 gap-4">
            {/* Connection Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Chat Room
                    </CardTitle>
                    <CardDescription>
                      Connect to your agent and chat via text or voice
                    </CardDescription>
                  </div>
                  {isConnected && (
                    <Badge variant="default" className="bg-green-500">
                      Connected
                    </Badge>
                  )}
                  {isConnecting && (
                    <Badge variant="secondary">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Connecting...
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isConnected
                      ? `Connected to room: ${roomName}. You can now chat with your agent via text or voice.`
                      : "Click 'Connect to Agent' to start chatting. The agent will respond to your messages with voice."}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  {!isConnected ? (
                    <Button
                      onClick={connectToAgent}
                      disabled={isConnecting}
                      className="w-full"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Connect to Agent
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={disconnectFromAgent}
                      variant="destructive"
                      className="w-full"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  )}
                </div>

                {/* Hidden audio container for agent voice responses */}
                <div ref={audioContainerRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <div className="h-[600px]">
              <ChatInterface room={room} isConnected={isConnected} />
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

