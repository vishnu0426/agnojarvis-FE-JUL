import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useRooms, useDeleteRoom } from "@/hooks/use-rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Video, Copy, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Room } from "@/services/api";

export default function Rooms() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useRooms();
  const deleteRoom = useDeleteRoom();

  if (isLoading) {
    return (
      <DashboardLayout title="Rooms">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Rooms">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to load rooms: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const rooms = data?.rooms || [];

  const filteredRooms = rooms.filter((room) => {
    const matchesFilter = filter === "all" || room.status === filter;
    const matchesSearch = room.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Copied!", {
      description: "Room ID copied to clipboard",
    });
  };

  const handleDeleteRoom = (roomName: string) => {
    if (confirm(`Are you sure you want to delete room "${roomName}"? This will end all active calls.`)) {
      deleteRoom.mutate(roomName);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Room Name",
      render: (room: Room) => (
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm">{room.name}</span>
        </div>
      ),
    },
    {
      key: "id",
      header: "Room ID",
      render: (room: Room) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{room.id}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyRoomId(room.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Copy className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (room: Room) => <StatusBadge status={room.status} />,
    },
    {
      key: "participants",
      header: "Participants",
      render: (room: Room) => (
        <span>
          {room.participants} / {room.maxParticipants}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (room: Room) => (
        <span className="text-sm text-muted-foreground">
          {room.createdAt ? format(new Date(room.createdAt), "PPp") : 'N/A'}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (room: Room) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteRoom(room.name);
          }}
          disabled={deleteRoom.isPending}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Rooms">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
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
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredRooms}
        emptyState={
          <EmptyState
            icon={<Video className="w-8 h-8 text-muted-foreground" />}
            title="No rooms found"
            description="Rooms will appear here when calls are active."
          />
        }
      />
    </DashboardLayout>
  );
}
