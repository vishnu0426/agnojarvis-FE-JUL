/**
 * React Query hooks for Analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { format, subDays, parseISO } from 'date-fns';

// ==================== Query Keys ====================

export const analyticsKeys = {
  all: ['analytics'] as const,
  metrics: () => [...analyticsKeys.all, 'metrics'] as const,
};

// ==================== Hooks ====================

/**
 * Fetch analytics metrics with aggregated data and time-series
 */
export function useAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.metrics(),
    queryFn: async () => {
      // Fetch rooms and sessions in parallel
      const [roomsData, sessionsData] = await Promise.all([
        apiClient.getRooms(),
        apiClient.getSessions(),
      ]);

      // Calculate basic metrics
      const activeRooms = roomsData.rooms.length;
      const totalSessions = sessionsData.sessions.length;

      // Calculate total participants across all active rooms
      const totalParticipants = roomsData.rooms.reduce(
        (sum, room) => sum + room.participants,
        0
      );

      // Calculate total duration from sessions (in seconds)
      const totalDuration = sessionsData.sessions.reduce((sum, session) => {
        if (session.duration) {
          // Parse duration string (HH:MM:SS format)
          const parts = session.duration.split(':');
          if (parts.length === 3) {
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            return sum + (hours * 3600 + minutes * 60 + seconds);
          }
        }
        return sum;
      }, 0);

      // Calculate average duration
      const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

      // Call status breakdown
      const callStatusBreakdown = {
        completed: sessionsData.sessions.filter(s => s.status === 'ended' || s.status === 'completed').length,
        active: sessionsData.sessions.filter(s => s.status === 'active' || s.status === 'in-progress').length,
        failed: sessionsData.sessions.filter(s => s.status === 'failed').length,
        total: totalSessions,
      };

      // Time-series data (last 14 days)
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const sessionsOverTime = last14Days.map(dateStr => {
        const sessionsOnDate = sessionsData.sessions.filter(session => {
          const sessionDate = session.startTime || session.created_at;
          if (!sessionDate) return false;
          try {
            const parsedDate = parseISO(sessionDate);
            return format(parsedDate, 'yyyy-MM-dd') === dateStr;
          } catch {
            return false;
          }
        });

        const durationOnDate = sessionsOnDate.reduce((sum, session) => {
          if (session.duration) {
            const parts = session.duration.split(':');
            if (parts.length === 3) {
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              const seconds = parseInt(parts[2]) || 0;
              return sum + (hours * 3600 + minutes * 60 + seconds);
            }
          }
          return sum;
        }, 0);

        return {
          date: dateStr,
          count: sessionsOnDate.length,
          duration: durationOnDate,
        };
      });

      return {
        totalSessions,
        activeRooms,
        totalParticipants,
        totalDuration,
        averageDuration,
        callStatusBreakdown,
        sessionsOverTime,
        rooms: roomsData.rooms,
        recentSessions: sessionsData.sessions.slice(0, 10),
      };
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

