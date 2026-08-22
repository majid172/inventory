<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame with 1px Gridlines -->
      <div class="border-1 border-slate-300 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div
          class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true"
              class="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white dark:text-gray-950 font-bold px-3 py-1.5 rounded border border-emerald-600 text-xs flex items-center gap-1 shadow-sm cursor-pointer active:scale-95">
              <span class="text-sm font-black mr-1">+</span> New Medical Category
            </button>
            <button @click="fetchCategories" :disabled="loading"
              class="bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer">
              <svg :class="['w-3.5 h-3.5 mr-1 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Table
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-extrabold text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider">FILTER
              SEARCH:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Filter category name or slug..."
                class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans shadow-inner w-56 sm:w-64" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 text-xs">✕</button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Visible 1px Gridlines -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr
                class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th
                  class="py-2.5 px-3 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">
                  #</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">CATEGORY NAME</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">URL SLUG</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-right">MEDICINES</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">CREATED AT</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredCategories.length === 0">
                <td colSpan="7"
                  class="py-8 text-center text-slate-400 dark:text-gray-500 font-mono text-xs border border-slate-300 dark:border-gray-800">
                  No medical categories found in database grid.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredCategories" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                selectedRow === row.id
                  ? 'bg-sky-500 text-white font-bold'
                  : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
              ]">
                <!-- Index Column with Desktop Number Cell Styling -->
                <td class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === row.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'">
                  {{ idx + 1 }}
                </td>

                <!-- Category Name -->
                <td class="py-2 px-3 font-extrabold border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center gap-2">
                    <span
                      :class="selectedRow === row.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">
                      {{ row.name }}
                    </span>
                  </div>
                </td>

                <!-- Slug -->
                <td class="py-2 px-3 font-mono font-semibold border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === row.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                  {{ row.slug }}
                </td>

                <!-- Medicine Count -->
                <td class="py-2 px-3 text-right font-mono font-black border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === row.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">
                  {{ row.product_count ?? 0 }}
                </td>

                <!-- Status Pointer Badge -->
                <td class="py-2 px-3 text-center font-bold border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider inline-flex items-center gap-1',
                    row.status === 'ACTIVE'
                      ? selectedRow === row.id ? 'bg-white text-emerald-800 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                      : selectedRow === row.id ? 'bg-white text-slate-800 border-white' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                  ]">
                    ● {{ row.status }}
                  </span>
                </td>

                <!-- Created At Date -->
                <td class="py-2 px-3 font-mono text-[11px] border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === row.id ? 'text-white' : 'text-slate-500 dark:text-gray-400'">
                  {{ row.created_at || '2026-08-10 10:00:00' }}
                </td>

                <!-- Actions -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      title="Edit Category">
                      ✏️ Edit
                    </button>
                    <button @click="handleRemoveCategory(row.id, row.name)"
                      class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-900 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      title="Remove Category">
                      ✕ Remove
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div
          class="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>Displaying <strong>{{ filteredCategories.length }}</strong> categories (Page 1 of 1)</div>
          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL Categories
            Database • Grid Connected</div>
        </div>
      </div>

      <!-- Add Category Modal Form -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base">Create Medical Category</h3>
            <button @click="showAddModal = false"
              class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CATEGORY NAME *</label>
              <input type="text" v-model="newCatName" placeholder="e.g. Ophthalmology & Eye Care"
                class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STATUS</label>
              <select v-model="newCatStatus"
                class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showAddModal = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              Cancel
            </button>
            <button @click="handleSaveCategory" :disabled="!newCatName"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
              Save Category
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Category Modal Form -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base">Edit Medical Category</h3>
            <button @click="showEditModal = false"
              class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CATEGORY NAME *</label>
              <input type="text" v-model="editCatName"
                class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STATUS</label>
              <select v-model="editCatStatus"
                class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showEditModal = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              Cancel
            </button>
            <button @click="handleUpdateCategory" :disabled="!editCatName"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
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
const selectedRow = ref<number | null>(null);

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
