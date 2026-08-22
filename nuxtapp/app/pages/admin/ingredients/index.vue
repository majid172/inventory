<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
        <div class="flex items-center gap-3">
          <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
            <span>🧪 Active Pharmaceutical Ingredients (API) & Chemical Compounds</span>
            <span class="text-xs bg-gray-800 text-emerald-400 border border-gray-700 px-2.5 py-0.5 rounded-full font-mono font-bold">{{ ingredients.length }}</span>
          </h2>

          <input 
            type="text" 
            v-model="filterText" 
            placeholder="Search API powder or chemical compound..." 
            class="bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <button 
          @click="showAddModal = true" 
          class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-950/40"
        >
          + Restock / Add API Chemical
        </button>
      </div>

      <!-- Ingredients Data Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">API CODE / SKU</th>
                <th class="py-3.5 px-4">CHEMICAL COMPOUND NAME</th>
                <th class="py-3.5 px-4">CATEGORY</th>
                <th class="py-3.5 px-4 text-right">RAW STOCK QTY</th>
                <th class="py-3.5 px-4 text-right">REORDER MIN</th>
                <th class="py-3.5 px-4 text-center">STATUS</th>
                <th class="py-3.5 px-4">MANUFACTURER / SUPPLIER</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="(ing, idx) in filteredIngredients" :key="ing.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 text-center text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  {{ ing.ingredient_id }}
                  <div class="text-[10px] text-gray-500">{{ ing.sku }}</div>
                </td>
                <td class="py-3.5 px-4 font-extrabold text-gray-100 text-sm">🧪 {{ ing.name }}</td>
                <td class="py-3.5 px-4 text-gray-400">{{ ing.category }}</td>
                <td class="py-3.5 px-4 text-right font-mono font-black text-sm text-gray-100">
                  {{ ing.stock }} <span class="text-xs text-gray-400 font-normal">{{ ing.unit }}</span>
                </td>
                <td class="py-3.5 px-4 text-right font-mono text-gray-400">{{ ing.min_level }} {{ ing.unit }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span 
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black border',
                      ing.status === 'IN STOCK' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      ing.status === 'LOW STOCK' ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse' :
                      'bg-rose-950 text-rose-400 border-rose-800'
                    ]"
                  >
                    {{ ing.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-gray-300 font-medium">{{ ing.supplier }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Ingredient Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base">Add Active Pharmaceutical Ingredient (API)</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CHEMICAL COMPOUND NAME *</label>
              <input type="text" v-model="newIng.name" placeholder="e.g. Paracetamol Micronized Powder" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">RAW STOCK QTY *</label>
                <input type="number" v-model.number="newIng.stock" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">UNIT (kg, liters, meters)</label>
                <input type="text" v-model="newIng.unit" placeholder="kg" class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false" class="flex-1 bg-gray-950 border border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
            <button @click="handleSaveIngredient" :disabled="!newIng.name" class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">Save Compound</button>
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
