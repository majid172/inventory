<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans">
      <!-- Desktop Application Header Toolbar Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> New User
            </button>
            <button @click="fetchUsers" :disabled="loading"
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

          <!-- Center: Quick Subscription Category Tabs -->
          <div class="flex items-center gap-1 bg-slate-200/80 dark:bg-gray-800 p-0.5 border border-slate-300 dark:border-gray-700 text-[11px] font-normal">
            <button 
              @click="subscriptionFilter = 'all'"
              :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                subscriptionFilter === 'all' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80'
              ]"
            >
              All Subscribers & Users ({{ users.length }})
            </button>
            <button 
              @click="subscriptionFilter = 'subscribed'"
              :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                subscriptionFilter === 'subscribed' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80'
              ]"
            >
              Store Owners ({{ subscribedUsersCount }})
            </button>
            <button 
              @click="subscriptionFilter = 'active'"
              :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                subscriptionFilter === 'active' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80'
              ]"
            >
              Active Paid Plans ({{ activeSubCount }})
            </button>
            <button 
              @click="subscriptionFilter = 'trial'"
              :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                subscriptionFilter === 'trial' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80'
              ]"
            >
              Free Trial ({{ trialSubCount }})
            </button>
          </div>

          <!-- Right: Search & Role Filter -->
          <div class="flex items-center gap-2">
            <!-- Role Filter -->
            <select v-model="filterRole"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal outline-none focus:border-[#107c41]">
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="STORE_ADMIN">Store Admin / Owner</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="CASHIER">Cashier</option>
            </select>

            <!-- Search Field -->
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search user, store, domain, plan..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-48 sm:w-56" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># ID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Subscriber</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Email</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Phone</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Pharmacy</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Subscription & MRR</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-28">Status</th>
                <!-- <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center w-28 font-normal">Role</th> -->
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal w-24">Expiry</th>
                <th class="py-1.5 px-3 text-center w-28 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  <span class="inline-block animate-spin mr-1">⏳</span> Loading subscribers ...
                </td>
              </tr>

              <!-- Error State -->
              <tr v-else-if="errorMessage">
                <td colspan="9" class="py-4 text-center text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 text-xs font-normal">
                  ⚠️ {{ errorMessage }}
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  No subscribers or users found matching your search.
                </td>
              </tr>

              <!-- Rows -->
              <tr v-for="(row, idx) in filteredUsers" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === row.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ idx + 1 }}
                </td>

                <!-- Subscriber Full Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  <div class="font-normal">{{ row.name }}</div>
                  <!-- <div class="text-[10px] text-slate-400 font-mono">UID: #{{ row.id }}</div> -->
                </td>

                <!-- Email -->
                <td
                  class="py-1.5 px-3 font-mono text-[11px] text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">
                  {{ row.email }}
                </td>

                <!-- Phone -->
                <td
                  class="py-1.5 px-3 font-mono text-[11px] text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">
                  {{ row.phone || row.tenant_phone || '-' }}
                </td>

                <!-- Tenant / Store Name -->
                <td
                  class="py-1.5 px-3 font-normal text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">
                  <div v-if="row.tenant_name">
                    <div class="inline-flex items-center gap-1 font-normal text-slate-800 dark:text-gray-200">
                      {{ row.tenant_name }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      {{ row.tenant_domain || 'store-' + row.tenant_id }}.{{ settingsStore.systemSettings.platformName.toLowerCase().replace(/\s+/g, '') }}.com
                    </div>
                  </div>
                  <span v-else class="text-slate-400 dark:text-gray-500 text-[11px]">
                    Platform Super Admin (Global)
                  </span>
                </td>

                <!-- Subscription Plan & MRR -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div v-if="row.plan_name" class="flex items-center gap-1.5">
                    <span :class="[
                      'text-[10px] font-mono px-1.5 py-0.2 border uppercase',
                      row.plan_name.toLowerCase().includes('enterprise')
                        ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                        : row.plan_name.toLowerCase().includes('pro')
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    ]">
                      🏷️ {{ row.plan_name }}
                    </span>
                    <span class="text-[10px] text-slate-500 font-mono">
                      {{ settingsStore.currencySymbol }}{{ Number(row.plan_price || 0).toFixed(0) }}/mo
                    </span>
                  </div>
                  <span v-else class="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                    {{ row.tenant_name ? 'Starter Tier' : 'Super Admin' }}
                  </span>
                </td>

                <!-- Subscription Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span v-if="row.status" :class="[
                    'text-[10px] font-mono px-1.5 py-0.2 border uppercase',
                    (row.status === 'expired' || row.subscription_status === 'expired' || (row.end_date && new Date(row.end_date).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]))
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 font-bold'
                      : (row.status === 'trial' || row.subscription_status === 'trial')
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 font-bold'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 font-bold'
                  ]">
                    {{ (row.end_date && new Date(row.end_date).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]) ? 'EXPIRED' : (row.subscription_status || row.status) }}
                  </span>
                  <span v-else-if="row.tenant_name" class="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-300">
                    active
                  </span>
                  <span v-else class="text-slate-400 text-[10px]">
                    -
                  </span>
                </td>

                <!-- Role -->
                <!-- <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'text-[10px] font-mono px-1.5 py-0.2 border',
                    row.role === 'SUPER_ADMIN'
                      ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                      : row.role === 'STORE_ADMIN'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                        : row.role === 'PHARMACIST'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                  ]">
                    {{ row.role }}
                  </span>
                </td> -->

                <!-- Expiry Date -->
                <td
                  class="py-1.5 px-3 text-slate-500 dark:text-gray-400 font-mono text-[11px] border-r border-slate-200 dark:border-gray-800">
                  {{ row.end_date ? String(row.end_date).split('T')[0] : (row.tenant_name ? '2028-12-31' : 'Unlimited') }}
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openViewDetails(row)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-1.5 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="View Full Subscriber Details">
                      View
                    </button>
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-1.5 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Edit User">
                      Edit
                    </button>
                    <button @click="handleDeleteUser(row.id, row.name)"
                      class="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-gray-800 dark:text-rose-400 dark:border-gray-700 px-1.5 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Delete User">
                      ✕
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
          <div>Total <strong>{{ filteredUsers.length }}</strong> subscribers & platform users</div>
          <div class="text-[10px] text-slate-400 font-normal">
            MySQL: <code>users</code> JOIN <code>tenants</code> JOIN <code>tenant_subscriptions</code> JOIN <code>subscription_plans</code>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: VIEW SUBSCRIBER FULL DETAILS -->
      <!-- ===================================================================== -->
      <div v-if="showDetailModal && activeDetailUser"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-lg shadow-lg overflow-hidden font-sans">
          <!-- Titlebar -->
          <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🏥</span> Subscriber & Store Details (#{{ activeDetailUser.id }})
            </h3>
            <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <div class="p-4 space-y-3 text-xs">
            <!-- Store Profile Header -->
            <div class="bg-slate-50 dark:bg-gray-900 p-3 border border-slate-200 dark:border-gray-800 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-normal text-sm text-slate-900 dark:text-gray-100">
                  🏥 {{ activeDetailUser.tenant_name || 'Platform Super Admin' }}
                </span>
                <span :class="[
                  'text-[10px] font-mono px-1.5 py-0.2 border uppercase',
                  activeDetailUser.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                ]">
                  {{ activeDetailUser.subscription_status || 'active' }}
                </span>
              </div>
              <div class="text-slate-500 font-mono text-[11px]">
                Domain: {{ activeDetailUser.tenant_domain || 'app' }}.{{ settingsStore.systemSettings.platformName.toLowerCase().replace(/\s+/g, '') }}.com
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">User / Owner Name</span>
                <span class="text-slate-800 dark:text-gray-200 font-normal">{{ activeDetailUser.name }}</span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Email Address</span>
                <span class="text-slate-800 dark:text-gray-200 font-mono text-[11px]">{{ activeDetailUser.email }}</span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Phone Number</span>
                <span class="text-slate-800 dark:text-gray-200">{{ activeDetailUser.phone || activeDetailUser.tenant_phone || '-' }}</span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">System Role</span>
                <span class="text-slate-800 dark:text-gray-200 font-mono">{{ activeDetailUser.role }}</span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Subscription Plan</span>
                <span class="text-emerald-700 dark:text-emerald-400 font-normal">
                  🏷️ {{ activeDetailUser.plan_name || 'Starter Plan' }} ({{ settingsStore.currencySymbol }}{{ Number(activeDetailUser.plan_price || 49).toFixed(0) }}/mo)
                </span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Renewal / Expiry Date</span>
                <span class="text-slate-800 dark:text-gray-200 font-mono">
                  {{ activeDetailUser.end_date ? String(activeDetailUser.end_date).split('T')[0] : '2028-12-31' }}
                </span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Store Staff Members</span>
                <span class="text-slate-800 dark:text-gray-200 font-mono">{{ activeDetailUser.store_users_count || 1 }} Accounts</span>
              </div>

              <div class="bg-white dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 space-y-0.5">
                <span class="text-[10px] text-slate-400 block uppercase">Catalog Inventory</span>
                <span class="text-slate-800 dark:text-gray-200 font-mono">{{ activeDetailUser.store_products_count || 0 }} Medicines</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-gray-800">
              <button @click="showDetailModal = false" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-normal text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: ADD NEW USER -->
      <!-- ===================================================================== -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Create New Platform / Tenant User
            </h3>
            <button @click="showAddModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="handleSaveUser" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" v-model="newUser.name" required placeholder="e.g. Dr. Robert Vance"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input type="email" v-model="newUser.email" required placeholder="e.g. robert@medicare.com"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="text" v-model="newUser.phone" placeholder="+1 (555) 000-0000"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Initial Password *</label>
              <input type="password" v-model="newUser.password" required placeholder="••••••••"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Assign To Tenant Store</label>
              <select v-model="newUser.tenantId"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                <option :value="null">-- Platform Wide (No Tenant) --</option>
                <option v-for="t in tenantsList" :key="t.id" :value="t.id">
                  🏥 {{ t.name }} (ID: #{{ t.id }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Role *</label>
                <select v-model="newUser.role"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="STORE_ADMIN">STORE_ADMIN</option>
                  <option value="PHARMACIST">PHARMACIST</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
              </div>

              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Status</label>
                <select v-model="newUser.status"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showAddModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Saving...' : 'Save User' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: EDIT USER -->
      <!-- ===================================================================== -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Edit User Profile (#{{ editUser.id }})
            </h3>
            <button @click="showEditModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="handleUpdateUser" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" v-model="editUser.name" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input type="email" v-model="editUser.email" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="text" v-model="editUser.phone"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                New Password <span class="text-[10px] text-slate-400 font-normal">(Leave blank to keep current)</span>
              </label>
              <input type="password" v-model="editUser.password" placeholder="••••••••"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Assign To Tenant Store</label>
              <select v-model="editUser.tenant_id"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                <option :value="null">-- Platform Wide (No Tenant) --</option>
                <option v-for="t in tenantsList" :key="t.id" :value="t.id">
                  🏥 {{ t.name }} (ID: #{{ t.id }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Role *</label>
                <select v-model="editUser.role"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="STORE_ADMIN">STORE_ADMIN</option>
                  <option value="PHARMACIST">PHARMACIST</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
              </div>

              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Status</label>
                <select v-model="editUser.status"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showEditModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Updating...' : 'Update User' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import SuperAdminHeader from '~/components/super-admin/SuperAdminHeader.vue';
import { useSettingsStore } from '~/stores/settings';
import { ref, computed, onMounted } from 'vue';

const settingsStore = useSettingsStore();

interface UserRecord {
  id: number;
  tenant_id: number | null;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string | number;
  created_at?: string;
  tenant_name?: string;
  tenant_domain?: string;
  tenant_phone?: string;
  tenant_address?: string;
  tenant_tax?: string;
  tenant_status?: string;
  plan_id?: number;
  plan_name?: string;
  plan_price?: number;
  subscription_id?: number;
  subscription_status?: string;
  start_date?: string;
  end_date?: string;
  store_users_count?: number;
  store_products_count?: number;
}

const users = ref<UserRecord[]>([]);
const tenantsList = ref<{ id: number; name: string }[]>([]);
const loading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const filterText = ref('');
const filterRole = ref('');
const subscriptionFilter = ref('all');
const selectedRow = ref<number | null>(null);

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const activeDetailUser = ref<UserRecord | null>(null);

const newUser = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  tenantId: null as number | null,
  role: 'STORE_ADMIN',
  status: 'active'
});

const editUser = ref<any>({});

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/users', {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    const userList = json?.data || json?.users || (Array.isArray(json) ? json : []);
    if (Array.isArray(userList)) {
      users.value = userList;
    } else if (json && json.message) {
      errorMessage.value = json.message;
    }
  } catch (err: any) {
    console.error('Failed to fetch users:', err.message);
    errorMessage.value = err.message || 'Failed to connect to backend server';
  } finally {
    loading.value = false;
  }
};

const fetchTenants = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/tenants', {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    const tList = json?.tenants || json?.data || (Array.isArray(json) ? json : []);
    if (Array.isArray(tList)) {
      tenantsList.value = tList.map((t: any) => ({
        id: t.id,
        name: t.name || t.store_name || t.storeName
      }));
    }
  } catch (err: any) {
    console.error('Failed to fetch tenants:', err.message);
  }
};

onMounted(() => {
  fetchUsers();
  fetchTenants();
});

const subscribedUsersCount = computed(() => {
  return users.value.filter(u => u.tenant_name || u.plan_name).length;
});

const activeSubCount = computed(() => {
  return users.value.filter(u => u.subscription_status === 'active' || (u.tenant_name && !u.subscription_status)).length;
});

const trialSubCount = computed(() => {
  return users.value.filter(u => u.subscription_status === 'trial').length;
});

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const q = filterText.value.toLowerCase();
    const matchQuery = !q || (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.tenant_name?.toLowerCase().includes(q) ||
      u.tenant_domain?.toLowerCase().includes(q) ||
      u.plan_name?.toLowerCase().includes(q)
    );
    const matchRole = !filterRole.value || u.role === filterRole.value;

    let matchSub = true;
    if (subscriptionFilter.value === 'subscribed') {
      matchSub = !!(u.tenant_name || u.plan_name);
    } else if (subscriptionFilter.value === 'active') {
      matchSub = u.subscription_status === 'active' || (!!u.tenant_name && !u.subscription_status);
    } else if (subscriptionFilter.value === 'trial') {
      matchSub = u.subscription_status === 'trial';
    }

    return matchQuery && matchRole && matchSub;
  });
});

const openViewDetails = (u: UserRecord) => {
  activeDetailUser.value = u;
  showDetailModal.value = true;
};

const openAddModal = () => {
  newUser.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    tenantId: tenantsList.value?.[0]?.id || null,
    role: 'STORE_ADMIN',
    status: 'active'
  };
  showAddModal.value = true;
};

const handleSaveUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return;
  isSaving.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newUser.value)
    });
    const json = await res.json();
    if (json.success) {
      showAddModal.value = false;
      await fetchUsers();
    } else {
      alert(json.message || 'Failed to create user');
    }
  } catch (err: any) {
    alert(err.message || 'Error creating user');
  } finally {
    isSaving.value = false;
  }
};

const openEditModal = (u: UserRecord) => {
  editUser.value = { 
    ...u,
    password: '' 
  };
  showEditModal.value = true;
};

const handleUpdateUser = async () => {
  if (!editUser.value.name || !editUser.value.email) return;
  isSaving.value = true;
  try {
    const res = await fetch(`http://localhost:5000/api/super-admin/users/${editUser.value.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: editUser.value.name,
        email: editUser.value.email,
        phone: editUser.value.phone,
        role: editUser.value.role,
        tenantId: editUser.value.tenant_id,
        status: editUser.value.status,
        password: editUser.value.password || undefined
      })
    });
    const json = await res.json();
    if (json.success) {
      showEditModal.value = false;
      await fetchUsers();
    } else {
      alert(json.message || 'Failed to update user');
    }
  } catch (err: any) {
    alert(err.message || 'Error updating user');
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteUser = async (id: number, name: string) => {
  if (!confirm(`Are you sure you want to permanently delete user "${name}" (ID: #${id})?`)) return;
  try {
    const res = await fetch(`http://localhost:5000/api/super-admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json.success) {
      await fetchUsers();
    } else {
      alert(json.message || 'Failed to delete user');
    }
  } catch (err: any) {
    alert(err.message || 'Error deleting user');
  }
};
</script>
