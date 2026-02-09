import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../lib/api'

export const analyticsKeys = {
  all: ['analytics'] as const,
  pipeline: () => [...analyticsKeys.all, 'pipeline'] as const,
  revenue: () => [...analyticsKeys.all, 'revenue'] as const,
  activity: () => [...analyticsKeys.all, 'activity'] as const,
  performance: () => [...analyticsKeys.all, 'performance'] as const,
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: analyticsKeys.pipeline(),
    queryFn: () => analyticsApi.getPipelineMetrics(),
  })
}

export function useRevenueMetrics() {
  return useQuery({
    queryKey: analyticsKeys.revenue(),
    queryFn: () => analyticsApi.getRevenueMetrics(),
  })
}

export function useActivityMetrics() {
  return useQuery({
    queryKey: analyticsKeys.activity(),
    queryFn: () => analyticsApi.getActivityMetrics(),
  })
}

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: () => analyticsApi.getPerformanceMetrics(),
  })
}
