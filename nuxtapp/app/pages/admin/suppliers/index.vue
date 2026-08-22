<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame with 1px Gridlines -->
      <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true"
              class="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white dark:text-gray-950 font-bold px-3 py-1.5 rounded border border-emerald-600 text-xs flex items-center gap-1 shadow-sm cursor-pointer active:scale-95">
              <span class="text-sm font-black mr-1">+</span> Add New Distributor
            </button>
            <span class="font-mono text-xs font-bold text-slate-600 dark:text-gray-400 bg-slate-200 dark:bg-gray-800 px-2 py-1 rounded border border-slate-300 dark:border-gray-700">
              Total Distributors: {{ suppliers.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-extrabold text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider">FILTER SEARCH:</label>
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

        <!-- Desktop Grid Table Viewport with Visible 1px Gridlines -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">SUPPLIER ID</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">DISTRIBUTOR / COMPANY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">REPRESENTATIVE</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">EMAIL ADDRESS</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">PHONE NUMBER</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredSuppliers.length === 0">
                <td colSpan="7" class="py-8 text-center text-slate-400 dark:text-gray-500 font-mono text-xs border border-slate-300 dark:border-gray-800">
                  No suppliers found in database grid.
                </td>
              </tr>
              <tr 
                v-for="(sup, idx) in filteredSuppliers" 
                :key="sup.id" 
                @click="selectedRow = sup.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                  selectedRow === sup.id 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                ]"
              >
                <!-- Index Column -->
                <td 
                  class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === sup.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                >
                  {{ idx + 1 }}
                </td>

                <!-- Supplier ID -->
                <td class="py-2 px-3 font-mono font-bold border border-slate-300 dark:border-gray-800" :class="selectedRow === sup.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                  {{ sup.supplier_id }}
                </td>

                <!-- Company Name -->
                <td class="py-2 px-3 font-extrabold border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center gap-2">
                    <span>🏢</span>
                    <span :class="selectedRow === sup.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">{{ sup.name }}</span>
                  </div>
                </td>

                <!-- Contact Name -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === sup.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  {{ sup.contact_name }}
                </td>

                <!-- Email -->
                <td class="py-2 px-3 font-mono border border-slate-300 dark:border-gray-800" :class="selectedRow === sup.id ? 'text-sky-100' : 'text-slate-600 dark:text-gray-400'">
                  {{ sup.email }}
                </td>

                <!-- Phone -->
                <td class="py-2 px-3 font-mono border border-slate-300 dark:border-gray-800" :class="selectedRow === sup.id ? 'text-sky-100' : 'text-slate-600 dark:text-gray-400'">
                  {{ sup.phone }}
                </td>

                <!-- Status -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider',
                    selectedRow === sup.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    ● {{ sup.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div class="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>Displaying <strong>{{ filteredSuppliers.length }}</strong> suppliers (Page 1 of 1)</div>
          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Pharma Suppliers Registry • Connected</div>
        </div>
      </div>

      <!-- Add Supplier Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base">Add Pharmaceutical Distributor</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">DISTRIBUTOR NAME *</label>
              <input type="text" v-model="newSup.name" placeholder="e.g. GSK Pharmaceuticals" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CONTACT REPRESENTATIVE</label>
              <input type="text" v-model="newSup.contact_name" placeholder="Jane Doe" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">EMAIL ADDRESS</label>
              <input type="email" v-model="newSup.email" placeholder="orders@distributor.com" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false" class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">Cancel</button>
            <button @click="handleSaveSupplier" :disabled="!newSup.name" class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">Save Distributor</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminSuppliers, type AdminSupplier } from '~/composables/useAdminSuppliers';

const { suppliers, addSupplier } = useAdminSuppliers();
const filterText = ref('');
const selectedRow = ref<string | number | null>(null);
const showAddModal = ref(false);
const newSup = ref<Partial<AdminSupplier>>({ name: '', contact_name: '', email: '' });

const filteredSuppliers = computed(() => {
  const query = filterText.value.toLowerCase();
  return suppliers.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.contact_name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    s.supplier_id.toLowerCase().includes(query)
  );
});

const handleSaveSupplier = () => {
  if (!newSup.value.name) return;
  addSupplier(newSup.value);
  newSup.value = { name: '', contact_name: '', email: '' };
  showAddModal.value = false;
};
</script>
