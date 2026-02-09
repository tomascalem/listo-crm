import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractsApi } from '../lib/api'

export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contractKeys.lists(), filters] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  byEntity: (entityType: string, entityId: string) => [...contractKeys.all, 'entity', entityType, entityId] as const,
}

export function useContracts(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: entityType && entityId
      ? contractKeys.byEntity(entityType, entityId)
      : contractKeys.list({}),
    queryFn: async () => {
      const response = await contractsApi.list({ entityType, entityId })
      return response.items
    },
    enabled: !entityType || (!!entityType && !!entityId),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => contractsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contractsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}

export function useContractDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...contractKeys.detail(id), 'download'] as const,
    queryFn: () => contractsApi.getDownloadUrl(id),
    enabled: !!id,
  })
}
