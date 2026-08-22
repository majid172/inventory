<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-4 select-none">
      <!-- Header Bar (Matching Admin Ribbon Header) -->
      <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xs font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>💳</span> Subscription Tiers & Plan-Wise Feature Matrix (Database Schema Aligned)
          </h1>
          <p class="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5 font-sans">Configure platform pricing tiers, POS terminal limits, catalog access levels, and feature flags directly mapped to the database.</p>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-black flex items-center gap-1">
            <span>🗄️</span> {{ plans.length }} Active DB Tiers
          </span>
          <button @click="openCreateModal()" class="bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white px-2.5 py-0.5 rounded font-black shadow-sm flex items-center gap-1 hover:brightness-105">
            <span>➕</span> Create Plan Tier
          </button>
          <button @click="fetchPlans()" class="bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 border border-slate-300 dark:border-gray-700 px-2 py-0.5 rounded font-bold hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors">
            🔄 Refresh DB
          </button>
        </div>
      </div>

      <!-- Plan Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="plan in plans" 
          :key="plan.id" 
          :class="[
            'bg-white dark:bg-gray-950 rounded-lg p-4 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all',
            plan.id === 'pro' ? 'border-2 border-sky-500 shadow-md' : 'border border-slate-300 dark:border-gray-800'
          ]"
        >
          <div 
            :class="[
              'absolute top-0 right-0 font-mono text-[9px] font-black px-2 py-0.5 rounded-bl uppercase text-white',
              plan.id === 'starter' ? 'bg-emerald-600' : plan.id === 'pro' ? 'bg-sky-600' : 'bg-purple-700'
            ]"
          >
            {{ plan.id === 'pro' ? 'Popular Choice' : plan.id === 'starter' ? 'Starter Tier' : 'Custom Tier' }}
          </div>

          <div>
            <div 
              :class="[
                'flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider',
                plan.id === 'starter' ? 'text-emerald-700 dark:text-emerald-400' : plan.id === 'pro' ? 'text-sky-700 dark:text-sky-400' : 'text-purple-700 dark:text-purple-400'
              ]"
            >
              <span>{{ plan.id === 'starter' ? '🟢' : plan.id === 'pro' ? '🟦' : '🟧' }}</span> {{ plan.name }}
            </div>
            <div class="mt-2.5 flex items-baseline gap-1">
              <span class="text-2xl font-black text-slate-900 dark:text-gray-100 font-mono">${{ plan.priceMonthly }}</span>
              <span class="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5 font-mono">
              Billed annually at ${{ plan.priceYearly }}/yr (Save 20%)
            </div>

            <div class="mt-3 p-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded text-xs font-sans">
              <div class="font-black text-slate-800 dark:text-gray-200">💊 Master Drug Catalog Access:</div>
              <div class="font-bold text-slate-600 dark:text-gray-400 mt-0.5">{{ plan.masterDrugLimit }}</div>
            </div>

            <!-- Features List -->
            <ul class="mt-4 space-y-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 font-sans">
              <li class="flex items-center gap-2">
                <span :class="plan.id === 'starter' ? 'text-emerald-600' : plan.id === 'pro' ? 'text-sky-600' : 'text-purple-600'" class="font-bold">✓</span> 
                {{ formatTerminalsText(plan) }}
              </li>
              <li class="flex items-center gap-2">
                <span :class="plan.id === 'starter' ? 'text-emerald-600' : plan.id === 'pro' ? 'text-sky-600' : 'text-purple-600'" class="font-bold">✓</span> 
                {{ formatBranchesText(plan) }}
              </li>
              <li class="flex items-center gap-2">
                <span :class="plan.id === 'starter' ? 'text-emerald-600' : plan.id === 'pro' ? 'text-sky-600' : 'text-purple-600'" class="font-bold">✓</span> 
                {{ plan.features?.fefoExpiry || 'FEFO Batch & Expiry Alerts' }}
              </li>
              <li class="flex items-center gap-2" :class="plan.features?.rxVerification ? 'text-slate-700 dark:text-gray-300' : 'text-slate-400'">
                <span :class="plan.features?.rxVerification ? (plan.id === 'starter' ? 'text-emerald-600' : plan.id === 'pro' ? 'text-sky-600' : 'text-purple-600') : ''" class="font-bold">
                  {{ plan.features?.rxVerification ? '✓' : '✕' }}
                </span> 
                Doctor Rx Verification Module
              </li>
              <li class="flex items-center gap-2" :class="plan.features?.poGenerator ? 'text-slate-700 dark:text-gray-300' : 'text-slate-400'">
                <span :class="plan.features?.poGenerator ? (plan.id === 'starter' ? 'text-emerald-600' : plan.id === 'pro' ? 'text-sky-600' : 'text-purple-600') : ''" class="font-bold">
                  {{ plan.features?.poGenerator ? '✓' : '✕' }}
                </span> 
                Purchase Order Generator
              </li>
              <li class="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                <span class="text-slate-400">📱</span> SMS: {{ plan.features?.smsReceipts || 'Not Included' }}
              </li>
            </ul>
          </div>

          <div class="mt-5 pt-2.5 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs font-mono font-bold">
            <span :class="plan.id === 'starter' ? 'text-slate-500' : plan.id === 'pro' ? 'text-sky-600 font-black' : 'text-purple-600 font-black'">
              {{ getTenantCountForTier(plan.id) }} Active Stores
            </span>
            <button @click="openEditModal(plan)" class="text-blue-700 dark:text-sky-400 hover:underline">Edit Tier Specs →</button>
          </div>
        </div>
      </div>

      <!-- Create New Subscription Tier Modal (Matches Table Structure) -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl my-8">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>💳</span> Create Subscription Plan (subscription_plans Table)
            </h3>
            <button @click="showCreateModal = false" class="font-bold text-slate-500 hover:text-slate-700">✕</button>
          </div>

          <form @submit.prevent="handleCreatePlan" class="p-4 space-y-3.5 text-xs font-sans max-h-[80vh] overflow-y-auto">
            <!-- 1. Key & Name -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Plan Key (id) *</label>
                <input v-model="createForm.id" type="text" required placeholder="e.g. growth-tier" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Display Name (name) *</label>
                <input v-model="createForm.name" type="text" required placeholder="e.g. Growth Tier" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none" />
              </div>
            </div>

            <!-- 2. Monthly & Yearly Prices -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Monthly Price (price_monthly) *</label>
                <input v-model.number="createForm.priceMonthly" type="number" step="0.01" required min="0" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Yearly Billed Price (price_yearly)</label>
                <input v-model.number="createForm.priceYearly" type="number" step="0.01" min="0" placeholder="Auto 10x" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <!-- 3. Terminal & Branch Limits -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Terminals Limit (terminals_limit)</label>
                <input v-model.number="createForm.terminalsLimit" type="number" min="1" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Branches Limit (branches_limit)</label>
                <input v-model.number="createForm.branchesLimit" type="number" min="1" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <!-- 4. Master Drug Limit Description -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Master Drug Entitlement (master_drug_limit_description)</label>
              <input v-model="createForm.masterDrugLimit" type="text" required placeholder="e.g. 25,000 Verified Generics & Specialty Catalog" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-sans outline-none" />
            </div>

            <!-- 5. Allowed Drug Tiers -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Allowed Drug Catalog Tiers (allowed_drug_tiers)</label>
              <div class="flex items-center gap-3 bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 rounded">
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="starter" v-model="createForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Starter Catalog</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="pro" v-model="createForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Pro National Catalog</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="enterprise" v-model="createForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Enterprise Specialty</span>
                </label>
              </div>
            </div>

            <!-- 6. Features JSON Matrix -->
            <div class="space-y-2 pt-1 border-t border-slate-200 dark:border-gray-800">
              <label class="block font-bold text-slate-700 dark:text-gray-300">Feature Matrix Configuration (features JSON)</label>
              
              <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800 rounded">
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="createForm.features.posRegister" class="rounded text-sky-600" />
                  <span>POS Cash Register Terminal</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="createForm.features.rxVerification" class="rounded text-sky-600" />
                  <span>Doctor Rx Verification</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="createForm.features.poGenerator" class="rounded text-sky-600" />
                  <span>PO Supplier Generator</span>
                </label>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">FEFO Expiry Mode</label>
                  <select v-model="createForm.features.fefoExpiry" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Basic">Basic</option>
                    <option value="Advanced FEFO Alerts">Advanced FEFO Alerts</option>
                    <option value="Automated AI Reordering">Automated AI Reordering</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">SMS Receipts Policy</label>
                  <select v-model="createForm.features.smsReceipts" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Not Included">Not Included</option>
                    <option value="250 SMS / month">250 SMS / month</option>
                    <option value="500 SMS / month">500 SMS / month</option>
                    <option value="Unlimited SMS">Unlimited SMS</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">Support SLA Level</label>
                  <select v-model="createForm.features.support" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Email Support">Email Support</option>
                    <option value="Priority Chat Support">Priority Chat Support</option>
                    <option value="24/7 Dedicated Account Manager">24/7 Dedicated Manager</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button type="button" @click="showCreateModal = false" class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold">
                Cancel
              </button>
              <button type="submit" class="px-4 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm">
                Insert into DB Table
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Subscription Tier Modal (Matches Table Structure) -->
      <div v-if="editingPlan" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl my-8">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>💳</span> Edit Subscription Tier: {{ editingPlan.id.toUpperCase() }} (DB Connected)
            </h3>
            <button @click="editingPlan = null" class="font-bold text-slate-500 hover:text-slate-700">✕</button>
          </div>

          <form @submit.prevent="savePlan" class="p-4 space-y-3.5 text-xs font-sans max-h-[80vh] overflow-y-auto">
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Plan Display Name (name)</label>
              <input v-model="editForm.name" type="text" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Monthly Price ($)</label>
                <input v-model.number="editForm.priceMonthly" type="number" step="0.01" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Yearly Price ($)</label>
                <input v-model.number="editForm.priceYearly" type="number" step="0.01" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Terminals Limit</label>
                <input v-model.number="editForm.terminalsLimit" type="number" min="1" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Branches Limit</label>
                <input v-model.number="editForm.branchesLimit" type="number" min="1" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Master Drug Catalog Entitlement Description</label>
              <input v-model="editForm.masterDrugLimit" type="text" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-sans outline-none" />
            </div>

            <!-- Allowed Drug Catalog Tiers -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Allowed Drug Catalog Tiers (allowed_drug_tiers)</label>
              <div class="flex items-center gap-3 bg-slate-50 dark:bg-gray-900 p-2 border border-slate-200 dark:border-gray-800 rounded">
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="starter" v-model="editForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Starter Catalog</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="pro" v-model="editForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Pro National Catalog</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" value="enterprise" v-model="editForm.allowedDrugTiers" class="rounded text-sky-600" />
                  <span>Enterprise Specialty</span>
                </label>
              </div>
            </div>

            <!-- Feature Entitlements in Edit Modal -->
            <div class="space-y-2 pt-1 border-t border-slate-200 dark:border-gray-800">
              <label class="block font-bold text-slate-700 dark:text-gray-300">Feature Entitlements Matrix</label>
              <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-900 p-2.5 border border-slate-200 dark:border-gray-800 rounded">
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="editForm.features.posRegister" class="rounded text-sky-600" />
                  <span>POS Cash Register Terminal</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="editForm.features.rxVerification" class="rounded text-sky-600" />
                  <span>Doctor Rx Verification</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="checkbox" v-model="editForm.features.poGenerator" class="rounded text-sky-600" />
                  <span>PO Supplier Generator</span>
                </label>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">FEFO Expiry Mode</label>
                  <select v-model="editForm.features.fefoExpiry" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Basic">Basic</option>
                    <option value="Advanced FEFO Alerts">Advanced FEFO Alerts</option>
                    <option value="Automated AI Reordering">Automated AI Reordering</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">SMS Receipts Policy</label>
                  <select v-model="editForm.features.smsReceipts" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Not Included">Not Included</option>
                    <option value="250 SMS / month">250 SMS / month</option>
                    <option value="500 SMS / month">500 SMS / month</option>
                    <option value="Unlimited SMS">Unlimited SMS</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-slate-600 dark:text-gray-400 text-[10px] mb-0.5">Support SLA Level</label>
                  <select v-model="editForm.features.support" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-1 text-xs">
                    <option value="Email Support">Email Support</option>
                    <option value="Priority Chat Support">Priority Chat Support</option>
                    <option value="24/7 Dedicated Account Manager">24/7 Dedicated Manager</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button type="button" @click="editingPlan = null" class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold">
                Cancel
              </button>
              <button type="submit" class="px-4 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm">
                Save DB Tier Specs
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import type { SubscriptionPlan } from '~/stores/superAdmin';

const { plans, tenants, fetchPlans, createPlanTier, updatePlanTier } = useSuperAdmin();

const showCreateModal = ref(false);
const createForm = ref({
  id: '',
  name: '',
  priceMonthly: 99,
  priceYearly: 950,
  terminalsLimit: 2,
  branchesLimit: 1,
  masterDrugLimit: '25,000 Essential Generics Catalog',
  allowedDrugTiers: ['starter', 'pro'],
  features: {
    posRegister: true,
    fefoExpiry: 'Advanced FEFO Alerts',
    rxVerification: true,
    smsReceipts: '250 SMS / month',
    poGenerator: true,
    support: 'Priority Chat Support'
  }
});

const editingPlan = ref<SubscriptionPlan | null>(null);
const editForm = ref({
  name: '',
  priceMonthly: 0,
  priceYearly: 0,
  terminalsLimit: 1,
  branchesLimit: 1,
  masterDrugLimit: '',
  allowedDrugTiers: ['starter'] as string[],
  features: {
    posRegister: true,
    fefoExpiry: 'Basic',
    rxVerification: false,
    smsReceipts: 'Not Included',
    poGenerator: false,
    support: 'Email Support'
  }
});

onMounted(() => {
  fetchPlans();
});

const getTenantCountForTier = (planTierId: string) => {
  return tenants.value.filter(t => t.planTier === planTierId).length;
};

const formatTerminalsText = (plan: SubscriptionPlan) => {
  const limit = plan.terminalsLimit ?? (plan as any).terminals_limit ?? 1;
  if (limit >= 999) return 'Unlimited POS Cash Register Terminals';
  return `${limit} POS Cash Register Terminal${limit > 1 ? 's' : ''}`;
};

const formatBranchesText = (plan: SubscriptionPlan) => {
  const count = plan.branchesLimit ?? (plan as any).branches_limit ?? 1;
  if (count >= 99) return 'Multi-Branch Sync';
  if (count === 1) return '1 Single Pharmacy Store Outlet';
  return `${count} Outlets`;
};

const openCreateModal = () => {
  createForm.value = {
    id: `tier-${Date.now().toString().slice(-4)}`,
    name: '',
    priceMonthly: 99,
    priceYearly: 950,
    terminalsLimit: 2,
    branchesLimit: 1,
    masterDrugLimit: '25,000 Essential Generics Catalog',
    allowedDrugTiers: ['starter', 'pro'],
    features: {
      posRegister: true,
      fefoExpiry: 'Advanced FEFO Alerts',
      rxVerification: true,
      smsReceipts: '250 SMS / month',
      poGenerator: true,
      support: 'Priority Chat Support'
    }
  };
  showCreateModal.value = true;
};

const handleCreatePlan = async () => {
  if (!createForm.value.name) return;
  if (!createForm.value.priceYearly) {
    createForm.value.priceYearly = createForm.value.priceMonthly * 10;
  }
  await createPlanTier(createForm.value);
  showCreateModal.value = false;
};

const openEditModal = (plan: SubscriptionPlan) => {
  editingPlan.value = plan;
  editForm.value = {
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    terminalsLimit: plan.terminalsLimit,
    branchesLimit: plan.branchesLimit,
    masterDrugLimit: plan.masterDrugLimit,
    allowedDrugTiers: Array.isArray(plan.allowedDrugTiers) ? [...plan.allowedDrugTiers] : [plan.id],
    features: plan.features ? { ...plan.features } : {
      posRegister: true,
      fefoExpiry: 'Basic',
      rxVerification: false,
      smsReceipts: 'Not Included',
      poGenerator: false,
      support: 'Email Support'
    }
  };
};

const savePlan = async () => {
  if (!editingPlan.value) return;
  await updatePlanTier(editingPlan.value.id, editForm.value);
  editingPlan.value = null;
};
</script>
