import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todosApi, usersApi } from '../lib/api'

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
      const response = await todosApi.list({
        assignedTo: filters?.assignedTo !== 'all' ? filters?.assignedTo : undefined,
        completed: filters?.status === 'completed' ? true : filters?.status === 'pending' ? false : undefined,
      })

      let result = response.items

      // Client-side filtering for priority and search
      if (filters?.priority && filters.priority !== 'all') {
        result = result.filter((t: any) => t.priority === filters.priority)
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter((t: any) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        )
      }

      // Sort by due date
      result.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

      return result
    },
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list()
      // Handle both paginated response and direct array
      return response.items || response || []
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => todosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => todosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useToggleTodoComplete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosApi.toggleComplete(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
