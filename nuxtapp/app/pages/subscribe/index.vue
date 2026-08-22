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
            <span>🚀</span> Start 14-Day Free Trial
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
          <span class="text-emerald-400">✓</span> 14-Day Free Trial
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
                ${{ isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly }}
              </span>
              <span class="text-slate-400 text-xs font-bold">/ month</span>
            </div>
            <span v-if="isYearly" class="text-[10px] font-mono font-bold mt-1 block" :class="plan.id === 'enterprise' ? 'text-purple-400' : plan.id === 'pro' ? 'text-sky-400' : 'text-emerald-400'">
              ${{ plan.priceYearly }} billed annually
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
          <button @click="showModal = false" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs">✕</button>
        </div>

        <!-- Onboarding Form -->
        <form @submit.prevent="handleRegisterStore" class="p-6 space-y-4 text-xs">
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
              ${{ signupForm.planTier === 'enterprise' ? '399' : signupForm.planTier === 'pro' ? '149' : '49' }} / mo
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

          <div>
            <label class="block font-bold text-slate-200 mb-1">Contact Phone Number</label>
            <input 
              v-model="signupForm.phone"
              type="text" 
              placeholder="+1 (555) 234-5678"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-sky-500 transition-all text-xs"
            />
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
              @click="showModal = false"
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
              <span>{{ isSubmitting ? 'Provisioning Store in MySQL...' : 'Complete Onboarding & Launch Store' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Onboarding Success Modal -->
    <div v-if="createdTenant" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-lg w-full p-8 text-center shadow-2xl space-y-5 relative overflow-hidden">
        <div class="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          🎉
        </div>

        <div>
          <h3 class="text-2xl font-black text-white">Pharmacy Store Onboarded!</h3>
          <p class="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Store <b>{{ createdTenant.storeName }}</b> has been provisioned on MySQL database. Master Drug Catalog synced for {{ createdTenant.planTier.toUpperCase() }} tier.
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
import { useSuperAdmin, type TenantStore, type SubscriptionPlan } from '~/composables/useSuperAdmin';

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
