import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '../lib/api'

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}

export function useContacts(filters?: { operatorId?: string; venueId?: string; search?: string }) {
  return useQuery({
    queryKey: contactKeys.list(filters || {}),
    queryFn: async () => {
      const response = await contactsApi.list({
        operatorId: filters?.operatorId,
        venueId: filters?.venueId,
      })
      let result = response.items

      // Client-side search filter if provided
      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter((c: any) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query)
        )
      }
      return result
    },
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  })
}

export function useContactsByVenue(venueId: string) {
  return useQuery({
    queryKey: [...contactKeys.all, 'byVenue', venueId] as const,
    queryFn: async () => {
      const response = await contactsApi.list({ venueId })
      return response.items
    },
    enabled: !!venueId,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => contactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contactsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}
