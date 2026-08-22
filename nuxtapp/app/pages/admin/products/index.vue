<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="db-grid-container">
        <!-- Top Toolbar -->
        <div class="db-grid-toolbar flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="db-grid-button bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm">
              <span class="text-base font-black">+</span> Add New Medicine
            </button>
            <button @click="fetchProducts" :disabled="loading"
              class="db-grid-button text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
              <svg :class="['w-3.5 h-3.5 mr-1', { 'animate-spin': loading }]" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Catalog
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-gray-400 font-medium text-xs">Search Filter:</label>
            <input type="text" v-model="filterText" placeholder="Search generic, brand, supplier, or batch..."
              class="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans" />
          </div>
        </div>

        <!-- Database Table Grid -->
        <div class="db-grid-table-wrapper">
          <table class="db-grid-table w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                <th class="py-2.5 px-3 w-10 text-center">#</th>
                <th class="py-2.5 px-3">BRAND NAME</th>
                <th class="py-2.5 px-3">GENERIC COMPOUND</th>
                <th class="py-2.5 px-3">FORM & STRENGTH</th>
                <th class="py-2.5 px-3">CATEGORY</th>
                <th class="py-2.5 px-3">SUPPLIER / DISTRIBUTOR</th>
                <th class="py-2.5 px-3 text-right">PRICE / COST</th>
                <th class="py-2.5 px-3 text-center">STOCK QTY</th>
                <th class="py-2.5 px-3 text-center">Rx FLAG</th>
                <th class="py-2.5 px-3">BATCH & EXPIRY</th>
                <th class="py-2.5 px-3 text-center">STATUS</th>
                <th class="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-800/60">
              <tr v-if="filteredProducts.length === 0">
                <td colSpan="12" class="text-center py-8 text-gray-500 font-mono">
                  No medicines found in database catalog.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredProducts" :key="row.id" @click="selectedRow = row.id" :class="[
                'hover:bg-gray-800/40 transition-colors',
                selectedRow === row.id ? 'bg-gray-800/60' : ''
              ]">
                <td class="py-3 px-3 text-gray-500 font-mono text-center">{{ idx + 1 }}</td>
                <td class="py-3 px-3 font-bold text-gray-100 flex items-center gap-2">
                  <span>{{ row.icon || '💊' }}</span>
                  <span>{{ row.name }}</span>
                </td>
                <td class="py-3 px-3 text-emerald-400/90 font-medium">🧪 {{ row.genericName || row.name }}</td>
                <td class="py-3 px-3 font-mono text-gray-300">
                  <span class="bg-gray-950 px-2 py-0.5 rounded border border-gray-800 text-[11px]">
                    {{ row.dosageForm }} ({{ row.strength }})
                  </span>
                </td>
                <td class="py-3 px-3 text-gray-400">{{ row.category }}</td>
                <td class="py-3 px-3 text-sky-400 font-medium">
                  🏭 {{ row.manufacturer || 'GSK Pharmaceuticals' }}
                </td>
                <td class="py-3 px-3 text-right font-mono">
                  <div class="font-bold text-emerald-400">${{ row.price.toFixed(2) }}</div>
                  <div class="text-[10px] text-gray-500">Cost: ${{ row.cost.toFixed(2) }}</div>
                </td>
                <td class="py-3 px-3 text-center font-mono font-bold">
                  <span :class="[
                    'px-2 py-0.5 rounded text-xs',
                    (row.stockQuantity || 0) <= (row.minReorderLevel || 15) ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-gray-200'
                  ]">
                    {{ row.stockQuantity || 0 }}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black font-mono border',
                    row.rxRequired ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  ]">
                    {{ row.rxRequired ? 'Rx Required' : 'OTC' }}
                  </span>
                </td>
                <td class="py-3 px-3 font-mono text-[11px]">
                  <div class="text-gray-200">Lot: {{ row.batchNumber }}</div>
                  <div class="text-amber-400">Exp: {{ row.expiryDate }}</div>
                </td>
                <td class="py-3 px-3 text-center font-bold">
                  <span :class="[
                    'px-2 py-0.5 rounded-md text-[10px] border',
                    row.status == 1 || row.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                  ]">
                    {{ row.status == 1 || row.status === 'AVAILABLE' ? 'Available' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <div class="flex items-center justify-center gap-1.5" @click.stop>
                    <button @click="openEditModal(row)"
                      class="w-7 h-7 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                      title="Edit Medicine">
                      ✏️
                    </button>
                    <button @click="handleDeleteMedicine(row.id, row.name)"
                      class="w-7 h-7 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 border border-rose-500/40 rounded-lg text-sm font-black flex items-center justify-center transition-all"
                      title="Delete Medicine">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Status Bar -->
        <div
          class="db-grid-footer flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
          <div>Showing {{ filteredProducts.length }} medicine entries</div>
          <div>Pharmacy Medicines Database - Connected</div>
        </div>
      </div>

      <!-- Add Medicine Modal Form -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base flex items-center gap-2">
              <span>💊</span> Add New Medicine to Catalog
            </h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">BRAND NAME *</label>
                <input type="text" v-model="newProd.name" placeholder="e.g. Amoxicillin 500mg"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">GENERIC COMPOUND NAME</label>
                <input type="text" v-model="newProd.genericName" placeholder="e.g. Amoxicillin Trihydrate"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">DOSAGE FORM</label>
                <select v-model="newProd.dosageForm"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">STRENGTH</label>
                <input type="text" v-model="newProd.strength" placeholder="e.g. 500mg"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">CATEGORY</label>
                <select v-model="newProd.categoryId"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">SUPPLIER / DISTRIBUTOR</label>
                <select v-model="newProd.manufacturer"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="" disabled>Select Supplier</option>
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">
                    {{ sup.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">SHELF / RACK LOCATION</label>
                <input type="text" v-model="newProd.rackLocation" placeholder="Shelf A-04"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">RETAIL PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.price"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">COST PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.cost"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-300 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">STOCK QTY</label>
                <input type="number" v-model.number="newProd.stockQuantity"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">MIN REORDER</label>
                <input type="number" v-model.number="newProd.minReorderLevel"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">BATCH LOT #</label>
                <input type="text" v-model="newProd.batchNumber" placeholder="BATCH-2026-X1"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">EXPIRY DATE</label>
                <input type="date" v-model="newProd.expiryDate"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-800">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="rxReq" v-model="newProd.rxRequired"
                  class="w-4 h-4 rounded bg-gray-950 border-gray-800 text-emerald-500 focus:ring-emerald-500" />
                <label for="rxReq" class="font-bold text-rose-400 cursor-pointer">Prescription Required (Rx
                  Medicine)</label>
              </div>

              <div class="flex items-center gap-2">
                <label class="font-bold text-gray-300">STATUS:</label>
                <select v-model="newProd.status"
                  class="bg-gray-950 border border-gray-800 rounded-lg p-1 text-xs text-gray-200">
                  <option value="1">AVAILABLE</option>
                  <option value="0">OUT OF STOCK</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-gray-800">
            <button @click="showAddModal = false"
              class="flex-1 bg-gray-950 hover:bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-800">
              Cancel
            </button>
            <button @click="handleSaveProduct" :disabled="!newProd.name"
              class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
              Save Medicine to Catalog
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Medicine Modal Form -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base flex items-center gap-2">
              <span>✏️</span> Edit Medicine: {{ editProd.name }}
            </h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">BRAND NAME *</label>
                <input type="text" v-model="editProd.name"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">GENERIC COMPOUND NAME</label>
                <input type="text" v-model="editProd.genericName"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">DOSAGE FORM</label>
                <select v-model="editProd.dosageForm"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">STRENGTH</label>
                <input type="text" v-model="editProd.strength"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">CATEGORY</label>
                <select v-model="editProd.categoryId"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">SUPPLIER / DISTRIBUTOR</label>
                <select v-model="editProd.manufacturer"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">
                    {{ sup.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">SHELF / RACK LOCATION</label>
                <input type="text" v-model="editProd.rackLocation"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">RETAIL PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.price"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">COST PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.cost"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-300 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">STOCK QTY</label>
                <input type="number" v-model.number="editProd.stockQuantity"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">MIN REORDER</label>
                <input type="number" v-model.number="editProd.minReorderLevel"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">BATCH LOT #</label>
                <input type="text" v-model="editProd.batchNumber"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">EXPIRY DATE</label>
                <input type="date" v-model="editProd.expiryDate"
                  class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-800">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="rxReqEdit" v-model="editProd.rxRequired"
                  class="w-4 h-4 rounded bg-gray-950 border-gray-800 text-emerald-500 focus:ring-emerald-500" />
                <label for="rxReqEdit" class="font-bold text-rose-400 cursor-pointer">Prescription Required (Rx
                  Medicine)</label>
              </div>

              <div class="flex items-center gap-2">
                <label class="font-bold text-gray-300">STATUS:</label>
                <select v-model="editProd.status"
                  class="bg-gray-950 border border-gray-800 rounded-lg p-1 text-xs text-gray-200">
                  <option value="1">AVAILABLE</option>
                  <option value="0">OUT OF STOCK</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-gray-800">
            <button @click="showEditModal = false"
              class="flex-1 bg-gray-950 hover:bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-800">
              Cancel
            </button>
            <button @click="handleUpdateProduct" :disabled="!editProd.name"
              class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
              Update Medicine Record
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
import { useCategoryStore } from '~/stores/categories';
import { useAdminSuppliers } from '~/composables/useAdminSuppliers';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const { suppliers: supplierList } = useAdminSuppliers();

const { products, loading } = storeToRefs(productStore);
const { fetchProducts, addProduct, updateProduct, deleteProduct } = productStore;

const { categories: dbCategories } = storeToRefs(categoryStore);
const { fetchCategories } = categoryStore;

const filterText = ref('');
const selectedRow = ref<number | null>(1);

// Add Modal State
const showAddModal = ref(false);
const newProd = ref<Partial<ProductItem>>({
  name: '',
  genericName: '',
  dosageForm: 'Tablet',
  strength: '500mg',
  categoryId: 1,
  manufacturer: 'GSK Pharmaceuticals Ltd.',
  price: 0.00,
  cost: 0.00,
  taxRate: 0,
  status: 'AVAILABLE',
  rxRequired: false,
  batchNumber: 'BATCH-2026-NEW',
  expiryDate: '2028-06-30',
  rackLocation: 'Shelf A-01',
  stockQuantity: 100,
  minReorderLevel: 15
});

// Edit Modal State
const showEditModal = ref(false);
const editingId = ref<number | null>(null);
const editProd = ref<Partial<ProductItem>>({});

onMounted(() => {
  fetchProducts();
  fetchCategories();
});

const filteredProducts = computed(() => {
  const query = filterText.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.genericName && p.genericName.toLowerCase().includes(query)) ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes(query)) ||
    (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
    (p.category && p.category.toLowerCase().includes(query))
  );
});

const openAddModal = () => {
  if (dbCategories.value && dbCategories.value.length > 0) {
    newProd.value.categoryId = dbCategories.value[0].id;
  }
  showAddModal.value = true;
};

const handleSaveProduct = async () => {
  if (!newProd.value.name) return;
  await addProduct(newProd.value);
  newProd.value = {
    name: '',
    genericName: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    categoryId: dbCategories.value?.[0]?.id || 1,
    manufacturer: supplierList.value?.[0]?.name || 'GSK Pharmaceuticals Ltd.',
    price: 0.00,
    cost: 0.00,
    taxRate: 0,
    status: 'AVAILABLE',
    rxRequired: false,
    batchNumber: 'BATCH-2026-NEW',
    expiryDate: '2028-06-30',
    rackLocation: 'Shelf A-01',
    stockQuantity: 100,
    minReorderLevel: 15
  };
  showAddModal.value = false;
};

const openEditModal = (product: ProductItem) => {
  editingId.value = product.id;
  editProd.value = { ...product };
  showEditModal.value = true;
};

const handleUpdateProduct = async () => {
  if (!editingId.value || !editProd.value.name) return;
  await updateProduct(editingId.value, editProd.value);
  showEditModal.value = false;
  editingId.value = null;
};

const handleDeleteMedicine = async (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete medicine "${name}" from database?`)) {
    await deleteProduct(id);
  }
};
</script>
