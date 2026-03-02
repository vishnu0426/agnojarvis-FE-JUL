/**
 * React Query hooks for Agent Configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, AgentConfigRequest, AgentConfigResponse } from '@/services/api';
import { toast } from 'sonner';

const DEFAULT_AGENT_ID = import.meta.env.VITE_DEFAULT_AGENT_ID || '00000000-0000-0000-0000-000000000001';

// ==================== Query Keys ====================

export const agentKeys = {
  all: ['agents'] as const,
  config: (agentId: string) => [...agentKeys.all, agentId, 'config'] as const,
  versions: (agentId: string) => [...agentKeys.all, agentId, 'versions'] as const,
  audit: (agentId: string) => [...agentKeys.all, agentId, 'audit'] as const,
};

export const providerKeys = {
  all: ['providers'] as const,
  whitelists: () => [...providerKeys.all, 'whitelists'] as const,
};

export const toolKeys = {
  all: ['tools'] as const,
  definitions: () => [...toolKeys.all, 'definitions'] as const,
};

// ==================== Hooks ====================

/**
 * Fetch agent configuration
 */
export function useAgentConfig(agentId: string = DEFAULT_AGENT_ID) {
  return useQuery({
    queryKey: agentKeys.config(agentId),
    queryFn: () => apiClient.getAgentConfig(agentId),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch configuration version history
 */
export function useConfigVersions(agentId: string = DEFAULT_AGENT_ID, limit: number = 10) {
  return useQuery({
    queryKey: agentKeys.versions(agentId),
    queryFn: () => apiClient.getConfigVersions(agentId, limit),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch audit log
 */
export function useAuditLog(agentId: string = DEFAULT_AGENT_ID, limit: number = 50) {
  return useQuery({
    queryKey: agentKeys.audit(agentId),
    queryFn: () => apiClient.getAuditLog(agentId, limit),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Update agent configuration
 */
export function useUpdateAgentConfig(agentId: string = DEFAULT_AGENT_ID) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: AgentConfigRequest) => 
      apiClient.updateAgentConfig(agentId, config),
    onSuccess: (data: AgentConfigResponse) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.config(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.versions(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.audit(agentId) });
      
      toast.success('Configuration updated successfully', {
        description: `Version ${data.version} is now active`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update configuration', {
        description: error.message,
      });
    },
  });
}

/**
 * Fetch provider whitelists
 */
export function useProviderWhitelists() {
  return useQuery({
    queryKey: providerKeys.whitelists(),
    queryFn: () => apiClient.getProviderWhitelists(),
    staleTime: 300000, // 5 minutes (whitelists don't change often)
  });
}

/**
 * Fetch tool definitions
 */
export function useToolDefinitions() {
  return useQuery({
    queryKey: toolKeys.definitions(),
    queryFn: () => apiClient.getToolDefinitions(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Health check
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 10000, // 10 seconds
    retry: 3,
  });
}

