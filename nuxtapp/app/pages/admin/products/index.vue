<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 select-none">
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="refreshList" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Catalog
            </button>
            <button @click="openAddModal"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white border border-[#0e6b37] font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label
              class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER:</label>
            <div class="relative">
              <input type="text" v-model="filterText" @input="onSearch" placeholder="Search brand, generic, supplier..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-emerald-500 w-56 sm:w-72" />
              <button v-if="filterText" @click="clearSearch"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Exact Match to Reference Typography -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal">SL.</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Generic Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Form & Strength</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Supplier</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">Price</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Qty in Stock</th>
                <th class="py-1.5 px-3 text-center w-28 font-normal">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="py-12">
                  <PharmacyLoader text="Loading Medicines Catalog..." />
                </td>
              </tr>
              <tr v-else-if="products.length === 0">
                <td colspan="8" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No medicines found.
                </td>
              </tr>
              <tr v-for="(row, idx) in products" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === row.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  <div class="flex items-center gap-1.5">
                    <span v-if="row.productType === 'medicine' && !row.masterDrugId" class="w-1.5 h-1.5 rounded-full bg-amber-500" title="Custom Medicine"></span>
                    <span>{{ row.name }}</span>
                  </div>
                </td>
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.genericName || row.name }}
                </td>
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.dosageForm || 'Tablet' }}<span v-if="row.strength && row.strength !== '-'"> ({{ row.strength }})</span>
                </td>
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.manufacturer || 'General' }}
                </td>
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="text-slate-800 dark:text-gray-200 font-normal">{{ settingsStore.currencySymbol }}{{ Number(row.price || 0).toFixed(2) }}</div>
                </td>
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="row.stockQuantity > 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'">
                    {{ row.stockQuantity || 0 }}
                  </span>
                </td>
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <button @click="openStockModal(row)"
                    class="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-normal cursor-pointer w-full text-center"
                    title="Add Stock">
                    Update Stock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Server-Side Pagination Footer -->
        <div class="px-3 py-2 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <div class="text-xs text-slate-600 dark:text-gray-400 font-normal">
            Showing {{ products.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }} - {{ (currentPage - 1) * itemsPerPage + products.length }} of {{ totalItems }} items
          </div>
          <div class="flex items-center gap-1.5">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="px-2 py-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-xs hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Prev
            </button>
            <span class="text-xs text-slate-700 dark:text-gray-300 font-medium px-2">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages"
              class="px-2 py-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-xs hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Update Stock Modal -->
      <div v-if="showStockModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden flex flex-col">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Update Stock: {{ stockProd.name }}
            </h3>
            <button @click="showStockModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleSaveStock" class="p-4 space-y-3 text-xs font-sans">
            
            <div class="p-2.5 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 rounded mb-3">
              <div class="text-[11px] text-sky-800 dark:text-sky-300 mb-1">Current Stock: <strong class="text-sm">{{ stockProd.stockQuantity || 0 }}</strong></div>
              <div class="text-[10px] text-sky-600 dark:text-sky-400">{{ stockProd.genericName || stockProd.name }} | {{ stockProd.dosageForm }}</div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Add Quantity *</label>
                <input type="number" v-model.number="stockForm.quantity" required min="1"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Supplier</label>
                <select v-model="stockForm.supplier_id"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option :value="null">Walk-in / Unknown</option>
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Cost Price (per unit) *</label>
                <input type="number" step="0.10" v-model.number="stockForm.purchase_price" required min="0"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Batch Number *</label>
                <input type="text" v-model="stockForm.batch_number" required placeholder="e.g. BATCH-001"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Expiry Date *</label>
                <input type="date" v-model="stockForm.expiry_date" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 mt-4 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showStockModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="stockSaving || stockForm.quantity <= 0"
                class="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-normal text-xs cursor-pointer flex items-center gap-1.5">
                <svg v-if="stockSaving" class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                  </path>
                </svg>
                Confirm Stock In
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add New Product Modal -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
          <!-- Titlebar -->
          <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between shrink-0">
            <h3 class="font-semibold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-2">
              <span>💊</span> Add New Custom Product
            </h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer">✕</button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleAddProduct" class="p-4 space-y-3 text-xs font-sans overflow-y-auto flex-1">
            
            <!-- Row 1: Name + Generic Name -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Brand / Trade Name <span class="text-red-500">*</span></label>
                <input type="text" v-model="addForm.name" required placeholder="e.g. Napa Extra"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Generic / Chemical Name</label>
                <input type="text" v-model="addForm.genericName" placeholder="e.g. Paracetamol + Caffeine"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <!-- Row 2: Dosage Form + Strength -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <select v-model="addForm.dosageForm"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option value="">-- Select Form --</option>
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Suspension</option>
                  <option>Injection</option>
                  <option>Cream/Ointment</option>
                  <option>Inhaler</option>
                  <option>Drops</option>
                  <option>Suppository</option>
                  <option>Patch</option>
                  <option>General Item</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Strength / Concentration</label>
                <input type="text" v-model="addForm.strength" placeholder="e.g. 500mg, 10mg/5ml"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <!-- Row 3: Category + Manufacturer -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Category</label>
                <select v-model="addForm.categoryId"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option :value="null">-- Select Category --</option>
                  <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Manufacturer / Brand</label>
                <input type="text" v-model="addForm.manufacturer" placeholder="e.g. Square Pharmaceuticals"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <!-- Row 4: Price + Cost -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Retail/Sale Price ({{ settingsStore.currencySymbol }}) <span class="text-red-500">*</span></label>
                <input type="number" step="0.01" min="0" v-model.number="addForm.price" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Purchase/Cost Price ({{ settingsStore.currencySymbol }})</label>
                <input type="number" step="0.01" min="0" v-model.number="addForm.cost"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <!-- Row 5: Barcode + Rack + Reorder -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Barcode</label>
                <input type="text" v-model="addForm.barcode" placeholder="Auto-generated if blank"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Rack / Shelf Location</label>
                <input type="text" v-model="addForm.rackLocation" placeholder="e.g. A-12"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 dark:text-gray-300 mb-1">Min Reorder Level</label>
                <input type="number" min="0" v-model.number="addForm.minReorderLevel"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <!-- Row 6: Rx Required toggle -->
            <div class="flex items-center gap-2 pt-1">
              <input type="checkbox" id="rxRequired" v-model="addForm.rxRequired"
                class="w-3.5 h-3.5 accent-emerald-600 cursor-pointer" />
              <label for="rxRequired" class="text-slate-700 dark:text-gray-300 cursor-pointer">Requires Prescription (Rx Only)</label>
            </div>

            <!-- Error -->
            <div v-if="addError" class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-2 text-[11px]">
              ⚠ {{ addError }}
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-3 mt-1 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showAddModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="addSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5">
                <svg v-if="addSaving" class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ addSaving ? 'Saving...' : 'Create Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '~/stores/categories';
import { useAdminSuppliers } from '~/composables/useAdminSuppliers';
import { useProductStore, type ProductItem } from '~/stores/products';
import { useSettingsStore } from '~/stores/settings';
import axios from 'axios';

const productsStore = useProductStore();
const settingsStore = useSettingsStore();
const categoryStore = useCategoryStore();
const { suppliers: supplierList } = useAdminSuppliers();

const { products, loading } = storeToRefs(productsStore);
const { fetchProducts, quickAddStock } = productsStore;

const { fetchCategories } = categoryStore;

// Server-Side Pagination State
const filterText = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);
const totalPages = ref(1);

const selectedRow = ref<number | null>(null);

let searchTimeout: any = null;

onMounted(() => {
  loadData();
  fetchCategories();
});

const loadData = async () => {
  const meta = await fetchProducts(currentPage.value, itemsPerPage.value, filterText.value);
  if (meta) {
    totalItems.value = meta.total;
    totalPages.value = meta.totalPages;
  }
};

const refreshList = () => {
  currentPage.value = 1;
  loadData();
};

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 300);
};

const clearSearch = () => {
  filterText.value = '';
  currentPage.value = 1;
  loadData();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadData();
  }
};


// Quick Stock Update Modal State
const showStockModal = ref(false);
const stockSaving = ref(false);
const stockProd = ref<any>({});
const stockForm = ref({
  quantity: 0,
  supplier_id: null as number | null,
  purchase_price: 0,
  batch_number: '',
  expiry_date: ''
});

const openStockModal = (product: any) => {
  stockProd.value = product;
  stockForm.value = {
    quantity: 10,
    supplier_id: null,
    purchase_price: Number(product.cost || product.price * 0.7).toFixed(2) as unknown as number,
    batch_number: `B-${new Date().getTime().toString().slice(-6)}`,
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  };
  showStockModal.value = true;
};

const handleSaveStock = async () => {
  if (stockForm.value.quantity <= 0) return;
  stockSaving.value = true;
  try {
    const payload = {
      product_id: stockProd.value.actualProductId || null,
      master_drug_id: stockProd.value.masterDrugId || null,
      batch_number: stockForm.value.batch_number,
      expiry_date: stockForm.value.expiry_date,
      quantity: stockForm.value.quantity,
      purchase_price: stockForm.value.purchase_price,
      supplier_id: stockForm.value.supplier_id
    };
    
    await quickAddStock(payload);
    
    showStockModal.value = false;
    // Reload the current page to reflect new stock
    loadData();
  } catch (e: any) {
    alert("Error adding stock: " + (e.message || "Failed to communicate with server"));
  } finally {
    stockSaving.value = false;
  }
};

// ─── Add New Product Modal ────────────────────────────────────────────────────
const showAddModal = ref(false);
const addSaving = ref(false);
const addError = ref('');

const defaultAddForm = () => ({
  name: '',
  genericName: '',
  dosageForm: 'Tablet',
  strength: '',
  categoryId: null as number | null,
  manufacturer: '',
  price: 0,
  cost: 0,
  barcode: '',
  rackLocation: '',
  minReorderLevel: 10,
  rxRequired: false
});

const addForm = ref(defaultAddForm());

const openAddModal = () => {
  addForm.value = defaultAddForm();
  addError.value = '';
  showAddModal.value = true;
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user?.tenantId && user.tenantId !== 'SYSTEM') headers['x-tenant-id'] = String(user.tenantId);
      } catch (e) {}
    }
    if (!headers['x-tenant-id']) {
      const savedStore = localStorage.getItem('active_tenant_store');
      if (savedStore) {
        try {
          const s = JSON.parse(savedStore);
          if (s?.id) headers['x-tenant-id'] = String(s.id);
        } catch (e) {}
      }
    }
  }
  return headers;
};

const handleAddProduct = async () => {
  addError.value = '';
  if (!addForm.value.name.trim()) {
    addError.value = 'Product name is required.';
    return;
  }
  if (addForm.value.price <= 0) {
    addError.value = 'Retail price must be greater than 0.';
    return;
  }
  addSaving.value = true;
  try {
    const payload = {
      name: addForm.value.name.trim(),
      genericName: addForm.value.genericName.trim(),
      dosageForm: addForm.value.dosageForm,
      strength: addForm.value.strength.trim(),
      categoryId: addForm.value.categoryId,
      manufacturer: addForm.value.manufacturer.trim(),
      price: addForm.value.price,
      cost: addForm.value.cost,
      barcode: addForm.value.barcode.trim() || undefined,
      rackLocation: addForm.value.rackLocation.trim(),
      minReorderLevel: addForm.value.minReorderLevel,
      rxRequired: addForm.value.rxRequired ? 1 : 0
    };
    await axios.post('/products', payload, { headers: getAuthHeaders() });
    showAddModal.value = false;
    currentPage.value = 1;
    loadData();
  } catch (e: any) {
    addError.value = e?.response?.data?.message || e?.message || 'Failed to create product. Please try again.';
  } finally {
    addSaving.value = false;
  }
};
</script>
