import { create } from 'zustand';
import { api } from '../lib/api';
import { User } from '../types';

interface AdminAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data.data?.user) {
        const u: User = res.data.data.user;
        if (u.role === 'admin') {
          set({ user: u, isAuthenticated: true, isLoading: false });
          return true;
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return false;
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  setUser: (user) => {
    const isAdmin = user?.role === 'admin';
    set({ user: isAdmin ? user : null, isAuthenticated: isAdmin, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      set({ user: null, isAuthenticated: false });
    }
  },
}));
