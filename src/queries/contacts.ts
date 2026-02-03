import { useQuery } from '@tanstack/react-query'
import {
  contacts,
  getContactById,
  getContactsByVenueId,
  getContactsByOperatorId,
} from '../lib/mock-data'

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}

export function useContacts(filters?: { operatorId?: string; search?: string }) {
  return useQuery({
    queryKey: contactKeys.list(filters || {}),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      let result = [...contacts]
      if (filters?.operatorId) {
        result = getContactsByOperatorId(filters.operatorId)
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter(c =>
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
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getContactById(id)
    },
    enabled: !!id,
  })
}

export function useContactsByVenue(venueId: string) {
  return useQuery({
    queryKey: [...contactKeys.all, 'byVenue', venueId] as const,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getContactsByVenueId(venueId)
    },
    enabled: !!venueId,
  })
}
