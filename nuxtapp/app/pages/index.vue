<template>
  <div class="flex flex-col h-screen w-screen bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200 select-none">
    <!-- Desktop Application Ribbon & Header Bar -->
    <DesktopAppHeader />

    <!-- Main Desktop Application Window Rail -->
    <div class="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-gray-950">
      <!-- Desktop Scrollable Viewport Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <!-- Desktop App Banner Header Card -->
        <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                SaaS Multi-Tenant Cloud Architecture
              </span>
              <span class="text-xs text-slate-400 font-mono">• 38 Active Subscriber Stores</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pharmacy Chain Subscription & Store Onboarding Center
            </h1>
            <p class="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Select your subscription plan below to automatically provision your store in MySQL database with instant plan-restricted Master Drug Catalog auto-sync.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0 flex-wrap">
            <!-- Billing Cycle Switcher -->
            <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button 
                @click="isYearly = false"
                class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
                :class="!isYearly ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                Monthly
              </button>
              <button 
                @click="isYearly = true"
                class="px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs"
                :class="isYearly ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                <span>Annual</span>
                <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-white">SAVE 20%</span>
              </button>
            </div>

            <button 
              @click="openRegisterModal('pro')"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded-lg font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <span>🚀</span> Start 14-Day Free Trial
            </button>
          </div>
        </div>

        <!-- Subscription Plan Tier Windows Grid (Loaded Dynamically) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            v-for="plan in displayPlans" 
            :key="plan.id"
            :class="[
              'border rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-950 flex flex-col justify-between transition-all duration-200',
              plan.id === 'pro'
                ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                : 'border-slate-300 dark:border-gray-800 hover:border-emerald-500'
            ]"
          >
            <!-- Desktop Window Titlebar for Plan Card -->
            <div>
              <div 
                class="px-3.5 py-2 border-b flex items-center justify-between text-xs font-black uppercase tracking-wider"
                :class="[
                  plan.id === 'pro'
                    ? 'bg-emerald-700 text-white border-emerald-600'
                    : 'bg-emerald-600 text-white border-emerald-500'
                ]"
              >
                <div class="flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>{{ plan.name }}</span>
                </div>
                <span v-if="plan.id === 'pro'" class="text-[9px] px-2 py-0.5 rounded bg-white text-emerald-900 font-extrabold uppercase">
                  POPULAR
                </span>
                <span v-else class="text-[9px] px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                  {{ plan.id.toUpperCase() }}
                </span>
              </div>

              <!-- Plan Window Body Content -->
              <div class="p-4 space-y-4">
                <p class="text-xs text-slate-600 dark:text-gray-400 font-medium min-h-[36px]">
                  {{ plan.masterDrugLimit }}
                </p>

                <!-- Pricing Display Panel -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg flex items-baseline justify-between">
                  <div>
                    <span class="text-3xl font-black font-mono text-slate-900 dark:text-white">
                      ${{ isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly }}
                    </span>
                    <span class="text-slate-500 text-xs font-bold"> / month</span>
                  </div>
                  <span v-if="isYearly" class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${{ plan.priceYearly }}/yr
                  </span>
                </div>

                <!-- Features Checklist -->
                <div class="space-y-2 text-xs font-sans border-t border-slate-200 dark:border-gray-800 pt-3">
                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Terminals Limit:</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">
                      {{ plan.terminalsLimit >= 99 ? 'Unlimited Terminals' : plan.terminalsLimit + ' Terminal' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Outlets / Branch Limit:</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">
                      {{ plan.branchesLimit >= 99 ? 'Multi-Branch Sync' : plan.branchesLimit === 1 ? '1 Outlet' : plan.branchesLimit + ' Outlets' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Catalog Tiers:</span>
                    <span class="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {{ plan.allowedDrugTiers.join(', ') }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">FEFO Expiry Mode:</span>
                    <span class="text-[11px] font-medium text-slate-800 dark:text-gray-200">
                      {{ plan.features?.fefoExpiry || 'Basic' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Doctor Rx Verification:</span>
                    <span :class="plan.features?.rxVerification ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'">
                      {{ plan.features?.rxVerification ? '✓ Enabled' : '✕ Not Included' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Supplier PO Generator:</span>
                    <span :class="plan.features?.poGenerator ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'">
                      {{ plan.features?.poGenerator ? '✓ Enabled' : '✕ Not Included' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Support SLA:</span>
                    <span class="text-[11px] font-medium text-slate-800 dark:text-gray-200">
                      {{ plan.features?.support || 'Email Support' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Action Footer -->
            <div class="p-3 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800">
              <button 
                @click="openRegisterModal(plan.id)"
                class="w-full py-2 px-3 rounded-lg font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white"
              >
                <span>Select {{ plan.name }}</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Application Feature Comparison Data Table Panel -->
        <div class="border border-slate-300 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-950">
          <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
            <h2 class="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>📋</span> Desktop ERP Feature Matrix Comparison Across Tiers
            </h2>
            <span class="font-mono text-[10px] text-slate-500">Plan Capabilities Matrix</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
              <thead>
                <tr class="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                  <th class="py-2.5 px-4 border border-slate-300 dark:border-gray-700">DESKTOP ERP FEATURE CAPABILITY</th>
                  <th class="py-2.5 px-4 border border-slate-300 dark:border-gray-700 text-center text-emerald-700 dark:text-emerald-400">STARTER TIER</th>
                  <th class="py-2.5 px-4 border border-slate-300 dark:border-gray-700 text-center text-emerald-700 dark:text-emerald-400">PRO TIER (POPULAR)</th>
                  <th class="py-2.5 px-4 border border-slate-300 dark:border-gray-700 text-center text-emerald-700 dark:text-emerald-400">ENTERPRISE CHAIN TIER</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-300 dark:divide-gray-800 font-medium">
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">POS Cash Register Terminals Limit</td>
                  <td class="py-2.5 px-4 text-center font-mono border border-slate-300 dark:border-gray-800">1 Terminal</td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-gray-800">3 Terminals</td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-gray-800">Unlimited Terminals</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Store Outlets / Multi-Branch Sync</td>
                  <td class="py-2.5 px-4 text-center font-mono border border-slate-300 dark:border-gray-800">1 Outlet</td>
                  <td class="py-2.5 px-4 text-center font-mono border border-slate-300 dark:border-gray-800">1 Outlet</td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-gray-800">Multi-Branch Sync</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Master Drug Catalog Access Tiers</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-mono font-bold text-emerald-600">['starter']</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-mono font-bold text-emerald-600">['starter', 'pro']</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-mono font-bold text-emerald-600">['starter', 'pro', 'enterprise']</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">FEFO Expiry Batch Management</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800">Basic Expiry Tracking</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-bold text-emerald-600">Advanced FEFO Alerts</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-bold text-emerald-600">Automated AI Reordering</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Doctor Rx Verification Protocol</td>
                  <td class="py-2.5 px-4 text-center text-slate-400 border border-slate-300 dark:border-gray-800">✕ Not Included</td>
                  <td class="py-2.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold border border-slate-300 dark:border-gray-800">✓ Included</td>
                  <td class="py-2.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold border border-slate-300 dark:border-gray-800">✓ Included</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Supplier PO Generator</td>
                  <td class="py-2.5 px-4 text-center text-slate-400 border border-slate-300 dark:border-gray-800">✕ Not Included</td>
                  <td class="py-2.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold border border-slate-300 dark:border-gray-800">✓ Included</td>
                  <td class="py-2.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold border border-slate-300 dark:border-gray-800">✓ Included</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">SMS Customer Receipts Policy</td>
                  <td class="py-2.5 px-4 text-center text-slate-400 border border-slate-300 dark:border-gray-800">Not Included</td>
                  <td class="py-2.5 px-4 text-center font-mono border border-slate-300 dark:border-gray-800">500 SMS / month</td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 border border-slate-300 dark:border-gray-800">Unlimited SMS</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Support Level Agreement</td>
                  <td class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800">Email Support</td>
                  <td class="py-2.5 px-4 text-center font-bold text-emerald-600 border border-slate-300 dark:border-gray-800">Priority Chat Support</td>
                  <td class="py-2.5 px-4 text-center font-bold text-emerald-600 border border-slate-300 dark:border-gray-800">24/7 Dedicated Account Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Desktop Windows Style Status Bar Footer -->
      <footer class="bg-slate-200/90 dark:bg-gray-950 border-t border-slate-300 dark:border-gray-800 px-3 py-1 text-[10px] font-mono text-slate-600 dark:text-gray-400 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> DB Connected (MySQL Isolation)
          </span>
          <span>• Status: Ready</span>
          <span class="hidden sm:inline">• Latency: 3ms</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Keyboard Navigation: [F10: POS] [F11: ERP Admin] [F12: Super Admin]</span>
        </div>
      </footer>
    </div>

    <!-- Onboarding Registration Modal Dialog (Desktop App Style) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
        <!-- Desktop Modal Titlebar -->
        <div class="bg-slate-100 dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
          <h3 class="font-black text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>🏥</span> Onboard New Pharmacy Store (MySQL Provisioning)
          </h3>
          <button @click="showModal = false" class="font-bold text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <!-- Onboarding Form -->
        <form @submit.prevent="handleRegisterStore" class="p-3.5 space-y-3 text-xs font-sans">
          <!-- Selected Plan Banner -->
          <div class="p-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg flex items-center justify-between">
            <div>
              <span class="text-slate-500 dark:text-gray-400 block text-[10px] font-bold uppercase">Selected Plan Tier:</span>
              <span class="font-extrabold text-slate-900 dark:text-white capitalize">{{ signupForm.planTier }} Tier</span>
            </div>
            <span class="font-mono font-black text-emerald-600 dark:text-emerald-400">
              ${{ signupForm.planTier === 'enterprise' ? '399' : signupForm.planTier === 'pro' ? '149' : '49' }} / mo
            </span>
          </div>

          <!-- Store Name & Auto Subdomain Slug -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Pharmacy Store Name *</label>
            <input 
              v-model="signupForm.storeName"
              @input="generateSlug"
              type="text" 
              required 
              placeholder="e.g. MediCare Central Pharmacy"
              class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1.5 font-bold outline-none text-xs focus:border-emerald-500"
            />
            <div v-if="signupForm.slug" class="mt-1 p-1.5 bg-emerald-50 dark:bg-gray-900 border border-emerald-200 dark:border-gray-800 rounded text-[10px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>🌐 Portal Subdomain:</span>
              <span class="font-bold">https://{{ signupForm.slug }}.pharmasaas.com</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner / Chief Pharmacist *</label>
              <input 
                v-model="signupForm.ownerName"
                type="text" 
                required 
                placeholder="Dr. Robert Vance"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Billing Email Address *</label>
              <input 
                v-model="signupForm.email"
                type="email" 
                required 
                placeholder="robert@medicare-central.com"
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Contact Phone Number</label>
            <input 
              v-model="signupForm.phone"
              type="text" 
              placeholder="+1 (555) 234-5678"
              class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none text-xs focus:border-emerald-500"
            />
          </div>

          <!-- Checkout Mode Options -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Checkout / Billing Option</label>
            <div class="grid grid-cols-2 gap-2">
              <label 
                @click="signupForm.billingType = 'trial'"
                class="p-2 rounded border cursor-pointer transition-all flex items-center gap-2"
                :class="signupForm.billingType === 'trial' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-600'"
              >
                <span>🎁 14-Day Free Trial</span>
              </label>

              <label 
                @click="signupForm.billingType = 'card'"
                class="p-2 rounded border cursor-pointer transition-all flex items-center gap-2"
                :class="signupForm.billingType === 'card' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-600'"
              >
                <span>💳 Credit Card</span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
            <button 
              type="button" 
              @click="showModal = false"
              class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded font-black shadow-sm flex items-center gap-1.5"
            >
              <span v-if="isSubmitting" class="animate-spin">⏳</span>
              <span>{{ isSubmitting ? 'Provisioning...' : 'Provision Store in DB' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Onboarding Success Modal -->
    <div v-if="createdTenant" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-emerald-500 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-3xl mx-auto">
          🎉
        </div>

        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white">Pharmacy Store Provisioned!</h3>
          <p class="text-xs text-slate-600 dark:text-gray-400 mt-1">
            Store <b>{{ createdTenant.storeName }}</b> is registered in MySQL. Master Drug Catalog synced for {{ createdTenant.planTier.toUpperCase() }} tier.
          </p>
        </div>

        <div class="p-3 bg-slate-50 dark:bg-gray-900 rounded border border-slate-200 dark:border-gray-800 text-left font-mono text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500">Tenant ID:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ createdTenant.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Store Subdomain:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">https://{{ createdTenant.slug }}.pharmasaas.com</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Assigned Plan:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{{ createdTenant.planTier }} Tier</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Next Billing Date:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ createdTenant.nextBillingDate }}</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 pt-2">
          <NuxtLink 
            to="/super-admin/tenants"
            class="px-3.5 py-1.5 bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 rounded font-bold text-xs"
          >
            View in Super Admin
          </NuxtLink>

          <NuxtLink 
            to="/pos"
            class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded font-black text-xs shadow-sm flex items-center gap-1.5"
          >
            <span>🚀</span> Launch Store POS & Backoffice
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useSuperAdmin, type TenantStore, type SubscriptionPlan } from '~/composables/useSuperAdmin';
import DesktopAppHeader from '~/components/DesktopAppHeader.vue';

const { plans, fetchPlans, createTenant } = useSuperAdmin();

const isYearly = ref(false);
const showModal = ref(false);
const isSubmitting = ref(false);
const createdTenant = ref<TenantStore | null>(null);

onMounted(() => {
  fetchPlans();
});

const displayPlans = computed(() => {
  if (plans.value && plans.value.length > 0) {
    return plans.value;
  }
  return [
    {
      id: 'starter',
      name: 'Starter Plan',
      priceMonthly: 49,
      priceYearly: 470,
      terminalsLimit: 1,
      branchesLimit: 1,
      masterDrugLimit: 'Essential POS cash register & generics inventory for independent retail pharmacies.',
      allowedDrugTiers: ['starter'],
      features: {
        posRegister: true,
        fefoExpiry: 'Basic',
        rxVerification: false,
        smsReceipts: 'Not Included',
        poGenerator: false,
        support: 'Email Support'
      }
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      priceMonthly: 149,
      priceYearly: 1430,
      terminalsLimit: 3,
      branchesLimit: 1,
      masterDrugLimit: 'Full national brand catalog, Rx verification, supplier PO generator & multi-terminal sales.',
      allowedDrugTiers: ['starter', 'pro'],
      features: {
        posRegister: true,
        fefoExpiry: 'Advanced FEFO Alerts',
        rxVerification: true,
        smsReceipts: '500 SMS / month',
        poGenerator: true,
        support: 'Priority Chat Support'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Chain',
      priceMonthly: 399,
      priceYearly: 3830,
      terminalsLimit: 99,
      branchesLimit: 99,
      masterDrugLimit: 'Multi-branch pharmacy chains, biologics catalog & AI reordering automation.',
      allowedDrugTiers: ['starter', 'pro', 'enterprise'],
      features: {
        posRegister: true,
        fefoExpiry: 'Automated AI Reordering',
        rxVerification: true,
        smsReceipts: 'Unlimited SMS',
        poGenerator: true,
        support: '24/7 Dedicated Manager'
      }
    }
  ] as SubscriptionPlan[];
});

const signupForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  phone: '',
  planTier: 'pro' as 'starter' | 'pro' | 'enterprise',
  billingType: 'trial' as 'trial' | 'card'
});

const generateSlug = () => {
  signupForm.slug = signupForm.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const openRegisterModal = (tier: string) => {
  signupForm.planTier = (tier === 'enterprise' ? 'enterprise' : tier === 'starter' ? 'starter' : 'pro') as 'starter' | 'pro' | 'enterprise';
  showModal.value = true;
};

const handleRegisterStore = async () => {
  isSubmitting.value = true;
  try {
    const tenant = await createTenant({
      storeName: signupForm.storeName,
      ownerName: signupForm.ownerName,
      email: signupForm.email,
      phone: signupForm.phone,
      planTier: signupForm.planTier
    });

    if (tenant) {
      createdTenant.value = tenant;
      showModal.value = false;
    }
  } catch (e) {
    alert("Error onboarding pharmacy store. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
