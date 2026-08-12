<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="db-grid-container">
        <!-- Top Toolbar -->
        <div class="db-grid-toolbar">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true" class="db-grid-button">
              <span class="text-green-600 font-bold mr-1">+</span> New Product
            </button>
            <button @click="fetchProducts" :disabled="loading" class="db-grid-button">
              <svg :class="['w-3 h-3 mr-1', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <div class="flex items-center gap-2 border-l border-gray-700 pl-4">
            <label class="text-gray-400 font-medium">Filter:</label>
            <input 
              type="text" 
              v-model="filterText" 
              placeholder="Enter SQL filter..." 
              class="db-grid-input"
            />
          </div>
        </div>

        <!-- Database Table Grid -->
        <div class="db-grid-table-wrapper">
          <table class="db-grid-table">
            <thead>
              <tr>
                <th class="px-1 py-1 w-8 text-center bg-[#e8e8e8]"></th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>PRODUCT_ID</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>NAME</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>CATEGORY</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-right">
                  <div class="flex items-center justify-end gap-1">
                    <span>PRICE</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-right">
                  <div class="flex items-center justify-end gap-1">
                    <span>RECIPE_COST</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-center">
                  <div class="flex items-center justify-center gap-1">
                    <span>TAX_RATE</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-center">
                  <div class="flex items-center justify-between">
                    <span>STATUS</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>UPDATED_AT</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colSpan="9" class="text-center py-6 text-gray-500 font-mono">
                  No records found.
                </td>
              </tr>
              <tr 
                v-for="(row, idx) in filteredProducts" 
                :key="row.id" 
                @click="selectedRow = row.id"
                :class="{ isSelected: selectedRow === row.id }"
              >
                <td class="db-grid-idx">{{ idx + 1 }}</td>
                <td class="db-grid-td db-grid-link">{{ row.productId || row.product_id }}</td>
                <td class="db-grid-td font-semibold text-slate-800">{{ row.name }}</td>
                <td class="db-grid-td text-gray-600">{{ row.category }}</td>
                <td class="db-grid-td text-right font-mono font-bold">${{ row.price.toFixed(2) }}</td>
                <td class="db-grid-td text-right font-mono text-gray-600">${{ row.cost.toFixed(2) }}</td>
                <td class="db-grid-td text-center font-mono font-bold">{{ row.taxRate || row.tax_rate || 8 }}%</td>
                <td 
                  :class="[
                    'db-grid-td text-center font-extrabold',
                    row.status === 'AVAILABLE' ? 'db-grid-status-active' : 'db-grid-status-inactive'
                  ]"
                >
                  {{ row.status }}
                </td>
                <td class="db-grid-td text-gray-600 font-mono">
                  {{ row.updated_at || '2026-08-12 15:49:51.000000000 PM' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Status Bar -->
        <div class="db-grid-footer">
          <div class="flex items-center gap-2">
            <span>{{ filteredProducts.length }} rows fetched.</span>
            <span class="text-gray-400">|</span>
            <span>Prev Page 1 of 1 Next</span>
          </div>
          <div>Products Database - Connected (0.012s)</div>
        </div>
      </div>

      <!-- Add Product Modal Form -->
      <div v-if="showAddModal" class="modal-backdrop select-none">
        <div class="modal-content max-w-md">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <h3 class="font-extrabold text-amber-500 text-base">Add New Menu Product</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">PRODUCT NAME *</label>
              <input 
                type="text" 
                v-model="newProd.name" 
                placeholder="e.g. Iced Cold Brew"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">CATEGORY</label>
              <select 
                v-model="newProd.category" 
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans"
              >
                <option value="Hot Drinks">Hot Drinks</option>
                <option value="Cold Drinks">Cold Drinks</option>
                <option value="Bakery">Bakery</option>
                <option value="Retail Coffee">Retail Coffee</option>
                <option value="Merchandise">Merchandise</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">RETAIL PRICE ($)</label>
                <input 
                  type="number" 
                  step="0.10"
                  v-model.number="newProd.price" 
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">RECIPE COST ($)</label>
                <input 
                  type="number" 
                  step="0.10"
                  v-model.number="newProd.cost" 
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="showAddModal = false" class="flex-1 bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-700">
              Cancel
            </button>
            <button @click="handleSaveProduct" :disabled="!newProd.name" class="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore, type ProductItem } from '~/stores/products';

const productStore = useProductStore();
const { products, loading } = storeToRefs(productStore);
const { fetchProducts, addProduct } = productStore;

const filterText = ref('');
const selectedRow = ref<number | null>(2);
const showAddModal = ref(false);
const newProd = ref<Partial<ProductItem>>({ name: '', category: 'Hot Drinks', price: 4.50, cost: 0.85 });

onMounted(() => {
  fetchProducts();
});

const filteredProducts = computed(() => {
  const query = filterText.value.toLowerCase();
  return products.value.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.productId.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
});

const handleSaveProduct = () => {
  if (!newProd.value.name) return;
  addProduct(newProd.value);
  newProd.value = { name: '', category: 'Hot Drinks', price: 4.50, cost: 0.85 };
  showAddModal.value = false;
};
</script>
