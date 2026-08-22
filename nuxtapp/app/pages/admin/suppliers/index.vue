<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
        <div class="flex items-center gap-3">
          <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
            <span>🚚 Pharmaceutical Distributors & Suppliers</span>
            <span class="text-xs bg-gray-800 text-emerald-400 border border-gray-700 px-2.5 py-0.5 rounded-full font-mono font-bold">{{ suppliers.length }}</span>
          </h2>
        </div>

        <button @click="showAddModal = true" class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-950/40">
          + Add New Distributor
        </button>
      </div>

      <!-- Suppliers Data Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">SUPPLIER ID</th>
                <th class="py-3.5 px-4">DISTRIBUTOR / COMPANY</th>
                <th class="py-3.5 px-4">REPRESENTATIVE</th>
                <th class="py-3.5 px-4">EMAIL ADDRESS</th>
                <th class="py-3.5 px-4">PHONE NUMBER</th>
                <th class="py-3.5 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="(sup, idx) in suppliers" :key="sup.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 text-center text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">{{ sup.supplier_id }}</td>
                <td class="py-3.5 px-4 font-extrabold text-gray-100 text-sm flex items-center gap-2">
                  <span>🏢</span>
                  <span>{{ sup.name }}</span>
                </td>
                <td class="py-3.5 px-4 text-gray-300 font-medium">{{ sup.contact_name }}</td>
                <td class="py-3.5 px-4 font-mono text-gray-400">{{ sup.email }}</td>
                <td class="py-3.5 px-4 font-mono text-gray-400">{{ sup.phone }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {{ sup.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Supplier Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base">Add Pharmaceutical Distributor</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">DISTRIBUTOR NAME *</label>
              <input type="text" v-model="newSup.name" placeholder="e.g. GSK Pharmaceuticals" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">CONTACT REPRESENTATIVE</label>
              <input type="text" v-model="newSup.contact_name" placeholder="Jane Doe" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">EMAIL ADDRESS</label>
              <input type="email" v-model="newSup.email" placeholder="orders@distributor.com" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false" class="flex-1 bg-gray-950 border border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
            <button @click="handleSaveSupplier" :disabled="!newSup.name" class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">Save Distributor</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAdminSuppliers, type AdminSupplier } from '~/composables/useAdminSuppliers';

const { suppliers, addSupplier } = useAdminSuppliers();
const showAddModal = ref(false);
const newSup = ref<Partial<AdminSupplier>>({ name: '', contact_name: '', email: '' });

const handleSaveSupplier = () => {
  if (!newSup.value.name) return;
  addSupplier(newSup.value);
  newSup.value = { name: '', contact_name: '', email: '' };
  showAddModal.value = false;
};
</script>
