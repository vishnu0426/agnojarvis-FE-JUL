import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSessions } from "@/hooks/use-sessions";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Users, AlertCircle, ChevronDown, ChevronUp, User, Clock, Phone, Download, FileAudio, PhoneOff } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient, type Session } from "@/services/api";

// Active call statuses (call is ongoing)
const ACTIVE_STATUSES = new Set(["in_progress", "initiated", "ringing", "answered", "queued", "on_hold", "transferring", "active", "connected", "running"]);
// Ended call statuses (call has finished)
const ENDED_STATUSES = new Set(["completed", "failed", "cancelled", "abandoned", "voicemail", "rejected", "ended", "stopped", "inactive", "error"]);

// ---------------------------------------------------------------------------
// Recording Player Component
// ---------------------------------------------------------------------------

function RecordingPlayer({ callId }: { callId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["call-recordings", callId],
    queryFn: () => apiClient.getCallRecordings(callId),
    staleTime: 60_000,
  });

  const recordings = data?.recordings ?? [];
  const audioUrl = apiClient.getCallRecordingAudioUrl(callId);

  if (isLoading) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm font-semibold mb-2">Call Recording</p>
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error || recordings.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Call Recording</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error ? "Unable to load recording." : "No recording available for this call."}
            </p>
          </div>
          <FileAudio className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  const rec = recordings[0];
  const durationLabel = rec.duration_seconds
    ? `${Math.floor(rec.duration_seconds / 60)}m ${rec.duration_seconds % 60}s`
    : null;
  const sizeLabel = rec.file_size_bytes
    ? `${(rec.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
    : null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b bg-muted/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Call Recording</p>
            <div className="flex items-center gap-3 mt-0.5">
              {durationLabel && (
                <span className="text-xs text-muted-foreground">Duration: {durationLabel}</span>
              )}
              {sizeLabel && (
                <span className="text-xs text-muted-foreground">Size: {sizeLabel}</span>
              )}
              {rec.recorded_at && (
                <span className="text-xs text-muted-foreground">
                  Recorded: {format(new Date(rec.recorded_at), "MMM d, yyyy HH:mm")}
                </span>
              )}
            </div>
          </div>
          <a
            href={audioUrl}
            download
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>
      <div className="p-4">
        <audio
          controls
          className="w-full"
          preload="metadata"
          src={audioUrl}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Sessions() {
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [search, setSearch] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useSessions();

  const forceEndMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.forceEndSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Sessions">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Sessions">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to load sessions: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const sessions = data?.sessions || [];

  const filteredSessions = sessions.filter((session) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ACTIVE_STATUSES.has(session.status)) ||
      (filter === "ended" && ENDED_STATUSES.has(session.status));
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      session.roomName.toLowerCase().includes(searchTerm) ||
      session.participants.some(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm) ||
          p.identity?.toLowerCase().includes(searchTerm)
      );
    return matchesFilter && matchesSearch;
  });

  const columns = [
    {
      key: "id",
      header: "Session ID",
      render: (session: Session) => (
        <span className="font-mono text-xs">{session.id}</span>
      ),
    },
    {
      key: "roomName",
      header: "Room",
      render: (session: Session) => (
        <span className="font-mono text-sm">{session.roomName}</span>
      ),
    },
    {
      key: "participants",
      header: "Participants",
      render: (session: Session) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{session.participants.length}</span>
        </div>
      ),
    },
    {
      key: "startTime",
      header: "Started",
      render: (session: Session) => (
        <span className="text-sm text-muted-foreground">
          {session.startTime ? format(new Date(session.startTime), "PPp") : 'N/A'}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (session: Session) => (
        <span className="font-mono text-sm">{session.duration}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (session: Session) => <StatusBadge status={session.status} />,
    },
  ];

  return (
    <DashboardLayout title="Sessions">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by room name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessions.has(session.id);
            return (
              <Card key={session.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleSession(session.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-semibold text-lg">{session.roomName}</h4>
                            <StatusBadge status={session.status} />
                            {session.transcription && session.transcription.length > 0 && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {session.transcription.length} messages
                              </span>
                            )}
                            {session.average_sentiment !== undefined && session.average_sentiment !== null && (
                              <Badge
                                variant={
                                  session.average_sentiment > 0.3
                                    ? "default"
                                    : session.average_sentiment < -0.3
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {session.average_sentiment > 0.3
                                  ? "Positive"
                                  : session.average_sentiment < -0.3
                                  ? "Negative"
                                  : "Neutral"}{" "}
                                ({session.average_sentiment.toFixed(2)})
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                            {session.participants[0]?.identity && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="font-mono">{session.participants[0].identity}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration || 'N/A'}</span>
                            </div>
                            <span>{format(new Date(session.startTime), "MMM d, yyyy HH:mm")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Force-end button for stuck in_progress calls */}
                        {ACTIVE_STATUSES.has(session.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            disabled={forceEndMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Mark session "${session.roomName}" as abandoned? This cannot be undone.`)) {
                                forceEndMutation.mutate(session.id);
                              }
                            }}
                          >
                            <PhoneOff className="w-4 h-4 mr-2" />
                            Force End
                          </Button>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Show Details
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="mt-6">
                      <div className="space-y-4 pt-4 border-t">
                        {/* Session Details */}
                        <div>
                          <h5 className="text-sm font-semibold mb-3">Session Information</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Session ID</p>
                              <p className="text-sm font-mono mt-1">{session.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Room Name</p>
                              <p className="text-sm font-mono mt-1">{session.roomName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Started At</p>
                              <p className="text-sm mt-1">{session.startTime ? format(new Date(session.startTime), "PPpp") : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-mono mt-1">{session.duration || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <div className="mt-1">
                                <StatusBadge status={session.status} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Participants */}
                        {session.participants.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3">Participants</h5>
                            <div className="grid gap-3 md:grid-cols-2">
                              {session.participants.map((participant) => (
                                <div
                                  key={participant.id}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <User className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{participant.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {participant.identity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Call Recording Player */}
                        <RecordingPlayer callId={session.id} />

                        {/* Sentiment Analysis */}
                        {session.average_sentiment !== undefined && session.average_sentiment !== null && (
                          <div className="pt-4 border-t">
                            <h5 className="text-sm font-semibold mb-3">Sentiment Analysis</h5>
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                              <div>
                                <p className="text-xs text-muted-foreground">Average Score</p>
                                <p className="text-lg font-bold mt-1" style={{
                                  color: session.average_sentiment > 0.3
                                    ? "hsl(var(--primary))"
                                    : session.average_sentiment < -0.3
                                    ? "hsl(var(--destructive))"
                                    : "hsl(var(--muted-foreground))"
                                }}>
                                  {session.average_sentiment.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">Range: -1.0 (negative) to 1.0 (positive)</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Overall Mood</p>
                                <p className="text-lg font-semibold mt-1">
                                  {session.average_sentiment > 0.3
                                    ? "Positive"
                                    : session.average_sentiment < -0.3
                                    ? "Negative"
                                    : "Neutral"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Call Transcript */}
                        {session.transcription && session.transcription.length > 0 && (
                          <div className="pt-4 border-t">
                            <h5 className="text-sm font-semibold mb-4">Call Transcript</h5>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                              {session.transcription.map((entry, idx) => (
                                <div
                                  key={idx}
                                  className={`flex flex-col ${entry.speaker === "ai_agent" ? "items-start" : "items-end"
                                    }`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${entry.speaker === "ai_agent"
                                        ? "bg-primary/10 text-primary rounded-tl-none"
                                        : "bg-muted text-foreground rounded-tr-none"
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                        {entry.speaker === "ai_agent" ? "AI Agent" : "Caller"}
                                      </span>
                                      {entry.timestamp && (
                                        <span className="text-[10px] opacity-50">
                                          {format(new Date(entry.timestamp), "HH:mm:ss")}
                                        </span>
                                      )}
                                    </div>
                                    <p className="leading-relaxed">{entry.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="No sessions found"
          description="Sessions will appear here when participants join rooms."
        />
      )}
    </DashboardLayout>
  );
}
