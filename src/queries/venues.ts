import { useQuery } from '@tanstack/react-query'
import {
  venues,
  getVenueById,
  getContactsByVenueId,
  getInteractionsByVenueId,
  getTodosByVenueId,
} from '../lib/mock-data'

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

export function useVenues(filters?: { status?: string; type?: string; search?: string }) {
  return useQuery({
    queryKey: venueKeys.list(filters || {}),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      let result = [...venues]
      if (filters?.status && filters.status !== 'all') {
        result = result.filter(v => v.status === filters.status)
      }
      if (filters?.type && filters.type !== 'all') {
        result = result.filter(v => v.type === filters.type)
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter(v =>
          v.name.toLowerCase().includes(query) ||
          v.city.toLowerCase().includes(query)
        )
      }
      return result
    },
  })
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getVenueById(id)
    },
    enabled: !!id,
  })
}

export function useVenueContacts(venueId: string) {
  return useQuery({
    queryKey: venueKeys.contacts(venueId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getContactsByVenueId(venueId)
    },
    enabled: !!venueId,
  })
}

export function useVenueInteractions(venueId: string) {
  return useQuery({
    queryKey: venueKeys.interactions(venueId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getInteractionsByVenueId(venueId)
    },
    enabled: !!venueId,
  })
}

export function useVenueTodos(venueId: string) {
  return useQuery({
    queryKey: venueKeys.todos(venueId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getTodosByVenueId(venueId)
    },
    enabled: !!venueId,
  })
}
