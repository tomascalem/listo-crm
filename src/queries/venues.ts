import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { venuesApi } from '../lib/api'

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...venueKeys.lists(), filters] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  contacts: (id: string) => [...venueKeys.detail(id), 'contacts'] as const,
  interactions: (id: string) => [...venueKeys.detail(id), 'interactions'] as const,
  todos: (id: string) => [...venueKeys.detail(id), 'todos'] as const,
}

export function useVenues(filters?: { status?: string; type?: string; stage?: string; search?: string }) {
  return useQuery({
    queryKey: venueKeys.list(filters || {}),
    queryFn: async () => {
      const response = await venuesApi.list({
        status: filters?.status !== 'all' ? filters?.status : undefined,
        type: filters?.type !== 'all' ? filters?.type : undefined,
        stage: filters?.stage !== 'all' ? filters?.stage : undefined,
        search: filters?.search || undefined,
      })
      return response.items
    },
  })
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: () => venuesApi.getById(id),
    enabled: !!id,
  })
}

export function useVenueContacts(venueId: string) {
  return useQuery({
    queryKey: venueKeys.contacts(venueId),
    queryFn: () => venuesApi.getContacts(venueId),
    enabled: !!venueId,
  })
}

export function useVenueInteractions(venueId: string) {
  return useQuery({
    queryKey: venueKeys.interactions(venueId),
    queryFn: () => venuesApi.getInteractions(venueId),
    enabled: !!venueId,
  })
}

export function useVenueTodos(venueId: string) {
  return useQuery({
    queryKey: venueKeys.todos(venueId),
    queryFn: () => venuesApi.getTodos(venueId),
    enabled: !!venueId,
  })
}

export function useCreateVenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => venuesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all })
    },
  })
}

export function useUpdateVenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => venuesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
    },
  })
}

export function useUpdateVenueStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => venuesApi.updateStage(id, stage),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
    },
  })
}

export function useDeleteVenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => venuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all })
    },
  })
}
