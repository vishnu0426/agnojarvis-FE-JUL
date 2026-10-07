/**
 * React Query hooks for Egress (Recordings)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

// ==================== Query Keys ====================

export const egressKeys = {
  all: ['egress'] as const,
  list: () => [...egressKeys.all, 'list'] as const,
  detail: (egressId: string) => [...egressKeys.all, egressId] as const,
};

export const recordingKeys = {
  all: ['recordings'] as const,
  list: () => [...recordingKeys.all, 'list'] as const,
};

// ==================== Hooks ====================

/**
 * Fetch all egress (recordings)
 */
export function useEgress() {
  return useQuery({
    queryKey: egressKeys.list(),
    queryFn: () => apiClient.getEgress(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

/**
 * Fetch specific egress details
 */
export function useEgressById(egressId: string) {
  return useQuery({
    queryKey: egressKeys.detail(egressId),
    queryFn: () => apiClient.getEgressById(egressId),
    staleTime: 10000, // 10 seconds
    enabled: !!egressId,
  });
}

/**
 * Delete egress (stop recording)
 */
export function useDeleteEgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (egressId: string) => apiClient.deleteEgress(egressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: egressKeys.list() });
      toast.success('Recording stopped successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to stop recording', {
        description: error.message,
      });
    },
  });
}

/**
 * Fetch all recordings from the database (historical + active).
 * This is the preferred hook for the Recordings page because it reads
 * from the call_recordings table instead of the LiveKit egress API
 * (which only returns active/in-progress egresses).
 */
export function useAllRecordings(limit = 100, offset = 0) {
  return useQuery({
    queryKey: [...recordingKeys.list(), limit, offset],
    queryFn: () => apiClient.getAllRecordings(limit, offset),
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

