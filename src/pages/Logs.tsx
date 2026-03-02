import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Info } from "lucide-react";

export default function Logs() {
  return (
    <DashboardLayout title="Logs">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>System Logs</CardTitle>
          </div>
          <CardDescription>
            View real-time logs from your LiveKit rooms and agent sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              Logs UI is under development. For now, logs can be viewed in the LiveKit server
              console or your application logs directory.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
