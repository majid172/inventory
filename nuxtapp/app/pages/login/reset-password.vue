<template>
  <div class="min-h-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-200 font-sans flex flex-col justify-between select-none">
    <!-- Top Header -->
    <header class="h-10 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">💊</span>
        <span class="font-normal text-slate-800 dark:text-gray-100 tracking-wide">{{ settingsStore.systemSettings.platformName.toUpperCase() }} ERP</span>
      </div>
    </header>

    <!-- Center Workspace -->
    <main class="max-w-sm mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">

      <!-- Loading token verification -->
      <div v-if="verifying" class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 text-center space-y-3">
        <div class="text-2xl animate-spin inline-block">🔄</div>
        <p class="text-xs text-slate-500 dark:text-gray-400">Verifying reset link...</p>
      </div>

      <!-- Invalid / expired token -->
      <div v-else-if="tokenInvalid" class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 space-y-4">
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>❌</span> Invalid Reset Link
          </h1>
        </div>
        <div class="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
          {{ tokenInvalidMessage }}
        </div>
        <NuxtLink
          to="/login/forgot-password"
          class="block w-full text-center bg-[#107c41] hover:bg-[#0e6b37] text-white text-xs py-2 font-normal transition-colors"
        >
          Request a New Reset Link →
        </NuxtLink>
        <div class="text-center">
          <NuxtLink to="/login" class="text-slate-400 dark:text-gray-500 hover:text-slate-600 text-[11px]">← Back to Sign In</NuxtLink>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="resetDone" class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 space-y-4">
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>✅</span> Password Reset Successful
          </h1>
        </div>
        <div class="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
          Your password has been updated successfully. You can now sign in with your new password.
        </div>
        <NuxtLink
          to="/login"
          class="block w-full text-center bg-[#107c41] hover:bg-[#0e6b37] text-white text-xs py-2 font-normal transition-colors"
        >
          Sign In Now →
        </NuxtLink>
      </div>

      <!-- Reset Form -->
      <div v-else class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xs p-6 space-y-4">
        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>🔐</span> Set New Password
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
            Resetting password for: <strong class="text-slate-700 dark:text-gray-300">{{ tokenEmail }}</strong>
          </p>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMsg"
          class="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-start justify-between gap-2"
        >
          <div class="flex items-start gap-1.5">
            <span>⚠️</span>
            <span>{{ errorMsg }}</span>
          </div>
          <button @click="errorMsg = ''" class="text-rose-400 hover:text-rose-600 font-bold shrink-0">✕</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleReset" class="space-y-3.5 text-xs">
          <!-- New Password -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">New Password</label>
            <div class="relative">
              <input
                v-model="newPassword"
                :type="showNew ? 'text' : 'password'"
                required
                autofocus
                placeholder="Minimum 6 characters"
                :disabled="loading"
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 pr-10 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs font-mono disabled:opacity-60"
              />
              <button
                type="button"
                @click="showNew = !showNew"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 text-xs"
              >{{ showNew ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                required
                placeholder="Re-enter password"
                :disabled="loading"
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 pr-10 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs font-mono disabled:opacity-60"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 text-xs"
              >{{ showConfirm ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <!-- Password strength indicator -->
          <div v-if="newPassword" class="space-y-1">
            <div class="flex gap-1">
              <div
                v-for="i in 4" :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="passwordStrength >= i ? strengthColor : 'bg-slate-200 dark:bg-gray-700'"
              />
            </div>
            <p class="text-[10px]" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal py-2 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
          >
            <span v-if="loading" class="inline-block animate-spin">🔄</span>
            <span>{{ loading ? 'Updating Password...' : 'Set New Password' }}</span>
          </button>
        </form>
      </div>

    </main>

    <!-- Footer -->
    <footer class="h-8 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-[11px] text-slate-500 font-normal">
      <div>{{ settingsStore.systemSettings.platformName }} SaaS Enterprise</div>
      <div class="font-mono">v2.4 Desktop ERP</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();
const route  = useRoute();
const router = useRouter();

const API_BASE = 'http://localhost:5000/api';

const token          = ref('');
const tokenEmail     = ref('');
const verifying      = ref(true);
const tokenInvalid   = ref(false);
const tokenInvalidMessage = ref('This reset link is invalid or has expired.');
const resetDone      = ref(false);
const errorMsg       = ref('');
const loading        = ref(false);

const newPassword     = ref('');
const confirmPassword = ref('');
const showNew         = ref(false);
const showConfirm     = ref(false);

// Password strength
const passwordStrength = computed(() => {
  const p = newPassword.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-rose-400';
  if (passwordStrength.value === 2) return 'bg-amber-400';
  if (passwordStrength.value === 3) return 'bg-blue-400';
  return 'bg-emerald-500';
});

const strengthTextColor = computed(() => {
  if (passwordStrength.value <= 1) return 'text-rose-500';
  if (passwordStrength.value === 2) return 'text-amber-500';
  if (passwordStrength.value === 3) return 'text-blue-500';
  return 'text-emerald-500';
});

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[passwordStrength.value] || '';
});

// Verify token on mount
onMounted(async () => {
  token.value = (route.query.token as string) || '';

  if (!token.value) {
    tokenInvalid.value = true;
    tokenInvalidMessage.value = 'No reset token found. Please use the link from your email.';
    verifying.value = false;
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token.value)}`);
    const data = await res.json();

    if (data.valid) {
      tokenEmail.value = data.email || '';
    } else {
      tokenInvalid.value = true;
      tokenInvalidMessage.value = data.message || 'This reset link is invalid or has expired.';
    }
  } catch {
    tokenInvalid.value = true;
    tokenInvalidMessage.value = 'Could not verify reset link. Please try again.';
  } finally {
    verifying.value = false;
  }
});

const handleReset = async () => {
  errorMsg.value = '';

  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters long.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match. Please re-enter.';
    return;
  }

  loading.value = true;

  try {
    const res  = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, newPassword: newPassword.value })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      resetDone.value = true;
      // Auto-redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    } else {
      errorMsg.value = data.message || 'Failed to reset password. Please try again.';
      if (data.code === 'INVALID_OR_EXPIRED_TOKEN') {
        tokenInvalid.value = true;
        tokenInvalidMessage.value = data.message;
      }
    }
  } catch {
    errorMsg.value = 'Could not connect to server. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
