import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAllRecordings } from "@/hooks/use-egress";
import { apiClient } from "@/services/api";
import type { CallRecording } from "@/services/api";
import {
  AlertCircle,
  FileAudio,
  Clock,
  HardDrive,
  Video,
  Phone,
} from "lucide-react";
import { format } from "date-fns";

export default function Egress() {
  const { data, isLoading, error } = useAllRecordings();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recording":
        return <Badge variant="default" className="bg-green-500">Recording</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "N/A";
    try {
      return format(new Date(iso), "MMM d, yyyy HH:mm:ss");
    } catch {
      return iso;
    }
  };

  const getAudioUrl = (rec: CallRecording) =>
    apiClient.getCallRecordingAudioUrl(rec.call_id);

  if (isLoading) {
    return (
      <DashboardLayout title="Egress & Recordings">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Egress & Recordings">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load recordings: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const recordings = data?.recordings ?? [];

  return (
    <DashboardLayout title="Egress & Recordings">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <CardTitle>Call Recordings</CardTitle>
              </div>
              <CardDescription>
                Manage and play call recordings from your voice agent sessions
              </CardDescription>
            </div>
            <Badge variant="outline">
              {recordings.length} Recording{recordings.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recordings.length > 0 ? (
            <div className="space-y-4">
              {recordings.map((rec) => (
                <Card key={rec.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <FileAudio className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {rec.room_name || rec.call_id}
                            </h4>
                            {rec.caller_phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {rec.caller_phone}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {rec.call_id}
                            </p>
                          </div>
                          <div className="shrink-0">{getStatusBadge(rec.status)}</div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-medium">{formatDuration(rec.duration_seconds)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">File Size</p>
                              <p className="text-sm font-medium">{formatFileSize(rec.file_size_bytes)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Recorded At</p>
                            <p className="text-sm font-medium">{formatDate(rec.recorded_at)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Egress ID</p>
                            <p className="text-xs font-mono break-all">{rec.egress_id || "—"}</p>
                          </div>
                        </div>

                        {/* Audio Player — shown when status is completed */}
                        {rec.status === "completed" && (
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <p className="text-xs text-muted-foreground mb-2">Audio Playback</p>
                            <audio controls className="w-full" preload="metadata">
                              <source src={getAudioUrl(rec)} type="audio/mpeg" />
                              <source src={getAudioUrl(rec)} type="audio/ogg" />
                              Your browser does not support the audio element.
                            </audio>
                            <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                              {rec.file_path}
                            </p>
                          </div>
                        )}

                        {/* File path for non-completed recordings */}
                        {rec.status !== "completed" && rec.file_path && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">File Path</p>
                            <p className="text-sm font-mono break-all">{rec.file_path}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileAudio className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recordings Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Call recordings will appear here automatically when agent calls are completed.
                Recordings are saved to the database once each session ends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
