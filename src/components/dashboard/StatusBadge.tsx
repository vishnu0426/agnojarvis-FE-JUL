import { cn } from "@/lib/utils";

export type StatusType =
  | "active" | "inactive" | "running" | "stopped" | "error" | "connected"
  | "standby" | "completed" | "failed" | "ended" | "info" | "warning"
  // Call statuses from database
  | "in_progress" | "initiated" | "ringing" | "answered" | "queued"
  | "on_hold" | "transferring" | "cancelled" | "abandoned" | "voicemail" | "rejected";

interface StatusBadgeProps {
  status: string; // Allow any string so unknown statuses don't crash
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Generic statuses
  active: { label: "Active", className: "status-active" },
  running: { label: "Running", className: "status-active" },
  connected: { label: "Connected", className: "status-active" },
  completed: { label: "Completed", className: "status-active" },
  inactive: { label: "Inactive", className: "status-inactive" },
  stopped: { label: "Stopped", className: "status-inactive" },
  standby: { label: "Standby", className: "status-warning" },
  ended: { label: "Ended", className: "status-inactive" },
  warning: { label: "Warning", className: "status-warning" },
  info: { label: "Info", className: "bg-primary/10 text-primary" },
  error: { label: "Error", className: "status-error" },
  failed: { label: "Failed", className: "status-error" },
  // Call statuses from database
  in_progress: { label: "In Progress", className: "status-active" },
  initiated: { label: "Initiated", className: "status-warning" },
  ringing: { label: "Ringing", className: "status-warning" },
  answered: { label: "Answered", className: "status-active" },
  queued: { label: "Queued", className: "status-warning" },
  on_hold: { label: "On Hold", className: "status-warning" },
  transferring: { label: "Transferring", className: "status-warning" },
  cancelled: { label: "Cancelled", className: "status-inactive" },
  abandoned: { label: "Abandoned", className: "status-inactive" },
  voicemail: { label: "Voicemail", className: "status-inactive" },
  rejected: { label: "Rejected", className: "status-error" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={cn("status-badge", config.className, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
