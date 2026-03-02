/**
 * Custom hooks for agent management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, AgentMetadata, CreateAgentRequest, AgentConfigResponse } from "@/services/api";
import { toast } from "sonner";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.listAgents(),
  });
}

export function useActiveAgent() {
  return useQuery({
    queryKey: ["agents", "active"],
    queryFn: () => apiClient.getActiveAgent(),
    staleTime: 30000, // 30 seconds
    retry: 3,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAgentRequest) => apiClient.createAgent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
}

export function useActivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, activatedBy }: { agentId: string; activatedBy: string }) =>
      apiClient.activateAgent(agentId, activatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent activated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate agent: ${error.message}`);
    },
  });
}

export function useDeactivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, deactivatedBy }: { agentId: string; deactivatedBy: string }) =>
      apiClient.deactivateAgent(agentId, deactivatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent deactivated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate agent: ${error.message}`);
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, deletedBy }: { agentId: string; deletedBy: string }) =>
      apiClient.deleteAgent(agentId, deletedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });
}

