<template>
  <div class="min-h-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-200 font-sans flex flex-col justify-between select-none">
    <!-- Top Header -->
    <header class="h-10 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">💊</span>
        <span class="font-normal text-slate-800 dark:text-gray-100 tracking-wide">{{ settingsStore.systemSettings.platformName.toUpperCase() }} ERP</span>
      </div>
      <NuxtLink to="/login" class="text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 font-normal text-xs">
        ← Back to Sign In
      </NuxtLink>
    </header>

    <!-- Center Workspace -->
    <main class="max-w-sm mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
      <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xs p-6 space-y-4">

        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>🔑</span> Forgot Password
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-normal">
            Enter your email to receive a password reset link
          </p>
        </div>

        <!-- Success State -->
        <div v-if="submitted" class="space-y-3">
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-xs space-y-2">
            <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <span class="text-base">✅</span>
              <span>Reset link sent!</span>
            </div>
            <p class="text-emerald-700 dark:text-emerald-400 leading-relaxed">
              If an account exists for <strong>{{ submittedEmail }}</strong>, a password reset link has been sent. Check your inbox (and spam folder).
            </p>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-gray-400 text-center">
            Didn't receive it?
            <button @click="submitted = false" class="text-[#107c41] hover:underline font-medium ml-1">Try again</button>
          </p>
          <NuxtLink
            to="/login"
            class="block w-full text-center border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 text-xs py-2 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Return to Sign In
          </NuxtLink>
        </div>

        <!-- Form State -->
        <template v-else>
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
          <form @submit.prevent="handleSubmit" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Account Email Address
              </label>
              <input
                v-model="email"
                type="email"
                required
                autofocus
                placeholder="e.g. laz@mail.com"
                :disabled="loading"
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs disabled:opacity-60"
              />
              <p class="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                Enter the email address associated with your pharmacy account.
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal py-2 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
            >
              <span v-if="loading" class="inline-block animate-spin">🔄</span>
              <span>{{ loading ? 'Sending Reset Link...' : 'Send Reset Link →' }}</span>
            </button>

            <div class="text-center pt-1">
              <NuxtLink to="/login" class="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-[11px]">
                Remember your password? Sign in
              </NuxtLink>
            </div>
          </form>
        </template>

      </div>

      <!-- Info Box -->
      <div class="mt-3 p-3 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 text-[11px] text-slate-500 dark:text-gray-400 space-y-1">
        <p class="font-medium text-slate-600 dark:text-gray-300">ℹ️ How it works:</p>
        <ul class="list-disc list-inside space-y-0.5 ml-1">
          <li>Enter your registered email address</li>
          <li>You will receive a reset link (valid for 30 minutes)</li>
          <li>Click the link to set a new password</li>
        </ul>
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
import { ref } from 'vue';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();

const email        = ref('');
const loading      = ref(false);
const errorMsg     = ref('');
const submitted    = ref(false);
const submittedEmail = ref('');

const API_BASE = 'http://localhost:5000/api';

const handleSubmit = async () => {
  errorMsg.value = '';
  const trimmedEmail = email.value.trim().toLowerCase();

  if (!trimmedEmail) {
    errorMsg.value = 'Please enter your email address.';
    return;
  }

  loading.value = true;

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      submittedEmail.value = trimmedEmail;
      submitted.value = true;
    } else {
      errorMsg.value = data.message || 'Something went wrong. Please try again.';
    }
  } catch (err: any) {
    errorMsg.value = 'Could not connect to server. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
