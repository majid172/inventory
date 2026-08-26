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
              <span class="text-xs text-slate-400 font-mono">• {{ displayPlans.length }} Active Subscriber Tiers</span>
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
                class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer"
                :class="!isYearly ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                Monthly
              </button>
              <button 
                @click="isYearly = true"
                class="px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                :class="isYearly ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                <span>Annual</span>
                <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-white">SAVE 20%</span>
              </button>
            </div>

            <button 
              @click="openRegisterModal(displayPlans[0] || null)"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded-lg font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀</span> Start 14-Day Free Trial
            </button>
          </div>
        </div>

        <!-- Subscription Plan Tier Windows Grid (Loaded Dynamically) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            v-for="(plan, idx) in displayPlans" 
            :key="plan.id"
            :class="[
              'border rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-950 flex flex-col justify-between transition-all duration-200',
              idx === 1
                ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                : 'border-slate-300 dark:border-gray-800 hover:border-emerald-500'
            ]"
          >
            <!-- Desktop Window Titlebar for Plan Card -->
            <div>
              <div 
                class="px-3.5 py-2 border-b flex items-center justify-between text-xs font-black uppercase tracking-wider"
                :class="[
                  idx === 1
                    ? 'bg-emerald-700 text-white border-emerald-600'
                    : 'bg-emerald-600 text-white border-emerald-500'
                ]"
              >
                <div class="flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>{{ plan.name }}</span>
                </div>
                <span v-if="idx === 1" class="text-[9px] px-2 py-0.5 rounded bg-white text-emerald-900 font-extrabold uppercase">
                  POPULAR
                </span>
                <span v-else class="text-[9px] px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                  #{{ plan.id }}
                </span>
              </div>

              <!-- Plan Window Body Content -->
              <div class="p-4 space-y-4">
                <p class="text-xs text-slate-600 dark:text-gray-400 font-medium min-h-[36px]">
                  {{ (plan as any).maxProducts || (plan as any).max_products || 500 }} Medicines limit with {{ (plan as any).durationDays || (plan as any).duration_days || 30 }} days active billing cycle.
                </p>

                <!-- Pricing Display Panel -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg flex items-baseline justify-between">
                  <div>
                    <span class="text-3xl font-black font-mono text-slate-900 dark:text-white">
                      {{ settingsStore.currencySymbol }}{{ getPrice(plan) }}
                    </span>
                    <span class="text-slate-500 text-xs font-bold"> / {{ (plan as any).durationDays || (plan as any).duration_days || 30 }} days</span>
                  </div>
                  <span v-if="isYearly" class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ settingsStore.currencySymbol }}{{ isYearly ? Math.round((plan as any).priceYearly / 12) : (plan as any).priceMonthly }}/mo
                  </span>
                </div>

                <!-- Features Checklist -->
                <div class="space-y-2 text-xs font-sans border-t border-slate-200 dark:border-gray-800 pt-3">
                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Terminals Limit:</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">
                      {{ (plan as any).maxTerminals || (plan as any).max_terminals || 1 }} Terminal(s)
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Staff Users Limit:</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">
                      {{ (plan as any).maxUsers || (plan as any).max_users || 5 }} Users
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">Max Inventory Products:</span>
                    <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {{ (plan as any).maxProducts || (plan as any).max_products || 500 }} Drugs
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-slate-700 dark:text-gray-300">
                    <span class="font-bold">POS Cash Register Counter:</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Enabled
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
                </div>
              </div>
            </div>

            <!-- Card Action Footer -->
            <div class="p-3 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800">
              <button 
                @click="openRegisterModal(plan)"
                class="w-full py-2 px-3 rounded-lg font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white cursor-pointer"
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
                  <th 
                    v-for="plan in displayPlans" 
                    :key="plan.id"
                    class="py-2.5 px-4 border border-slate-300 dark:border-gray-700 text-center text-emerald-700 dark:text-emerald-400 font-extrabold"
                  >
                    {{ plan.name.toUpperCase() }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-300 dark:divide-gray-800 font-medium">
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Subscription Price</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center font-mono font-black text-emerald-600 border border-slate-300 dark:border-gray-800">
                    {{ settingsStore.currencySymbol }}{{ getPrice(plan) }} / {{ (plan as any).durationDays || (plan as any).duration_days || 30 }}d
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">POS Cash Register Terminals Limit</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-gray-100 border border-slate-300 dark:border-gray-800">
                    {{ (plan as any).maxTerminals || (plan as any).max_terminals || 1 }} Terminal(s)
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Max Staff Users Limit</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-gray-100 border border-slate-300 dark:border-gray-800">
                    {{ (plan as any).maxUsers || (plan as any).max_users || 5 }} Users
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Max Drug Catalog Limit</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-gray-800">
                    {{ (plan as any).maxProducts || (plan as any).max_products || 500 }} Drugs
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Doctor Rx Verification Protocol</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-bold" :class="plan.features?.rxVerification ? 'text-emerald-600' : 'text-slate-400'">
                    {{ plan.features?.rxVerification ? '✓ Included' : '✕ Not Included' }}
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-gray-900/60">
                  <td class="py-2.5 px-4 font-bold border border-slate-300 dark:border-gray-800 text-slate-900 dark:text-gray-100">Supplier PO Generator</td>
                  <td v-for="plan in displayPlans" :key="plan.id" class="py-2.5 px-4 text-center border border-slate-300 dark:border-gray-800 font-bold" :class="plan.features?.poGenerator ? 'text-emerald-600' : 'text-slate-400'">
                    {{ plan.features?.poGenerator ? '✓ Included' : '✕ Not Included' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Desktop Windows Style Status Bar Footer -->
      <footer class="h-6 bg-slate-200 dark:bg-gray-900 border-t border-slate-300 dark:border-gray-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-gray-400 select-none">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            System Status: Connected
          </span>
          <span>|</span>
          <span>Database: MySQL (subscription_plans)</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Keyboard Navigation: [F10: POS] [F11: ERP Admin] [F12: Super Admin]</span>
        </div>
      </footer>
    </div>

    <!-- Onboarding Registration Modal Dialog (100% Authentic Desktop Application Window) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-slate-400 dark:border-gray-700 shadow-2xl rounded-none max-w-lg w-full overflow-hidden">
        <!-- Desktop Modal Window Titlebar -->
        <div class="bg-[#e9eef2] dark:bg-gray-900 border-b border-slate-300 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs">🏬</span>
            <h3 class="font-bold text-xs uppercase text-slate-800 dark:text-gray-100 tracking-wider">
              Store Registration Wizard <span class="font-mono text-[10px] text-slate-500 font-normal">[{{ modalStep === 1 ? 'Step 1 of 2: Store Details' : 'Step 2 of 2: Payment & Trx ID' }}]</span>
            </h3>
          </div>
          <button @click="showModal = false" class="w-5 h-5 flex items-center justify-center bg-slate-200 hover:bg-red-600 hover:text-white border border-slate-300 dark:bg-gray-800 dark:hover:bg-red-600 text-xs font-mono font-bold cursor-pointer transition-colors">✕</button>
        </div>

        <!-- Onboarding Form Container -->
        <div class="p-4 text-xs font-sans bg-white dark:bg-gray-950">
          <!-- Form Step 1: Store & Owner Details -->
          <form v-if="modalStep === 1" @submit.prevent="goToPaymentStep" class="space-y-3 text-xs">
            <!-- Selected Plan Banner -->
            <div class="p-2.5 bg-[#f4f6f8] dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-none flex items-center justify-between text-xs">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">SELECTED PLAN TIER:</span>
                <span class="font-bold text-slate-800 dark:text-gray-200">{{ selectedPlan?.name || 'Pro Tier' }}</span>
              </div>
              <span class="font-mono font-black text-[#107c41] dark:text-emerald-400 text-sm">
                {{ settingsStore.currencySymbol }}{{ selectedPlan ? getPrice(selectedPlan) : '49' }}
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
                placeholder="e.g. Laz Pharma Central"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-2.5 py-1.5 font-bold outline-none text-xs focus:border-[#107c41]"
              />
              <div v-if="signupForm.slug" class="mt-1.5 p-1.5 bg-[#eef6f0] dark:bg-gray-900 border border-[#b2d8bc] dark:border-gray-800 rounded-none text-[10px] font-mono text-[#107c41] dark:text-emerald-400 flex items-center justify-between">
                <span>🌐 Portal Subdomain:</span>
                <span class="font-bold">https://{{ signupForm.slug }}.pharmasaas.com</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Owner / Chief Pharmacist *</label>
                <input 
                  v-model="signupForm.ownerName"
                  type="text" 
                  required 
                  placeholder="e.g. Laz"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-2.5 py-1.5 outline-none text-xs focus:border-[#107c41]"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Billing Email Address *</label>
                <input 
                  v-model="signupForm.email"
                  type="email" 
                  required 
                  placeholder="laz@mail.com"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-2.5 py-1.5 outline-none text-xs focus:border-[#107c41]"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Password *</label>
                <input 
                  v-model="signupForm.password"
                  type="password" 
                  required 
                  placeholder="••••••••"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-2.5 py-1.5 outline-none text-xs focus:border-[#107c41]"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Contact Phone Number</label>
                <input 
                  v-model="signupForm.phone"
                  type="text" 
                  placeholder="01700000000"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-2.5 py-1.5 font-mono outline-none text-xs focus:border-[#107c41]"
                />
              </div>
            </div>

            <!-- Step 1 Buttons -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-300 dark:border-gray-800">
              <button 
                type="button" 
                @click="showModal = false"
                class="px-3.5 py-1.5 bg-[#e1e6ea] hover:bg-[#d5dbe0] text-slate-800 dark:bg-gray-800 dark:text-gray-200 border border-slate-300 dark:border-gray-700 font-normal rounded-none cursor-pointer text-xs transition-all shadow-2xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] border border-[#0b542c] text-white rounded-none font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs transition-all"
              >
                <span>Next: Payment & Trx ID</span>
                <span>→</span>
              </button>
            </div>
          </form>

          <!-- Form Step 2: Gateway Selection & Payment Transaction ID (Trx ID) Pop-Up Step -->
          <form v-else-if="modalStep === 2" @submit.prevent="handleRegisterStore" class="space-y-3.5 text-xs">
            <!-- Gateway Selector Buttons (Dynamically Filtered by Super Admin Settings) -->
            <div>
              <label class="block font-bold text-slate-800 dark:text-gray-100 mb-1.5 text-xs">
                Select Payment Gateway *
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  v-if="settingsStore.systemSettings.bkashEnabled !== false"
                  type="button"
                  @click="signupForm.paymentMethod = 'bkash'"
                  class="py-2 px-3 rounded-none border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                  :class="(signupForm.paymentMethod === 'bkash' || signupForm.paymentMethod === 'mobile_banking') ? 'bg-[#107c41] text-white border-[#0e6b37]' : 'bg-[#f4f6f8] dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200'"
                >
                  bKash
                </button>
                <button 
                  v-if="settingsStore.systemSettings.nagadEnabled !== false"
                  type="button"
                  @click="signupForm.paymentMethod = 'nagad'"
                  class="py-2 px-3 rounded-none border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                  :class="signupForm.paymentMethod === 'nagad' ? 'bg-[#107c41] text-white border-[#0e6b37]' : 'bg-[#f4f6f8] dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200'"
                >
                  Nagad
                </button>
                <button 
                  v-if="settingsStore.systemSettings.upayEnabled !== false"
                  type="button"
                  @click="signupForm.paymentMethod = 'upay'"
                  class="py-2 px-3 rounded-none border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                  :class="signupForm.paymentMethod === 'upay' ? 'bg-[#107c41] text-white border-[#0e6b37]' : 'bg-[#f4f6f8] dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200'"
                >
                  Upay
                </button>
                <button 
                  v-if="settingsStore.systemSettings.rocketEnabled !== false"
                  type="button"
                  @click="signupForm.paymentMethod = 'rocket'"
                  class="py-2 px-3 rounded-none border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                  :class="signupForm.paymentMethod === 'rocket' ? 'bg-[#107c41] text-white border-[#0e6b37]' : 'bg-[#f4f6f8] dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200'"
                >
                  Rocket
                </button>
                <button 
                  v-if="settingsStore.systemSettings.cardEnabled === true"
                  type="button"
                  @click="signupForm.paymentMethod = 'card'"
                  class="py-2 px-3 rounded-none border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                  :class="signupForm.paymentMethod === 'card' ? 'bg-[#107c41] text-white border-[#0e6b37]' : 'bg-[#f4f6f8] dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200'"
                >
                  Card / SSL
                </button>
              </div>
            </div>

            <!-- Dynamic Merchant Payment Banner (Desktop ERP Style) -->
            <div class="p-3 bg-[#eef6f0] dark:bg-emerald-950/40 border border-[#b2d8bc] dark:border-emerald-800 rounded-none text-slate-800 dark:text-emerald-200 space-y-1.5">
              <div class="flex items-center justify-between font-bold text-xs">
                <span class="uppercase font-mono text-[#107c41] dark:text-emerald-400">
                  {{ signupForm.paymentMethod }} Merchant Payment Instructions
                </span>
                <span class="font-mono text-slate-900 dark:text-white font-black">
                  Amount: {{ settingsStore.currencySymbol }}{{ selectedPlan ? getPrice(selectedPlan) : '49' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Please pay <b>{{ settingsStore.currencySymbol }}{{ selectedPlan ? getPrice(selectedPlan) : '49' }}</b> using {{ signupForm.paymentMethod }} App (Send Money / Payment):
              </p>
              <div class="p-2 bg-white dark:bg-gray-900 border border-[#a2cbac] dark:border-emerald-800 rounded-none font-mono text-xs text-center font-bold tracking-wider">
                <span class="uppercase font-mono text-slate-500">{{ signupForm.paymentMethod }}</span> Official Number: 
                <span class="text-[#107c41] dark:text-emerald-400 font-extrabold text-sm">
                  {{ 
                    signupForm.paymentMethod === 'nagad' ? (settingsStore.systemSettings.nagadNumber || '01800-000000') :
                    signupForm.paymentMethod === 'upay' ? (settingsStore.systemSettings.upayNumber || '01900-000000') :
                    signupForm.paymentMethod === 'rocket' ? (settingsStore.systemSettings.rocketNumber || '01600-000000') :
                    signupForm.paymentMethod === 'card' ? (settingsStore.systemSettings.cardRef || 'SSL-MED-PAY') :
                    (settingsStore.systemSettings.bkashNumber || '01700-000000')
                  }}
                </span>
              </div>
            </div>

            <!-- Transaction ID (Trx ID) Input Field -->
            <div class="pt-1">
              <label class="block font-bold text-slate-800 dark:text-gray-100 mb-1 text-xs uppercase font-mono">
                Enter {{ signupForm.paymentMethod }} Transaction ID (Trx ID) *
              </label>
              <input 
                v-model="signupForm.trx_no"
                type="text" 
                required 
                autofocus
                placeholder="e.g. TRX9B82K19A or Trx ID"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-none px-3 py-1.5 text-slate-800 dark:text-gray-100 font-mono text-xs outline-none focus:border-[#107c41] uppercase tracking-wider font-bold shadow-2xs"
              />
              <p class="text-[10px] text-slate-500 dark:text-gray-400 mt-1 font-mono">
                Selected Gateway: <b class="uppercase font-mono text-[#107c41] dark:text-emerald-400">{{ signupForm.paymentMethod }}</b>. Direct MySQL billing record.
              </p>
            </div>

            <!-- Step 2 Action Buttons -->
            <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-300 dark:border-gray-800">
              <button 
                type="button" 
                @click="modalStep = 1"
                class="px-3.5 py-1.5 bg-[#e1e6ea] hover:bg-[#d5dbe0] text-slate-800 dark:bg-gray-800 dark:text-gray-200 border border-slate-300 dark:border-gray-700 font-normal rounded-none cursor-pointer text-xs transition-all shadow-2xs"
              >
                ← Back
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting || !signupForm.trx_no.trim()"
                class="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] border border-[#0b542c] disabled:opacity-50 text-white rounded-none font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs transition-all"
              >
                <span v-if="isSubmitting" class="animate-spin text-xs">⌛</span>
                <span>{{ isSubmitting ? 'Provisioning Store...' : 'Complete Subscription & Activate Store 🚀' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  <!-- Onboarding Success Modal -->
    <div v-if="createdTenant" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div class="bg-white dark:bg-gray-950 border border-emerald-500 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-fadeIn">
        <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-3xl mx-auto">
          🎉
        </div>

        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white">Payment & Subscription Activated!</h3>
          <p class="text-xs text-slate-600 dark:text-gray-400 mt-1">
            Store <b>{{ createdTenant.name || createdTenant.storeName }}</b> is live with active subscription.
          </p>
        </div>

        <div class="p-3 bg-slate-50 dark:bg-gray-900 rounded border border-slate-200 dark:border-gray-800 text-left font-mono text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500">Tenant Store:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ createdTenant.name || createdTenant.storeName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white font-black">{{ settingsStore.systemSettings.platformName }}</span>
            <span class="font-bold text-emerald-600">CONFIRMED (SUCCESS)</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button 
            @click="goToTenantDashboard"
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Enter Tenant Dashboard</span>
            <span>➡️</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import { useSettingsStore } from '~/stores/settings';
import { useAuth } from '~/composables/useAuth';
import type { SubscriptionPlan } from '~/stores/superAdmin';

const router = useRouter();
const settingsStore = useSettingsStore();
const { plans, fetchPlans } = useSuperAdmin();
const { setAuthSession } = useAuth();

const isYearly = ref(false);
const showModal = ref(false);
const isSubmitting = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);
const createdTenant = ref<any>(null);

onMounted(async () => {
  await fetchPlans();
});

const displayPlans = computed(() => {
  let list: SubscriptionPlan[] = [];
  if (plans.value && plans.value.length > 0) {
    list = [...plans.value];
  } else {
    list = [
      {
        id: '1',
        name: 'Starter Plan',
        price: 49,
        priceMonthly: 49,
        durationDays: 30,
        maxTerminals: 1,
        maxUsers: 5,
        maxProducts: 500,
      }
    ] as SubscriptionPlan[];
  }

  return list.sort((a: any, b: any) => {
    const pA = Number(a.price ?? a.priceMonthly ?? a.price_monthly ?? 0);
    const pB = Number(b.price ?? b.priceMonthly ?? b.price_monthly ?? 0);
    return pA - pB;
  });
});

const getPrice = (plan: SubscriptionPlan) => {
  const p = plan.price ?? (plan as any).priceMonthly ?? (plan as any).price_monthly ?? 49;
  return isYearly.value ? Math.round(p * 10) : p;
};

const signupForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  password: '',
  phone: '',
  paymentMethod: 'mobile_banking',
  trx_no: ''
});

const generateSlug = () => {
  signupForm.slug = signupForm.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const modalStep = ref(1);

const openRegisterModal = (plan: SubscriptionPlan | null) => {
  selectedPlan.value = plan || (displayPlans.value.length > 0 ? displayPlans.value[0] : null);
  signupForm.storeName = '';
  signupForm.slug = '';
  signupForm.ownerName = '';
  signupForm.email = '';
  signupForm.password = '';
  signupForm.phone = '';
  signupForm.paymentMethod = 'mobile_banking';
  signupForm.trx_no = '';
  modalStep.value = 1;
  showModal.value = true;
};

const goToPaymentStep = () => {
  if (!signupForm.storeName.trim() || !signupForm.email.trim() || !signupForm.password.trim()) {
    alert("Please fill in Store Name, Billing Email, and Password.");
    return;
  }
  modalStep.value = 2;
};

const handleRegisterStore = async () => {
  if (!signupForm.trx_no.trim()) {
    alert("Please enter the Payment Transaction ID (Trx ID) to complete subscription.");
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/auth/register-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName: signupForm.storeName,
        ownerName: signupForm.ownerName,
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone,
        domain: signupForm.slug,
        planId: selectedPlan.value?.id || 1,
        gateway: signupForm.paymentMethod,
        paymentMethod: signupForm.paymentMethod,
        trx_no: signupForm.trx_no.trim()
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Registration failed');
    }

    if (json.token && json.user) {
      setAuthSession(json.token, json.user, json.tenant);
    }

    createdTenant.value = json.tenant || { name: signupForm.storeName };
    showModal.value = false;

    // Direct redirect to Tenant Dashboard
    setTimeout(() => {
      navigateTo('/admin');
    }, 1200);
  } catch (e: any) {
    alert("Error onboarding pharmacy store: " + (e.message || "Please check connection"));
  } finally {
    isSubmitting.value = false;
  }
};

const goToTenantDashboard = () => {
  navigateTo('/admin');
};
</script>
