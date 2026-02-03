import { useQuery } from '@tanstack/react-query'
import {
  concessionaires,
  getConcessionaireById,
  getVenuesByConcessionaireId,
  getContactsByConcessionaireId,
} from '../lib/mock-data'

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
      await new Promise(resolve => setTimeout(resolve, 100))
      return concessionaires
    },
  })
}

export function useConcessionaire(id: string) {
  return useQuery({
    queryKey: concessionaireKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getConcessionaireById(id)
    },
    enabled: !!id,
  })
}

export function useConcessionaireVenues(concessionaireId: string) {
  return useQuery({
    queryKey: concessionaireKeys.venues(concessionaireId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getVenuesByConcessionaireId(concessionaireId)
    },
    enabled: !!concessionaireId,
  })
}

export function useConcessionaireContacts(concessionaireId: string) {
  return useQuery({
    queryKey: concessionaireKeys.contacts(concessionaireId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return getContactsByConcessionaireId(concessionaireId)
    },
    enabled: !!concessionaireId,
  })
}
