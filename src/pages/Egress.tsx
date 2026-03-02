import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEgress, useDeleteEgress } from "@/hooks/use-egress";
import {
  Download,
  AlertCircle,
  Trash2,
  FileAudio,
  Clock,
  HardDrive,
  Video,
} from "lucide-react";
import { format } from "date-fns";

export default function Egress() {
  const { data, isLoading, error } = useEgress();
  const deleteEgress = useDeleteEgress();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEgressId, setSelectedEgressId] = useState<string | null>(null);

  const handleDelete = (egressId: string) => {
    setSelectedEgressId(egressId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEgressId) {
      await deleteEgress.mutateAsync(selectedEgressId);
      setDeleteDialogOpen(false);
      setSelectedEgressId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    // LiveKit egress status codes
    // 0: PENDING, 1: ACTIVE, 2: ENDING, 3: COMPLETE, 4: FAILED, 5: ABORTED
    switch (status) {
      case 0:
        return <Badge variant="secondary">Pending</Badge>;
      case 1:
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 2:
        return <Badge variant="secondary">Ending</Badge>;
      case 3:
        return <Badge variant="outline">Complete</Badge>;
      case 4:
        return <Badge variant="destructive">Failed</Badge>;
      case 5:
        return <Badge variant="secondary">Aborted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDuration = (durationNs?: number) => {
    if (!durationNs) return 'N/A';
    const seconds = Math.floor(durationNs / 1_000_000_000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp / 1_000_000), "MMM d, yyyy HH:mm:ss");
  };

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
            Failed to load recordings: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

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
                Manage and download call recordings from your voice agent sessions
              </CardDescription>
            </div>
            <Badge variant="outline">
              {data?.egress.length || 0} Recording{data?.egress.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data?.egress && data.egress.length > 0 ? (
            <div className="space-y-4">
              {data.egress.map((egress) => (
                <Card key={egress.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <FileAudio className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg">{egress.room_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Recording ID: {egress.id}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="text-sm font-medium">{formatDuration(egress.duration)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">File Size</p>
                                <p className="text-sm font-medium">{formatFileSize(egress.file_size)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Started</p>
                              <p className="text-sm font-medium">{formatTimestamp(egress.started_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <div className="mt-1">{getStatusBadge(egress.status)}</div>
                            </div>
                          </div>

                          {/* Audio Player */}
                          {egress.file_path && egress.status === 3 && (
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                              <p className="text-xs text-muted-foreground mb-2">Audio Playback</p>
                              <audio
                                controls
                                className="w-full"
                                preload="metadata"
                              >
                                <source src={`/recordings/${egress.file_path}`} type="audio/mpeg" />
                                <source src={`/recordings/${egress.file_path}`} type="audio/wav" />
                                Your browser does not support the audio element.
                              </audio>
                              <p className="text-xs text-muted-foreground mt-2">
                                File: <span className="font-mono">{egress.file_path}</span>
                              </p>
                            </div>
                          )}

                          {/* File Path (for non-complete recordings) */}
                          {egress.file_path && egress.status !== 3 && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">File Path</p>
                              <p className="text-sm font-mono break-all">{egress.file_path}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {egress.file_path && egress.status === 3 && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/recordings/${egress.file_path}`} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(egress.id)}
                          disabled={deleteEgress.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {egress.status === 1 ? 'Stop' : 'Delete'}
                        </Button>
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
                Call recordings will appear here automatically when agent calls are made.
                Recordings are stored according to your egress configuration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the active recording or delete the recording metadata.
              The recording file will remain on disk unless manually deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
