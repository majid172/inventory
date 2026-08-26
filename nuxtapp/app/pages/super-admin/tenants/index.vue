<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-4 select-none">
      <!-- Action Toolbar (Matching Admin Toolbar Style) -->
      <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <!-- Search input -->
          <div class="relative min-w-[240px] flex-1 max-w-md">
            <input 
              v-model="searchFilter"
              type="text" 
              placeholder="Search store name, owner, email, domain..."
              class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded pl-8 pr-3 py-1 text-xs focus:ring-1 focus:ring-sky-500 font-sans outline-none shadow-inner"
            />
            <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
          </div>

          <!-- Status Filter -->
          <select 
            v-model="statusFilter"
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-200 outline-none shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">🟢 Active</option>
            <option value="trial">🟡 14-Day Trial</option>
            <option value="suspended">🔴 Suspended</option>
          </select>

          <!-- Plan Filter -->
          <select 
            v-model="planFilter"
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-200 outline-none shadow-sm"
          >
            <option value="all">All Plan Tiers</option>
            <option value="starter">Starter Plan ($49)</option>
            <option value="pro">Pro Plan ($149)</option>
            <option value="enterprise">Enterprise Plan ($399)</option>
          </select>
        </div>

        <button 
          @click="showOnboardModal = true"
          class="px-3 py-1.5 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black text-xs hover:from-sky-600 hover:to-blue-700 shadow-sm transition-all flex items-center gap-1"
        >
          <span>+ Onboard New Pharmacy Store</span>
        </button>
      </div>

      <!-- Subscribers Directory Data Table (Matching Admin Grid Style) -->
      <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
          <h2 class="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>🏥</span> Subscriber Pharmacy Directory ({{ filteredTenants.length }} Stores)
          </h2>
          <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded">
            PostgreSQL RLS Active
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th class="py-2 px-2.5 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">STORE DETAILS</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">OWNER & CONTACT</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">PLAN TIER</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">TERMINALS</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">RENEWAL DATE</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(tenant, idx) in filteredTenants" 
                :key="tenant.id"
                @click="selectedRow = tenant.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                  selectedRow === tenant.id 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                ]"
              >
                <td 
                  class="py-2 px-2.5 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === tenant.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                >
                  {{ idx + 1 }}
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800">
                  <div class="font-extrabold" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-900 dark:text-gray-100'">{{ tenant.storeName }}</div>
                  <div class="text-[10px] font-mono" :class="selectedRow === tenant.id ? 'text-sky-100' : 'text-blue-700 dark:text-sky-400'">{{ tenant.slug }}.{{ settingsStore.systemSettings.platformName.toLowerCase().replace(/\s+/g, '') }}.com</div>
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  <div>{{ tenant.ownerName }}</div>
                  <div class="text-[10px] font-mono" :class="selectedRow === tenant.id ? 'text-white/80' : 'text-slate-500 dark:text-gray-400'">{{ tenant.email }}</div>
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-mono">
                  <span :class="selectedRow === tenant.id ? 'bg-white/20 text-white border-white/40' : tenant.planTier === 'enterprise' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' : tenant.planTier === 'pro' ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'" class="px-1.5 py-0.2 rounded border text-[10px] font-black uppercase">
                    {{ tenant.planTier }} ({{ settingsStore.currencySymbol }}{{ tenant.mrr }}/mo)
                  </span>
                </td>
                <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                  <span :class="selectedRow === tenant.id ? 'bg-white text-emerald-900 border-white' : tenant.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' : tenant.status === 'trial' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'" class="px-2 py-0.2 rounded text-[10px] font-black border uppercase">
                    {{ tenant.status }}
                  </span>
                </td>
                <td class="py-2 px-2.5 text-center font-mono font-bold border border-slate-300 dark:border-gray-800" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  {{ tenant.terminalsCount }} Terminals
                </td>
                <td class="py-2 px-2.5 font-mono text-xs border border-slate-300 dark:border-gray-800" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-800 dark:text-gray-200'">
                  <div>{{ tenant.nextBillingDate }}</div>
                  <div v-if="tenant.status === 'trial'" class="text-[9px] font-bold" :class="new Date(tenant.nextBillingDate) < new Date() ? 'text-rose-500 font-black' : 'text-amber-600 dark:text-amber-400'">
                    {{ new Date(tenant.nextBillingDate) < new Date() ? '🚨 Trial Completed' : '🎁 Trial Active' }}
                  </div>
                </td>
                <td class="py-2 px-2.5 text-right border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center justify-end gap-1 flex-wrap">
                    <button 
                      @click.stop="extendTrialDays(tenant, 7)"
                      title="Extend Trial by +7 Days"
                      class="px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[9px] font-black shadow-sm"
                    >
                      +7D
                    </button>
                    <button 
                      @click.stop="extendTrialDays(tenant, 14)"
                      title="Extend Trial by +14 Days"
                      class="px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[9px] font-black shadow-sm"
                    >
                      +14D
                    </button>
                    <button 
                      @click.stop="openEditModal(tenant)"
                      class="px-2 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 rounded text-[10px] font-bold text-slate-800 dark:text-gray-200 shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      v-if="tenant.status === 'suspended' || tenant.status === 'expired' || tenant.status === 'trial'"
                      @click.stop="toggleStatus(tenant, 'active')"
                      class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-extrabold hover:bg-emerald-500 shadow-sm"
                    >
                      Activate
                    </button>
                    <button 
                      v-else
                      @click.stop="toggleStatus(tenant, 'suspended')"
                      class="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-extrabold hover:bg-rose-200 shadow-sm"
                    >
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Onboard New Store Modal (Matching Desktop App Modal Style) -->
      <div v-if="showOnboardModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-black text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🏥</span> Onboard New Pharmacy Subscriber Store
            </h3>
            <button @click="showOnboardModal = false" class="text-slate-500 font-bold hover:text-slate-800">✕</button>
          </div>

          <form @submit.prevent="handleCreateTenant" class="p-3.5 space-y-3 text-xs font-sans">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Pharmacy Store Name *</label>
              <input 
                v-model="newStore.storeName"
                type="text" 
                required
                placeholder="e.g. HealthCare Plus Pharmacy"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner / Chief Pharmacist *</label>
                <input 
                  v-model="newStore.ownerName"
                  type="text" 
                  required
                  placeholder="Dr. Jane Doe"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Billing Email *</label>
                <input 
                  v-model="newStore.email"
                  type="email" 
                  required
                  placeholder="owner@pharmacy.com"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Select Subscription Tier *</label>
              <select 
                v-model="newStore.planTier"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none"
              >
                <option v-for="p in plans" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ settingsStore.currencySymbol }}{{ p.priceMonthly }}/mo - {{ p.masterDrugLimit }})
                </option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button 
                type="button" 
                @click="showOnboardModal = false"
                class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-3.5 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm"
              >
                Provision Store
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Tenant Plan Modal -->
      <div v-if="selectedTenant" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs uppercase text-slate-800 dark:text-gray-100">
              Edit Subscription: {{ selectedTenant.storeName }}
            </h3>
            <button @click="selectedTenant = null" class="font-bold text-slate-500">✕</button>
          </div>

          <div class="p-3.5 space-y-3 text-xs font-sans">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Subscription Plan Tier</label>
              <select 
                v-model="editForm.planTier"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none"
              >
                <option v-for="p in plans" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ settingsStore.currencySymbol }}{{ p.priceMonthly }}/mo)
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Extend Billing Expiry (+ Days)</label>
              <input 
                v-model.number="editForm.extendDays"
                type="number" 
                placeholder="0"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button @click="selectedTenant = null" class="px-3 py-1 bg-slate-200 dark:bg-gray-800 font-bold rounded">Cancel</button>
              <button @click="saveTenantEdit" class="px-3.5 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white font-black rounded shadow-sm">Save Plan Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();
import type { TenantStore } from '~/stores/superAdmin';

const { plans, filteredTenants, searchFilter, statusFilter, planFilter, fetchTenants, fetchPlans, createTenant, updateTenant } = useSuperAdmin();

const showOnboardModal = ref(false);
const selectedTenant = ref<TenantStore | null>(null);
const selectedRow = ref<string | null>(null);

const newStore = reactive({
  storeName: '',
  ownerName: '',
  email: '',
  phone: '',
  planTier: 'pro' as string
});

const editForm = reactive({
  planTier: 'pro' as string,
  extendDays: 0
});

onMounted(() => {
  fetchTenants();
  fetchPlans();
});

const handleCreateTenant = async () => {
  await createTenant({
    storeName: newStore.storeName,
    ownerName: newStore.ownerName,
    email: newStore.email,
    phone: newStore.phone,
    planTier: newStore.planTier
  });
  showOnboardModal.value = false;
  newStore.storeName = '';
  newStore.ownerName = '';
  newStore.email = '';
  newStore.phone = '';
  alert("Pharmacy subscriber store onboarded successfully!");
};

const openEditModal = (t: TenantStore) => {
  selectedTenant.value = t;
  editForm.planTier = t.planTier;
  editForm.extendDays = 0;
};

const saveTenantEdit = async () => {
  if (selectedTenant.value) {
    await updateTenant(selectedTenant.value.id, {
      planTier: editForm.planTier,
      extendDays: editForm.extendDays
    });
    selectedTenant.value = null;
    alert("Subscriber store plan updated successfully!");
  }
};

const toggleStatus = async (t: TenantStore, newStatus: 'active' | 'suspended') => {
  await updateTenant(t.id, { status: newStatus });
};

const extendTrialDays = async (t: TenantStore, days: number) => {
  await updateTenant(t.id, { extendDays: days, status: 'trial' });
  alert(`Trial period for '${t.storeName}' extended by +${days} days!`);
};
</script>

