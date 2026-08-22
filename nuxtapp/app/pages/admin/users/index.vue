<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Action Toolbar -->
      <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <!-- Search input -->
          <div class="relative min-w-[240px] flex-1 max-w-md">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search users by name, email or ID..."
              class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded pl-8 pr-3 py-1 text-xs focus:ring-1 focus:ring-sky-500 font-sans outline-none shadow-inner"
            />
            <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
          </div>

          <!-- Role Filter -->
          <select 
            v-model="roleFilter"
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-200 outline-none shadow-sm"
          >
            <option value="All">All Roles</option>
            <option value="Store Admin">Store Admin</option>
            <option value="Chief Pharmacist">Chief Pharmacist</option>
            <option value="POS Cashier">POS Cashier</option>
          </select>
        </div>

        <button 
          @click="openAddModal"
          class="px-3 py-1.5 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black text-xs hover:from-sky-600 hover:to-blue-700 shadow-sm transition-all flex items-center gap-1"
        >
          <span>+ Add Staff Member</span>
        </button>
      </div>

      <!-- Users Data Table -->
      <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
          <h2 class="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>👥</span> Staff & User Management ({{ filteredUsers.length }} Users)
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th class="py-2 px-2.5 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">USER / EMAIL</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">ROLE</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">POS ACCESS</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">LAST ACTIVE</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-if="userStore.isLoading"
                class="bg-white dark:bg-gray-950"
              >
                <td colspan="7" class="py-8 text-center text-slate-500 dark:text-gray-400 font-mono text-xs">
                  Loading staff directory...
                </td>
              </tr>
              <tr 
                v-else-if="filteredUsers.length === 0"
                class="bg-white dark:bg-gray-950"
              >
                <td colspan="7" class="py-8 text-center text-slate-500 dark:text-gray-400 font-mono text-xs">
                  No users found matching your criteria.
                </td>
              </tr>
              <tr 
                v-else
                v-for="(user, idx) in filteredUsers" 
                :key="user.id"
                @click="selectedRow = user.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                  selectedRow === user.id 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                ]"
              >
                <td 
                  class="py-2 px-2.5 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === user.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                >
                  {{ idx + 1 }}
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800">
                  <div class="font-extrabold flex items-center gap-1.5" :class="selectedRow === user.id ? 'text-white' : 'text-slate-900 dark:text-gray-100'">
                    <div class="w-6 h-6 rounded-full bg-slate-300 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-gray-300 uppercase">
                      {{ user.name.substring(0, 2) }}
                    </div>
                    {{ user.name }}
                  </div>
                  <div class="text-[10px] font-mono mt-0.5 ml-7.5" :class="selectedRow === user.id ? 'text-sky-100' : 'text-slate-500 dark:text-gray-400'">{{ user.email }}</div>
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium">
                  <span 
                    :class="[
                      'px-1.5 py-0.5 rounded border text-[10px] font-black uppercase',
                      selectedRow === user.id ? 'bg-white/20 text-white border-white/40' : 
                      user.role === 'Store Admin' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' : 
                      user.role === 'Chief Pharmacist' ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' : 
                      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-black border uppercase',
                      selectedRow === user.id ? 'bg-white text-emerald-900 border-white' : 
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' : 
                      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                    ]"
                  >
                    {{ user.status }}
                  </span>
                </td>
                <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                  <span v-if="user.terminalAccess" class="text-emerald-600 dark:text-emerald-400 font-bold">✅ Yes</span>
                  <span v-else class="text-rose-500 dark:text-rose-400 font-bold">❌ No</span>
                </td>
                <td class="py-2 px-2.5 font-mono text-xs border border-slate-300 dark:border-gray-800" :class="selectedRow === user.id ? 'text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ user.lastActive }}
                </td>
                <td class="py-2 px-2.5 text-right border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      @click.stop="openEditModal(user)"
                      class="px-2 py-0.5 bg-white dark:bg-gray-800 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 rounded text-[10px] font-bold text-slate-800 dark:text-gray-200 shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      @click.stop="toggleStatus(user)"
                      :class="user.status === 'Suspended' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'"
                      class="px-2 py-0.5 rounded text-[10px] font-extrabold border shadow-sm transition-colors"
                    >
                      {{ user.status === 'Suspended' ? 'Unsuspend' : 'Suspend' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit User Modal -->
      <div v-if="showUserModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-black text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>{{ isEditing ? '✏️ Edit Staff Member' : '👥 Add New Staff Member' }}</span>
            </h3>
            <button @click="closeModal" class="text-slate-500 font-bold hover:text-slate-800">✕</button>
          </div>

          <form @submit.prevent="saveUser" class="p-3.5 space-y-3 text-xs font-sans">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input 
                v-model="userForm.name"
                type="text" 
                required
                placeholder="e.g. John Doe"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input 
                v-model="userForm.email"
                type="email" 
                required
                placeholder="john.doe@pharmacare.com"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">System Role *</label>
                <select 
                  v-model="userForm.role"
                  required
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none"
                >
                  <option value="Store Admin">Store Admin</option>
                  <option value="Chief Pharmacist">Chief Pharmacist</option>
                  <option value="POS Cashier">POS Cashier</option>
                </select>
              </div>
              
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-gray-300">
                  <input 
                    type="checkbox" 
                    v-model="userForm.terminalAccess"
                    class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  Has POS Terminal Access
                </label>
              </div>
            </div>
            
            <div v-if="!isEditing">
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Temporary Password *</label>
              <input 
                type="text"
                disabled 
                value="Auto-generated on save"
                class="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono text-slate-500 outline-none italic"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800 mt-4">
              <button 
                type="button" 
                @click="closeModal"
                class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold hover:bg-slate-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-3.5 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm hover:from-sky-600 hover:to-blue-700"
              >
                {{ isEditing ? 'Save Changes' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useUserStore } from '~/stores/users';

const userStore = useUserStore();

const searchQuery = ref('');
const roleFilter = ref('All');
const selectedRow = ref<string | null>(null);

const showUserModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);

const userForm = reactive({
  name: '',
  email: '',
  role: 'POS Cashier' as 'Store Admin' | 'Chief Pharmacist' | 'POS Cashier',
  terminalAccess: true
});

onMounted(() => {
  userStore.fetchUsers();
});

const filteredUsers = computed(() => {
  return userStore.users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.value.toLowerCase());
      
    const matchesRole = roleFilter.value === 'All' || user.role === roleFilter.value;
    
    return matchesSearch && matchesRole;
  });
});

const openAddModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  userForm.name = '';
  userForm.email = '';
  userForm.role = 'POS Cashier';
  userForm.terminalAccess = true;
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
  if (isEditing.value && editingUserId.value) {
    await userStore.updateUser(editingUserId.value, {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      terminalAccess: userForm.terminalAccess
    });
    alert('User updated successfully');
  } else {
    await userStore.createUser({
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      status: 'Active',
      terminalAccess: userForm.terminalAccess
    });
    alert('User created successfully');
  }
  closeModal();
};

const toggleStatus = async (user: any) => {
  if (confirm(`Are you sure you want to ${user.status === 'Active' ? 'suspend' : 'unsuspend'} ${user.name}?`)) {
    await userStore.toggleUserStatus(user.id);
  }
};
</script>
