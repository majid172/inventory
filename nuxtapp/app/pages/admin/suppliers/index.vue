<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> Add New Distributor
            </button>
            <button v-if="selectedRow" @click="openEditModal"
              class="bg-white hover:bg-slate-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span>✏️</span> Edit Distributor
            </button>
            <button v-if="selectedRow" @click="handleDelete(selectedRow)"
              class="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span>🗑️</span> Delete
            </button>
            <span class="font-normal text-xs text-slate-500 dark:text-gray-400">
              Total Distributors: {{ suppliers.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER SEARCH:</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="filterText" 
                placeholder="Search supplier, contact, email..." 
                class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans shadow-inner w-56 sm:w-64"
              />
              <button v-if="filterText" @click="filterText = ''" class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 text-xs">✕</button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-10 text-center border-r border-slate-200 dark:border-gray-800 font-normal">#</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">SUPPLIER ID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">COMPANY</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">REPRESENTATIVE</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">EMAIL</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">PHONE </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">STATUS</th>
                <th class="py-1.5 px-3 text-center font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colSpan="8" class="py-12">
                  <PharmacyLoader text="Loading Distributors..." />
                </td>
              </tr>
              <tr v-else-if="filteredSuppliers.length === 0">
                <td colSpan="8" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No suppliers found in database grid.
                </td>
              </tr>
              <tr 
                v-for="(sup, idx) in paginatedData" 
                :key="sup.id" 
                @click="selectedRow = sup.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === sup.id 
                    ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white' 
                    : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                ]"
              >
                <!-- Index Column -->
                <td 
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-10 font-normal text-slate-500 dark:text-gray-400"
                >
                  {{ idx + 1 }}
                </td>

                <!-- Supplier ID -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === sup.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ sup.supplier_id }}
                </td>

                <!-- Company Name -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="flex items-center gap-2">
                    <span :class="selectedRow === sup.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">{{ sup.name }}</span>
                  </div>
                </td>

                <!-- Contact Name -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === sup.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ sup.contact_name }}
                </td>

                <!-- Email -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === sup.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">
                  {{ sup.email }}
                </td>

                <!-- Phone -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === sup.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">
                  {{ sup.phone }}
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-normal border uppercase tracking-wider',
                    selectedRow === sup.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    ● {{ sup.status }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="py-1.5 px-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click.stop="selectedRow = sup.id; openEditModal()" class="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="Edit">
                      Edit
                    </button>
                    <button @click.stop="handleDelete(sup.id)" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <PaginationControls 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          :total-items="filteredSuppliers.length" 
          :items-per-page="itemsPerPage"
          @prev="prevPage" 
          @next="nextPage" 
        />
      </div>

      <!-- Add/Edit Supplier Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
          
          <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
            <h3 class="font-normal text-slate-800 dark:text-gray-100 text-sm">
              {{ isEditing ? 'Edit Distributor' : 'Add New Distributor' }}
            </h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold cursor-pointer">✕</button>
          </div>

          <div class="p-4 space-y-4 bg-white dark:bg-gray-950">
            <div>
              <label class="block font-normal text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider mb-1">DISTRIBUTOR NAME *</label>
              <input type="text" v-model="formData.name" placeholder="e.g. GSK Pharmaceuticals" class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner" />
            </div>
            <div>
              <label class="block font-normal text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider mb-1">CONTACT REPRESENTATIVE</label>
              <input type="text" v-model="formData.contact_name" placeholder="Jane Doe" class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner" />
            </div>
            <div>
              <label class="block font-normal text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider mb-1">EMAIL ADDRESS</label>
              <input type="email" v-model="formData.email" placeholder="orders@distributor.com" class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner" />
            </div>
            <div>
              <label class="block font-normal text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider mb-1">PHONE NUMBER</label>
              <input type="text" v-model="formData.phone" placeholder="+1-555-0000" class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner" />
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-4 py-3 flex items-center justify-end gap-2">
            <button @click="showModal = false" class="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 hover:text-slate-900 px-4 py-1.5 rounded text-xs transition-colors cursor-pointer">Cancel</button>
            <button @click="handleSave" :disabled="!formData.name" class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs shadow-xs transition-colors cursor-pointer">
              {{ isEditing ? 'Save Changes' : 'Save Distributor' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminSuppliers, type AdminSupplier } from '~/composables/useAdminSuppliers';
import { usePagination } from '~/composables/usePagination';
import PaginationControls from '~/components/PaginationControls.vue';

const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useAdminSuppliers();
const filterText = ref('');
const selectedRow = ref<number | null>(null);

const showModal = ref(false);
const isEditing = ref(false);
const formData = ref<Partial<AdminSupplier>>({ name: '', contact_name: '', email: '', phone: '' });

const filteredSuppliers = computed(() => {
  const query = filterText.value.toLowerCase();
  return suppliers.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.contact_name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    s.supplier_id.toLowerCase().includes(query)
  );
});

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(filteredSuppliers, 10);

const openAddModal = () => {
  isEditing.value = false;
  formData.value = { name: '', contact_name: '', email: '', phone: '' };
  showModal.value = true;
};

const openEditModal = () => {
  if (!selectedRow.value) return;
  const sup = suppliers.value.find(s => s.id === selectedRow.value);
  if (sup) {
    isEditing.value = true;
    formData.value = { ...sup };
    showModal.value = true;
  }
};

const handleSave = async () => {
  if (!formData.value.name) return;
  
  if (isEditing.value && formData.value.id) {
    await updateSupplier(formData.value.id, formData.value);
  } else {
    await addSupplier(formData.value);
  }
  
  showModal.value = false;
};

const handleDelete = async (id: number) => {
  if (confirm("Are you sure you want to delete this distributor? This action cannot be undone.")) {
    await deleteSupplier(id);
    if (selectedRow.value === id) selectedRow.value = null;
  }
};
</script>
