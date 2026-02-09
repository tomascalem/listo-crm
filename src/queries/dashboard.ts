import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '../lib/api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  todos: () => [...dashboardKeys.all, 'todos'] as const,
  schedule: (date?: string) => [...dashboardKeys.all, 'schedule', date] as const,
  recommendedActions: () => [...dashboardKeys.all, 'recommended-actions'] as const,
  insights: () => [...dashboardKeys.all, 'insights'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
  })
}

export function useDashboardTodos(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.todos(),
    queryFn: () => dashboardApi.getTodos(limit),
  })
}

export function useDashboardSchedule(date?: string) {
  return useQuery({
    queryKey: dashboardKeys.schedule(date),
    queryFn: () => dashboardApi.getSchedule(date),
  })
}

export function useRecommendedActions() {
  return useQuery({
    queryKey: dashboardKeys.recommendedActions(),
    queryFn: () => dashboardApi.getRecommendedActions(),
  })
}

export function useBusinessInsights(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.insights(),
    queryFn: () => dashboardApi.getInsights(limit),
  })
}

export function useDismissRecommendedAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dashboardApi.dismissRecommendedAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recommendedActions() })
    },
  })
}

export function useCompleteRecommendedAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dashboardApi.completeRecommendedAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recommendedActions() })
    },
  })
}

export function useMarkInsightRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dashboardApi.markInsightRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.insights() })
    },
  })
}
