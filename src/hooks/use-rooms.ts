import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type RoomsResponse, type RoomDetails } from '@/services/api';
import { toast } from 'sonner';

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: () => [...roomKeys.lists()] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (roomName: string) => [...roomKeys.details(), roomName] as const,
};

// ==================== Hooks ====================

/**
 * Fetch all rooms
 */
export function useRooms() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: () => apiClient.getRooms(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time updates
  });
}

/**
 * Fetch room details
 */
export function useRoom(roomName: string) {
  return useQuery({
    queryKey: roomKeys.detail(roomName),
    queryFn: () => apiClient.getRoom(roomName),
    enabled: !!roomName,
    staleTime: 5 * 1000, // 5 seconds
  });
}

/**
 * Delete room mutation
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomName: string) => apiClient.deleteRoom(roomName),
    onSuccess: (data, roomName) => {
      // Invalidate rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomName) });

      toast.success('Room deleted successfully', {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete room', {
        description: error.message,
      });
    },
  });
}

