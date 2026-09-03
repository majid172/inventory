<template>
  <div
    class="min-h-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-200 font-sans flex flex-col justify-between select-none">
    <!-- Top Minimal Header -->
    <header
      class="h-10 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">💊</span>
        <span class="font-normal text-slate-800 dark:text-gray-100 tracking-wide">{{
          settingsStore.systemSettings.platformName.toUpperCase() }} ERP</span>
        <span
          class="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 border border-emerald-300 dark:border-emerald-800">
          Desktop Edition
        </span>
      </div>

      <NuxtLink to="/" class="text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 font-normal">
        ← Public Portal
      </NuxtLink>
    </header>

    <!-- Center Login Workspace -->
    <main class="max-w-sm mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
      <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xs p-6 space-y-4">

        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>🔐</span> Account Sign In
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-normal">
            Enter your credentials to access the workspace
          </p>
        </div>

        <!-- Subscription Expired / Account Inactive Error Alert -->
        <div v-if="authError" class="p-3 border text-xs font-medium space-y-1 shadow-xs"
          :class="isSubscriptionExpired ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400'">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2">
              <span class="text-base leading-none">{{ isSubscriptionExpired ? '🚨' : '⚠️' }}</span>
              <div>
                <strong v-if="isSubscriptionExpired"
                  class="block font-bold text-xs mb-0.5 text-amber-800 dark:text-amber-300">Subscription Expired /
                  Access Suspended</strong>
                <p class="leading-relaxed">{{ authError }}</p>
              </div>
            </div>
            <button @click="authError = ''"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer text-xs font-bold">✕</button>
          </div>
          <div v-if="isSubscriptionExpired"
            class="pt-2 mt-1 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <span class="text-[10px] text-amber-700 dark:text-amber-300">Need to renew your store subscription?</span>
            <NuxtLink to="/subscribe"
              class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-xs">
              Renew Plan →
            </NuxtLink>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="authSuccess"
          class="p-2.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <span>✅</span>
          <span>{{ authSuccess }}</span>
        </div>

        <!-- Simple Clean Form -->
        <form @submit.prevent="handleSignIn" class="space-y-3.5 text-xs">
          <!-- Email / Username -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
              Email or Username
            </label>
            <input v-model="identifier" type="text" required autofocus placeholder="e.g. admin@medicare.com or admin"
              class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs" />
          </div>

          <!-- Password -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" required placeholder="••••••••"
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 pl-3 pr-9 py-2 text-slate-800 dark:text-gray-200 font-mono outline-none focus:border-[#107c41] text-xs" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 cursor-pointer p-0.5 focus:outline-none"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'">
                <!-- Eye Open Icon (Show) -->
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye Closed / Slash Icon (Hide) -->
                <svg v-else class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me + Forgot Password -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-gray-400 font-normal">
              <input type="checkbox" v-model="rememberMe" class="accent-[#107c41]" />
              <span>Remember me</span>
            </label>
            <div class="flex flex-col items-end gap-0.5">
              <NuxtLink to="/login/forgot-password"
                class="text-slate-400 dark:text-gray-500 hover:text-[#107c41] dark:hover:text-emerald-400 font-normal text-[11px] transition-colors">
                Forgot password?
              </NuxtLink>

            </div>
          </div>


          <!-- Sign In Button (Solid Green #107c41) -->
          <button type="submit" :disabled="loading"
            class="w-full bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal py-2 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-60">
            <span v-if="loading" class="inline-block animate-spin">🔄</span>
            <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
          </button>
        </form>
      </div>
    </main>

    <!-- Bottom Footer -->
    <footer
      class="h-8 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-[11px] text-slate-500 font-normal">
      <div>{{ settingsStore.systemSettings.platformName }} SaaS Enterprise</div>
      <div class="font-mono">v2.4 Desktop ERP</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useSettingsStore } from '~/stores/settings';

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();
const { setAuthSession } = useAuth() as any;

const identifier = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(true);
const loading = ref(false);
const authError = ref('');
const isSubscriptionExpired = ref(false);
const authSuccess = ref('');

onMounted(() => {
  if (route.query.reason == 'subscription_expired') {
    authError.value = '⚠️ Subscription Expired! Your store plan has ended. Please renew to regain access.';
    isSubscriptionExpired.value = true;
  }
});

const handleSignIn = async () => {
  if (!identifier.value.trim() || !password.value.trim()) {
    authError.value = 'Please enter both email/username and password.';
    isSubscriptionExpired.value = false;
    return;
  }

  loading.value = true;
  authError.value = '';
  isSubscriptionExpired.value = false;
  authSuccess.value = '';

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: identifier.value.trim(),
        password: password.value
      })
    });

    const data = await res.json();

    if (res.ok && data.success && data.token) {
      authSuccess.value = 'Sign in successful! Redirecting...';

      const user = data.user || {
        id: '1',
        name: identifier.value,
        email: identifier.value,
        role: 'STORE_ADMIN'
      };

      if (process.client) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('is_logged_in', 'true');
        if (user.role === 'SUPER_ADMIN' || user.role === 'superadmin') {
          localStorage.setItem('is_super_admin', 'true');
        } else {
          localStorage.removeItem('is_super_admin');
        }
      }

      const normRole = (user.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');

      setTimeout(() => {
        if (normRole === 'SUPERADMIN' || identifier.value.includes('superadmin')) {
          router.push('/super-admin');
        } else if (normRole === 'CASHIER' || normRole === 'POSUSER') {
          router.push('/pos');
        } else {
          router.push('/admin');
        }
      }, 250);
    } else {
      authError.value = data.message || 'Invalid email or password. Please try again.';
      if (data.code === 'SUBSCRIPTION_EXPIRED' || (data.message && (data.message.toLowerCase().includes('expire') || data.message.toLowerCase().includes('inactive') || data.message.toLowerCase().includes('suspend')))) {
        isSubscriptionExpired.value = true;
      }
    }
  } catch (err: any) {
    authError.value = err.message || 'Error connecting to authentication server.';
  } finally {
    loading.value = false;
  }
};
</script>
