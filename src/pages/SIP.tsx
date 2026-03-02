import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSIPTrunks } from "@/hooks/use-sip";
import { Phone, AlertCircle, PhoneIncoming, PhoneOutgoing, Hash, CheckCircle2 } from "lucide-react";

export default function SIP() {
  const { data, isLoading, error } = useSIPTrunks();

  // Separate inbound and outbound trunks
  const inboundTrunks = data?.trunks.filter(trunk => trunk.type === 'inbound') || [];
  const outboundTrunks = data?.trunks.filter(trunk => trunk.type === 'outbound') || [];

  if (isLoading) {
    return (
      <DashboardLayout title="SIP Trunking">
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="SIP Trunking">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load SIP trunks: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="SIP Trunking">
      <div className="space-y-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <CardTitle>SIP Trunk Overview</CardTitle>
                </div>
                <CardDescription>
                  Connect your PSTN phone lines to LiveKit rooms using SIP trunking
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{inboundTrunks.length}</p>
                  <p className="text-xs text-muted-foreground">Inbound</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{outboundTrunks.length}</p>
                  <p className="text-xs text-muted-foreground">Outbound</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Inbound Trunks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PhoneIncoming className="w-5 h-5 text-green-600" />
              <CardTitle>Inbound Trunks</CardTitle>
            </div>
            <CardDescription>
              Receive incoming calls from PSTN phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inboundTrunks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trunk ID</TableHead>
                    <TableHead>Phone Numbers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inboundTrunks.map((trunk) => (
                    <TableRow key={trunk.id}>
                      <TableCell className="font-medium">{trunk.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{trunk.id}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {trunk.numbers.map((number, idx) => (
                            <Badge key={idx} variant="outline" className="font-mono text-xs">
                              <Hash className="w-3 h-3 mr-1" />
                              {number}
                            </Badge>
                          ))}
                          {trunk.numbers.length === 0 && (
                            <span className="text-sm text-muted-foreground">No numbers</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {trunk.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PhoneIncoming className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No inbound trunks configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure inbound trunks in LiveKit server settings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outbound Trunks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PhoneOutgoing className="w-5 h-5 text-blue-600" />
              <CardTitle>Outbound Trunks</CardTitle>
            </div>
            <CardDescription>
              Make outgoing calls to PSTN phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {outboundTrunks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trunk ID</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone Numbers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outboundTrunks.map((trunk) => (
                    <TableRow key={trunk.id}>
                      <TableCell className="font-medium">{trunk.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{trunk.id}</code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{trunk.address || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {trunk.numbers.map((number, idx) => (
                            <Badge key={idx} variant="outline" className="font-mono text-xs">
                              <Hash className="w-3 h-3 mr-1" />
                              {number}
                            </Badge>
                          ))}
                          {trunk.numbers.length === 0 && (
                            <span className="text-sm text-muted-foreground">No numbers</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {trunk.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PhoneOutgoing className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No outbound trunks configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure outbound trunks in LiveKit server settings
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
