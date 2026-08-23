<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
    <div class="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-8 relative">
      <!-- Top Decorative Warning Gradient Bar -->
      <div class="h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600"></div>

      <div class="p-6 sm:p-8 space-y-6 text-center">
        <!-- Lock Icon Badge -->
        <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-500/10 font-black animate-pulse">
          🔒
        </div>

        <!-- Lock Header Title -->
        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-black uppercase tracking-wider">
            🚨 Free Trial Period Completed
          </span>
          <h2 class="text-2xl font-black text-white tracking-tight">
            Store Access Locked
          </h2>
          <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            The <span class="text-white font-bold">14-Day Free Trial</span> for pharmacy tenant 
            <span class="text-rose-400 font-bold underline">{{ info.storeName }}</span> 
            expired on <span class="font-mono text-slate-300 font-bold">{{ info.nextBillingDate }}</span>. POS billing and ERP data access are currently restricted.
          </p>
        </div>

        <!-- Store Subscription Status Card -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Pharmacy Tenant:</span>
            <span class="font-bold text-white">{{ info.storeName }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Current Plan Tier:</span>
            <span class="font-bold text-sky-400 uppercase">{{ info.planTier }} PLAN</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Trial Days Remaining:</span>
            <span class="font-bold text-rose-400">0 Days (Trial Expired)</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800">
            <span class="text-slate-400">POS & Inventory Access:</span>
            <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">RESTRICTED / LOCKED</span>
          </div>
        </div>

        <!-- Primary Action Buttons -->
        <div class="space-y-3">
          <NuxtLink 
            to="/subscribe" 
            class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer block text-center"
          >
            <span>💳 Upgrade Subscription Plan</span>
          </NuxtLink>

          <!-- Super Admin Extension Action -->
          <div class="flex items-center gap-2">
            <button 
              @click="extendTrialLocally(7)"
              class="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              ⚡ Extend Trial (+7 Days)
            </button>
            <button 
              @click="extendTrialLocally(14)"
              class="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              ⚡ Extend Trial (+14 Days)
            </button>
          </div>

          <!-- Switch Store / Sign Out -->
          <button 
            @click="handleLogout" 
            class="w-full py-2.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
          >
            ← Sign Out / Switch Pharmacy Store
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTenantSubscription } from '~/composables/useTenantSubscription';
import { useProductStore } from '~/stores/products';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const router = useRouter();
const productStore = useProductStore();
const { getSubscriptionInfo, getActiveStore } = useTenantSubscription();

const info = computed(() => getSubscriptionInfo());

const extendTrialLocally = async (days: number) => {
  if (!process.client) return;
  const store = getActiveStore();
  if (store) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    store.nextBillingDate = nextDate.toISOString().split('T')[0];
    store.status = 'trial';
    localStorage.setItem('active_tenant_store', JSON.stringify(store));
    alert(`Trial period extended by +${days} days until ${store.nextBillingDate}. Store access unlocked!`);
    await productStore.fetchProducts(store.id);
    emit('close');
    window.location.reload();
  }
};

const handleLogout = () => {
  if (process.client) {
    localStorage.removeItem('active_tenant_store');
    localStorage.removeItem('is_logged_in');
    router.push('/login');
  }
};
</script>
