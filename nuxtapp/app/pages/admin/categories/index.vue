<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 select-none">
      <!-- Desktop Application Database Data Grid Frame (Clean, Sharp Edges, Regular Font) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> New Medical Category
            </button>
            <button @click="fetchCategories" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Table
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label
              class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search category name..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-emerald-500 w-56 sm:w-64" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Exact Match to Image Typography -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># ID
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Category Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Description</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center w-24 font-normal">
                  Status</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right w-24 font-normal">
                  Products</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredCategories.length === 0">
                <td colspan="6" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No medical categories found.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredCategories" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === row.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ ++idx }}
                </td>

                <!-- Category Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  {{ row.name }}
                </td>

                <!-- Description -->
                <td
                  class="py-1.5 px-3 font-normal text-slate-600 dark:text-gray-400 border-r border-slate-200 dark:border-gray-800 max-w-sm truncate">
                  {{ (row as any).description || '-' }}
                </td>

                <!-- Status Badge (Clean & Subtle, Not Bold) -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'text-[11px] font-normal inline-flex items-center gap-1',
                    row.status === 1 || row.statusLabel === 'ACTIVE'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-gray-500'
                  ]">
                    {{ row.status === 1 || row.statusLabel === 'ACTIVE' ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Product Count -->
                <td
                  class="py-1.5 px-3 text-right font-normal text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">
                  {{ row.product_count ?? 0 }}
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Edit Category">
                      Edit
                    </button>
                    <button @click="handleRemoveCategory(row.id, row.name)"
                      class="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-gray-800 dark:text-rose-400 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Delete Category">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div
          class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-normal">
          <div>Total <strong>{{ filteredCategories.length }}</strong> categories</div>
          <div class="text-[10px] text-slate-400 font-normal">
            MySQL: <code>categories</code>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CLEAN & SHARP DESKTOP MODAL: CREATE CATEGORY (REGULAR FONT) -->
      <!-- ===================================================================== -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Desktop Window Titlebar (Clean, Regular Font) -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Create Medical Category
            </h3>

            <!-- Titlebar Controls -->
            <button @click="showAddModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer"
              title="Close [Esc]">
              ✕
            </button>
          </div>

          <!-- Clean Desktop Form Body (Regular Font) -->
          <form @submit.prevent="handleSaveCategory" class="p-4 space-y-3 text-xs font-sans">
            <!-- Category Name Field -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Category Name <span class="text-rose-500">*</span>
                </label>
                <span class="text-[10px] text-slate-400 font-normal">varchar(100)</span>
              </div>
              <input type="text" v-model="newCatName" required placeholder="e.g. Ophthalmology & Eye Care"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs" />
            </div>

            <!-- Description Field -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Description
                </label>
                <span class="text-[10px] text-slate-400 font-normal">text</span>
              </div>
              <textarea v-model="newCatDescription" rows="2" placeholder="Therapeutic classification details..."
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs resize-none"></textarea>
            </div>

            <!-- Status Dropdown -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Status
                </label>
              </div>
              <select v-model="newCatStatus"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                <option :value="1">Active</option>
                <option :value="0">Inactive</option>
              </select>
            </div>

            <!-- Desktop Action Bar Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showAddModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="!newCatName || isSaving"
                class="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span v-if="isSaving" class="animate-spin">⏳</span>
                <span>{{ isSaving ? 'Saving...' : 'Save Category' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CLEAN & SHARP DESKTOP MODAL: EDIT CATEGORY (REGULAR FONT) -->
      <!-- ===================================================================== -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Desktop Window Titlebar (Clean, Regular Font) -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Edit Medical Category (#{{ editingId }})
            </h3>

            <!-- Titlebar Controls -->
            <button @click="showEditModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer"
              title="Close [Esc]">
              ✕
            </button>
          </div>

          <!-- Clean Desktop Form Body (Regular Font) -->
          <form @submit.prevent="handleUpdateCategory" class="p-4 space-y-3 text-xs font-sans">
            <!-- Category Name Field -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Category Name <span class="text-rose-500">*</span>
                </label>
                <span class="text-[10px] text-slate-400 font-normal">varchar(100)</span>
              </div>
              <input type="text" v-model="editCatName" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs" />
            </div>

            <!-- Description Field -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Description
                </label>
                <span class="text-[10px] text-slate-400 font-normal">text</span>
              </div>
              <textarea v-model="editCatDescription" rows="2" placeholder="Therapeutic classification details..."
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs resize-none"></textarea>
            </div>

            <!-- Status Dropdown -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-normal text-slate-700 dark:text-gray-300">
                  Status
                </label>
              </div>
              <select v-model="editCatStatus"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                <option :value="1">Active</option>
                <option :value="0">Inactive</option>
              </select>
            </div>

            <!-- Desktop Action Bar Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showEditModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="!editCatName || isSaving"
                class="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span v-if="isSaving" class="animate-spin">⏳</span>
                <span>{{ isSaving ? 'Updating...' : 'Update Category' }}</span>
              </button>
            </div>
          </form>
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
const isSaving = ref(false);

// Add Modal State
const showAddModal = ref(false);
const newCatName = ref('');
const newCatDescription = ref('');
const newCatStatus = ref<number>(1);

// Edit Modal State
const showEditModal = ref(false);
const editingId = ref<number | null>(null);
const editCatName = ref('');
const editCatDescription = ref('');
const editCatStatus = ref<number>(1);

onMounted(() => {
  fetchCategories();
});

const filteredCategories = computed(() => {
  const query = filterText.value.toLowerCase();
  return categories.value.filter(c => {
    const name = (c.name || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    return name.includes(query) || desc.includes(query);
  });
});

const openAddModal = () => {
  newCatName.value = '';
  newCatDescription.value = '';
  newCatStatus.value = 1;
  showAddModal.value = true;
};

const handleSaveCategory = async () => {
  if (!newCatName.value) return;
  isSaving.value = true;
  try {
    await addCategory({
      name: newCatName.value,
      description: newCatDescription.value,
      status: newCatStatus.value
    });
    newCatName.value = '';
    newCatDescription.value = '';
    showAddModal.value = false;
  } catch (e: any) {
    alert("Error saving category: " + (e.message || "Failed to save in MySQL"));
  } finally {
    isSaving.value = false;
  }
};

const openEditModal = (category: CategoryItem) => {
  editingId.value = category.id;
  editCatName.value = category.name;
  editCatDescription.value = category.description || '';
  editCatStatus.value = (category.status === 0 || category.statusLabel === 'INACTIVE') ? 0 : 1;
  showEditModal.value = true;
};

const handleUpdateCategory = async () => {
  if (!editingId.value || !editCatName.value) return;
  isSaving.value = true;
  try {
    await updateCategory(editingId.value, {
      name: editCatName.value,
      description: editCatDescription.value,
      status: editCatStatus.value
    });
    showEditModal.value = false;
    editingId.value = null;
  } catch (e: any) {
    alert("Error updating category: " + (e.message || "Failed to update in MySQL"));
  } finally {
    isSaving.value = false;
  }
};

const handleRemoveCategory = async (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete category "${name}" (#${id})?`)) {
    await deleteCategory(id);
  }
};
</script>
