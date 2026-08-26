<template>
  <NuxtLayout name="admin">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
            <span>🛒</span> Purchase Orders
          </h2>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">Generate and manage purchase orders to suppliers.</p>
        </div>
        <button @click="showAddModal = true" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
          <span>+</span> Create PO
        </button>
      </div>

      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300">
              <th class="p-3 font-bold">PO Number</th>
              <th class="p-3 font-bold">Supplier</th>
              <th class="p-3 font-bold">Expected Date</th>
              <th class="p-3 font-bold text-right">Total Amount</th>
              <th class="p-3 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-gray-800">
            <tr v-if="loading" class="text-center">
              <td colspan="5" class="p-4 text-slate-500 dark:text-gray-400">Loading purchase orders...</td>
            </tr>
            <tr v-else-if="orders.length === 0" class="text-center">
              <td colspan="5" class="p-8 text-slate-500 dark:text-gray-400">
                <div class="text-4xl mb-2">🛒</div>
                <div>No purchase orders found.</div>
              </td>
            </tr>
            <tr v-else v-for="order in orders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors">
              <td class="p-3 font-mono font-bold text-slate-600 dark:text-gray-400">{{ order.poNumber }}</td>
              <td class="p-3 font-bold text-slate-800 dark:text-gray-200">{{ order.supplierName }}</td>
              <td class="p-3 text-slate-600 dark:text-gray-400">{{ order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-' }}</td>
              <td class="p-3 font-mono font-bold text-right text-slate-700 dark:text-gray-300">{{ settingsStore.currencySymbol }}{{ order.totalAmount?.toFixed(2) }}</td>
              <td class="p-3 text-center">
                <span :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold border',
                  order.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                  order.status === 'SENT' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                  'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                ]">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create PO Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
          <div class="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-900">
            <h3 class="font-bold text-slate-800 dark:text-gray-100">Create Purchase Order</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200">✕</button>
          </div>
          <form @submit.prevent="submitOrder" class="p-4 space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Select Supplier *</label>
              <select v-model="form.supplierId" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-800 dark:text-gray-100 outline-none focus:border-emerald-500">
                <option value="" disabled>Choose a supplier...</option>
                <option v-for="sup in suppliers" :key="sup.supplierId" :value="sup.supplierId">
                  {{ sup.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Expected Delivery Date</label>
              <input v-model="form.expectedDate" type="date" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-800 dark:text-gray-100 outline-none focus:border-emerald-500" />
            </div>
            
            <div class="border border-slate-200 dark:border-gray-800 rounded-lg p-3 bg-slate-50 dark:bg-gray-900/50">
              <h4 class="font-bold text-slate-700 dark:text-gray-300 mb-2">Order Summary</h4>
              <div>
                <label class="block font-bold text-slate-600 dark:text-gray-400 mb-1 text-[10px] uppercase">Estimated Total Cost</label>
                <input v-model.number="form.totalAmount" type="number" step="0.01" class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-800 dark:text-gray-100 outline-none focus:border-emerald-500 font-mono" placeholder="0.00" />
              </div>
              <p class="text-[10px] text-slate-500 mt-2 italic">Note: In a full ERP, you would select individual products to generate this PO total.</p>
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-gray-800 mt-4">
              <button type="button" @click="showAddModal = false" class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold hover:bg-slate-200 dark:hover:bg-gray-700">Cancel</button>
              <button type="submit" :disabled="submitting || !form.supplierId" class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50">
                {{ submitting ? 'Creating...' : 'Generate PO' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import axios from 'axios';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import { useSettingsStore } from '~/stores/settings';

const settingsStore = useSettingsStore();

const selectedRow = ref<string | null>(null);

const auth = useAuth();
const orders = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);
const submitting = ref(false);

const form = reactive({
  supplierId: '',
  expectedDate: '',
  totalAmount: 0
});

const getHeaders = () => {
  return {
    headers: {
      'Authorization': `Bearer ${auth.token.value}`,
      'x-tenant-id': auth.user.value?.tenantId || 'TENANT_101'
    }
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [ordersRes, suppRes] = await Promise.all([
      axios.get('/api/purchase-orders', getHeaders()).catch(() => ({ data: { success: false, data: [] } })),
      axios.get('/api/suppliers', getHeaders()).catch(() => ({ data: { success: false, data: [] } }))
    ]);
    
    if (ordersRes.data && ordersRes.data.success) {
      orders.value = ordersRes.data.data;
    }
    if (suppRes.data && suppRes.data.success) {
      suppliers.value = suppRes.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch data", err);
  } finally {
    loading.value = false;
  }
};

const submitOrder = async () => {
  submitting.value = true;
  try {
    const res = await axios.post('/api/purchase-orders', { 
      ...form, 
      tenant_id: auth.user.value?.tenantId 
    }, getHeaders());
    
    if (res.data && res.data.success) {
      // Add the supplier name manually for immediate UI update
      const supp = suppliers.value.find(s => s.supplierId === form.supplierId);
      const newPo = { ...res.data.data, supplierName: supp ? supp.name : 'Unknown' };
      orders.value.unshift(newPo);
      
      showAddModal.value = false;
      form.supplierId = '';
      form.expectedDate = '';
      form.totalAmount = 0;
    }
  } catch (err) {
    alert("Failed to create purchase order.");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
