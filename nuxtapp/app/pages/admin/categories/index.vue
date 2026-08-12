<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="db-grid-container">
        <!-- Top Toolbar -->
        <div class="db-grid-toolbar">
          <div class="flex items-center gap-2">
            <button @click="showAddModal = true" class="db-grid-button">
              <span class="text-green-600 font-bold mr-1">+</span> New Category
            </button>
            <button @click="fetchCategories" :disabled="loading" class="db-grid-button">
              <svg :class="['w-3 h-3 mr-1', { 'animate-spin': loading }]" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh
            </button>
          </div>

          <div class="flex items-center gap-2 border-l border-gray-700 pl-4">
            <label class="text-gray-400 font-medium">Filter:</label>
            <input type="text" v-model="filterText" placeholder="Enter SQL filter..." class="db-grid-input" />
          </div>
        </div>

        <!-- Database Table Grid -->
        <div class="db-grid-table-wrapper">
          <table class="db-grid-table">
            <thead>
              <tr>
                <th class="px-1 py-1 w-8 text-center bg-[#e8e8e8]">SL</th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>NAME</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group">
                  <div class="flex items-center justify-between">
                    <span>SLUG</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-right">
                  <div class="flex items-center justify-end gap-1">
                    <span>PRODUCT_COUNT</span>
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
                    <span>CREATED_AT</span>
                    <span class="text-[10px] text-gray-400">˅</span>
                  </div>
                </th>

                <th class="cursor-pointer group text-center">
                  <div class="flex items-center justify-center">
                    <span>ACTIONS</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredCategories.length === 0">
                <td colSpan="7" class="text-center py-6 text-gray-500 font-mono">
                  No records found.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredCategories" :key="row.id" @click="selectedRow = row.id"
                :class="{ isSelected: selectedRow === row.id }">
                <td class="db-grid-idx">{{ idx + 1 }}</td>

                <td class="db-grid-td font-semibold text-slate-800">{{ row.name }}</td>
                <td class="db-grid-td font-mono text-gray-600">{{ row.slug }}</td>
                <td class="db-grid-td text-right font-mono font-bold">{{ row.product_count ?? 0 }}</td>
                <td :class="[
                  'db-grid-td text-center font-extrabold',
                  row.status === 'ACTIVE' ? 'db-grid-status-active' : 'db-grid-status-inactive'
                ]">
                  {{ row.status }}
                </td>
                <td class="db-grid-td text-gray-600 font-mono">
                  {{ row.created_at || '2026-08-10 10:00:00.000000000 AM' }}
                </td>
                <td class="db-grid-td text-center font-sans">
                  <div class="flex items-center justify-center gap-2" @click.stop>
                    <button 
                      @click="openEditModal(row)" 
                      class="w-7 h-7 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-sm"
                      title="Edit Category"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="handleRemoveCategory(row.id, row.name)" 
                      class="w-7 h-7 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 border border-rose-500/40 rounded-lg text-sm font-black flex items-center justify-center transition-all shadow-sm"
                      title="Remove Category"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Status Bar -->
        <div class="db-grid-footer">
          <div class="flex items-center gap-2">
            <span>{{ filteredCategories.length }} rows fetched.</span>
            <span class="text-gray-400">|</span>
            <span>Categories Database - Connected (0.010s)</span>
          </div>
        </div>
      </div>

      <!-- Add Category Modal Form -->
      <div v-if="showAddModal" class="modal-backdrop select-none">
        <div class="modal-content max-w-md">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <h3 class="font-extrabold text-amber-500 text-base">Create New Category</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">CATEGORY NAME *</label>
              <input type="text" v-model="newCatName" placeholder="e.g. Special Pastries"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">STATUS</label>
              <select v-model="newCatStatus"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="showAddModal = false"
              class="flex-1 bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-700">
              Cancel
            </button>
            <button @click="handleSaveCategory" :disabled="!newCatName"
              class="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">
              Save Category
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Category Modal Form -->
      <div v-if="showEditModal" class="modal-backdrop select-none">
        <div class="modal-content max-w-md">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <h3 class="font-extrabold text-amber-500 text-base">Edit Category</h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">CATEGORY NAME *</label>
              <input type="text" v-model="editCatName"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">STATUS</label>
              <select v-model="editCatStatus"
                class="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 font-sans">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="showEditModal = false"
              class="flex-1 bg-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs border border-gray-700">
              Cancel
            </button>
            <button @click="handleUpdateCategory" :disabled="!editCatName"
              class="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black py-2.5 rounded-xl text-xs">
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
