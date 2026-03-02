/**
 * React Query hooks for Dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// ==================== Query Keys ====================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
};

// ==================== Hooks ====================

/**
 * Fetch dashboard metrics (combines rooms and sessions data)
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      // Fetch rooms and sessions in parallel
      const [roomsData, sessionsData] = await Promise.all([
        apiClient.getRooms(),
        apiClient.getSessions(),
      ]);

      // Calculate metrics
      const activeRooms = roomsData.rooms.length;
      const totalSessions = sessionsData.sessions.length;

      // Calculate total participants across all active rooms
      const totalParticipants = roomsData.rooms.reduce(
        (sum, room) => sum + room.participants,
        0
      );

      // Calculate total duration from sessions (in minutes)
      const totalDuration = sessionsData.sessions.reduce((sum, session) => {
        if (session.duration) {
          // Parse duration string (HH:MM:SS format)
          const parts = session.duration.split(':');
          if (parts.length === 3) {
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            return sum + (hours * 60 + minutes + seconds / 60);
          }
        }
        return sum;
      }, 0);

      // Get recent sessions (last 10)
      const recentSessions = sessionsData.sessions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      return {
        activeRooms,
        totalSessions,
        totalParticipants,
        totalDuration: Math.round(totalDuration),
        rooms: roomsData.rooms,
        recentSessions,
      };
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

