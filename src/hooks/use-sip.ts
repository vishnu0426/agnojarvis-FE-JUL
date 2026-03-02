/**
 * React Query hooks for SIP Trunks
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// ==================== Query Keys ====================

export const sipKeys = {
  all: ['sip'] as const,
  trunks: () => [...sipKeys.all, 'trunks'] as const,
};

// ==================== Hooks ====================

/**
 * Fetch all SIP trunks (inbound and outbound)
 */
export function useSIPTrunks() {
  return useQuery({
    queryKey: sipKeys.trunks(),
    queryFn: () => apiClient.getSIPTrunks(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}

