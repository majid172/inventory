<template>
  <div
    class="min-h-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-200 font-sans flex flex-col justify-between select-none">
    <!-- Top Minimal Header -->
    <header
      class="h-10 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">💊</span>
        <span class="font-normal text-slate-800 dark:text-gray-100 tracking-wide">
          {{ settingsStore.systemSettings.platformName.toUpperCase() }} ERP
        </span>
        <span
          class="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 border border-emerald-300 dark:border-emerald-800">
          Store Subscription Renewal
        </span>
      </div>

      <NuxtLink to="/login" class="text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 font-normal">
        ← Back to Sign In
      </NuxtLink>
    </header>

    <!-- Center Renewal Workspace -->
    <main class="max-w-md mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
      <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xs p-6 space-y-4">

        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-gray-800 pb-3">
          <h1 class="text-base font-normal text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>🔄</span> Renew Store Subscription
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-normal">
            Select your plan & payment method to reactivate your pharmacy store
          </p>
        </div>

        <!-- Alert Error Message -->
        <div v-if="renewError"
          class="p-3 border text-xs font-medium space-y-1 shadow-xs bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-start justify-between gap-2">
          <div class="flex items-start gap-2">
            <span class="text-base leading-none">⚠️</span>
            <p class="leading-relaxed">{{ renewError }}</p>
          </div>
          <button @click="renewError = ''"
            class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer text-xs font-bold">✕</button>
        </div>

        <!-- Success Alert -->
        <div v-if="renewSuccess"
          class="p-2.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <span>✅</span>
          <span>{{ renewSuccess }}</span>
        </div>

        <!-- Simple Clean Form (Matching Login UI) -->
        <form @submit.prevent="handleRenew" class="space-y-3.5 text-xs">
          <!-- Store Email or Owner Email -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
              Account Email <span class="text-rose-500">*</span>
            </label>
            <input v-model="email" type="email" required autofocus placeholder="e.g. owner@medicare.com"
              class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs" />
          </div>

          <!-- Select Subscription Plan -->
          <div>
            <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
              Select Plan <span class="text-rose-500">*</span>
            </label>
            <select v-model="selectedPlanId" required
              class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-2.5 py-2 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs">
              <option v-for="plan in availablePlans" :key="plan.id" :value="plan.id">
                {{ plan.name }} — {{ settingsStore.currencySymbol }}{{ plan.priceMonthly }}
              </option>
            </select>
          </div>

          <!-- Payment Method & Transaction ID -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Payment Method <span class="text-rose-500">*</span>
              </label>
              <select v-model="paymentMethod" required
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-2.5 py-2 text-slate-800 dark:text-gray-200 outline-none focus:border-[#107c41] text-xs">
                <option value="bkash">bKash Mobile Banking</option>
                <option value="nagad">Nagad Mobile Banking</option>
                <option value="rocket">Rocket Mobile Banking</option>
                <option value="bank">Bank Wire Transfer</option>
                <option value="card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Trx ID / Reference <span class="text-rose-500">*</span>
              </label>
              <input v-model="trxNo" type="text" required placeholder="e.g. TRX98274102"
                class="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 px-3 py-2 text-slate-800 dark:text-gray-200 font-mono outline-none focus:border-[#107c41] text-xs" />
            </div>
          </div>

          <!-- Total Summary Box -->
          <div class="p-2.5 bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-gray-400">Total Renewal Fee:</span>
            <span class="font-bold text-[#107c41] dark:text-emerald-400 text-sm">
              {{ settingsStore.currencySymbol }}{{ calculatedPrice }}
            </span>
          </div>

          <!-- Renew Submit Button -->
          <button type="submit" :disabled="loading"
            class="w-full bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-60">
            <span v-if="loading" class="inline-block animate-spin">🔄</span>
            <span>{{ loading ? 'Processing Renewal...' : 'Renew Subscription & Reactivate Access' }}</span>
          </button>
        </form>

        <div class="text-center border-t border-slate-200 dark:border-gray-800 pt-3">
          <NuxtLink to="/login" class="text-slate-500 dark:text-gray-400 hover:text-[#107c41] dark:hover:text-emerald-400 text-[11px]">
            Already renewed? Proceed to Sign In →
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Bottom Footer -->
    <footer
      class="h-8 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between text-[11px] text-slate-500 font-normal">
      <div>{{ settingsStore.systemSettings.platformName }} SaaS Enterprise</div>
      <div class="font-mono">v2.4 Subscription Portal</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useSettingsStore } from '~/stores/settings';

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();
const { setAuthSession } = useAuth() as any;

const email = ref('');
const selectedPlanId = ref<number | string>(2); // Default Pro
const paymentMethod = ref('bkash');
const trxNo = ref('');

const loading = ref(false);
const renewError = ref('');
const renewSuccess = ref('');

// Fallback plans list
const availablePlans = ref([
  { id: 1, name: 'Starter Tier', priceMonthly: 49 },
  { id: 2, name: 'Pro Tier (Recommended)', priceMonthly: 149 },
  { id: 3, name: 'Enterprise Tier', priceMonthly: 399 }
]);

// Pre-fill email from route query if passed from login
onMounted(async () => {
  if (route.query.email) {
    email.value = String(route.query.email);
  }

  // Fetch dynamic plans from API if available
  try {
    const res = await fetch('http://localhost:5000/api/plans');
    const data = await res.json();
    if (data.success && data.plans && data.plans.length > 0) {
      availablePlans.value = data.plans.map((p: any) => ({
        id: p.id,
        name: p.name,
        priceMonthly: p.priceMonthly || p.price || 149
      }));
    }
  } catch (e) {
    // Keep fallback plans
  }
});

const calculatedPrice = computed(() => {
  const currentPlan = availablePlans.value.find(p => String(p.id) === String(selectedPlanId.value));
  return currentPlan ? currentPlan.priceMonthly : 149;
});

const handleRenew = async () => {
  if (!email.value.trim()) {
    renewError.value = 'Please enter your account email.';
    return;
  }
  if (!trxNo.value.trim()) {
    renewError.value = 'Please enter the payment Transaction ID / Reference.';
    return;
  }

  loading.value = true;
  renewError.value = '';
  renewSuccess.value = '';

  try {
    const res = await fetch('http://localhost:5000/api/auth/register-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        planId: selectedPlanId.value,
        gateway: paymentMethod.value,
        trx_no: trxNo.value.trim()
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      renewSuccess.value = data.message || 'Subscription renewal submitted successfully!';

      if (data.isPending) {
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.value.trim())}&pending=true`);
        }, 2200);
      } else if (data.token && data.user) {
        setAuthSession(data.token, data.user);
        setTimeout(() => {
          router.push('/admin');
        }, 1200);
      } else {
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.value.trim())}&renewed=true`);
        }, 1500);
      }
    } else {
      renewError.value = data.message || 'Renewal failed. Please verify your details or contact support.';
    }
  } catch (err: any) {
    console.error('Renewal Error:', err);
    renewError.value = err.message || 'Network error occurred while processing renewal.';
  } finally {
    loading.value = false;
  }
};
</script>
