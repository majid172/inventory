<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 select-none font-sans">
      <!-- Plan Limit Warning Banner when limit reached -->
      <div v-if="isPlanLimitReached"
        class="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900 dark:text-amber-200 shadow-2xs">
        <div class="flex items-center gap-2">
          <span class="text-sm">⚠️</span>
          <span>
            <strong>Plan Limit Reached:</strong> Your <strong>{{ userStore.planMeta.planName }}</strong> plan allows up to <strong>{{ userStore.planMeta.maxUsers }}</strong> staff accounts ({{ userStore.users.length }} currently enrolled).
          </span>
        </div>
        <NuxtLink to="/admin/billing"
          class="bg-[#107c41] hover:bg-[#0e6b37] text-white px-2.5 py-1 text-[11px] font-normal flex items-center gap-1 shadow-xs transition-all">
          <span>⚡ Upgrade Plan</span>
        </NuxtLink>
      </div>

      <!-- Desktop Application Database Data Grid Frame (Clean, Sharp Edges, Regular Font) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar Ribbon -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <!-- Left: Action buttons & Plan Meter -->
          <div class="flex items-center gap-2 flex-wrap">
            <button @click="handleAddStaffClick"
              :class="[
                'font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer',
                isPlanLimitReached
                  ? 'bg-slate-300 dark:bg-gray-800 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-gray-700'
                  : 'bg-[#107c41] hover:bg-[#0e6b37] text-white active:scale-95'
              ]">
              <span class="text-sm font-bold">+</span> Add Staff Member <span class="text-[10px] opacity-80 font-mono ml-0.5">[F2]</span>
            </button>

            <button @click="fetchStaff" :disabled="userStore.isLoading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': userStore.isLoading }]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh
            </button>

            <!-- Plan & Database Limits Meter Badge -->
            <div class="flex items-center gap-2 ml-1 pl-2.5 border-l border-slate-200 dark:border-gray-700 text-[11px] text-slate-600 dark:text-gray-400">
              <span class="px-1.5 py-0.5 bg-slate-200 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 font-mono text-[10px] text-slate-700 dark:text-gray-300 uppercase">
                Plan: {{ userStore.planMeta.planName }}
              </span>
              <span>Capacity: <strong :class="isPlanLimitReached ? 'text-rose-600 dark:text-rose-400 font-mono font-bold' : 'text-slate-800 dark:text-gray-200 font-mono'">{{ userStore.users.length }} / {{ userStore.planMeta.maxUsers }}</strong> Users</span>
              <span class="text-slate-300 dark:text-gray-700 hidden sm:inline">|</span>
              <span class="hidden sm:inline">Active: <strong class="text-emerald-700 dark:text-emerald-400 font-mono">{{ activeUsersCount }}</strong></span>
            </div>
          </div>

          <!-- Right: Filters & Search Box -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Role Filter -->
            <select v-model="roleFilter"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] cursor-pointer">
              <option value="All">All Roles</option>
              <option value="Store Admin">Store Admin</option>
              <option value="Chief Pharmacist">Chief Pharmacist</option>
              <option value="POS Cashier">POS Cashier</option>
            </select>

            <!-- Status Filter -->
            <select v-model="statusFilter"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] cursor-pointer">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

            <!-- Search input -->
            <div class="relative">
              <input type="text" v-model="searchQuery" placeholder="Search staff by name or email..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 pl-2.5 pr-6 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-48 sm:w-60" />
              <button v-if="searchQuery" @click="searchQuery = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal">SL.</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Staff Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Email Address</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">System Role</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">POS Terminal</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Status</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Last Active</th>
                <th class="py-1.5 px-3 text-center w-36 font-normal">Actions</th>
              </tr>
            </thead>

            <tbody>
              <!-- Loader State -->
              <tr v-if="userStore.isLoading">
                <td colspan="8" class="py-12">
                  <PharmacyLoader text="Loading Staff Directory..." />
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No staff members found matching your search criteria.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-for="(user, idx) in paginatedData" :key="user.id"
                @click="selectedRow = user.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                  selectedRow === user.id
                    ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                ]">
                <!-- SL Column -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                  {{ ((currentPage - 1) * itemsPerPage) + idx + 1 }}
                </td>

                <!-- Staff Name -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 text-[10px] font-mono flex items-center justify-center border border-slate-300 dark:border-gray-700 uppercase">
                      {{ user.name.substring(0, 1) }}
                    </span>
                    <span>{{ user.name }}</span>
                  </div>
                </td>

                <!-- Email -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px] text-slate-600 dark:text-gray-400">
                  {{ user.email }}
                </td>

                <!-- Role -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'px-2 py-0.5 text-[10px] border font-normal inline-block',
                    user.role === 'Store Admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                      : user.role === 'Chief Pharmacist'
                      ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  ]">
                    {{ user.role }}
                  </span>
                </td>

                <!-- POS Terminal Access -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal text-[11px]">
                  <span v-if="user.terminalAccess" class="text-emerald-700 dark:text-emerald-400 font-normal">
                    ● Authorized
                  </span>
                  <span v-else class="text-slate-400 dark:text-gray-500 font-normal">
                    ○ No Access
                  </span>
                </td>

                <!-- Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'px-2 py-0.5 text-[10px] border font-normal inline-block',
                    user.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800'
                  ]">
                    {{ user.status }}
                  </span>
                </td>

                <!-- Last Active -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-mono text-[11px] text-slate-500 dark:text-gray-400">
                  {{ user.lastActive }}
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center font-normal">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click.stop="openEditModal(user)"
                      class="px-2 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-[11px] text-slate-700 dark:text-gray-200 transition-colors cursor-pointer">
                      Edit
                    </button>
                    <button @click.stop="toggleStatus(user)"
                      :class="user.status === 'Suspended' ? 'text-emerald-700 dark:text-emerald-400 hover:underline' : 'text-amber-700 dark:text-amber-400 hover:underline'"
                      class="px-1 py-0.5 text-[11px] font-normal transition-colors cursor-pointer">
                      {{ user.status === 'Suspended' ? 'Activate' : 'Suspend' }}
                    </button>
                    <button @click.stop="deleteStaff(user)"
                      class="px-1 py-0.5 text-[11px] text-rose-600 dark:text-rose-400 hover:underline transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer / Pagination -->
        <div class="bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 font-sans">
          <div>
            Showing <strong class="text-slate-700 dark:text-gray-300">{{ filteredUsers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0 }}</strong> to <strong class="text-slate-700 dark:text-gray-300">{{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}</strong> of <strong class="text-slate-700 dark:text-gray-300">{{ filteredUsers.length }}</strong> staff records (Max limit: <strong class="text-slate-700 dark:text-gray-300">{{ userStore.planMeta.maxUsers }}</strong>)
          </div>
          <PaginationControls 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :total-items="filteredUsers.length" 
            :items-per-page="itemsPerPage"
            @prev="prevPage" 
            @next="nextPage" 
          />
        </div>
      </div>

      <!-- Desktop Window Modal: Add / Edit Staff Member -->
      <div v-if="showUserModal"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 select-none">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 max-w-lg w-full shadow-2xl overflow-hidden font-sans">
          <!-- Window Title Bar -->
          <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-gray-200">
              <span>👤</span>
              <span>{{ isEditing ? 'Edit Staff Member' : 'Add New Staff Member' }}</span>
            </div>
            <button @click="closeModal"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-1 font-normal cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Modal Body Form -->
          <form @submit.prevent="saveUser" class="p-4 space-y-3.5 text-xs">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input v-model="userForm.name" type="text" required placeholder="e.g. John Doe"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input v-model="userForm.email" type="email" required placeholder="john.doe@pharmacare.com"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">System Role *</label>
                <select v-model="userForm.role" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="Store Admin">Store Admin (Full Control)</option>
                  <option value="Chief Pharmacist">Chief Pharmacist</option>
                  <option value="POS Cashier">POS Cashier (Sales Only)</option>
                </select>
              </div>

              <div class="flex flex-col justify-end">
                <label class="flex items-center gap-2 cursor-pointer font-normal text-slate-700 dark:text-gray-300 py-1.5">
                  <input type="checkbox" v-model="userForm.terminalAccess"
                    class="w-4 h-4 border-slate-300 dark:border-gray-700 text-[#107c41] focus:ring-0 cursor-pointer" />
                  <span>Has POS Terminal Access</span>
                </label>
              </div>
            </div>

            <div v-if="!isEditing">
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Password / 4-Digit PIN *</label>
              <input v-model="userForm.password" type="password" required placeholder="e.g. 123456"
                class="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-200 font-mono focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <!-- Window Footer Actions -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800 mt-4">
              <button type="button" @click="closeModal"
                class="px-3 py-1 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel [Esc]
              </button>
              <button type="submit"
                class="px-3.5 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                <span>✓</span> {{ isEditing ? 'Save Changes' : 'Create Staff Member' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '~/stores/users';
import PharmacyLoader from '~/components/PharmacyLoader.vue';
import PaginationControls from '~/components/PaginationControls.vue';
import { usePagination } from '~/composables/usePagination';

const userStore = useUserStore();

const searchQuery = ref('');
const roleFilter = ref('All');
const statusFilter = ref('All');
const selectedRow = ref<string | null>(null);

const showUserModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);

const userForm = reactive({
  name: '',
  email: '',
  role: 'POS Cashier',
  terminalAccess: true,
  password: '123456'
});

const fetchStaff = () => {
  userStore.fetchUsers();
};

onMounted(() => {
  fetchStaff();
  window.addEventListener('keydown', handleKeyShortcuts);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyShortcuts);
});

const handleKeyShortcuts = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault();
    handleAddStaffClick();
  } else if (e.key === 'Escape' && showUserModal.value) {
    e.preventDefault();
    closeModal();
  }
};

const activeUsersCount = computed(() => {
  return userStore.users.filter(u => u.status === 'Active').length;
});

const isPlanLimitReached = computed(() => {
  const max = userStore.planMeta.maxUsers || 2;
  return userStore.users.length >= max;
});

const handleAddStaffClick = () => {
  if (isPlanLimitReached.value) {
    alert(`Plan Limit Reached: Your current "${userStore.planMeta.planName}" plan allows a maximum of ${userStore.planMeta.maxUsers} staff members. Please upgrade your plan in "Billing & Plan" or delete an existing member to add new staff.`);
    return;
  }
  openAddModal();
};

const filteredUsers = computed(() => {
  return userStore.users.filter(user => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !q ||
      user.name.toLowerCase().includes(q) || 
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q);
      
    const matchesRole = roleFilter.value === 'All' || user.role === roleFilter.value;
    const matchesStatus = statusFilter.value === 'All' || user.status === statusFilter.value;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
});

const { currentPage, totalPages, paginatedData, nextPage, prevPage, itemsPerPage } = usePagination(filteredUsers, 12);

const openAddModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  userForm.name = '';
  userForm.email = '';
  userForm.role = 'POS Cashier';
  userForm.terminalAccess = true;
  userForm.password = '123456';
  showUserModal.value = true;
};

const openEditModal = (user: any) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  userForm.name = user.name;
  userForm.email = user.email;
  userForm.role = user.role;
  userForm.terminalAccess = user.terminalAccess;
  showUserModal.value = true;
};

const closeModal = () => {
  showUserModal.value = false;
};

const saveUser = async () => {
  try {
    if (isEditing.value && editingUserId.value) {
      await userStore.updateUser(editingUserId.value, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        terminalAccess: userForm.terminalAccess
      });
    } else {
      await userStore.createUser({
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        password: userForm.password
      });
    }
    closeModal();
  } catch (err: any) {
    alert('Error: ' + (err.message || 'Failed to save staff'));
  }
};

const toggleStatus = async (user: any) => {
  if (confirm(`Are you sure you want to ${user.status === 'Active' ? 'suspend' : 'activate'} ${user.name}?`)) {
    await userStore.toggleUserStatus(user.id);
  }
};

const deleteStaff = async (user: any) => {
  if (confirm(`Are you sure you want to permanently delete staff member "${user.name}" (${user.email})?`)) {
    try {
      await userStore.deleteUser(user.id);
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to delete staff member'));
    }
  }
};
</script>
