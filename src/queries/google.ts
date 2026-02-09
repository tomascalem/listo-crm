import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { googleApi } from '@/lib/api';

export const googleKeys = {
  all: ['google'] as const,
  status: () => [...googleKeys.all, 'status'] as const,
};

/**
 * Get Google connection status
 * Automatically refetches every 30 seconds to keep sync status updated
 */
export function useGoogleStatus() {
  return useQuery({
    queryKey: googleKeys.status(),
    queryFn: () => googleApi.getConnectionStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Connect Google account
 * Redirects to Google OAuth consent screen
 */
export function useConnectGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { authUrl } = await googleApi.getAuthUrl();
      // Redirect to Google OAuth
      window.location.href = authUrl;
    },
  });
}

/**
 * Disconnect Google account
 */
export function useDisconnectGoogle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => googleApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleKeys.status() });
    },
  });
}

/**
 * Sync Google Calendar events
 */
export function useSyncCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fullSync?: boolean) => googleApi.syncCalendar(fullSync),
    onSuccess: () => {
      // Invalidate Google status to update lastCalendarSync
      queryClient.invalidateQueries({ queryKey: googleKeys.status() });
      // Invalidate events since new events may have been synced
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Also invalidate dashboard schedule
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
