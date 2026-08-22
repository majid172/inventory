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
              <span class="text-sm font-black mr-1">+</span> Restock / Add API Chemical
            </button>
            <span class="font-mono text-xs font-bold text-slate-600 dark:text-gray-400 bg-slate-200 dark:bg-gray-800 px-2 py-1 rounded border border-slate-300 dark:border-gray-700">
              Total Compounds: {{ ingredients.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-extrabold text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider">FILTER SEARCH:</label>
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

        <!-- Desktop Grid Table Viewport with Visible 1px Gridlines -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">API CODE / SKU</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">CHEMICAL COMPOUND NAME</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">CATEGORY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-right">RAW STOCK QTY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-right">REORDER MIN</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">MANUFACTURER / SUPPLIER</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredIngredients.length === 0">
                <td colSpan="8" class="py-8 text-center text-slate-400 dark:text-gray-500 font-mono text-xs border border-slate-300 dark:border-gray-800">
                  No chemical compounds found in database grid.
                </td>
              </tr>
              <tr 
                v-for="(ing, idx) in filteredIngredients" 
                :key="ing.id" 
                @click="selectedRow = ing.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                  selectedRow === ing.id 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                ]"
              >
                <!-- Index Column -->
                <td 
                  class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === ing.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                >
                  {{ idx + 1 }}
                </td>

                <!-- API Code -->
                <td class="py-2 px-3 font-mono font-bold border border-slate-300 dark:border-gray-800" :class="selectedRow === ing.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                  {{ ing.ingredient_id }}
                  <div class="text-[10px]" :class="selectedRow === ing.id ? 'text-sky-100' : 'text-slate-400 dark:text-gray-500'">SKU: {{ ing.sku }}</div>
                </td>

                <!-- Compound Name -->
                <td class="py-2 px-3 font-extrabold border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center gap-1.5">
                    <span>🧪</span>
                    <span :class="selectedRow === ing.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">{{ ing.name }}</span>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === ing.id ? 'text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ ing.category }}
                </td>

                <!-- Raw Stock Qty -->
                <td class="py-2 px-3 text-right font-mono font-black border border-slate-300 dark:border-gray-800">
                  {{ ing.stock }} <span class="text-xs font-normal" :class="selectedRow === ing.id ? 'text-sky-100' : 'text-slate-500 dark:text-gray-400'">{{ ing.unit }}</span>
                </td>

                <!-- Reorder Min -->
                <td class="py-2 px-3 text-right font-mono border border-slate-300 dark:border-gray-800" :class="selectedRow === ing.id ? 'text-sky-100' : 'text-slate-500 dark:text-gray-400'">
                  {{ ing.min_level }} {{ ing.unit }}
                </td>

                <!-- Status -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider',
                      ing.status === 'IN STOCK' ? selectedRow === ing.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' :
                      ing.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 animate-pulse' :
                      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                    ]"
                  >
                    ● {{ ing.status }}
                  </span>
                </td>

                <!-- Supplier -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-semibold" :class="selectedRow === ing.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  {{ ing.supplier }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div class="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>Displaying <strong>{{ filteredIngredients.length }}</strong> active compounds (Page 1 of 1)</div>
          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">API Chemical Inventory • Grid Connected</div>
        </div>
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

const { ingredients, addIngredient } = useAdminIngredients();
const filterText = ref('');
const selectedRow = ref<string | null>(null);
const showAddModal = ref(false);
const newIng = ref<Partial<AdminIngredient>>({ name: '', stock: 100, unit: 'kg', min_level: 20 });

const filteredIngredients = computed(() => {
  const query = filterText.value.toLowerCase();
  return ingredients.value.filter(i => i.name.toLowerCase().includes(query) || i.ingredient_id.toLowerCase().includes(query));
});

const handleSaveIngredient = () => {
  if (!newIng.value.name) return;
  addIngredient(newIng.value);
  newIng.value = { name: '', stock: 100, unit: 'kg', min_level: 20 };
  showAddModal.value = false;
};
</script>
