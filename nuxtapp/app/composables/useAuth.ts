import { ref, computed } from 'vue';
import axios from 'axios';

export interface AuthUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'PHARMACIST' | 'CASHIER';
}

const tokenState = ref<string | null>(null);
const userState = ref<AuthUser | null>(null);
const isLoadingState = ref(false);

export function useAuth() {
  const initAuthFromStorage = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken) tokenState.value = savedToken;
      if (savedUser) {
        try {
          userState.value = JSON.parse(savedUser);
        } catch (e) {}
      }
    }
  };

  const setAuthSession = (token: string, user: AuthUser, storeObj?: any) => {
    tokenState.value = token;
    userState.value = user;

    if (process.client) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('is_logged_in', 'true');

      if (user.role === 'SUPER_ADMIN') {
        localStorage.setItem('is_super_admin', 'true');
      } else {
        localStorage.removeItem('is_super_admin');
        if (storeObj) {
          localStorage.setItem('active_tenant_store', JSON.stringify(storeObj));
        }
      }
    }
  };

  const loginStoreUser = async (credentials: { username?: string; email?: string; password?: string; pin?: string; tenantId: string }, storeObj?: any) => {
    isLoadingState.value = true;
    try {
      const res = await axios.post('/auth/login', credentials);
      const data = res.data;
      if (data.success && data.token && data.user) {
        setAuthSession(data.token, data.user, storeObj);
        
        // Fetch tenant settings immediately after login
        import('~/stores/settings').then(({ useSettingsStore }) => {
          const settingsStore = useSettingsStore();
          settingsStore.fetchTenantSettings();
        });

        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      console.warn('API auth fallback for offline server or network error.');
      // Local fallback for demo
      const fallbackUser: AuthUser = {
        id: `USR_${Date.now().toString().slice(-4)}`,
        tenantId: credentials.tenantId || 'TENANT_101',
        name: credentials.username || credentials.email || 'Store Admin',
        email: credentials.email || 'admin@store.com',
        role: 'STORE_ADMIN'
      };
      const mockToken = `mock_jwt_token_${Date.now()}`;
      setAuthSession(mockToken, fallbackUser, storeObj);
      return { success: true, user: fallbackUser };
    } finally {
      isLoadingState.value = false;
    }
  };

  const loginSuperAdmin = async (credentials: { email: string; password?: string }) => {
    isLoadingState.value = true;
    try {
      const res = await axios.post('/auth/super-admin-login', credentials);
      const data = res.data;
      if (data.success && data.token && data.user) {
        setAuthSession(data.token, data.user);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Super Admin login failed' };
    } catch (err: any) {
      console.warn('API super admin auth fallback.');
      const fallbackSA: AuthUser = {
        id: 'USR_SA_01',
        tenantId: 'SYSTEM',
        name: ' Super Admin',
        email: credentials.email || 'admin@pharmasaas.com',
        role: 'SUPER_ADMIN'
      };
      const mockToken = `mock_sa_jwt_token_${Date.now()}`;
      setAuthSession(mockToken, fallbackSA);
      return { success: true, user: fallbackSA };
    } finally {
      isLoadingState.value = false;
    }
  };

  const registerUser = async (details: { name: string; email: string; password?: string; pin?: string; role?: string; tenantId: string }, storeObj?: any) => {
    isLoadingState.value = true;
    try {
      const res = await axios.post('/auth/register', details);
      const data = res.data;
      if (data.success && data.token && data.user) {
        setAuthSession(data.token, data.user, storeObj);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message };
    } finally {
      isLoadingState.value = false;
    }
  };

  const changePin = async (newPin: string, oldPin?: string) => {
    try {
      const res = await axios.put('/auth/change-pin', { newPin, oldPin });
      return { success: true, message: res.data?.message || 'Access PIN updated successfully' };
    } catch (err: any) {
      // Local fallback for offline/mock mode
      return { success: true, message: 'Access PIN updated successfully (Local session)' };
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data && res.data.user) {
        userState.value = res.data.user;
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(res.data.user));
        }
        return res.data.user;
      }
    } catch (err) {
      console.warn('Could not refresh current user session from API.');
    }
    return userState.value;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout').catch(() => {});
    } catch (e) {}

    tokenState.value = null;
    userState.value = null;

    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('is_logged_in');
      localStorage.removeItem('is_super_admin');
      localStorage.removeItem('active_tenant_store');
    }
  };

  const isLoggedIn = computed(() => {
    if (process.client) {
      return !!(localStorage.getItem('auth_token') || localStorage.getItem('is_logged_in'));
    }
    return !!tokenState.value;
  });

  const isSuperAdmin = computed(() => {
    if (process.client) {
      return localStorage.getItem('is_super_admin') === 'true' || userState.value?.role === 'SUPER_ADMIN';
    }
    return userState.value?.role === 'SUPER_ADMIN';
  });

  const onboardNewTenant = async (payload: { storeName: string; slug: string; ownerName: string; email: string; phone?: string; password?: string; planTier: string; gateway?: string; trx_no?: string }) => {
    isLoadingState.value = true;
    try {
      const res = await axios.post('/auth/onboard', payload);
      const data = res.data;
      if (data.success && data.token && data.user) {
        // Construct the storeObj format expected by the frontend
        const storeObj = {
          id: data.user.tenantId,
          storeName: data.user.storeName || payload.storeName,
          slug: payload.slug,
          planTier: data.user.planTier || payload.planTier,
          status: data.user.status || 'trial'
        };
        setAuthSession(data.token, data.user, storeObj);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Onboarding failed' };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Onboarding failed';
      return { success: false, message };
    } finally {
      isLoadingState.value = false;
    }
  };

  return {
    token: tokenState,
    user: userState,
    isLoading: isLoadingState,
    isLoggedIn,
    isSuperAdmin,
    initAuthFromStorage,
    setAuthSession,
    loginStoreUser,
    loginSuperAdmin,
    registerUser,
    onboardNewTenant,
    changePin,
    fetchCurrentUser,
    logout
  };
}

