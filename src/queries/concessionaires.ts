import { useQuery } from '@tanstack/react-query'
import { concessionairesApi, contactsApi } from '../lib/api'

export const concessionaireKeys = {
  all: ['concessionaires'] as const,
  lists: () => [...concessionaireKeys.all, 'list'] as const,
  details: () => [...concessionaireKeys.all, 'detail'] as const,
  detail: (id: string) => [...concessionaireKeys.details(), id] as const,
  venues: (id: string) => [...concessionaireKeys.detail(id), 'venues'] as const,
  contacts: (id: string) => [...concessionaireKeys.detail(id), 'contacts'] as const,
}

export function useConcessionaires() {
  return useQuery({
    queryKey: concessionaireKeys.lists(),
    queryFn: async () => {
      const response = await concessionairesApi.list()
      return response.items
    },
  })
}

export function useConcessionaire(id: string) {
  return useQuery({
    queryKey: concessionaireKeys.detail(id),
    queryFn: () => concessionairesApi.getById(id),
    enabled: !!id,
  })
}

export function useConcessionaireVenues(concessionaireId: string) {
  return useQuery({
    queryKey: concessionaireKeys.venues(concessionaireId),
    queryFn: () => concessionairesApi.getVenues(concessionaireId),
    enabled: !!concessionaireId,
  })
}

export function useConcessionaireContacts(concessionaireId: string) {
  return useQuery({
    queryKey: concessionaireKeys.contacts(concessionaireId),
    queryFn: async () => {
      const response = await contactsApi.list({ concessionaireId })
      return response.items
    },
    enabled: !!concessionaireId,
  })
}
