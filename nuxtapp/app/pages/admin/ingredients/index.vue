<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> Restock / Add API Chemical
            </button>
            <span class="font-normal text-xs text-slate-500 dark:text-gray-400">
              Total Compounds: {{ ingredients.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER SEARCH:</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="filterText" 
                placeholder="Search API powder or chemical..." 
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
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">API CODE / SKU</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">CHEMICAL COMPOUND NAME</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">CATEGORY</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">RAW STOCK QTY</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">REORDER MIN</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">STATUS</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">MANUFACTURER / SUPPLIER</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredIngredients.length === 0">
                <td colSpan="8" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No chemical compounds found in database grid.
                </td>
              </tr>
              <tr 
                v-for="(ing, idx) in paginatedData" 
                :key="ing.id" 
                @click="selectedRow = ing.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === ing.id 
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

                <!-- API Code -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === ing.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ ing.ingredient_id }}
                  <div class="text-[10px]" :class="selectedRow === ing.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">SKU: {{ ing.sku }}</div>
                </td>

                <!-- Compound Name -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="flex items-center gap-1.5">
                    <span></span>
                    <span :class="selectedRow === ing.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">{{ ing.name }}</span>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === ing.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ ing.category }}
                </td>

                <!-- Raw Stock Qty -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === ing.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ ing.stock }} <span class="text-[11px]" :class="selectedRow === ing.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">{{ ing.unit }}</span>
                </td>

                <!-- Reorder Min -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === ing.id ? 'text-slate-600 dark:text-gray-400' : 'text-slate-500 dark:text-gray-400'">
                  {{ ing.min_level }} {{ ing.unit }}
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-normal border uppercase tracking-wider',
                      ing.status === 'IN STOCK' ? selectedRow === ing.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' :
                      ing.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 animate-pulse' :
                      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                    ]"
                  >
                    ● {{ ing.status }}
                  </span>
                </td>

                <!-- Supplier -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal" :class="selectedRow === ing.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ ing.supplier }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <PaginationControls 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          :total-items="filteredIngredients.length" 
          :items-per-page="itemsPerPage"
          @prev="prevPage" 
          @next="nextPage" 
        />
      </div>

      <!-- Add Ingredient Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base">Add Active Pharmaceutical Ingredient (API)</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CHEMICAL COMPOUND NAME *</label>
              <input type="text" v-model="newIng.name" placeholder="e.g. Paracetamol Micronized Powder" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">RAW STOCK QTY *</label>
                <input type="number" v-model.number="newIng.stock" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">UNIT (kg, liters, meters)</label>
                <input type="text" v-model="newIng.unit" placeholder="kg" class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false" class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">Cancel</button>
            <button @click="handleSaveIngredient" :disabled="!newIng.name" class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">Save Compound</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminIngredients, type AdminIngredient } from '~/composables/useAdminIngredients';
import { usePagination } from '~/composables/usePagination';
import PaginationControls from '~/components/PaginationControls.vue';

const { ingredients, addIngredient } = useAdminIngredients();
const filterText = ref('');
const selectedRow = ref<string | null>(null);
const showAddModal = ref(false);
const newIng = ref<Partial<AdminIngredient>>({ name: '', stock: 100, unit: 'kg', min_level: 20 });

const filteredIngredients = computed(() => {
  const query = filterText.value.toLowerCase();
  return ingredients.value.filter(i => i.name.toLowerCase().includes(query) || i.ingredient_id.toLowerCase().includes(query));
});

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(filteredIngredients, 10);

const handleSaveIngredient = () => {
  if (!newIng.value.name) return;
  addIngredient(newIng.value);
  newIng.value = { name: '', stock: 100, unit: 'kg', min_level: 20 };
  showAddModal.value = false;
};
</script>
