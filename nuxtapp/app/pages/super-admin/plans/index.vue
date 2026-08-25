<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans">
      <!-- Desktop Application Header Toolbar Frame (Exact Match with Categories / Products / Users Design) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button @click="openCreateModal"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> New Subscription Plan
            </button>
            <button @click="refreshData" :disabled="isRefreshing"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': isRefreshing }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Table
            </button>
          </div>

          <!-- Right: Search Filter -->
          <div class="flex items-center gap-2">
            <label class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search plan name, price..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-56 sm:w-64" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Sharp 1px Borders and Regular Typography -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># ID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Plan Tier Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-right font-normal w-24">Price ($)</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal w-28">Billing Cycle</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal w-28">Max Terminals</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal w-24">Max Users</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal w-28">Max Products</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Feature Matrix</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              <!-- Loading State -->
              <tr v-if="isRefreshing">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  <span class="inline-block animate-spin mr-1">⏳</span> Loading subscription tiers from MySQL...
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredPlans.length === 0">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  No subscription tiers found matching your filter.
                </td>
              </tr>

              <!-- Rows -->
              <tr v-for="(row, idx) in filteredPlans" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === row.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ idx + 1 }}
                </td>

                <!-- Plan Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  <div class="flex items-center gap-1.5">
                    <span :class="[
                      'text-[10px] font-mono px-1.5 py-0.2 border uppercase',
                      row.name.toLowerCase().includes('enterprise')
                        ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                        : row.name.toLowerCase().includes('pro')
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    ]">
                      🏷️ {{ row.name }}
                    </span>
                  </div>
                </td>

                <!-- Price -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-right font-normal text-slate-800 dark:text-gray-200">
                  ${{ Number(row.price ?? (row as any).priceMonthly ?? (row as any).price_monthly ?? 0).toFixed(2) }}
                </td>

                <!-- Duration -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-mono font-normal text-slate-600 dark:text-gray-400">
                  {{ (row as any).durationDays || (row as any).duration_days || 30 }} Days
                </td>

                <!-- Max Terminals -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-mono font-normal text-slate-700 dark:text-gray-300">
                  {{ (row as any).maxTerminals || (row as any).max_terminals || (row as any).terminalsLimit || 1 }} Counter
                </td>

                <!-- Max Users -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-mono font-normal text-slate-700 dark:text-gray-300">
                  {{ (row as any).maxUsers || (row as any).max_users || 5 }} Staff
                </td>

                <!-- Max Products -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-mono font-normal text-slate-700 dark:text-gray-300">
                  {{ (row as any).maxProducts || (row as any).max_products || 500 }} Items
                </td>

                <!-- Features Matrix -->
                <td
                  class="py-1.5 px-3 font-normal text-slate-600 dark:text-gray-400 border-r border-slate-200 dark:border-gray-800 text-[11px]">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400">
                      <span>✓</span> POS
                    </span>
                    <span :class="row.features?.rxVerification ? 'text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-0.5' : 'text-slate-400'">
                      {{ row.features?.rxVerification ? '✓ Rx' : '✕ Rx' }}
                    </span>
                    <span :class="row.features?.poGenerator ? 'text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-0.5' : 'text-slate-400'">
                      {{ row.features?.poGenerator ? '✓ PO' : '✕ PO' }}
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Edit Subscription Tier">
                      Edit
                    </button>
                    <button @click="confirmDeletePlan(row)"
                      class="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-gray-800 dark:text-rose-400 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Delete Subscription Tier">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div
          class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-normal">
          <div>Total <strong>{{ filteredPlans.length }}</strong> subscription packages</div>
          <div class="text-[10px] text-slate-400 font-normal">
            MySQL: <code>subscription_plans</code>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: CREATE SUBSCRIPTION PLAN -->
      <!-- ===================================================================== -->
      <div v-if="showCreateModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Create Subscription Plan Package
            </h3>
            <button @click="showCreateModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="createPlan" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Plan Name *
              </label>
              <input v-model="form.name" type="text" required placeholder="e.g. Starter Plan / Pro Plan"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Price ($) *
                </label>
                <input v-model.number="form.price" type="number" step="0.01" required placeholder="49.00"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Duration (Days) *
                </label>
                <input v-model.number="form.durationDays" type="number" min="1" required placeholder="30"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Terminals
                </label>
                <input v-model.number="form.maxTerminals" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Users
                </label>
                <input v-model.number="form.maxUsers" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Products
                </label>
                <input v-model.number="form.maxProducts" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
            </div>

            <!-- Features -->
            <div class="pt-1">
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1.5">Features Included</label>
              <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800">
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.posRegister" class="text-emerald-600" />
                  <span>POS Terminal Counter</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.rxVerification" class="text-emerald-600" />
                  <span>Doctor Rx Verification</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.poGenerator" class="text-emerald-600" />
                  <span>PO Supplier Generator</span>
                </label>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showCreateModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Saving...' : 'Save Plan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: EDIT SUBSCRIPTION PLAN -->
      <!-- ===================================================================== -->
      <div v-if="editingPlan"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Edit Subscription Plan (#{{ editingPlan.id }})
            </h3>
            <button @click="editingPlan = null"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="savePlan" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Plan Name *
              </label>
              <input v-model="form.name" type="text" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Price ($) *
                </label>
                <input v-model.number="form.price" type="number" step="0.01" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Duration (Days) *
                </label>
                <input v-model.number="form.durationDays" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Terminals
                </label>
                <input v-model.number="form.maxTerminals" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Users
                </label>
                <input v-model.number="form.maxUsers" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  Max Products
                </label>
                <input v-model.number="form.maxProducts" type="number" min="1" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>
            </div>

            <!-- Features -->
            <div class="pt-1">
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1.5">Features Included</label>
              <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800">
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.posRegister" class="text-emerald-600" />
                  <span>POS Terminal Counter</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.rxVerification" class="text-emerald-600" />
                  <span>Doctor Rx Verification</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="form.features.poGenerator" class="text-emerald-600" />
                  <span>PO Supplier Generator</span>
                </label>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="editingPlan = null"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Updating...' : 'Update Plan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import type { SubscriptionPlan } from '~/stores/superAdmin';

const { plans, fetchPlans, createPlanTier, updatePlanTier, deletePlanTier } = useSuperAdmin();

const showCreateModal = ref(false);
const editingPlan = ref<SubscriptionPlan | null>(null);
const isRefreshing = ref(false);
const isSaving = ref(false);
const filterText = ref('');
const selectedRow = ref<number | null>(null);

const form = reactive({
  name: '',
  price: 49,
  durationDays: 30,
  maxTerminals: 1,
  maxUsers: 5,
  maxProducts: 500,
  features: {
    posRegister: true,
    rxVerification: true,
    poGenerator: false
  }
});

const refreshData = async () => {
  isRefreshing.value = true;
  await fetchPlans();
  isRefreshing.value = false;
};

onMounted(() => {
  fetchPlans();
});

const filteredPlans = computed(() => {
  const q = filterText.value.toLowerCase();
  if (!q) return plans.value;
  return plans.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    String(p.price).includes(q)
  );
});

const openCreateModal = () => {
  form.name = '';
  form.price = 49;
  form.durationDays = 30;
  form.maxTerminals = 1;
  form.maxUsers = 5;
  form.maxProducts = 500;
  form.features = {
    posRegister: true,
    rxVerification: true,
    poGenerator: false
  };
  showCreateModal.value = true;
};

const createPlan = async () => {
  if (!form.name) return;
  isSaving.value = true;
  try {
    await createPlanTier({
      name: form.name,
      price: form.price,
      durationDays: form.durationDays,
      maxTerminals: form.maxTerminals,
      maxUsers: form.maxUsers,
      maxProducts: form.maxProducts,
      features: form.features
    } as any);
    showCreateModal.value = false;
    await fetchPlans();
  } catch (e: any) {
    alert("Error creating plan: " + (e.message || "Failed to insert into database"));
  } finally {
    isSaving.value = false;
  }
};

const openEditModal = (plan: SubscriptionPlan) => {
  editingPlan.value = plan;
  form.name = plan.name;
  form.price = plan.price ?? (plan as any).priceMonthly ?? (plan as any).price_monthly ?? 49;
  form.durationDays = (plan as any).durationDays || (plan as any).duration_days || 30;
  form.maxTerminals = (plan as any).maxTerminals || (plan as any).max_terminals || (plan as any).terminalsLimit || 1;
  form.maxUsers = (plan as any).maxUsers || (plan as any).max_users || 5;
  form.maxProducts = (plan as any).maxProducts || (plan as any).max_products || 500;
  form.features = {
    posRegister: plan.features?.posRegister ?? true,
    rxVerification: plan.features?.rxVerification ?? false,
    poGenerator: plan.features?.poGenerator ?? false
  };
};

const savePlan = async () => {
  if (!editingPlan.value) return;
  isSaving.value = true;
  try {
    await updatePlanTier(editingPlan.value.id, {
      name: form.name,
      price: form.price,
      durationDays: form.durationDays,
      maxTerminals: form.maxTerminals,
      maxUsers: form.maxUsers,
      maxProducts: form.maxProducts,
      features: form.features
    } as any);
    editingPlan.value = null;
    await fetchPlans();
  } catch (e: any) {
    alert("Error updating plan: " + (e.message || "Failed to update"));
  } finally {
    isSaving.value = false;
  }
};

const confirmDeletePlan = async (plan: SubscriptionPlan) => {
  if (!confirm(`Are you sure you want to delete subscription plan "${plan.name}" (#${plan.id})?`)) return;
  try {
    await deletePlanTier(plan.id);
    await fetchPlans();
  } catch (e: any) {
    alert("Error deleting plan: " + (e.message || "Failed to delete"));
  }
};
</script>
