<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
        <div class="flex items-center gap-3">
          <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
            <span>🚚 Suppliers Directory</span>
            <span class="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full font-mono font-bold">{{ suppliers.length }}</span>
          </h2>
        </div>

        <button @click="showAddModal = true" class="bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-black px-4 py-2 rounded-xl text-xs">
          + Add New Supplier
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
                <th class="py-3.5 px-4">COMPANY NAME</th>
                <th class="py-3.5 px-4">CONTACT PERSON</th>
                <th class="py-3.5 px-4">EMAIL</th>
                <th class="py-3.5 px-4">PHONE</th>
                <th class="py-3.5 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="(sup, idx) in suppliers" :key="sup.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 text-center text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-amber-400">{{ sup.supplier_id }}</td>
                <td class="py-3.5 px-4 font-extrabold text-gray-100 text-sm">{{ sup.name }}</td>
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
      <div v-if="showAddModal" class="modal-backdrop select-none">
        <div class="modal-content max-w-md">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <h3 class="font-extrabold text-amber-500 text-base">Add New Supplier</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1">COMPANY NAME *</label>
              <input type="text" v-model="newSup.name" placeholder="e.g. Acme Coffee Corp" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1">CONTACT NAME</label>
              <input type="text" v-model="newSup.contact_name" placeholder="Jane Doe" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1">EMAIL</label>
              <input type="email" v-model="newSup.email" placeholder="jane@acme.com" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="showAddModal = false" class="flex-1 bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-700">Cancel</button>
            <button @click="handleSaveSupplier" :disabled="!newSup.name" class="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">Save Supplier</button>
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
