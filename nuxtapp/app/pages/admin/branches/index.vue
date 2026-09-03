<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 select-none font-sans">
      
      <!-- Limit Warning Alert (If max branches reached) -->
      <div v-if="meta.maxAllowed > 0 && meta.activeBranches >= meta.maxAllowed" 
           class="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900 dark:text-amber-200 shadow-2xs">
        <div class="flex items-center gap-2">
          <span class="text-sm">⚠️</span>
          <span>
            <strong>Plan Limit Reached:</strong> Your <strong>{{ meta.planName }}</strong> plan allows up to <strong>{{ meta.maxAllowed }}</strong> active branch(es) ({{ meta.activeBranches }} currently active).
          </span>
        </div>
        <NuxtLink to="/admin/billing" class="bg-[#107c41] hover:bg-[#0e6b37] text-white px-2.5 py-1 text-[11px] font-normal flex items-center gap-1 shadow-xs transition-all">
          <span>⚡ Upgrade Plan</span>
        </NuxtLink>
      </div>

      <!-- Desktop Application Database Data Grid Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar Ribbon -->
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <!-- Left: Action buttons & Plan Meter -->
          <div class="flex items-center gap-2 flex-wrap">
            <button @click="openAddModal"
              :class="[
                'font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer',
                !meta.canAddMore && meta.maxAllowed > 0
                  ? 'bg-slate-300 dark:bg-gray-800 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-gray-700 cursor-not-allowed'
                  : 'bg-[#107c41] hover:bg-[#0e6b37] text-white active:scale-95'
              ]">
              <span class="text-sm font-bold">+</span> New Branch <span class="text-[10px] opacity-80 font-mono ml-0.5">[F2]</span>
            </button>

            <button @click="fetchBranches" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh
            </button>
            
            <!-- Plan & Capacity Meter Badge -->
            <div v-if="meta.maxAllowed > 0" class="flex items-center gap-2 ml-1 pl-2.5 border-l border-slate-200 dark:border-gray-700 text-[11px] text-slate-600 dark:text-gray-400">
              <span class="px-1.5 py-0.5 bg-slate-200 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 font-mono text-[10px] text-slate-700 dark:text-gray-300 uppercase">
                Plan: {{ meta.planName }}
              </span>
              <span>Capacity: <strong :class="meta.activeBranches >= meta.maxAllowed ? 'text-rose-600 dark:text-rose-400 font-mono font-bold' : 'text-slate-800 dark:text-gray-200 font-mono'">{{ meta.activeBranches }} / {{ meta.maxAllowed }}</strong> Branches</span>
              <span class="text-slate-300 dark:text-gray-700 hidden sm:inline">|</span>
              <span class="hidden sm:inline">Total: <strong class="text-emerald-700 dark:text-emerald-400 font-mono">{{ branches.length }}</strong></span>
            </div>
          </div>

          <!-- Right: Filters & Search Box -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Status Filter -->
            <select v-model="statusFilter"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] cursor-pointer">
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <!-- Search input -->
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search branches by name, code, address..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 pl-2.5 pr-6 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-48 sm:w-64" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal">SL.</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Branch Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Code</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Address & Phone</th>
                <th class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">Terminals</th>
                <th class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">Staff</th>
                <th class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal w-24">Status</th>
                <th class="py-1.5 px-3 text-center w-36 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loader State -->
              <tr v-if="loading">
                <td colspan="8" class="py-12">
                  <PharmacyLoader text="Loading Store Branches..." />
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredBranches.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No branch records found matching your search criteria.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-for="(branch, idx) in paginatedData" :key="branch.id"
                @click="selectedRow = branch.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === branch.id
                    ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                ]">
                <!-- SL Column -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                  {{ ((currentPage - 1) * itemsPerPage) + idx + 1 }}
                </td>

                <!-- Branch Name -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 text-[10px] font-mono flex items-center justify-center border border-slate-300 dark:border-gray-700 uppercase">
                      🏢
                    </span>
                    <span class="font-medium">{{ branch.name }}</span>
                    <span v-if="branch.is_main === 1" class="text-[9px] uppercase tracking-wider font-mono font-semibold text-sky-700 bg-sky-50 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-1.5 py-0.2">
                      HQ MAIN
                    </span>
                  </div>
                </td>

                <!-- Code -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px] text-slate-600 dark:text-gray-400">
                  <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                    {{ branch.code || 'HQ' }}
                  </span>
                </td>

                <!-- Address & Phone -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800">
                  <div class="text-slate-700 dark:text-gray-300 truncate max-w-[220px]">
                    📍 {{ branch.address || 'Not specified' }}
                  </div>
                  <div v-if="branch.phone" class="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                    📞 {{ branch.phone }}
                  </div>
                </td>

                <!-- POS Terminals Count -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-mono text-slate-700 dark:text-gray-300">
                  <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                    🖥️ {{ branch.terminals_count || 0 }} POS
                  </span>
                </td>

                <!-- Staff Count -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-mono text-slate-700 dark:text-gray-300">
                  <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                    👥 {{ branch.staff_count || 0 }} Staff
                  </span>
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 text-[10px] border font-normal uppercase font-mono tracking-wider',
                    branch.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  ]">
                    {{ branch.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center font-normal">
                  <div class="flex items-center justify-center gap-2">
                    <button @click.stop="openEditModal(branch)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline cursor-pointer font-normal text-xs">
                      Edit
                    </button>
                    <span class="text-slate-300 dark:text-gray-700">|</span>
                    <button v-if="branch.is_main === 0" @click.stop="confirmDelete(branch)"
                      class="text-rose-600 dark:text-rose-400 hover:text-rose-800 hover:underline cursor-pointer font-normal text-xs">
                      Delete
                    </button>
                    <span v-else class="text-slate-400 text-[10px] italic">
                      Protected
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Pagination Controls -->
        <PaginationControls
          :currentPage="currentPage"
          :totalPages="totalPages"
          :totalItems="filteredBranches.length"
          :itemsPerPage="itemsPerPage"
          itemName="Branches"
          @prev="prevPage"
          @next="nextPage"
        />
      </div>
    </div>

    <!-- Modal Form (Add/Edit) -->
    <div v-if="showModal"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 shadow-xl max-w-md w-full">
        <!-- Window Title Bar (Solid Green Classic) -->
        <div class="bg-[#107c41] px-3 py-1.5 text-white flex items-center justify-between text-xs font-normal">
          <span class="flex items-center gap-1.5">
            <span>🏢</span> {{ isEditing ? 'Edit Store Branch' : 'Add New Store Branch' }}
          </span>
          <button @click="closeModal" class="hover:bg-[#0e6b37] px-1.5 py-0.5 text-white cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="saveBranch" class="p-4 space-y-3 text-xs font-sans">
          <div v-if="formError"
            class="p-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            ⚠️ {{ formError }}
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Branch Name <span class="text-rose-500">*</span></label>
              <input v-model="form.name" type="text" required placeholder="e.g. Dhanmondi Outlet"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Branch Code (Optional)</label>
              <input v-model="form.code" type="text" placeholder="e.g. DHN-01"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41] text-xs uppercase" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Address Location</label>
              <input v-model="form.address" type="text" placeholder="e.g. House #12, Road #4, Dhanmondi, Dhaka"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Phone Contact</label>
              <input v-model="form.phone" type="text" placeholder="e.g. +880 1711 000000"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41] text-xs" />
            </div>
            
            <div v-if="isEditing">
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Operating Status</label>
              <select v-model="form.status"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                <option value="active">Active (Operational)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <!-- Window Footer Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800 mt-4">
            <button type="button" @click="closeModal"
              class="px-3 py-1 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
              Cancel [Esc]
            </button>
            <button type="submit" :disabled="saving"
              class="px-3.5 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-60">
              <span v-if="saving" class="animate-spin inline-block">🔄</span>
              <span>✓</span> {{ isEditing ? 'Save Changes' : 'Create Branch' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from '#app';
import PharmacyLoader from '~/components/PharmacyLoader.vue';
import PaginationControls from '~/components/PaginationControls.vue';
import { usePagination } from '~/composables/usePagination';

definePageMeta({ layout: false });

const { $api } = useNuxtApp();
const branches = ref<any[]>([]);
const meta = ref({
  activeBranches: 0,
  canAddMore: false,
  maxAllowed: 0,
  planName: '',
  totalBranches: 0
});

const loading = ref(false);
const saving = ref(false);
const filterText = ref('');
const statusFilter = ref('All');
const formError = ref('');
const selectedRow = ref<number | null>(null);

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref<number | null>(null);

const form = ref({
  name: '',
  code: '',
  address: '',
  phone: '',
  status: 'active'
});

const filteredBranches = computed(() => {
  return branches.value.filter(b => {
    const q = filterText.value.toLowerCase().trim();
    const matchesSearch = !q ||
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.code && b.code.toLowerCase().includes(q)) || 
      (b.address && b.address.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q));

    const matchesStatus = statusFilter.value === 'All' || b.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(filteredBranches, 12);

const fetchBranches = async () => {
  loading.value = true;
  try {
    const res = await $api.get('/branches');
    if (res.data?.success) {
      branches.value = res.data.data || res.data.branches || [];
      if (res.data.meta) meta.value = res.data.meta;
    }
  } catch (error) {
    console.error('Failed to load branches', error);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  if (!meta.value.canAddMore && meta.value.maxAllowed > 0) return;
  isEditing.value = false;
  currentId.value = null;
  form.value = { name: '', code: '', address: '', phone: '', status: 'active' };
  formError.value = '';
  showModal.value = true;
};

const openEditModal = (branch: any) => {
  isEditing.value = true;
  currentId.value = branch.id;
  form.value = {
    name: branch.name,
    code: branch.code || '',
    address: branch.address || '',
    phone: branch.phone || '',
    status: branch.status || 'active'
  };
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formError.value = '';
};

const saveBranch = async () => {
  saving.value = true;
  formError.value = '';
  try {
    if (isEditing.value && currentId.value) {
      const res = await $api.put(`/branches/${currentId.value}`, form.value);
      if (res.data?.success) {
        await fetchBranches();
        closeModal();
      } else {
        formError.value = res.data?.message || 'Update failed.';
      }
    } else {
      const res = await $api.post('/branches', form.value);
      if (res.data?.success) {
        await fetchBranches();
        closeModal();
      } else {
        formError.value = res.data?.message || 'Creation failed.';
      }
    }
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Server error occurred.';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (branch: any) => {
  if (branch.is_main === 1) {
    alert("Main branch cannot be deleted.");
    return;
  }
  if (confirm(`Are you sure you want to delete branch "${branch.name}"? This action cannot be undone.`)) {
    try {
      await $api.delete(`/branches/${branch.id}`);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete branch');
    }
  }
};

const handleKeyShortcuts = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault();
    openAddModal();
  } else if (e.key === 'Escape' && showModal.value) {
    e.preventDefault();
    closeModal();
  }
};

onMounted(() => {
  fetchBranches();
  window.addEventListener('keydown', handleKeyShortcuts);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyShortcuts);
});
</script>
