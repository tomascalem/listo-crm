import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Modal states
  addVenueModalOpen: boolean
  setAddVenueModalOpen: (open: boolean) => void
  addContactModalOpen: boolean
  setAddContactModalOpen: (open: boolean) => void
  addTaskModalOpen: boolean
  setAddTaskModalOpen: (open: boolean) => void
  logActivityModalOpen: boolean
  setLogActivityModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addVenueModalOpen: false,
  setAddVenueModalOpen: (open) => set({ addVenueModalOpen: open }),
  addContactModalOpen: false,
  setAddContactModalOpen: (open) => set({ addContactModalOpen: open }),
  addTaskModalOpen: false,
  setAddTaskModalOpen: (open) => set({ addTaskModalOpen: open }),
  logActivityModalOpen: false,
  setLogActivityModalOpen: (open) => set({ logActivityModalOpen: open }),
}))
