<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between select-none relative">
    <!-- Header Navigation -->
    <header class="border-b border-slate-800 bg-slate-950 px-4 h-16 flex items-center justify-between z-20">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-xl">💊</span>
        <span class="text-emerald-500 font-black text-lg tracking-wider">PHARMACARE</span>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Multi-Tenant v2.4</span>
      </NuxtLink>

      <div class="flex items-center gap-3 text-xs">
        <NuxtLink to="/" class="text-slate-400 hover:text-white font-bold transition-colors">
          ← Public Portal
        </NuxtLink>
        <button 
          @click="showRegisterModal = true"
          class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
        >
          👤 Register Staff
        </button>
        <button 
          @click="showOnboardModal = true"
          class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
        >
          + Onboard Store
        </button>
      </div>
    </header>

    <!-- Main Sign In Workspace Container -->
    <main class="max-w-xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center relative z-10">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <!-- Sign In Header Title -->
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-600/20 font-black">
            🔐
          </div>
          <h1 class="text-2xl font-black text-white tracking-tight">
            {{ isSuperAdminLogin ? 'Super Admin Platform Portal' : 'Pharmacy Store Sign In' }}
          </h1>
          <p class="text-xs text-slate-400">
            {{ isSuperAdminLogin ? 'Sign in with global platform administrator credentials to manage all tenants.' : 'Select your pharmacy tenant store and enter staff access credentials.' }}
          </p>
        </div>

        <!-- Alert / Error Banner -->
        <div v-if="authError" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 animate-fadeIn">
          <span>⚠️</span>
          <span class="flex-1">{{ authError }}</span>
          <button @click="authError = ''" class="text-rose-400 hover:text-rose-200 font-bold text-xs">✕</button>
        </div>

        <!-- Success Banner -->
        <div v-if="authSuccess" class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <span>✅</span>
          <span class="flex-1">{{ authSuccess }}</span>
          <button @click="authSuccess = ''" class="text-emerald-400 hover:text-emerald-200 font-bold text-xs">✕</button>
        </div>

        <!-- Mode Toggle Tabs (Pharmacy Store Login vs Super Admin Login) -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button 
            type="button"
            @click="switchMode(false)"
            class="flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="!isSuperAdminLogin ? 'bg-emerald-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>🏥 Pharmacy Store Login</span>
          </button>
          <button 
            type="button"
            @click="switchMode(true)"
            class="flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="isSuperAdminLogin ? 'bg-emerald-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>👑 Super Admin Mode</span>
          </button>
        </div>

        <!-- Quick 1-Click Demo Accounts Selector -->
        <div class="space-y-2">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">⚡ Quick Demo Accounts:</span>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="acc in demoAccounts" 
              :key="acc.name"
              type="button"
              @click="selectDemoAccount(acc)"
              class="p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col gap-0.5 hover:border-emerald-500 hover:bg-slate-800/60 cursor-pointer"
              :class="selectedTenantId === acc.tenantId && username === acc.email && !isSuperAdminLogin ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 text-slate-300'"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-[11px] truncate">{{ acc.name }}</span>
                <span class="text-[10px]">{{ acc.icon }}</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono truncate">{{ acc.storeName }}</span>
            </button>
          </div>
        </div>

        <!-- Form 1: Pharmacy Store Tenant Login -->
        <form v-if="!isSuperAdminLogin" @submit.prevent="handleStoreSignIn" class="space-y-4 text-xs font-sans">
          <!-- Store Selection Dropdown -->
          <div>
            <label class="block font-bold text-slate-300 mb-1">Select Pharmacy Tenant Store *</label>
            <select 
              v-model="selectedTenantId"
              required
              @change="updateSelectedStoreInfo"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-emerald-500 outline-none text-xs"
            >
              <option value="" disabled>-- Select Registered Pharmacy Store --</option>
              <option 
                v-for="t in availableTenants" 
                :key="t.id" 
                :value="t.id"
              >
                🏥 {{ t.storeName }} ({{ (t.planTier || 'Pro').toUpperCase() }} Tier)
              </option>
            </select>

            <div v-if="activeSelectedStore" class="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-mono text-emerald-400 flex items-center justify-between">
              <span>🌐 Tenant Domain:</span>
              <span class="font-bold">https://{{ activeSelectedStore.slug }}.pharmasaas.com</span>
            </div>
          </div>

          <!-- Pharmacist Username / Email -->
          <div>
            <label class="block font-bold text-slate-300 mb-1">Pharmacist Username or Email *</label>
            <input 
              v-model="username"
              type="text" 
              required 
              placeholder="e.g. robert@medicare-central.com"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <!-- Passcode / PIN -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-300">Staff Access PIN / Password *</label>
              <button type="button" @click="forgotPinAlert" class="text-emerald-400 font-medium hover:underline text-[11px] cursor-pointer">Forgot PIN?</button>
            </div>
            <input 
              v-model="password"
              type="password" 
              required 
              placeholder="••••••••"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <!-- Destination Module Launcher Selection -->
          <div>
            <label class="block font-bold text-slate-300 mb-1">Default Destination Workspace</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button"
                @click="destinationModule = 'pos'"
                class="p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer"
                :class="destinationModule === 'pos' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'"
              >
                <span>💻 POS Register</span>
              </button>

              <button 
                type="button"
                @click="destinationModule = 'admin'"
                class="p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer"
                :class="destinationModule === 'admin' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'"
              >
                <span>📊 Store ERP Dashboard</span>
              </button>
            </div>
          </div>

          <!-- Sign In Button -->
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span v-if="isSubmitting" class="animate-spin">⏳</span>
            <span>{{ isSubmitting ? 'Authenticating...' : '🔐 Sign In to Store Portal' }}</span>
          </button>
        </form>

        <!-- Form 2: Super Admin Platform Login -->
        <form v-else @submit.prevent="handleSuperAdminSignIn" class="space-y-4 text-xs font-sans">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Super Admin Email *</label>
            <input 
              v-model="superAdminEmail"
              type="email" 
              required 
              placeholder="admin@pharmasaas.com"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Super Admin Password *</label>
            <input 
              v-model="superAdminPassword"
              type="password" 
              required 
              placeholder="••••••••"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span v-if="isSubmitting" class="animate-spin">⏳</span>
            <span>{{ isSubmitting ? 'Authenticating...' : '👑 Sign In to Super Admin Console' }}</span>
          </button>
        </form>

        <!-- Onboarding & Staff Register Shortcut Footer -->
        <div class="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <div>
            <span>Need new store instance? </span>
            <button @click="showOnboardModal = true" class="text-emerald-400 font-bold hover:underline cursor-pointer">
              Onboard Store Now
            </button>
          </div>
          <div>
            <span>Add pharmacist / cashier? </span>
            <button @click="showRegisterModal = true" class="text-emerald-400 font-bold hover:underline cursor-pointer">
              Register Staff User
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
      <span>PharmaSaaS Multi-Tenant Cloud Security • 256-Bit SSL Encrypted Auth Session</span>
    </footer>

    <!-- Staff Registration Modal Dialog -->
    <div v-if="showRegisterModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl my-8">
        <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
              👤
            </div>
            <div>
              <h3 class="font-black text-sm text-white">Register Pharmacy Staff</h3>
              <p class="text-[11px] text-slate-400">Create new staff login account for your store</p>
            </div>
          </div>
          <button @click="showRegisterModal = false" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleRegisterStaff" class="p-6 space-y-4 text-xs font-sans">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Assign To Pharmacy Store *</label>
            <select 
              v-model="registerForm.tenantId"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500 text-xs"
            >
              <option v-for="t in availableTenants" :key="t.id" :value="t.id">
                🏥 {{ t.storeName }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Staff Full Name *</label>
            <input 
              v-model="registerForm.name"
              type="text" 
              required 
              placeholder="e.g. Alex Morgan"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Staff Email / Username *</label>
            <input 
              v-model="registerForm.email"
              type="email" 
              required 
              placeholder="alex@store.com"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Staff Access PIN / Password *</label>
              <input 
                v-model="registerForm.password"
                type="password" 
                required 
                placeholder="4-digit PIN"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Staff Role</label>
              <select 
                v-model="registerForm.role"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500 text-xs"
              >
                <option value="STORE_ADMIN">Store Admin</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="CASHIER">Cashier / Staff</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showRegisterModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span v-if="isSubmitting" class="animate-spin">⏳</span>
              <span>Register Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Store Onboarding Registration Modal Dialog -->
    <div v-if="showOnboardModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-8">
        <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
              🏥
            </div>
            <div>
              <h3 class="font-black text-sm text-white">Onboard New Pharmacy Store</h3>
              <p class="text-[11px] text-slate-400">Register new tenant store into SaaS database</p>
            </div>
          </div>
          <button @click="showOnboardModal = false" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleOnboardStore" class="p-6 space-y-4 text-xs font-sans">
          <div>
            <label class="block font-bold text-slate-200 mb-1">Pharmacy Store Name *</label>
            <input 
              v-model="onboardForm.storeName"
              @input="generateSlug"
              type="text" 
              required 
              placeholder="e.g. MediCare Express Pharmacy"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500 text-xs"
            />
            <div v-if="onboardForm.slug" class="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono flex items-center justify-between">
              <span>🌐 Subdomain:</span>
              <span class="font-bold">https://{{ onboardForm.slug }}.pharmasaas.com</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-200 mb-1">Owner / Chief Pharmacist *</label>
              <input 
                v-model="onboardForm.ownerName"
                type="text" 
                required 
                placeholder="Dr. Vance"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-200 mb-1">Billing Email *</label>
              <input 
                v-model="onboardForm.email"
                type="email" 
                required 
                placeholder="vance@medicare.com"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-200 mb-1">Subscription Plan Tier</label>
            <select 
              v-model="onboardForm.planTier"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500 text-xs"
            >
              <option value="starter">🟢 Starter Tier ($49/mo - 1 Terminal)</option>
              <option value="pro">🟦 Pro Tier ($149/mo - 3 Terminals + Rx Verification)</option>
              <option value="enterprise">🟧 Enterprise Chain ($399/mo - Multi-Branch Sync)</option>
            </select>
          </div>

          <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showOnboardModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isOnboarding"
              class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span v-if="isOnboarding" class="animate-spin">⏳</span>
              <span>{{ isOnboarding ? 'Provisioning...' : 'Provision Store' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSuperAdmin, type TenantStore } from '~/composables/useSuperAdmin';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const { tenants, fetchTenants, createTenant } = useSuperAdmin();
const { loginStoreUser, loginSuperAdmin, registerUser } = useAuth();

const isSuperAdminLogin = ref(false);
const selectedTenantId = ref('TENANT_101');
const activeSelectedStore = ref<TenantStore | null>(null);

const username = ref('robert@medicare-central.com');
const password = ref('1234');
const destinationModule = ref<'pos' | 'admin'>('pos');

const superAdminEmail = ref('admin@pharmasaas.com');
const superAdminPassword = ref('admin123');

const isSubmitting = ref(false);
const showOnboardModal = ref(false);
const showRegisterModal = ref(false);
const isOnboarding = ref(false);

const authError = ref('');
const authSuccess = ref('');

const onboardForm = reactive({
  storeName: '',
  slug: '',
  ownerName: '',
  email: '',
  phone: '',
  planTier: 'pro'
});

const registerForm = reactive({
  tenantId: 'TENANT_101',
  name: '',
  email: '',
  password: '1234',
  role: 'STORE_ADMIN'
});

const demoAccounts = [
  {
    name: 'Dr. Robert Vance',
    storeName: 'MediCare Central',
    email: 'robert@medicare-central.com',
    pin: '1234',
    tenantId: 'TENANT_101',
    isSuperAdmin: false,
    icon: '🏥'
  },
  {
    name: 'Sarah Jenkins',
    storeName: 'HealthPlus Retail',
    email: 'sarah@healthplus.com',
    pin: '1234',
    tenantId: 'TENANT_102',
    isSuperAdmin: false,
    icon: '💊'
  },
  {
    name: 'David Sterling',
    storeName: 'Apex City Chain',
    email: 'david@apexpharma.com',
    pin: '1234',
    tenantId: 'TENANT_103',
    isSuperAdmin: false,
    icon: '🏬'
  },
  {
    name: 'Super Admin',
    storeName: 'Global SaaS Control',
    email: 'admin@pharmasaas.com',
    pin: 'admin123',
    tenantId: 'SYSTEM',
    isSuperAdmin: true,
    icon: '👑'
  }
];

const defaultTenants: TenantStore[] = [
  {
    id: 'TENANT_101',
    storeName: 'MediCare Central Pharmacy',
    slug: 'medicare-central',
    ownerName: 'Dr. Robert Vance',
    email: 'robert@medicare-central.com',
    phone: '+1 (555) 234-5678',
    planTier: 'pro',
    status: 'active',
    terminalsCount: 3,
    branchesCount: 1,
    joinedDate: '2026-01-15',
    nextBillingDate: '2028-09-15',
    mrr: 149
  },
  {
    id: 'TENANT_102',
    storeName: 'HealthPlus Retail Pharma',
    slug: 'healthplus-pharma',
    ownerName: 'Sarah Jenkins',
    email: 'sarah@healthplus.com',
    phone: '+1 (555) 876-5432',
    planTier: 'starter',
    status: 'trial',
    terminalsCount: 1,
    branchesCount: 1,
    joinedDate: '2026-02-01',
    nextBillingDate: '2026-02-15',
    mrr: 49
  },
  {
    id: 'TENANT_103',
    storeName: 'Apex City Pharmacy Chain',
    slug: 'apex-city-pharma',
    ownerName: 'David Sterling',
    email: 'david@apexpharma.com',
    phone: '+1 (555) 999-0000',
    planTier: 'enterprise',
    status: 'active',
    terminalsCount: 5,
    branchesCount: 3,
    joinedDate: '2025-11-10',
    nextBillingDate: '2028-11-10',
    mrr: 399
  }
];

const availableTenants = computed(() => {
  return tenants.value.length > 0 ? tenants.value : defaultTenants;
});

const switchMode = (superAdmin: boolean) => {
  isSuperAdminLogin.value = superAdmin;
  authError.value = '';
  authSuccess.value = '';
};

const selectDemoAccount = (acc: typeof demoAccounts[0]) => {
  authError.value = '';
  if (acc.isSuperAdmin) {
    isSuperAdminLogin.value = true;
    superAdminEmail.value = acc.email;
    superAdminPassword.value = acc.pin;
  } else {
    isSuperAdminLogin.value = false;
    selectedTenantId.value = acc.tenantId;
    username.value = acc.email;
    password.value = acc.pin;
    updateSelectedStoreInfo();
  }
};

const updateSelectedStoreInfo = () => {
  activeSelectedStore.value = availableTenants.value.find(t => t.id === selectedTenantId.value) || null;
  registerForm.tenantId = selectedTenantId.value;
};

const handleStoreSignIn = async () => {
  authError.value = '';
  authSuccess.value = '';
  isSubmitting.value = true;
  
  const store = availableTenants.value.find(t => t.id === selectedTenantId.value);
  const result = await loginStoreUser({
    username: username.value,
    email: username.value,
    password: password.value,
    pin: password.value,
    tenantId: selectedTenantId.value || 'TENANT_101'
  }, store);
  
  isSubmitting.value = false;
  
  if (result.success) {
    if (destinationModule.value === 'pos') {
      router.push('/pos');
    } else {
      router.push('/admin');
    }
  } else {
    authError.value = result.message || 'Invalid username or PIN. Please try again.';
  }
};

const handleSuperAdminSignIn = async () => {
  authError.value = '';
  authSuccess.value = '';
  isSubmitting.value = true;
  
  const result = await loginSuperAdmin({
    email: superAdminEmail.value,
    password: superAdminPassword.value
  });
  
  isSubmitting.value = false;
  
  if (result.success) {
    router.push('/super-admin');
  } else {
    authError.value = result.message || 'Invalid Super Admin email or password.';
  }
};

const handleRegisterStaff = async () => {
  isSubmitting.value = true;
  authError.value = '';
  
  const store = availableTenants.value.find(t => t.id === registerForm.tenantId);
  const result = await registerUser({
    name: registerForm.name,
    email: registerForm.email,
    password: registerForm.password,
    pin: registerForm.password,
    role: registerForm.role,
    tenantId: registerForm.tenantId
  }, store);
  
  isSubmitting.value = false;
  
  if (result.success) {
    showRegisterModal.value = false;
    authSuccess.value = `Staff account for ${registerForm.name} registered successfully!`;
    router.push('/pos');
  } else {
    authError.value = result.message || 'Failed to register staff member.';
  }
};

const generateSlug = () => {
  onboardForm.slug = onboardForm.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const forgotPinAlert = () => {
  alert("Default PIN for demo tenant stores is 1234. You can also register a new staff account.");
};

const handleOnboardStore = async () => {
  isOnboarding.value = true;
  authError.value = '';
  try {
    const newStore = await createTenant({
      storeName: onboardForm.storeName,
      ownerName: onboardForm.ownerName,
      email: onboardForm.email,
      phone: onboardForm.phone,
      planTier: onboardForm.planTier
    });

    if (newStore && process.client) {
      localStorage.setItem('active_tenant_store', JSON.stringify(newStore));
      localStorage.setItem('is_logged_in', 'true');
      showOnboardModal.value = false;
      router.push('/pos');
    }
  } catch (e: any) {
    authError.value = "Error onboarding store. Please try again.";
  } finally {
    isOnboarding.value = false;
  }
};

onMounted(async () => {
  await fetchTenants();
  if (availableTenants.value.length > 0) {
    selectedTenantId.value = availableTenants.value[0].id;
    updateSelectedStoreInfo();
  }
});
</script>

