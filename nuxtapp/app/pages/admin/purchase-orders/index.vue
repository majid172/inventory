<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 font-sans pb-12">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg border border-emerald-300 dark:border-emerald-800/80">
            🛒
          </div>
          <div>
            <h1 class="text-sm font-semibold text-slate-800 dark:text-gray-100 uppercase tracking-wide">
              Purchase Orders (Procurement)
            </h1>
            <p class="text-[11px] text-slate-500 dark:text-gray-400">
              Generate POs, track status, and receive stock directly into inventory.
            </p>
          </div>
        </div>
        <button @click="openCreateModal" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition-all">
          <span>+</span> Create PO
        </button>
      </div>

      <!-- Main Table -->
      <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th class="py-2 px-3">PO Number</th>
                <th class="py-2 px-3">Supplier</th>
                <th class="py-2 px-3">Expected Date</th>
                <th class="py-2 px-3 text-right">Total Amount</th>
                <th class="py-2 px-3 text-center">Status</th>
                <th class="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 font-mono">
              <tr v-if="loading">
                <td colspan="6" class="py-12">
                  <PharmacyLoader text="Loading Purchase Orders..." />
                </td>
              </tr>
              <tr v-else-if="orders.length === 0" class="text-center font-sans">
                <td colspan="6" class="py-8 text-slate-500 dark:text-gray-400">
                  <div class="text-3xl mb-2">📦</div>
                  <div>No purchase orders found. Create one to procure stock.</div>
                </td>
              </tr>
              <tr v-else v-for="order in paginatedData" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors">
                <td class="py-2.5 px-3 font-medium text-slate-700 dark:text-gray-200">{{ order.poNumber }}</td>
                <td class="py-2.5 px-3 font-sans text-slate-800 dark:text-gray-100">{{ order.supplierName }}</td>
                <td class="py-2.5 px-3 text-slate-600 dark:text-gray-400 font-sans">
                  {{ order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-' }}
                </td>
                <td class="py-2.5 px-3 font-medium text-right text-emerald-700 dark:text-emerald-400">
                  {{ settingsStore.currencySymbol }}{{ order.totalAmount?.toFixed(2) }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span :class="[
                    'px-2 py-0.5 text-[10px] uppercase font-sans font-semibold border',
                    order.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' :
                    order.status === 'SENT' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800' :
                    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                  ]">
                    {{ order.status }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center font-sans">
                  <button @click="viewOrderDetails(order)" class="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 px-2 py-1 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination Footer -->
        <PaginationControls 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          :total-items="orders.length" 
          :items-per-page="itemsPerPage"
          @prev="prevPage" 
          @next="nextPage" 
        />
      </div>

      <!-- ========================================== -->
      <!-- Create PO Modal                            -->
      <!-- ========================================== -->
      <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
          <div class="p-3 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-900">
            <h3 class="font-semibold text-slate-800 dark:text-gray-100 text-sm">Create Purchase Order</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 cursor-pointer text-lg leading-none">×</button>
          </div>
          
          <div class="p-4 overflow-y-auto flex-1 text-xs space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Select Supplier <span class="text-red-500">*</span></label>
                <select v-model="form.supplierId" required class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 outline-none focus:border-emerald-500">
                  <option value="" disabled>Choose a supplier...</option>
                  <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
                    {{ sup.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Expected Delivery Date</label>
                <input v-model="form.expectedDate" type="date" class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 outline-none focus:border-emerald-500" />
              </div>
            </div>

            <!-- Items Selector -->
            <div class="border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 p-3">
              <h4 class="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                <span>Order Items</span>
                <button type="button" @click="addItemRow" class="text-emerald-600 dark:text-emerald-400 hover:underline">+ Add Medicine</button>
              </h4>
              
              <div class="space-y-2">
                <!-- Header for Order Items -->
                <div v-if="form.items.length > 0" class="flex gap-2 items-center px-1 pb-1 border-b border-slate-200 dark:border-gray-700 text-xs font-semibold text-slate-600 dark:text-gray-400">
                  <div class="flex-1">Medicine</div>
                  <div class="w-20 text-center">Quantity</div>
                  <div class="w-28 text-center">Unit Cost</div>
                  <div class="w-24 text-right">Line Total</div>
                  <div class="w-5"></div>
                </div>
                
                <div v-for="(item, idx) in form.items" :key="idx" class="flex gap-2 items-center">
                  <select v-model="item.productId" class="flex-1 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2 py-1.5 outline-none focus:border-emerald-500" @change="autoFillCost(item)">
                    <option value="" disabled>Select Medicine...</option>
                    <option v-for="prod in products" :key="prod.id" :value="prod.id">
                      {{ prod.name }} ({{ prod.generic_name || 'Generic' }})
                    </option>
                  </select>
                  <input v-model.number="item.quantity" type="number" min="1" placeholder="Qty" title="Quantity" class="w-20 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2 py-1.5 outline-none font-mono text-center" />
                  <input v-model.number="item.unitCost" type="number" step="0.01" min="0" placeholder="Unit Cost" title="Unit Cost" class="w-28 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2 py-1.5 outline-none font-mono text-right" />
                  <div class="w-24 text-right font-mono font-medium text-slate-600 dark:text-gray-300">
                    {{ settingsStore.currencySymbol }}{{ (item.quantity * (item.unitCost || 0)).toFixed(2) }}
                  </div>
                  <button type="button" @click="removeItemRow(idx)" class="text-red-500 hover:text-red-700 px-1 w-5 text-center" title="Remove Item">✕</button>
                </div>
              </div>

              <div class="mt-4 pt-2 border-t border-slate-200 dark:border-gray-800 flex justify-between items-center font-semibold text-sm">
                <span class="text-slate-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Total Estimated Cost:</span>
                <span class="font-mono text-emerald-700 dark:text-emerald-400">
                  {{ settingsStore.currencySymbol }}{{ calculatedTotal.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex justify-end gap-2 text-xs">
            <button type="button" @click="showAddModal = false" class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">Cancel</button>
            <button type="button" @click="submitOrder" :disabled="submitting || !form.supplierId || form.items.length === 0" class="px-4 py-1.5 bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50">
              {{ submitting ? 'Saving...' : 'Generate PO' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- View / Manage PO Modal                     -->
      <!-- ========================================== -->
      <div v-if="viewModalOpen && selectedPO" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
          <div class="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-900">
            <div>
              <h3 class="font-semibold text-slate-800 dark:text-gray-100 text-sm flex items-center gap-2">
                Purchase Order: <span class="font-mono">{{ selectedPO.poNumber }}</span>
                <span :class="[
                  'px-1.5 py-0.5 text-[9px] uppercase font-sans font-bold border ml-2',
                  selectedPO.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                  selectedPO.status === 'SENT' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' :
                  selectedPO.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300' :
                  'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                ]">
                  {{ selectedPO.status }}
                </span>
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">Supplier: {{ selectedPO.supplierName }}</p>
            </div>
            <button @click="closeViewModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 cursor-pointer text-lg leading-none">×</button>
          </div>
          
          <div class="p-4 overflow-y-auto flex-1 text-xs">
            <div v-if="poLoading" class="text-center py-8 text-slate-500">Loading details...</div>
            <div v-else>
              <table class="w-full text-left font-sans">
                <thead class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 text-[10px] text-slate-600 dark:text-gray-400 uppercase">
                  <tr>
                    <th class="py-1.5 px-2">Medicine / Product</th>
                    <th class="py-1.5 px-2 text-right">Quantity</th>
                    <th class="py-1.5 px-2 text-right">Unit Cost</th>
                    <th class="py-1.5 px-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-gray-800 font-mono">
                  <tr v-for="item in poDetails?.items" :key="item.id">
                    <td class="py-2 px-2 font-sans">
                      <div class="font-medium text-slate-800 dark:text-gray-200">{{ item.productName }}</div>
                      <div class="text-[9px] text-slate-500">{{ item.genericName }}</div>
                    </td>
                    <td class="py-2 px-2 text-right">{{ item.quantity }}</td>
                    <td class="py-2 px-2 text-right text-slate-600 dark:text-gray-400">{{ settingsStore.currencySymbol }}{{ item.unitCost.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right font-medium text-slate-800 dark:text-gray-200">{{ settingsStore.currencySymbol }}{{ item.lineTotal.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-slate-50 dark:bg-gray-900/50">
                    <td colspan="3" class="py-2 px-2 text-right font-sans font-semibold text-slate-700 dark:text-gray-300 text-[11px] uppercase tracking-wider">Total Amount:</td>
                    <td class="py-2 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">{{ settingsStore.currencySymbol }}{{ poDetails?.totalAmount.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Receive Form Section -->
              <div v-if="receiveMode" class="mt-6 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <h4 class="font-semibold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <span>📦</span> Stock Receipt Form
                </h4>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-500 mb-3">Please specify the received Batch Numbers and Expiry Dates before moving items into inventory stock.</p>
                
                <div class="space-y-3 font-sans">
                  <div v-for="(item, idx) in poDetails?.items" :key="'recv-'+item.id" class="flex flex-col sm:flex-row gap-2 sm:items-center bg-white dark:bg-gray-900 p-2 border border-emerald-100 dark:border-emerald-900">
                    <div class="flex-1 font-medium text-[11px] truncate" :title="item.productName">
                      {{ item.productName }} <span class="font-mono text-slate-500 ml-1">x{{ item.quantity }}</span>
                    </div>
                    <div class="flex gap-2">
                      <input v-model="receiveForm[idx].batchNumber" type="text" placeholder="Batch No (Opt)" class="w-32 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 px-2 py-1 outline-none text-[11px] font-mono" />
                      <input v-model="receiveForm[idx].expiryDate" type="date" class="w-32 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 px-2 py-1 outline-none text-[11px] font-mono" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Modals Actions -->
          <div class="p-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex justify-between items-center text-xs">
            <!-- Left Actions -->
            <div class="flex gap-2">
              <button 
                v-if="selectedPO.status === 'DRAFT'" 
                @click="updateStatus('SENT')"
                :disabled="poActionLoading"
                class="px-3 py-1.5 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Mark as SENT
              </button>
              <button 
                v-if="selectedPO.status === 'DRAFT' || selectedPO.status === 'SENT'" 
                @click="updateStatus('CANCELLED')"
                :disabled="poActionLoading"
                class="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900 disabled:opacity-50"
              >
                Cancel PO
              </button>
            </div>
            
            <!-- Right Actions -->
            <div class="flex gap-2">
              <button v-if="receiveMode" @click="receiveMode = false" class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Back</button>
              
              <button 
                v-if="(selectedPO.status === 'DRAFT' || selectedPO.status === 'SENT') && !receiveMode" 
                @click="enterReceiveMode"
                :disabled="poActionLoading"
                class="px-4 py-1.5 bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
              >
                <span>📥</span> Receive & Stock In
              </button>
              
              <button 
                v-if="receiveMode" 
                @click="submitReceive"
                :disabled="poActionLoading"
                class="px-4 py-1.5 bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
              >
                {{ poActionLoading ? 'Processing...' : 'Confirm Stock Receipt' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import axios from 'axios';
import { useSettingsStore } from '~/stores/settings';
import { usePagination } from '~/composables/usePagination';
import PaginationControls from '~/components/PaginationControls.vue';
import { useProductStore } from '~/stores/products';

const settingsStore = useSettingsStore();
const productStore = useProductStore();
const auth = useAuth();

// State
const orders = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const products = ref<any[]>([]);
const loading = ref(true);

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(orders, 10);

// Create PO State
const showAddModal = ref(false);
const submitting = ref(false);
const form = reactive({
  supplierId: '',
  expectedDate: '',
  items: [] as Array<{ productId: string, quantity: number, unitCost: number }>
});

// View PO State
const viewModalOpen = ref(false);
const selectedPO = ref<any>(null);
const poDetails = ref<any>(null);
const poLoading = ref(false);
const poActionLoading = ref(false);

// Receive PO State
const receiveMode = ref(false);
const receiveForm = ref<Array<{ productId: string, batchNumber: string, expiryDate: string }>>([]);

const getHeaders = () => {
  return {
    headers: {
      'Authorization': `Bearer ${auth.token.value}`,
      'x-tenant-id': auth.user.value?.tenantId || '1'
    }
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [ordersRes, suppRes, prodRes] = await Promise.all([
      axios.get('/purchase-orders', getHeaders()).catch(() => ({ data: { success: false, data: [] } })),
      axios.get('/suppliers', getHeaders()).catch(() => ({ data: { success: false, data: [] } })),
      axios.get('/products', getHeaders()).catch(() => ({ data: { success: false, data: [] } }))
    ]);
    
    if (ordersRes.data && ordersRes.data.success) orders.value = ordersRes.data.data;
    if (suppRes.data && suppRes.data.success) suppliers.value = suppRes.data.data;
    if (prodRes.data && prodRes.data.success) products.value = prodRes.data.data;
  } catch (err) {
    console.error("Failed to fetch data", err);
  } finally {
    loading.value = false;
  }
};

// Create Workflow
const calculatedTotal = computed(() => {
  return form.items.reduce((acc, item) => acc + (item.quantity * (item.unitCost || 0)), 0);
});

const openCreateModal = () => {
  form.supplierId = '';
  form.expectedDate = '';
  form.items = [{ productId: '', quantity: 1, unitCost: 0 }];
  showAddModal.value = true;
};

const addItemRow = () => {
  form.items.push({ productId: '', quantity: 1, unitCost: 0 });
};

const removeItemRow = (idx: number) => {
  form.items.splice(idx, 1);
};

const autoFillCost = (item: any) => {
  const prod = products.value.find(p => p.id === item.productId);
  if (prod && !item.unitCost) {
    item.unitCost = prod.cost || prod.purchase_price || 0;
  }
};

const submitOrder = async () => {
  if (form.items.length === 0 || !form.items[0].productId) return alert('Please select at least one product');
  submitting.value = true;
  try {
    const payload = {
      supplierId: form.supplierId,
      expectedDate: form.expectedDate,
      totalAmount: calculatedTotal.value,
      items: form.items
    };
    
    const res = await axios.post('/purchase-orders', payload, getHeaders());
    if (res.data && res.data.success) {
      fetchData(); // Refresh list
      showAddModal.value = false;
    }
  } catch (err) {
    alert("Failed to create purchase order.");
  } finally {
    submitting.value = false;
  }
};

// View Workflow
const viewOrderDetails = async (order: any) => {
  selectedPO.value = order;
  viewModalOpen.value = true;
  receiveMode.value = false;
  poLoading.value = true;
  poDetails.value = null;
  
  try {
    const res = await axios.get(`/purchase-orders/${order.id}`, getHeaders());
    if (res.data && res.data.success) {
      poDetails.value = res.data.data;
    }
  } catch (err) {
    alert("Failed to load PO details");
    viewModalOpen.value = false;
  } finally {
    poLoading.value = false;
  }
};

const closeViewModal = () => {
  viewModalOpen.value = false;
  selectedPO.value = null;
  receiveMode.value = false;
};

// Status / Receive Workflow
const updateStatus = async (newStatus: string) => {
  if (!confirm(`Are you sure you want to mark this PO as ${newStatus}?`)) return;
  poActionLoading.value = true;
  try {
    await axios.put(`/purchase-orders/${selectedPO.value.id}/status`, { status: newStatus }, getHeaders());
    selectedPO.value.status = newStatus;
    // update in list as well
    const listIdx = orders.value.findIndex(o => o.id === selectedPO.value.id);
    if (listIdx !== -1) orders.value[listIdx].status = newStatus;

    if (newStatus === 'RECEIVED') {
      await Promise.all([
        productStore.fetchProducts(),
        fetchData()
      ]);
    }
  } catch(e: any) {
    alert(e.response?.data?.message || "Failed to update status");
  } finally {
    poActionLoading.value = false;
  }
};

const enterReceiveMode = () => {
  if (!poDetails.value) return;
  receiveForm.value = poDetails.value.items.map((i: any) => ({
    productId: i.productId,
    batchNumber: '',
    expiryDate: ''
  }));
  receiveMode.value = true;
};

const submitReceive = async () => {
  if (!confirm("This will receive the items into inventory stock. Proceed?")) return;
  poActionLoading.value = true;
  try {
    await axios.post(`/purchase-orders/${selectedPO.value.id}/receive`, {
      batches: receiveForm.value
    }, getHeaders());
    
    // Update local state
    selectedPO.value.status = 'RECEIVED';
    const listIdx = orders.value.findIndex(o => o.id === selectedPO.value.id);
    if (listIdx !== -1) orders.value[listIdx].status = 'RECEIVED';
    
    // Refresh product store stock & PO data list
    await Promise.all([
      productStore.fetchProducts(),
      fetchData()
    ]);
    
    alert("🎉 Purchase Order successfully received! Stock has been updated into inventory.");
    receiveMode.value = false;
  } catch(e: any) {
    alert(e.response?.data?.message || "Failed to receive PO stock. Ensure it's not already received.");
  } finally {
    poActionLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
