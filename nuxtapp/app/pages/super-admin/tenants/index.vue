<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans select-none">
      <!-- Desktop Application Header Toolbar Frame (Matching Main Template Desktop ERP Design) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar Ribbon -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <!-- Left: Action buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button @click="openOnboardModal"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm font-bold">+</span> Onboard Pharmacy Store <span
                class="text-[10px] opacity-80 font-mono ml-0.5">[F2]</span>
            </button>

            <button @click="loadTenants" :disabled="isLoading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': isLoading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Table
            </button>

            <!-- Quick Status Tab Filters -->
            <div
              class="flex items-center gap-1 bg-slate-200/80 dark:bg-gray-800 p-0.5 border border-slate-300 dark:border-gray-700 text-[11px] font-normal">
              <button @click="statusFilter = 'all'" :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                statusFilter === 'all' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700'
              ]">
                All Stores ({{ tenants.length }})
              </button>
              <button @click="statusFilter = 'active'" :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                statusFilter === 'active' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700'
              ]">
                🟢 Active ({{ activeCount }})
              </button>
              <button @click="statusFilter = 'trial'" :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                statusFilter === 'trial' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700'
              ]">
                🟡 Free Trial ({{ trialCount }})
              </button>
              <button @click="statusFilter = 'suspended'" :class="[
                'px-2 py-0.5 cursor-pointer transition-colors',
                statusFilter === 'suspended' ? 'bg-[#107c41] text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700'
              ]">
                🔴 Suspended ({{ suspendedCount }})
              </button>
            </div>
          </div>

          <!-- Right: Plan Selector & Search Box -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Plan Filter -->
            <select v-model="planFilter"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal outline-none focus:border-[#107c41] cursor-pointer">
              <option value="all">All Plans</option>
              <option v-for="p in plans" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>

            <!-- Search input -->
            <div class="relative">
              <input type="text" v-model="searchFilter" placeholder="Search store, owner, email, domain..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 pl-2.5 pr-6 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-48 sm:w-64" />
              <button v-if="searchFilter" @click="searchFilter = ''"
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
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># ID
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Store Details</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal"> Email</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal"> Phone</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Subscription Plan
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Status
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Staff /
                  Products</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Renewal / Expiry</th>
                <th class="py-1.5 px-3 text-center min-w-[230px] font-normal">ACTIONS</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              <!-- Loading State -->
              <tr v-if="isLoading">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  <span class="inline-block animate-spin mr-1">⏳</span> Loading pharmacy tenant stores...
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="paginatedTenants.length === 0">
                <td colspan="9" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No subscriber stores found matching your search and filter criteria.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-for="tenant in paginatedTenants" :key="tenant.id" @click="selectedRow = tenant.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === tenant.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center font-mono text-slate-500 dark:text-gray-400 border-r border-slate-200 dark:border-gray-800">
                  #{{ tenant.id }}
                </td>

                <!-- Store Details -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800">
                  <div class="font-bold text-slate-900 dark:text-gray-100 flex items-center gap-1.5">
                    {{ tenant.storeName || tenant.name }}
                  </div>
                  <div class="text-[10px] font-mono text-blue-600 dark:text-sky-400 flex items-center gap-1 mt-0.5">
                    <span>🌐</span> {{ tenant.slug || tenant.domain }}.{{ domainBase }}
                  </div>
                  <div v-if="tenant.address"
                    class="text-[10px] text-slate-400 dark:text-gray-500 truncate max-w-xs mt-0.5">
                    📍 {{ tenant.address }}
                  </div>
                </td>

                <!-- Email (Related from users table) -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800">
                  <div class="text-[10px] font-mono text-slate-700 dark:text-gray-300 font-medium">{{ tenant.email ||
                    '--' }}</div>
                </td>

                <!-- Phone (Related from users table) -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800">
                  <div class="text-[10px] font-mono text-slate-700 dark:text-gray-300">{{ tenant.phone || '--' }}</div>
                </td>

                <!-- Subscription Plan -->
                <td class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800">
                  <div class="flex items-center gap-1.5">
                    <span :class="[
                      'px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border font-mono',
                      (tenant.planTier === 'enterprise' || (tenant.planName && tenant.planName.toLowerCase().includes('enterprise')))
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : (tenant.planTier === 'pro' || (tenant.planName && tenant.planName.toLowerCase().includes('pro')))
                          ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    ]">
                      {{ tenant.planName || tenant.planTier || 'Standard' }}
                    </span>
                    <span class="font-mono text-[11px] font-semibold text-slate-600 dark:text-gray-400">
                      {{ settingsStore.currencySymbol }}{{ tenant.mrr || 49 }}/mo
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                    Terminals: {{ tenant.terminalsCount || 1 }} | Branches: {{ tenant.branchesCount || 1 }}
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 text-[10px] font-bold uppercase rounded border inline-block',
                    tenant.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : tenant.status === 'trial'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : tenant.status === 'expired'
                          ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800'
                          : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  ]">
                    ● {{ tenant.status }}
                  </span>
                </td>

                <!-- Staff & Products Count -->
                <td
                  class="py-1.5 px-3 text-center font-mono border-r border-slate-200 dark:border-gray-800 text-[11px]">
                  <span class="text-slate-800 dark:text-gray-200 font-bold">{{ tenant.usersCount || 1 }}</span> Users /
                  <span class="text-slate-600 dark:text-gray-400 font-bold">{{ tenant.productsCount || 0 }}</span> Prods
                </td>

                <!-- Renewal Date -->
                <td class="py-1.5 px-3 font-mono text-xs border-r border-slate-200 dark:border-gray-800">
                  <div class="text-slate-800 dark:text-gray-200">{{ tenant.nextBillingDate || tenant.subscriptionEnd ||
                    '2028-12-31' }}</div>
                  <div v-if="tenant.status === 'trial'"
                    class="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    ⏳ Trial Active
                  </div>
                  <div v-else-if="isExpired(tenant.nextBillingDate)"
                    class="text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    🚨 Expired
                  </div>
                </td>

                <!-- Action Toolbar Buttons (Matches ERP Clean Boxed Style) -->
                <td class="py-1.5 px-3 text-center">
                  <div class="flex items-center justify-center gap-1.5 flex-wrap">
                    <!-- View Details -->
                    <button @click.stop="openViewModal(tenant)" title="View Store Details"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      View
                    </button>

                    <!-- Edit Store -->
                    <button @click.stop="openEditModal(tenant)" title="Edit Store & Plan"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-[#005a9e] dark:text-sky-400 text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      Edit
                    </button>

                    <!-- Quick +30 Days Extend -->
                    <button @click.stop="quickExtendTrial(tenant, 30)" title="Extend +30 Days"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-300 dark:border-gray-700 text-amber-700 dark:text-amber-400 font-mono text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      +30D
                    </button>

                    <!-- Suspend / Activate Toggle -->
                    <button v-if="tenant.status === 'active' || tenant.status === 'trial'"
                      @click.stop="toggleTenantStatus(tenant, 'suspended')" title="Suspend Store Access"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-300 dark:border-gray-700 text-orange-700 dark:text-orange-400 text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      Suspend
                    </button>
                    <button v-else @click.stop="toggleTenantStatus(tenant, 'active')" title="Reactivate Store Access"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-300 dark:border-gray-700 text-emerald-700 dark:text-emerald-400 text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      Activate
                    </button>

                    <!-- Delete Store -->
                    <button @click.stop="confirmDeleteTenant(tenant)" title="Delete Store Permanently"
                      class="px-2 py-0.5 bg-white dark:bg-gray-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-gray-700 text-[#d13438] dark:text-rose-400 text-xs font-normal cursor-pointer transition-colors shadow-2xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar Footer -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>
            Showing <strong class="text-slate-800 dark:text-gray-200">{{ paginatedTenants.length }}</strong> of <strong
              class="text-slate-800 dark:text-gray-200">{{ filteredTenantsList.length }}</strong> stores
          </div>
          <div class="flex items-center gap-1">
            <button @click="currentPage--" :disabled="currentPage <= 1"
              class="px-2 py-0.5 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 rounded text-xs cursor-pointer">
              ◀ Prev
            </button>
            <span class="px-2 font-mono font-bold text-slate-700 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button @click="currentPage++" :disabled="currentPage >= totalPages"
              class="px-2 py-0.5 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 rounded text-xs cursor-pointer">
              Next ▶
            </button>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: ONBOARD NEW PHARMACY STORE -->
      <!-- ===================================================================== -->
      <div v-if="showOnboardModal"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded shadow-2xl max-w-lg w-full overflow-hidden">
          <!-- Modal Header Ribbon -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3
              class="font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🏥</span> Onboard New Pharmacy Subscriber Store
            </h3>
            <button @click="showOnboardModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs font-bold cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitCreateTenant" class="p-4 space-y-3 text-xs">
            <!-- Store Name & Slug -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Pharmacy Store Name *</label>
              <input v-model="newStoreForm.storeName" type="text" required placeholder="e.g. Popular Pharmacy Dhanmondi"
                @input="autoGenerateSlug"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41]" />
            </div>

            <!-- Domain / Subdomain Slug -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Store Subdomain / Slug *</label>
              <div class="flex items-center">
                <input v-model="newStoreForm.slug" type="text" required placeholder="popular-dhanmondi"
                  class="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-l px-2.5 py-1.5 font-mono text-xs outline-none focus:border-[#107c41]" />
                <span
                  class="bg-slate-200 dark:bg-gray-800 border-y border-r border-slate-300 dark:border-gray-700 px-2.5 py-1.5 font-mono text-xs text-slate-500 rounded-r">
                  .{{ domainBase }}
                </span>
              </div>
            </div>

            <!-- Owner Name & Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner / Chief Pharmacist *</label>
                <input v-model="newStoreForm.ownerName" type="text" required placeholder="Dr. Rafiqul Islam"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 outline-none focus:border-[#107c41]" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner Login Email *</label>
                <input v-model="newStoreForm.email" type="email" required placeholder="owner@popularpharma.com"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
            </div>

            <!-- Phone & Initial Password -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input v-model="newStoreForm.phone" type="text" placeholder="+880 1700-000000"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Initial Password</label>
                <input v-model="newStoreForm.password" type="text" placeholder="Password@123"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
            </div>

            <!-- Plan Tier & Initial Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Subscription Plan *</label>
                <select v-model="newStoreForm.planTier"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41] cursor-pointer">
                  <option v-for="p in plans" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ settingsStore.currencySymbol }}{{ p.priceMonthly || p.price || 49 }}/mo)
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Initial Store Status *</label>
                <select v-model="newStoreForm.status"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41] cursor-pointer">
                  <option value="active">🟢 Active Subscription (30 Days)</option>
                  <option value="trial">🟡 14-Day Free Trial</option>
                  <option value="suspended">🔴 Suspended</option>
                </select>
              </div>
            </div>

            <!-- Physical Address -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Store Address / Location</label>
              <input v-model="newStoreForm.address" type="text" placeholder="House 12, Road 4, Dhanmondi, Dhaka"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 outline-none focus:border-[#107c41]" />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showOnboardModal = false"
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-normal cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting"
                class="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded font-normal shadow-xs cursor-pointer flex items-center gap-1.5">
                <span v-if="isSubmitting" class="animate-spin text-xs">⏳</span>
                <span>Provision Store</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: EDIT STORE & SUBSCRIPTION -->
      <!-- ===================================================================== -->
      <div v-if="editingTenant"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded shadow-2xl max-w-lg w-full overflow-hidden">
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3
              class="font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>✏️</span> Edit Store: {{ editingTenant.storeName || editingTenant.name }}
            </h3>
            <button @click="editingTenant = null"
              class="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitUpdateTenant" class="p-4 space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Store Name *</label>
              <input v-model="editForm.storeName" type="text" required
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41]" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner Name</label>
                <input v-model="editForm.ownerName" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 outline-none focus:border-[#107c41]" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner Email</label>
                <input v-model="editForm.email" type="email"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Phone</label>
                <input v-model="editForm.phone" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Subdomain Slug</label>
                <input v-model="editForm.slug" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Subscription Plan</label>
                <select v-model="editForm.planTier"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41] cursor-pointer">
                  <option v-for="p in plans" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ settingsStore.currencySymbol }}{{ p.priceMonthly || p.price || 49 }}/mo)
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Status</label>
                <select v-model="editForm.status"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none focus:border-[#107c41] cursor-pointer">
                  <option value="active">🟢 Active</option>
                  <option value="trial">🟡 Trial</option>
                  <option value="suspended">🔴 Suspended</option>
                </select>
              </div>
            </div>

            <!-- Extend Validity Days -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">
                Extend Expiry Date (+ Days)
                <span class="font-normal text-slate-400 ml-1">(Current: {{ editingTenant.nextBillingDate || '2028-12-31'
                }})</span>
              </label>
              <div class="flex items-center gap-2">
                <input v-model.number="editForm.extendDays" type="number" placeholder="0" min="0"
                  class="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-mono outline-none focus:border-[#107c41]" />
                <button type="button" @click="editForm.extendDays = 7"
                  class="px-2 py-1 bg-slate-200 dark:bg-gray-800 rounded font-mono font-bold">+7D</button>
                <button type="button" @click="editForm.extendDays = 30"
                  class="px-2 py-1 bg-slate-200 dark:bg-gray-800 rounded font-mono font-bold">+30D</button>
                <button type="button" @click="editForm.extendDays = 365"
                  class="px-2 py-1 bg-slate-200 dark:bg-gray-800 rounded font-mono font-bold">+1Y</button>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Address</label>
              <input v-model="editForm.address" type="text"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 outline-none focus:border-[#107c41]" />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="editingTenant = null"
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-normal cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting"
                class="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded font-normal shadow-xs cursor-pointer flex items-center gap-1.5">
                <span v-if="isSubmitting" class="animate-spin text-xs">⏳</span>
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: VIEW STORE DETAILS & STATISTICS -->
      <!-- ===================================================================== -->
      <div v-if="viewingTenant"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded shadow-2xl max-w-md w-full overflow-hidden">
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3
              class="font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🏥</span> Store Profile: {{ viewingTenant.storeName || viewingTenant.name }}
            </h3>
            <button @click="viewingTenant = null"
              class="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">✕</button>
          </div>

          <div class="p-4 space-y-3 text-xs font-sans">
            <!-- Key Stats Header Cards -->
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2 rounded">
                <div class="text-[10px] text-slate-500 uppercase">Monthly MRR</div>
                <div class="text-sm font-bold font-mono text-[#107c41]">{{ settingsStore.currencySymbol }}{{
                  viewingTenant.mrr || 49 }}</div>
              </div>
              <div class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2 rounded">
                <div class="text-[10px] text-slate-500 uppercase">Users / Staff</div>
                <div class="text-sm font-bold font-mono text-slate-800 dark:text-gray-200">{{ viewingTenant.usersCount
                  || 1 }}</div>
              </div>
              <div class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2 rounded">
                <div class="text-[10px] text-slate-500 uppercase">Catalog Items</div>
                <div class="text-sm font-bold font-mono text-slate-800 dark:text-gray-200">{{
                  viewingTenant.productsCount || 0 }}</div>
              </div>
            </div>

            <!-- Metadata List -->
            <div
              class="border border-slate-200 dark:border-gray-800 rounded divide-y divide-slate-200 dark:divide-gray-800 bg-slate-50/50 dark:bg-gray-900/50 text-xs">
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Tenant ID:</span>
                <span class="font-mono font-bold text-slate-800 dark:text-gray-200">#{{ viewingTenant.id }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Subdomain Access:</span>
                <span class="font-mono text-blue-600 dark:text-sky-400 font-bold">{{ viewingTenant.slug ||
                  viewingTenant.domain }}.{{ domainBase }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Owner Contact:</span>
                <span class="text-slate-800 dark:text-gray-200">{{ viewingTenant.ownerName }} ({{ viewingTenant.email
                }})</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Phone:</span>
                <span class="font-mono text-slate-800 dark:text-gray-200">{{ viewingTenant.phone || 'N/A' }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Subscription Plan:</span>
                <span class="font-bold text-slate-800 dark:text-gray-200">{{ viewingTenant.planName ||
                  viewingTenant.planTier }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Account Status:</span>
                <span class="font-bold uppercase"
                  :class="viewingTenant.status === 'active' ? 'text-emerald-600' : 'text-amber-600'">{{
                    viewingTenant.status }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Renewal Date:</span>
                <span class="font-mono font-bold text-slate-800 dark:text-gray-200">{{ viewingTenant.nextBillingDate ||
                  viewingTenant.subscriptionEnd || '2028-12-31' }}</span>
              </div>
              <div class="px-3 py-2 flex justify-between">
                <span class="text-slate-500">Onboarding Date:</span>
                <span class="font-mono text-slate-600 dark:text-gray-400">{{ viewingTenant.joinedDate || '2026-01-01'
                }}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
              <button @click="viewingTenant = null"
                class="px-4 py-1.5 bg-[#107c41] text-white rounded font-normal cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TOAST NOTIFICATION ALERT -->
      <!-- ===================================================================== -->
      <div v-if="toastMessage"
        class="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-bounce-short">
        <span>{{ toastMessage.icon || '-' }}</span>
        <span>{{ toastMessage.text }}</span>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import { useSettingsStore } from '~/stores/settings';
import type { TenantStore } from '~/stores/superAdmin';

const settingsStore = useSettingsStore();
const {
  tenants,
  plans,
  isLoading,
  fetchTenants,
  fetchPlans,
  createTenant,
  updateTenant,
  deleteTenant
} = useSuperAdmin();

// Filters & State
const searchFilter = ref('');
const statusFilter = ref('all');
const planFilter = ref('all');
const selectedRow = ref<string | null>(null);
const isSubmitting = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = 15;

// Modal States
const showOnboardModal = ref(false);
const editingTenant = ref<TenantStore | null>(null);
const viewingTenant = ref<TenantStore | null>(null);

// Forms
const newStoreForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  planTier: 'pro',
  status: 'active',
  address: ''
});

const editForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  phone: '',
  planTier: 'pro',
  status: 'active',
  extendDays: 0,
  address: ''
});

// Toast
const toastMessage = ref<{ text: string; icon?: string } | null>(null);

const showToast = (text: string, icon = '✅') => {
  toastMessage.value = { text, icon };
  setTimeout(() => {
    toastMessage.value = null;
  }, 3500);
};

// Computed
const domainBase = computed(() => {
  const name = settingsStore.systemSettings?.platformName || 'pharmacare';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
});

const activeCount = computed(() => tenants.value.filter(t => t.status === 'active').length);
const trialCount = computed(() => tenants.value.filter(t => t.status === 'trial').length);
const suspendedCount = computed(() => tenants.value.filter(t => t.status === 'suspended' || t.status === 'expired').length);

const filteredTenantsList = computed(() => {
  return tenants.value.filter(t => {
    const s = searchFilter.value.trim().toLowerCase();
    const matchesSearch = !s ||
      (t.storeName && t.storeName.toLowerCase().includes(s)) ||
      (t.name && t.name.toLowerCase().includes(s)) ||
      (t.ownerName && t.ownerName.toLowerCase().includes(s)) ||
      (t.email && t.email.toLowerCase().includes(s)) ||
      (t.slug && t.slug.toLowerCase().includes(s)) ||
      (t.domain && t.domain.toLowerCase().includes(s));

    const matchesStatus = statusFilter.value === 'all' || t.status === statusFilter.value;
    const matchesPlan = planFilter.value === 'all' || t.planTier === planFilter.value || (t.planId && String(t.planId) === String(planFilter.value));

    return matchesSearch && matchesStatus && matchesPlan;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTenantsList.value.length / itemsPerPage)));

const paginatedTenants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTenantsList.value.slice(start, start + itemsPerPage);
});

const isExpired = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const autoGenerateSlug = () => {
  if (newStoreForm.storeName) {
    newStoreForm.slug = newStoreForm.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
};

const loadTenants = async () => {
  await fetchTenants();
  await fetchPlans();
};

onMounted(() => {
  loadTenants();
});

// Handlers
const openOnboardModal = () => {
  newStoreForm.storeName = '';
  newStoreForm.slug = '';
  newStoreForm.ownerName = '';
  newStoreForm.email = '';
  newStoreForm.phone = '';
  newStoreForm.password = '';
  newStoreForm.planTier = plans.value.length > 0 ? plans.value[0].id : 'pro';
  newStoreForm.status = 'active';
  newStoreForm.address = '';
  showOnboardModal.value = true;
};

const submitCreateTenant = async () => {
  isSubmitting.value = true;
  try {
    await createTenant({
      storeName: newStoreForm.storeName,
      slug: newStoreForm.slug,
      ownerName: newStoreForm.ownerName,
      email: newStoreForm.email,
      phone: newStoreForm.phone,
      password: newStoreForm.password,
      planTier: newStoreForm.planTier,
      planId: newStoreForm.planTier,
      status: newStoreForm.status,
      address: newStoreForm.address
    });
    showOnboardModal.value = false;
    showToast(`Store '${newStoreForm.storeName}' onboarded successfully!`);
    await loadTenants();
  } catch (e: any) {
    showToast(e.message || 'Failed to onboard store.', '❌');
  } finally {
    isSubmitting.value = false;
  }
};

const openEditModal = (t: TenantStore) => {
  editingTenant.value = t;
  editForm.storeName = t.storeName || t.name || '';
  editForm.slug = t.slug || '';
  editForm.ownerName = t.ownerName || '';
  editForm.email = t.email || '';
  editForm.phone = t.phone || '';
  editForm.planTier = t.planTier || 'pro';
  editForm.status = t.status || 'active';
  editForm.extendDays = 0;
  editForm.address = (t as any).address || '';
};

const openViewModal = (t: TenantStore) => {
  viewingTenant.value = t;
};

const submitUpdateTenant = async () => {
  if (!editingTenant.value) return;
  isSubmitting.value = true;
  try {
    await updateTenant(editingTenant.value.id, {
      status: editForm.status as any,
      planTier: editForm.planTier,
      extendDays: editForm.extendDays
    });
    showToast(`Store '${editForm.storeName}' updated successfully!`);
    editingTenant.value = null;
    await loadTenants();
  } catch (e: any) {
    showToast(e.message || 'Failed to update store.', '❌');
  } finally {
    isSubmitting.value = false;
  }
};

const quickExtendTrial = async (t: TenantStore, days: number) => {
  try {
    await updateTenant(t.id, { extendDays: days });
    showToast(`Extended validity for '${t.storeName}' by +${days} days!`);
    await loadTenants();
  } catch (e: any) {
    showToast('Failed to extend validity.', '❌');
  }
};

const toggleTenantStatus = async (t: TenantStore, newStatus: 'active' | 'suspended') => {
  try {
    await updateTenant(t.id, { status: newStatus });
    showToast(`Store '${t.storeName}' status changed to ${newStatus.toUpperCase()}`);
    await loadTenants();
  } catch (e: any) {
    showToast('Failed to change status.', '❌');
  }
};

const confirmDeleteTenant = async (t: TenantStore) => {
  if (confirm(`Are you sure you want to completely delete store '${t.storeName}' (ID: #${t.id})? This will also remove its subscription records.`)) {
    try {
      await deleteTenant(t.id);
      showToast(`Store '${t.storeName}' removed successfully.`);
      await loadTenants();
    } catch (e: any) {
      showToast('Failed to delete store.', '❌');
    }
  }
};
</script>
