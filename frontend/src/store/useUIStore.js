import { create } from 'zustand';

const getTodayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const useUIStore = create((set, get) => ({
  selectedDate: getTodayString(),
  setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),
  goToPreviousDay: () => {
    const current = new Date(get().selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    set({ selectedDate: `${y}-${m}-${d}` });
  },
  goToNextDay: () => {
    const current = new Date(get().selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    set({ selectedDate: `${y}-${m}-${d}` });
  },
  goToToday: () => set({ selectedDate: getTodayString() }),

  // Global Toasts
  toasts: [],
  addToast: (message, type = 'success', durationMs = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, durationMs);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // Active Modals: 'foodSearch' | 'logExercise' | 'logWater' | 'logWeight' | null
  activeModal: null,
  modalData: null,
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Mobile sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
