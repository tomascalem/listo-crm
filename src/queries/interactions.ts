import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interactionsApi } from '../lib/api'

export const interactionKeys = {
  all: ['interactions'] as const,
  lists: () => [...interactionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...interactionKeys.lists(), filters] as const,
  details: () => [...interactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...interactionKeys.details(), id] as const,
  byVenue: (venueId: string) => [...interactionKeys.all, 'venue', venueId] as const,
  byContact: (contactId: string) => [...interactionKeys.all, 'contact', contactId] as const,
}

export function useInteractions(filters?: { venueId?: string; contactId?: string; userId?: string }) {
  return useQuery({
    queryKey: interactionKeys.list(filters || {}),
    queryFn: async () => {
      const response = await interactionsApi.list(filters)
      return response.items
    },
  })
}

export function useInteraction(id: string) {
  return useQuery({
    queryKey: interactionKeys.detail(id),
    queryFn: () => interactionsApi.getById(id),
    enabled: !!id,
  })
}

export function useInteractionsByVenue(venueId: string) {
  return useQuery({
    queryKey: interactionKeys.byVenue(venueId),
    queryFn: async () => {
      const response = await interactionsApi.list({ venueId })
      return response.items
    },
    enabled: !!venueId,
  })
}

export function useInteractionsByContact(contactId: string) {
  return useQuery({
    queryKey: interactionKeys.byContact(contactId),
    queryFn: async () => {
      const response = await interactionsApi.list({ contactId })
      return response.items
    },
    enabled: !!contactId,
  })
}

export function useCreateInteraction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => interactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all })
    },
  })
}

export function useUpdateInteraction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => interactionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() })
    },
  })
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => interactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all })
    },
  })
}
