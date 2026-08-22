<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="db-grid-container">
        <!-- Top Toolbar -->
        <div class="db-grid-toolbar flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true" class="db-grid-button bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
              <span class="text-base font-black">+</span> New Medical Category
            </button>
            <button @click="fetchCategories" :disabled="loading" class="db-grid-button text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
              <svg :class="['w-3.5 h-3.5 mr-1', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-gray-400 font-medium text-xs">Search Filter:</label>
            <input type="text" v-model="filterText" placeholder="Search category name..." class="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <!-- Database Table Grid -->
        <div class="db-grid-table-wrapper">
          <table class="db-grid-table w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                <th class="py-2.5 px-3">SL</th>
                <th class="py-2.5 px-3">CATEGORY NAME</th>
                <th class="py-2.5 px-3">URL SLUG</th>
                <th class="py-2.5 px-3 text-right">MEDICINE COUNT</th>
                <th class="py-2.5 px-3 text-center">STATUS</th>
                <th class="py-2.5 px-3">CREATED AT</th>
                <th class="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-800/60">
              <tr v-if="filteredCategories.length === 0">
                <td colSpan="7" class="text-center py-6 text-gray-500 font-mono">
                  No medical categories found.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredCategories" :key="row.id" @click="selectedRow = row.id"
                :class="['hover:bg-gray-800/40 transition-colors', selectedRow === row.id ? 'bg-gray-800/60' : '']">
                <td class="py-3 px-3 text-gray-500 font-mono">{{ idx + 1 }}</td>

                <td class="py-3 px-3 font-bold text-gray-100 flex items-center gap-2">
                  <span>📁</span>
                  <span>{{ row.name }}</span>
                </td>
                <td class="py-3 px-3 font-mono text-emerald-400/90">{{ row.slug }}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-emerald-400">{{ row.product_count ?? 0 }}</td>
                <td class="py-3 px-3 text-center font-bold">
                  <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md text-[10px]">
                    {{ row.status }}
                  </span>
                </td>
                <td class="py-3 px-3 text-gray-500 font-mono">
                  {{ row.created_at || '2026-08-10 10:00:00' }}
                </td>
                <td class="py-3 px-3 text-center">
                  <div class="flex items-center justify-center gap-2" @click.stop>
                    <button @click="openEditModal(row)"
                      class="w-7 h-7 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                      title="Edit Category">
                      ✏️
                    </button>
                    <button @click="handleRemoveCategory(row.id, row.name)"
                      class="w-7 h-7 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 border border-rose-500/40 rounded-lg text-sm font-black flex items-center justify-center transition-all"
                      title="Remove Category">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Status Bar -->
        <div class="db-grid-footer flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
          <div>Showing {{ filteredCategories.length }} medical categories</div>
          <div>Pharmacy Categories Database - Connected</div>
        </div>
      </div>

      <!-- Add Category Modal Form -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base">Create Medical Category</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CATEGORY NAME *</label>
              <input type="text" v-model="newCatName" placeholder="e.g. Ophthalmology & Eye Care"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">STATUS</label>
              <select v-model="newCatStatus"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false"
              class="flex-1 bg-gray-950 border border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs">
              Cancel
            </button>
            <button @click="handleSaveCategory" :disabled="!newCatName"
              class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
              Save Category
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Category Modal Form -->
      <div v-if="showEditModal" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 class="font-black text-emerald-400 text-base">Edit Medical Category</h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CATEGORY NAME *</label>
              <input type="text" v-model="editCatName"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">STATUS</label>
              <select v-model="editCatStatus"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showEditModal = false"
              class="flex-1 bg-gray-950 border border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs">
              Cancel
            </button>
            <button @click="handleUpdateCategory" :disabled="!editCatName"
              class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40">
              Update Category
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
import { useCategoryStore, type CategoryItem } from '~/stores/categories';

const categoryStore = useCategoryStore();
const { categories, loading } = storeToRefs(categoryStore);
const { fetchCategories, addCategory, updateCategory, deleteCategory } = categoryStore;

const filterText = ref('');
const selectedRow = ref<number | null>(1);

// Add Modal State
const showAddModal = ref(false);
const newCatName = ref('');
const newCatStatus = ref<'ACTIVE' | 'INACTIVE'>('ACTIVE');

// Edit Modal State
const showEditModal = ref(false);
const editingId = ref<number | null>(null);
const editCatName = ref('');
const editCatStatus = ref<'ACTIVE' | 'INACTIVE'>('ACTIVE');

onMounted(() => {
  fetchCategories();
});

const filteredCategories = computed(() => {
  const query = filterText.value.toLowerCase();
  return categories.value.filter(c => {
    const catId = (c.category_id || c.categoryId || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    return name.includes(query) || catId.includes(query);
  });
});

const handleSaveCategory = async () => {
  if (!newCatName.value) return;
  await addCategory({ name: newCatName.value, status: newCatStatus.value });
  newCatName.value = '';
  showAddModal.value = false;
};

const openEditModal = (category: CategoryItem) => {
  editingId.value = category.id;
  editCatName.value = category.name;
  editCatStatus.value = category.status;
  showEditModal.value = true;
};

const handleUpdateCategory = async () => {
  if (!editingId.value || !editCatName.value) return;
  await updateCategory(editingId.value, {
    name: editCatName.value,
    status: editCatStatus.value
  });
  showEditModal.value = false;
  editingId.value = null;
};

const handleRemoveCategory = async (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete category "${name}"?`)) {
    await deleteCategory(id);
  }
};
</script>
