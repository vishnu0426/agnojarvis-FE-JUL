/**
 * Agents Page - Table Layout with Model Information
 *
 * Displays all agents in a table view with LLM, STT, TTS model details.
 * Row click goes to view page.
 * Actions dropdown has separate View and Edit options.
 * 
 * UPDATED: Uses custom modal for delete confirmation
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAgents, useActivateAgent, useDeactivateAgent, useDeleteAgent } from "@/hooks/use-agents";
import { Bot, Plus, MoreVertical, Eye, Edit, Trash2, MessageSquare, X } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AgentMetadata } from "@/services/api";
import { useChatContext } from "@/contexts/ChatContext";
import { formatProviderName } from "@/lib/format-provider";

export default function Agents() {
  const navigate = useNavigate();

  // Fetch agents list
  const { data: agents, isLoading: agentsLoading } = useAgents();

  // Mutations
  const activateAgent = useActivateAgent();
  const deactivateAgent = useDeactivateAgent();
  const deleteAgentMutation = useDeleteAgent();

  // Chat context
  const { openChat, clearMessages, setSelectedAgentId } = useChatContext();

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleToggleAgent = async (e: React.MouseEvent, agentId: string, isActive: boolean) => {
    e.stopPropagation();
    if (isActive) {
      await deactivateAgent.mutateAsync({ agentId, deactivatedBy: "user" });
    } else {
      await activateAgent.mutateAsync({ agentId, activatedBy: "user" });
    }
  };

  const handleDeleteClick = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteDialogOpen(false);
    setTimeout(() => setAgentToDelete(null), 200);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!agentToDelete) return;

    deleteAgentMutation.mutate(
      { agentId: agentToDelete.id, deletedBy: "user" },
      {
        onSuccess: () => {
          toast.success("Agent deleted successfully!");
          handleCancelDelete();
        },
        onError: (error: any) => {
          toast.error(`Failed to delete agent: ${error.message}`);
        },
      }
    );
  };

  // Loading state
  if (agentsLoading) {
    return (
      <DashboardLayout title="Agent Management">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Define table columns with model information
  const columns: Array<{
    key: string;
    header: string;
    render?: (item: AgentMetadata & { id: string }) => React.ReactNode;
    className?: string;
  }> = [
      {
        key: "name",
        header: "Agent Name",
        render: (agent) => (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">{agent.name}</span>
          </div>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (agent) => {
          if (!agent.description) {
            return <span className="text-muted-foreground italic">No description</span>;
          }

          const truncated = agent.description.length > 40
            ? `${agent.description.substring(0, 40)}...`
            : agent.description;

          return agent.description.length > 40 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground cursor-help">
                    {truncated}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{agent.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-sm text-muted-foreground">{agent.description}</span>
          );
        },
      },
      {
        key: "llm",
        header: "LLM",
        render: (agent) => {
          if (!agent.models?.llm?.provider || !agent.models?.llm?.model) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">{formatProviderName(agent.models.llm.provider)}</span>
              <span className="text-xs text-muted-foreground">{agent.models.llm.model}</span>
            </div>
          );
        },
      },
      {
        key: "stt",
        header: "STT",
        render: (agent) => {
          if (!agent.models?.stt?.provider || !agent.models?.stt?.model) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">{formatProviderName(agent.models.stt.provider)}</span>
              <span className="text-xs text-muted-foreground">{agent.models.stt.model}</span>
            </div>
          );
        },
      },
      {
        key: "tts",
        header: "TTS",
        render: (agent) => {
          if (!agent.models?.tts?.provider || !agent.models?.tts?.voice) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">{formatProviderName(agent.models.tts.provider)}</span>
              <span className="text-xs text-muted-foreground">{agent.models.tts.voice}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (agent) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={agent.is_active}
              onCheckedChange={() => handleToggleAgent(event as any, agent.agent_id, agent.is_active)}
            />
          </div>
        ),
      },
      {
        key: "chat",
        header: "Chat",
        render: (agent) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                clearMessages();
                // Force fresh connection by cycling agent ID
                setSelectedAgentId("");
                setTimeout(() => {
                  openChat(agent.agent_id);
                }, 0);
              }}
              title="Chat with agent"
            >
              <MessageSquare className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (agent) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/agents/${agent.agent_id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/agents/${agent.agent_id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(agent.agent_id, agent.name)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ];

  return (
    <>
      <DashboardLayout title="Agent Management">
        {/* Header with Create Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Voice Agents</h2>
              <p className="text-muted-foreground">Manage and configure your AI voice agents</p>
            </div>
            <Button onClick={() => navigate('/create-agent')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Agent
            </Button>
          </div>
        </div>

        {/* Agents Table */}
        {agents && agents.length > 0 ? (
          <DataTable
            columns={columns}
            data={agents.map(agent => ({ ...agent, id: agent.agent_id }))}
            onRowClick={(agent) => navigate(`/agents/${agent.agent_id}`)}
          />
        ) : (
          <EmptyState
            icon={<Bot className="w-12 h-12 text-muted-foreground" />}
            title="No agents yet"
            description="Create your first AI voice agent to get started"
            actionLabel="Create Agent"
            onAction={() => navigate('/create-agent')}
          />
        )}
      </DashboardLayout>

      {/* Custom Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={handleCancelDelete}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal */}
          <div
            className="relative z-[10000] bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCancelDelete}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Delete Agent</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete agent{" "}
                  <span className="font-semibold text-foreground">"{agentToDelete?.name}"</span>?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. All configuration and history will be permanently removed.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={deleteAgentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteAgentMutation.isPending}
                >
                  {deleteAgentMutation.isPending ? "Deleting..." : "Delete Agent"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}