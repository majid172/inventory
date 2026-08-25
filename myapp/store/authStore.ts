import { create } from 'zustand';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'PHARMACIST' | 'CASHIER' | 'VIEWER';
  storeName?: string;
  planId?: string;
  tenantStatus?: string;
  subscriptionEnd?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  superAdminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  clearError: () => void;
  fetchMe: () => Promise<void>;
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pharma_token');
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('pharma_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!getStoredToken(),

  setUser: (user, token) => {
    localStorage.setItem('pharma_token', token);
    localStorage.setItem('pharma_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        get().setUser(data.user, data.token);
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false, error: data.message || 'Login failed.' });
      return { success: false, error: data.message };
    } catch {
      const msg = 'Network error. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  superAdminLogin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/auth/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        get().setUser(data.user, data.token);
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false, error: data.message || 'Login failed.' });
      return { success: false, error: data.message };
    } catch {
      const msg = 'Network error. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        set({ user: data.user });
        localStorage.setItem('pharma_user', JSON.stringify(data.user));
      }
    } catch { /* silently fail */ }
  }
}));
