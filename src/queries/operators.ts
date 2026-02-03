import { useQuery } from '@tanstack/react-query'
import {
  operators,
  getOperatorById,
  getVenuesByOperatorId,
  getContactsByOperatorId,
  getInteractionsByOperatorId,
  getTodosByOperatorId,
} from '../lib/mock-data'

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
      await new Promise(resolve => setTimeout(resolve, 100))
      return operators
    },
  })
}

export function useOperator(id: string) {
  return useQuery({
    queryKey: operatorKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getOperatorById(id)
    },
    enabled: !!id,
  })
}

export function useOperatorVenues(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.venues(operatorId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getVenuesByOperatorId(operatorId)
    },
    enabled: !!operatorId,
  })
}

export function useOperatorContacts(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.contacts(operatorId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getContactsByOperatorId(operatorId)
    },
    enabled: !!operatorId,
  })
}

export function useOperatorInteractions(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.interactions(operatorId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getInteractionsByOperatorId(operatorId)
    },
    enabled: !!operatorId,
  })
}

export function useOperatorTodos(operatorId: string) {
  return useQuery({
    queryKey: operatorKeys.todos(operatorId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getTodosByOperatorId(operatorId)
    },
    enabled: !!operatorId,
  })
}
