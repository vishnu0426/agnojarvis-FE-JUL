import { useQuery } from '@tanstack/react-query';
import { apiClient, type SessionsResponse } from '@/services/api';

// Query keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: () => [...sessionKeys.lists()] as const,
};

// ==================== Hooks ====================

/**
 * Fetch all sessions
 */
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => apiClient.getSessions(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time updates
  });
}

