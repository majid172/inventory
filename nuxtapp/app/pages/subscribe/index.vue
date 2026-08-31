<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white pb-32 overflow-hidden relative">
    <!-- Ambient Background Glow Effects -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none rounded-full"></div>
    <div class="absolute top-[600px] right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full"></div>

    <!-- Top Navigation Header -->
    <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 font-black text-xl">
            💊
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">PharmaSaaS</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase tracking-wider">v2.4 Multi-Tenant</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs font-bold">
          <NuxtLink to="/super-admin" class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
            <span>🛡️</span> Super Admin Console
          </NuxtLink>
          <NuxtLink to="/" class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
            <span>💻</span> Live POS Register
          </NuxtLink>
          <button 
            @click="openRegisterModal('pro')"
            class="px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-black shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 flex items-center gap-1.5"
          >
            <span>🚀</span> Start {{ settingsStore.systemSettings.defaultTrialDays || 14 }}-Day Free Trial
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-16 pb-14 px-4 max-w-5xl mx-auto text-center z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-500/30 text-sky-300 text-xs font-extrabold mb-6 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
        <span>AUTOMATED PHARMACY ONBOARDING & INSTANT CATALOG SYNC</span>
      </div>

      <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15]">
        Empower Your Pharmacy Chain With <br />
        <span class="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
          Multi-Tenant Cloud POS & Master Catalog
        </span>
      </h1>

      <p class="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
        Choose your subscription tier below to provision your pharmacy store instantly. Automated FEFO inventory alerts, doctor Rx verification, and plan-restricted drug catalog sync built-in.
      </p>

      <!-- Trust Badges Bar -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-400">✓</span> {{ settingsStore.systemSettings.defaultTrialDays || 14 }}-Day Free Trial
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-400">✓</span> No Credit Card Required
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-400">✓</span> Cancel Anytime
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-400">✓</span> Instant Database Provisioning
        </div>
      </div>

      <!-- Monthly / Yearly Billing Toggle -->
      <div class="mt-10 inline-flex items-center gap-4 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md select-none">
        <button 
          @click="isYearly = false"
          class="px-5 py-2 rounded-xl text-xs font-black transition-all"
          :class="!isYearly ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          Monthly Billing
        </button>

        <button 
          @click="isYearly = true"
          class="px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
          :class="isYearly ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          <span>Annual Billing</span>
          <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            SAVE 20%
          </span>
        </button>
      </div>
    </section>

    <!-- Subscription Plans Grid (Loaded Dynamically from Database) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
      <div 
        v-for="plan in displayPlans" 
        :key="plan.id"
        :class="[
          'relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-xl group',
          plan.id === 'pro'
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-sky-500 shadow-sky-500/20 transform md:-translate-y-3 z-20'
            : plan.id === 'enterprise'
            ? 'bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:shadow-purple-500/10'
            : 'bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
        ]"
      >
        <!-- Highlight ribbon for Pro / Popular plan -->
        <div v-if="plan.id === 'pro'" class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-sky-500/30 flex items-center gap-1.5">
          <span>🔥</span> MOST POPULAR FOR PHARMACIES
        </div>

        <div>
          <div class="flex items-center justify-between mb-4 mt-2">
            <span 
              class="text-xs font-black tracking-widest uppercase flex items-center gap-1.5"
              :class="plan.id === 'enterprise' ? 'text-purple-400' : plan.id === 'pro' ? 'text-sky-400' : 'text-emerald-400'"
            >
              <span>{{ plan.id === 'enterprise' ? '🟧' : plan.id === 'pro' ? '🟦' : '🟢' }}</span>
              {{ plan.id.toUpperCase() }} TIER
            </span>
            <span 
              class="text-[10px] font-bold px-2.5 py-1 rounded-lg border"
              :class="plan.id === 'enterprise' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : plan.id === 'pro' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'"
            >
              {{ plan.branchesLimit >= 99 ? 'Multi-Branch Sync' : plan.branchesLimit === 1 ? 'Single Outlet' : plan.branchesLimit + ' Outlets' }}
            </span>
          </div>

          <h3 class="text-2xl font-black text-white">{{ plan.name }}</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">{{ plan.masterDrugLimit }}</p>

          <div 
            class="my-6 p-4 rounded-2xl border"
            :class="plan.id === 'pro' ? 'bg-slate-950/80 border-sky-500/30' : 'bg-slate-950/60 border-slate-800/80'"
          >
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-black text-white">
                {{ settingsStore.currencySymbol }}{{ isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly }}
              </span>
              <span class="text-slate-400 text-xs font-bold">/ month</span>
            </div>
            <span v-if="isYearly" class="text-[10px] font-mono font-bold mt-1 block" :class="plan.id === 'enterprise' ? 'text-purple-400' : plan.id === 'pro' ? 'text-sky-400' : 'text-emerald-400'">
              {{ settingsStore.currencySymbol }}{{ plan.priceYearly }} billed annually
            </span>
          </div>

          <ul class="space-y-3.5 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
            <li class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">✓</span>
              <span><b>{{ plan.terminalsLimit >= 99 ? 'Unlimited Terminals' : plan.terminalsLimit + ' POS Terminal' }}</b> Sales Counter</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">✓</span>
              <span><b>{{ plan.branchesLimit >= 99 ? 'Multi-Branch Sync' : plan.branchesLimit === 1 ? '1 Single Outlet' : plan.branchesLimit + ' Outlets' }}</b></span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">✓</span>
              <span><b>Catalog Access:</b> {{ plan.allowedDrugTiers.join(' + ').toUpperCase() }}</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>FEFO Expiry: {{ plan.features?.fefoExpiry || 'Advanced Alerts' }}</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span 
                class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                :class="plan.features?.rxVerification ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500 opacity-60'"
              >
                {{ plan.features?.rxVerification ? '✓' : '✕' }}
              </span>
              <span :class="!plan.features?.rxVerification ? 'line-through opacity-60' : ''">
                Doctor Rx Verification Protocol
              </span>
            </li>
            <li class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>SMS Receipts: {{ plan.features?.smsReceipts || 'Not Included' }}</span>
            </li>
            <li class="flex items-center gap-2.5">
              <span 
                class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                :class="plan.features?.poGenerator ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500 opacity-60'"
              >
                {{ plan.features?.poGenerator ? '✓' : '✕' }}
              </span>
              <span :class="!plan.features?.poGenerator ? 'line-through opacity-60' : ''">
                Supplier PO Generator
              </span>
            </li>
          </ul>
        </div>

        <button 
          @click="openRegisterModal(plan.id)"
          :class="[
            'mt-8 w-full py-3.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2',
            plan.id === 'pro'
              ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-xl shadow-sky-500/30 active:scale-95'
              : plan.id === 'enterprise'
              ? 'bg-slate-800 hover:bg-purple-600 text-white shadow-md group-hover:shadow-purple-500/20'
              : 'bg-slate-800 hover:bg-emerald-600 text-white shadow-md group-hover:shadow-emerald-500/20'
          ]"
        >
          <span>Select {{ plan.name }}</span>
          <span>🚀</span>
        </button>
      </div>
    </section>

    <!-- Feature Comparison Matrix Table -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-black text-white">Compare Plan Features</h2>
        <p class="text-xs text-slate-400 mt-2">Comprehensive breakdown of features, limits, and catalog entitlement per tier.</p>
      </div>

      <div class="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900/90 text-slate-200 font-black">
              <th class="p-4 sm:p-6 w-1/3">Feature Capability</th>
              <th class="p-4 sm:p-6 text-center text-emerald-400">Starter Plan</th>
              <th class="p-4 sm:p-6 text-center text-sky-400">Pro Plan</th>
              <th class="p-4 sm:p-6 text-center text-purple-400">Enterprise Chain</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-medium text-slate-300">
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">POS Cash Register Terminals</td>
              <td class="p-4 sm:p-5 text-center font-mono">1 Terminal</td>
              <td class="p-4 sm:p-5 text-center font-mono text-sky-300 font-bold">3 Terminals</td>
              <td class="p-4 sm:p-5 text-center font-mono text-purple-300 font-bold">Unlimited Terminals</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">Store Outlets / Branch Limit</td>
              <td class="p-4 sm:p-5 text-center font-mono">1 Outlet</td>
              <td class="p-4 sm:p-5 text-center font-mono">1 Outlet</td>
              <td class="p-4 sm:p-5 text-center font-mono text-purple-300 font-bold">Multi-Branch Sync</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">Master Drug Catalog Access Tiers</td>
              <td class="p-4 sm:p-5 text-center">
                <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">['starter']</span>
              </td>
              <td class="p-4 sm:p-5 text-center">
                <span class="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold">['starter', 'pro']</span>
              </td>
              <td class="p-4 sm:p-5 text-center">
                <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono font-bold">['starter', 'pro', 'enterprise']</span>
              </td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">FEFO Expiry Batch Tracking</td>
              <td class="p-4 sm:p-5 text-center">Basic</td>
              <td class="p-4 sm:p-5 text-center text-sky-300 font-bold">Advanced FEFO Alerts</td>
              <td class="p-4 sm:p-5 text-center text-purple-300 font-bold">Automated AI Reordering</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">Doctor Rx Verification Protocol</td>
              <td class="p-4 sm:p-5 text-center text-slate-500">✕</td>
              <td class="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Included</td>
              <td class="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Included</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">Supplier PO Generator</td>
              <td class="p-4 sm:p-5 text-center text-slate-500">✕</td>
              <td class="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Included</td>
              <td class="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Included</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">SMS Customer Receipts</td>
              <td class="p-4 sm:p-5 text-center text-slate-500">Not Included</td>
              <td class="p-4 sm:p-5 text-center font-mono">500 SMS / month</td>
              <td class="p-4 sm:p-5 text-center font-mono text-purple-300 font-bold">Unlimited SMS</td>
            </tr>
            <tr>
              <td class="p-4 sm:p-5 font-bold text-white">Support SLA</td>
              <td class="p-4 sm:p-5 text-center">Email Support</td>
              <td class="p-4 sm:p-5 text-center font-bold text-sky-300">Priority Chat Support</td>
              <td class="p-4 sm:p-5 text-center font-bold text-purple-300">24/7 Dedicated Manager</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Interactive Store Onboarding Registration Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-8">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              🏥
            </div>
            <div>
              <h3 class="font-black text-base text-white">Onboard Your Pharmacy Store</h3>
              <p class="text-[11px] text-slate-400">Complete setup to provision your MySQL tenant store</p>
            </div>
          </div>
          <button @click="resetModal" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs">✕</button>
        </div>

        <!-- Step 1: Onboarding Details Form -->
        <form v-if="currentStep === 1 && !accountExistsEmail" @submit.prevent="handleRegisterStore" class="p-6 space-y-4 text-xs">
          <!-- Selected Plan Banner -->
          <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Selected Subscription Plan</span>
              <span class="text-white font-black text-sm capitalize">{{ signupForm.planTier }} Tier Access</span>
            </div>
            <span 
              class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border"
              :class="signupForm.planTier === 'enterprise' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : signupForm.planTier === 'pro' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'"
            >
              {{ settingsStore.currencySymbol }}{{ signupForm.planTier === 'enterprise' ? '399' : signupForm.planTier === 'pro' ? '149' : '49' }} / mo
            </span>
          </div>

          <!-- Store Name & Auto Subdomain Slug -->
          <div>
            <label class="block font-bold text-slate-200 mb-1">Pharmacy Store Name *</label>
            <input 
              v-model="signupForm.storeName"
              @input="generateSlug"
              type="text" 
              required 
              placeholder="e.g. MediCare Central Pharmacy"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-xs"
            />
            <div v-if="signupForm.slug" class="mt-1.5 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-mono flex items-center justify-between">
              <span>🌐 Tenant Portal:</span>
              <span class="font-bold">https://{{ signupForm.slug }}.pharmasaas.com</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-200 mb-1">Owner / Chief Pharmacist Name *</label>
              <input 
                v-model="signupForm.ownerName"
                type="text" 
                required 
                placeholder="Dr. Robert Vance"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-sky-500 transition-all text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-200 mb-1">Billing Email Address *</label>
              <input 
                v-model="signupForm.email"
                type="email" 
                required 
                placeholder="robert@medicare-central.com"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-sky-500 transition-all text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-200 mb-1">Contact Phone Number</label>
              <input 
                v-model="signupForm.phone"
                type="text" 
                placeholder="+1 (555) 234-5678"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-sky-500 transition-all text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-200 mb-1">Admin Password *</label>
              <input 
                v-model="signupForm.password"
                type="password" 
                required
                placeholder="Secure access password"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-sky-500 transition-all text-xs"
              />
            </div>
          </div>

          <!-- Billing Options Toggle -->
          <div>
            <label class="block font-bold text-slate-200 mb-1.5">Select Checkout Method</label>
            <div class="grid grid-cols-2 gap-3">
              <div 
                @click="signupForm.billingType = 'trial'"
                class="p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5"
                :class="signupForm.billingType === 'trial' ? 'bg-sky-500/10 border-sky-500 text-sky-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                <span class="text-base">🎁</span>
                <div>
                  <span class="font-bold block text-xs">14-Day Free Trial</span>
                  <span class="text-[10px] text-slate-400">Instant access, no card needed</span>
                </div>
              </div>

              <div 
                @click="signupForm.billingType = 'card'"
                class="p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5"
                :class="signupForm.billingType === 'card' ? 'bg-sky-500/10 border-sky-500 text-sky-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                <span class="text-base">💳</span>
                <div>
                  <span class="font-bold block text-xs">Credit Card Checkout</span>
                  <span class="text-[10px] text-slate-400">Direct subscription billing</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="resetModal"
              class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black shadow-lg shadow-sky-500/25 flex items-center gap-2 text-xs transition-all active:scale-95"
            >
              <span v-if="isSubmitting" class="animate-spin">⏳</span>
              <span>{{ signupForm.billingType === 'card' ? 'Continue to Payment' : (isSubmitting ? 'Provisioning...' : 'Launch Free Trial') }}</span>
            </button>
          </div>
        </form>

        <!-- Step 2: Secure MFS / Card Payment Checkout -->
        <div v-else-if="currentStep === 2 && !accountExistsEmail" class="p-6">
          <div class="text-center mb-5">
            <div class="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl mx-auto mb-2 border border-emerald-500/30">
              💳
            </div>
            <h4 class="text-base font-black text-white">Payment Checkout & Activation</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">Pay via bKash / Nagad or Card and enter your Transaction ID (Trx ID)</p>
          </div>

          <div class="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 mb-5 font-mono text-xs text-slate-300 space-y-1.5">
            <div class="flex justify-between">
              <span>Plan:</span><span class="text-white font-bold uppercase">{{ signupForm.planTier }} Tier</span>
            </div>
            <div class="flex justify-between">
              <span>Billing Cycle:</span><span class="text-white">Monthly</span>
            </div>
            <div class="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1.5">
              <span>Total Amount:</span><span class="text-emerald-400 font-black text-sm">{{ settingsStore.currencySymbol }}{{ signupForm.planTier === 'enterprise' ? '399.00' : signupForm.planTier === 'pro' ? '149.00' : '49.00' }}</span>
            </div>
          </div>

          <form @submit.prevent="processPaymentAndRegister" class="space-y-4 text-xs">
            <!-- Payment Gateway Selector -->
            <div>
              <label class="block font-bold text-slate-200 mb-1.5">Select Payment Method</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-if="settingsStore.systemSettings.bkashEnabled !== false"
                  type="button"
                  @click="signupForm.gateway = 'bkash'"
                  class="p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs"
                  :class="signupForm.gateway === 'bkash' ? 'bg-pink-500/20 text-pink-300 border-pink-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
                >
                  bKash
                </button>

                <button
                  v-if="settingsStore.systemSettings.nagadEnabled !== false"
                  type="button"
                  @click="signupForm.gateway = 'nagad'"
                  class="p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs"
                  :class="signupForm.gateway === 'nagad' ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
                >
                  Nagad
                </button>

                <button
                  v-if="settingsStore.systemSettings.upayEnabled !== false"
                  type="button"
                  @click="signupForm.gateway = 'upay'"
                  class="p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs"
                  :class="signupForm.gateway === 'upay' ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
                >
                  Upay
                </button>

                <button
                  v-if="settingsStore.systemSettings.rocketEnabled !== false"
                  type="button"
                  @click="signupForm.gateway = 'rocket'"
                  class="p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs"
                  :class="signupForm.gateway === 'rocket' ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
                >
                  Rocket
                </button>

                <button
                  v-if="settingsStore.systemSettings.cardEnabled === true"
                  type="button"
                  @click="signupForm.gateway = 'card'"
                  class="p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs"
                  :class="signupForm.gateway === 'card' ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
                >
                  Card / SSL
                </button>
              </div>
            </div>

            <!-- bKash / Nagad / Upay / Rocket Payment Instructions -->
            <div v-if="signupForm.gateway === 'bkash'" class="p-3 bg-pink-950/30 border border-pink-500/30 rounded-xl text-[11px] text-pink-200 space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-pink-300">
                <span>📲 bKash Payment Instructions:</span>
              </div>
              <p>1. Go to your bKash Mobile App or dial *247#</p>
              <p>2. Select <b>"Make Payment"</b> to Merchant: <strong class="text-white font-mono text-xs">{{ settingsStore.systemSettings.bkashNumber || '01700-000000' }}</strong></p>
              <p>3. Enter Reference: <strong class="text-white font-mono">{{ signupForm.slug || 'PHARMA' }}</strong></p>
              <p>4. Copy and paste the <b>Transaction ID (Trx ID)</b> below.</p>
            </div>

            <div v-else-if="signupForm.gateway === 'nagad'" class="p-3 bg-orange-950/30 border border-orange-500/30 rounded-xl text-[11px] text-orange-200 space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-orange-300">
                <span>📲 Nagad Payment Instructions:</span>
              </div>
              <p>1. Go to your Nagad Mobile App or dial *167#</p>
              <p>2. Select <b>"Merchant Pay"</b> to: <strong class="text-white font-mono text-xs">{{ settingsStore.systemSettings.nagadNumber || '01800-000000' }}</strong></p>
              <p>3. Enter Reference: <strong class="text-white font-mono">{{ signupForm.slug || 'PHARMA' }}</strong></p>
              <p>4. Copy and paste the <b>Transaction ID (Trx ID)</b> below.</p>
            </div>

            <div v-else-if="signupForm.gateway === 'upay'" class="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-blue-300">
                <span>📲 Upay Payment Instructions:</span>
              </div>
              <p>1. Open Upay App or dial *268#</p>
              <p>2. Select <b>"Merchant Payment"</b> to: <strong class="text-white font-mono text-xs">{{ settingsStore.systemSettings.upayNumber || '01900-000000' }}</strong></p>
              <p>3. Enter Reference: <strong class="text-white font-mono">{{ signupForm.slug || 'PHARMA' }}</strong></p>
              <p>4. Copy and paste the <b>Transaction ID (Trx ID)</b> below.</p>
            </div>

            <div v-else-if="signupForm.gateway === 'rocket'" class="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-[11px] text-purple-200 space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-purple-300">
                <span>📲 Rocket Payment Instructions:</span>
              </div>
              <p>1. Open Rocket App or dial *322#</p>
              <p>2. Select <b>"Merchant Payment"</b> to: <strong class="text-white font-mono text-xs">{{ settingsStore.systemSettings.rocketNumber || '01600-000000' }}</strong></p>
              <p>3. Enter Reference: <strong class="text-white font-mono">{{ signupForm.slug || 'PHARMA' }}</strong></p>
              <p>4. Copy and paste the <b>Transaction ID (Trx ID)</b> below.</p>
            </div>

            <!-- Transaction ID Input (trx_no) -->
            <div>
              <label class="block font-bold text-slate-200 mb-1">
                Transaction ID (Trx ID) <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  v-model="signupForm.trx_no" 
                  required 
                  placeholder="e.g. TRX9B82K19A or bKash Trx ID" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500 transition-all text-xs tracking-wider uppercase" 
                />
                <span class="absolute right-3.5 top-2.5 text-slate-500 text-xs font-mono">Trx ID</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">This Transaction ID will be verified & saved directly to the database `billings` table.</p>
            </div>

            <div class="pt-3 flex items-center justify-between gap-3">
              <button type="button" @click="currentStep = 1" :disabled="isProcessingPayment" class="text-slate-400 hover:text-white font-bold px-3 text-xs">
                ← Back
              </button>
              <button 
                type="submit" 
                :disabled="isProcessingPayment || !signupForm.trx_no"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-black shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs transition-all w-full flex-1 cursor-pointer"
              >
                <span v-if="isProcessingPayment" class="animate-spin">⌛</span>
                <span>{{ isProcessingPayment ? 'Storing Billing Record...' : 'Submit Trx & Activate Store' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Account Exists State -->
        <div v-else-if="accountExistsEmail" class="p-8 text-center space-y-4">
          <div class="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto border border-amber-500/30">
            ⚠️
          </div>
          <h4 class="text-xl font-black text-white">Account Already Exists</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            The email <strong class="text-slate-200">{{ accountExistsEmail }}</strong> is already registered to a pharmacy tenant in our system.
          </p>
          <div class="pt-6 border-t border-slate-800/80">
            <p class="text-[11px] text-slate-500 mb-4 uppercase font-bold tracking-wider">Want to renew or upgrade your plan?</p>
            <NuxtLink 
              to="/login"
              class="inline-flex px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-bold transition-all items-center gap-2 text-xs"
            >
              <span>🔑</span> Log In to Renew Subscription
            </NuxtLink>
            <button @click="resetModal" class="block w-full text-center text-slate-500 hover:text-slate-300 mt-4 text-xs font-bold transition-colors">
              Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Onboarding Success Modal -->
    <div v-if="createdTenant" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-lg w-full p-8 text-center shadow-2xl space-y-5 relative overflow-hidden">
        <div class="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          🎉
        </div>

        <div>
          <h3 class="text-2xl font-black text-white">{{ createdTenant.isRenewal ? '🎉 Subscription Renewed!' : '🎉 Pharmacy Store Onboarded!' }}</h3>
          <p class="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            {{ createdTenant.isRenewal ? `Store ${createdTenant.storeName} subscription has been renewed and access reactivated on MySQL.` : `Store ${createdTenant.storeName} has been provisioned on MySQL database.` }} Master Drug Catalog synced for {{ createdTenant.planTier.toUpperCase() }} tier.
          </p>
        </div>

        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left font-mono text-xs space-y-2">
          <div class="flex justify-between border-b border-slate-800/80 pb-2">
            <span class="text-slate-500">Tenant ID:</span>
            <span class="text-white font-bold">{{ createdTenant.id }}</span>
          </div>
          <div class="flex justify-between border-b border-slate-800/80 pb-2">
            <span class="text-slate-500">Store Subdomain:</span>
            <span class="text-sky-400 font-bold">https://{{ createdTenant.slug }}.pharmasaas.com</span>
          </div>
          <div class="flex justify-between border-b border-slate-800/80 pb-2">
            <span class="text-slate-500">Assigned Plan:</span>
            <span class="text-emerald-400 font-bold uppercase">{{ createdTenant.planTier }} Tier</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Next Billing Date:</span>
            <span class="text-white font-bold">{{ createdTenant.nextBillingDate }}</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <NuxtLink 
            to="/super-admin/tenants"
            class="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-colors"
          >
            View in Super Admin
          </NuxtLink>

          <NuxtLink 
            to="/"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-sky-500/30 flex items-center gap-2 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95"
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
import { useRouter } from 'vue-router';
import { useSettingsStore } from '~/stores/settings';
import { useSuperAdmin, type TenantStore, type SubscriptionPlan } from '~/composables/useSuperAdmin';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const settingsStore = useSettingsStore();
const { plans, fetchPlans } = useSuperAdmin();
const { onboardNewTenant } = useAuth();

const isYearly = ref(false);
const showModal = ref(false);
const isSubmitting = ref(false);
const isProcessingPayment = ref(false);
const currentStep = ref(1);
const accountExistsEmail = ref('');
const createdTenant = ref<TenantStore | null>(null);

onMounted(() => {
  fetchPlans();
  settingsStore.fetchSystemSettings();
});

const displayPlans = computed(() => {
  let list: SubscriptionPlan[] = [];
  if (plans.value && plans.value.length > 0) {
    list = [...plans.value];
  } else {
    list = [
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
          smsReceipts: '100 SMS/mo',
          poGenerator: false,
          support: 'Standard Email'
        }
      },
      {
        id: 'pro',
        name: 'Professional Store',
        priceMonthly: 149,
        priceYearly: 1430,
        terminalsLimit: 5,
        branchesLimit: 2,
        masterDrugLimit: 'Complete pharmacy ERP, FEFO batch tracking & automated purchase orders.',
        allowedDrugTiers: ['starter', 'pro'],
        features: {
          posRegister: true,
          fefoExpiry: 'Advanced FEFO',
          rxVerification: true,
          smsReceipts: '1,000 SMS/mo',
          poGenerator: true,
          support: 'Priority Phone & Chat'
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
  }

  return list.sort((a: any, b: any) => {
    const pA = Number(a.priceMonthly ?? a.price ?? a.price_monthly ?? 0);
    const pB = Number(b.priceMonthly ?? b.price ?? b.price_monthly ?? 0);
    return pA - pB;
  });
});

const signupForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  planTier: 'pro' as 'starter' | 'pro' | 'enterprise',
  billingType: 'trial' as 'trial' | 'card',
  gateway: 'bkash' as 'bkash' | 'nagad' | 'card' | 'sslcommerz',
  trx_no: ''
});

const generateSlug = () => {
  signupForm.slug = signupForm.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const resetModal = () => {
  currentStep.value = 1;
  accountExistsEmail.value = '';
  showModal.value = false;
  isSubmitting.value = false;
  isProcessingPayment.value = false;
};

const openRegisterModal = (tier: string) => {
  signupForm.planTier = (tier === 'enterprise' ? 'enterprise' : tier === 'starter' ? 'starter' : 'pro') as 'starter' | 'pro' | 'enterprise';
  currentStep.value = 1;
  accountExistsEmail.value = '';
  signupForm.trx_no = '';
  showModal.value = true;
};

const executeBackendOnboarding = async () => {
  try {
    const res = await onboardNewTenant({
      storeName: signupForm.storeName,
      slug: signupForm.slug,
      ownerName: signupForm.ownerName,
      email: signupForm.email,
      phone: signupForm.phone,
      password: signupForm.password,
      planTier: signupForm.planTier,
      gateway: signupForm.billingType === 'trial' ? 'free_trial' : signupForm.gateway,
      trx_no: signupForm.trx_no || `TRX_${Date.now()}`
    });

    if (res.success && res.user) {
      createdTenant.value = {
        id: res.user.tenantId,
        storeName: res.user.storeName || signupForm.storeName,
        slug: signupForm.slug || 'store',
        ownerName: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        planTier: res.user.planTier || signupForm.planTier,
        isRenewal: res.isRenewal || false,
        status: signupForm.billingType === 'trial' ? 'trial' : 'active',
        nextBillingDate: new Date(Date.now() + (signupForm.billingType === 'trial' ? 14 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } as any;
      showModal.value = false;
      return true;
    } else {
      if (res.message && (res.message.includes('already exists') || res.message.includes('A user with this email'))) {
        accountExistsEmail.value = signupForm.email;
      } else {
        alert(res.message || "Error onboarding pharmacy store. Please try again.");
      }
      return false;
    }
  } catch (e: any) {
    alert("An unexpected error occurred during onboarding.");
    return false;
  }
};

const handleRegisterStore = async () => {
  if (signupForm.billingType === 'card') {
    // Move to payment step
    currentStep.value = 2;
  } else {
    // Execute free trial onboarding directly
    isSubmitting.value = true;
    await executeBackendOnboarding();
    isSubmitting.value = false;
  }
};

const processPaymentAndRegister = async () => {
  isProcessingPayment.value = true;
  
  // Simulate 2 second secure payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = await executeBackendOnboarding();
  isProcessingPayment.value = false;
  
  // If failed (e.g. email exists), it will stay on step 2 but show the accountExists state
};
</script>
