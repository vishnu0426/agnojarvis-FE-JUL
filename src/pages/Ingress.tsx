import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Radio, Youtube, Twitch } from "lucide-react";

const ingressTypes = [
  {
    id: "rtmp",
    name: "RTMP",
    description: "Ingest streams using RTMP protocol from OBS, Streamyard, etc.",
    icon: Radio,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    id: "whip",
    name: "WHIP",
    description: "WebRTC-based ingestion for low-latency streaming.",
    icon: Upload,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    id: "url",
    name: "URL Input",
    description: "Pull streams from RTSP, HLS, or other URL sources.",
    icon: Youtube,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
];

export default function Ingress() {
  return (
    <DashboardLayout title="Ingress">
      <div className="mb-8">
        <p className="text-muted-foreground mb-4">
          Bring external media streams into LiveKit rooms from various sources.
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ingress
        </Button>
      </div>

      {/* Ingress Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {ingressTypes.map((type) => (
          <div
            key={type.id}
            className="metric-card cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${type.bgColor} mb-4`}>
              <type.icon className={`w-5 h-5 ${type.color}`} />
            </div>
            <h3 className="font-medium mb-1">{type.name}</h3>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Active Ingresses */}
      <div className="metric-card">
        <h3 className="font-medium mb-4">Active Ingress Streams</h3>
        <EmptyState
          icon={<Upload className="w-8 h-8 text-muted-foreground" />}
          title="No active ingress streams"
          description="Create an ingress to bring external streams into your rooms."
          actionLabel="Create Ingress"
        />
      </div>
    </DashboardLayout>
  );
}
