import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardMetrics } from "@/hooks/use-dashboard";
import {
  Video,
  Users,
  Clock,
  Activity,
  AlertCircle,
  TrendingUp,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard metrics: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Active Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeRooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              Live voice sessions
            </p>
          </CardContent>
        </Card>

        {/* Total Participants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalParticipants || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently connected
            </p>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        {/* Total Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalDuration ? `${Math.floor(metrics.totalDuration / 60)}h ${metrics.totalDuration % 60}m` : '0m'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative call time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Rooms List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Rooms</CardTitle>
                <CardDescription>Currently running voice sessions</CardDescription>
              </div>
              <Link to="/rooms">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  View All
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {metrics?.rooms && metrics.rooms.length > 0 ? (
              <div className="space-y-3">
                {metrics.rooms.slice(0, 5).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.participants} participant{room.participants !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-primary">
                      <Activity className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No active rooms</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rooms will appear here when calls are in progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Latest completed calls</CardDescription>
              </div>
              <Link to="/sessions">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  View All
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {metrics?.recentSessions && metrics.recentSessions.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.room_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.created_at
                            ? format(new Date(session.created_at), "MMM d, HH:mm")
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.duration || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No recent sessions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Session history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>LiveKit infrastructure health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">LiveKit Server</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Agent Manager API</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Voice Agent</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
