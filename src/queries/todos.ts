import { useQuery } from '@tanstack/react-query'
import { todos, getUserById } from '../lib/mock-data'

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...todoKeys.lists(), filters] as const,
}

export function useTodos(filters?: {
  status?: 'all' | 'pending' | 'completed'
  priority?: 'all' | 'low' | 'medium' | 'high'
  assignedTo?: string
  search?: string
}) {
  return useQuery({
    queryKey: todoKeys.list(filters || {}),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      let result = [...todos]

      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'completed') {
          result = result.filter(t => t.completed)
        } else if (filters.status === 'pending') {
          result = result.filter(t => !t.completed)
        }
      }

      if (filters?.priority && filters.priority !== 'all') {
        result = result.filter(t => t.priority === filters.priority)
      }

      if (filters?.assignedTo && filters.assignedTo !== 'all') {
        result = result.filter(t => t.assignedTo === filters.assignedTo)
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter(t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        )
      }

      // Sort by due date
      result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

      return result
    },
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return [
        getUserById('user-1'),
        getUserById('user-2'),
        getUserById('user-3'),
      ].filter(Boolean)
    },
  })
}
