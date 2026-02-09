import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '../lib/api'

export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...fileKeys.lists(), filters] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
  byEntity: (entityType: string, entityId: string) => [...fileKeys.all, 'entity', entityType, entityId] as const,
}

export function useFiles(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: entityType && entityId
      ? fileKeys.byEntity(entityType, entityId)
      : fileKeys.list({}),
    queryFn: async () => {
      const response = await filesApi.list({ entityType, entityId })
      return response.items
    },
    enabled: !entityType || (!!entityType && !!entityId),
  })
}

export function useFile(id: string) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => filesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => filesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
    },
  })
}

export function useUpdateFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => filesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
    },
  })
}

export function useFileDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...fileKeys.detail(id), 'download'] as const,
    queryFn: () => filesApi.getDownloadUrl(id),
    enabled: !!id,
  })
}

export function useGetUploadUrl() {
  return useMutation({
    mutationFn: (data: { fileName: string; mimeType: string; entityType: string; entityId: string }) =>
      filesApi.getUploadUrl(data),
  })
}
