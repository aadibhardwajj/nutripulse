import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('nutripulse_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })(),
  token: localStorage.getItem('nutripulse_token') || null,
  isAuthenticated: !!localStorage.getItem('nutripulse_token'),
  isLoading: false,
  error: null,
  profile: null,
  goals: null,

  setAuth: (user, token) => {
    localStorage.setItem('nutripulse_token', token);
    localStorage.setItem('nutripulse_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('nutripulse_token');
    localStorage.removeItem('nutripulse_user');
    set({ user: null, token: null, isAuthenticated: false, profile: null, goals: null });
  },

  fetchCurrentUser: async () => {
    if (!get().token) return;
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data.user,
        profile: res.data.profile,
        goals: res.data.goals,
        isLoading: false,
      });
      localStorage.setItem('nutripulse_user', JSON.stringify(res.data.user));
    } catch (err) {
      set({ isLoading: false, error: err.message });
      if (err.status === 401 || err.code === 'AUTH_TOKEN_EXPIRED' || err.code === 'AUTH_TOKEN_INVALID') {
        get().logout();
      }
    }
  },

  updateUserData: (updatedFields) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('nutripulse_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  setProfileAndGoals: (profile, goals) => {
    set({ profile, goals });
  },
}));

// Listen for global session expiration dispatched from api interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('nutripulse_session_expired', () => {
    useAuthStore.getState().logout();
  });
}
