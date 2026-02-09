import { useQuery } from '@tanstack/react-query'
import { operatorsApi, interactionsApi, todosApi } from '../lib/api'

export const operatorKeys = {
  all: ['operators'] as const,
  lists: () => [...operatorKeys.all, 'list'] as const,
  details: () => [...operatorKeys.all, 'detail'] as const,
  detail: (id: string) => [...operatorKeys.details(), id] as const,
  venues: (id: string) => [...operatorKeys.detail(id), 'venues'] as const,
  contacts: (id: string) => [...operatorKeys.detail(id), 'contacts'] as const,
  interactions: (id: string) => [...operatorKeys.detail(id), 'interactions'] as const,
  todos: (id: string) => [...operatorKeys.detail(id), 'todos'] as const,
}

export function useOperators() {
  return useQuery({
    queryKey: operatorKeys.lists(),
    queryFn: async () => {
      const response = await operatorsApi.list()
      return response.items
    },
  })
}

export function useOperator(id: string) {
  return useQuery({
    queryKey: operatorKeys.detail(id),
    queryFn: () => operatorsApi.getById(id),
    enabled: !!id,
  })
}

export function useOperatorVenues(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.venues(operatorId),
    queryFn: () => operatorsApi.getVenues(operatorId),
    enabled: !!operatorId,
  })
}

export function useOperatorContacts(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.contacts(operatorId),
    queryFn: () => operatorsApi.getContacts(operatorId),
    enabled: !!operatorId,
  })
}

export function useOperatorInteractions(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.interactions(operatorId),
    queryFn: async () => {
      // Get venues for this operator, then get interactions for each venue
      const venues = await operatorsApi.getVenues(operatorId)
      const allInteractions: any[] = []
      for (const venue of venues) {
        try {
          const response = await interactionsApi.list({ venueId: venue.id })
          if (response.items) {
            allInteractions.push(...response.items)
          }
        } catch {
          // Skip venues without interactions
        }
      }
      return allInteractions
    },
    enabled: !!operatorId,
  })
}

export function useOperatorTodos(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.todos(operatorId),
    queryFn: async () => {
      // Get venues for this operator, then get todos for each venue
      const venues = await operatorsApi.getVenues(operatorId)
      const allTodos: any[] = []
      for (const venue of venues) {
        try {
          const response = await todosApi.list({ venueId: venue.id })
          if (response.items) {
            allTodos.push(...response.items)
          }
        } catch {
          // Skip venues without todos
        }
      }
      return allTodos
    },
    enabled: !!operatorId,
  })
}
