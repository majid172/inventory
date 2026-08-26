<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans">
      <!-- Desktop Application Header Toolbar Frame -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button @click="saveSettings" :disabled="isSaving"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3.5 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span v-if="isSaving" class="animate-spin text-xs">⏳</span>
              <span v-else class="text-xs">💾</span>
              <span>{{ isSaving ? 'Saving...' : 'Save Configuration' }}</span>
            </button>
            <button @click="loadSettings" :disabled="isLoading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': isLoading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Reload
            </button>
          </div>

          <!-- Right: System Status Tag -->
          <div class="flex items-center gap-2">
            <span :class="[
              'text-[10px] font-mono px-2 py-0.5 border uppercase',
              settings.maintenanceMode
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
            ]">
              {{ settings.maintenanceMode ? '⚠️ Maintenance Mode Active' : '● System Live' }}
            </span>
          </div>
        </div>

        <!-- Desktop 2-Column Split: Left Tabs Sidebar & Right Form Panels -->
        <div class="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          <!-- LEFT SIDE: Vertical Settings Navigation Menu -->
          <div class="md:col-span-3 lg:col-span-3 bg-slate-50/80 dark:bg-gray-900/60 border-r border-slate-200 dark:border-gray-800 p-2 space-y-1 text-xs">
            <div class="px-2 py-1.5 text-[10px] uppercase font-normal text-slate-400 dark:text-gray-500 tracking-wider">
              Settings Categories
            </div>

            <button 
              @click="activeTab = 'general'"
              :class="[
                'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border',
                activeTab === 'general'
                  ? 'bg-[#107c41] text-white border-[#107c41]'
                  : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <span>⚙️</span>
              <span>General & Identity</span>
            </button>

            <button 
              @click="activeTab = 'onboarding'"
              :class="[
                'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border',
                activeTab === 'onboarding'
                  ? 'bg-[#107c41] text-white border-[#107c41]'
                  : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <span>🚀</span>
              <span>Onboarding & Plans</span>
            </button>

            <button 
              @click="activeTab = 'maintenance'"
              :class="[
                'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border',
                activeTab === 'maintenance'
                  ? 'bg-[#107c41] text-white border-[#107c41]'
                  : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <span>🛡️</span>
              <span>Maintenance & MySQL</span>
            </button>

            <button 
              @click="activeTab = 'pos'"
              :class="[
                'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border',
                activeTab === 'pos'
                  ? 'bg-[#107c41] text-white border-[#107c41]'
                  : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <span>🔒</span>
              <span>Security & POS Defaults</span>
            </button>

            <button 
              @click="activeTab = 'payments'"
              :class="[
                'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer text-xs font-normal border',
                activeTab === 'payments'
                  ? 'bg-[#107c41] text-white border-[#107c41]'
                  : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <span>💳</span>
              <span>Payment Gateways</span>
            </button>

            <div class="pt-4 px-2 text-[11px] text-slate-400 border-t border-slate-200 dark:border-gray-800 mt-4 space-y-1">
              <div>MySQL DB: Connected</div>
              <div>Node: Active (Port 5000)</div>
            </div>
          </div>

          <!-- RIGHT SIDE: Configuration Form Content -->
          <div class="md:col-span-9 lg:col-span-9 p-5 text-xs font-sans bg-white dark:bg-gray-950">
            <!-- Toast Feedback -->
            <div v-if="toastMessage" class="mb-4 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>✅</span>
                <span>{{ toastMessage }}</span>
              </div>
              <button @click="toastMessage = ''" class="text-emerald-700 font-normal cursor-pointer">✕</button>
            </div>

            <!-- TAB 1: General & Platform Branding -->
            <div v-show="activeTab === 'general'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚙️</span> Platform Identity & Branding
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Configure your global SaaS platform brand name, contact channels, and locale defaults.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Platform Brand Name</label>
                  <input v-model="settings.platformName" type="text"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Primary Support Email</label>
                  <input v-model="settings.supportEmail" type="email"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Support Hotline / Phone</label>
                  <input v-model="settings.supportPhone" type="text"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Primary Currency Symbol</label>
                  <input v-model="settings.currencySymbol" type="text" placeholder="$ / ৳ / €"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">System Timezone</label>
                  <select v-model="settings.timezone"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                    <option value="Asia/Dhaka">UTC+6 (Dhaka / Central Asia)</option>
                    <option value="Europe/London">UTC+0 (GMT / London)</option>
                    <option value="America/New_York">UTC-5 (EST / New York)</option>
                    <option value="Asia/Singapore">UTC+8 (Singapore / Beijing)</option>
                    <option value="Asia/Kolkata">UTC+5:30 (IST / New Delhi)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Date Display Format</label>
                  <select v-model="settings.dateFormat"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-25)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (25/08/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (08/25/2026)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 2: Onboarding & Subscription Plan Defaults -->
            <div v-show="activeTab === 'onboarding'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚀</span> Public Store Registration & Onboarding
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Manage how new pharmacies sign up and what default trial tier they receive.
                </p>
              </div>

              <div class="space-y-3">
                <label class="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 cursor-pointer">
                  <input type="checkbox" v-model="settings.selfRegistrationEnabled" class="mt-0.5 text-emerald-600" />
                  <div>
                    <span class="font-normal text-slate-800 dark:text-gray-200 block">Enable Public Self-Registration Portal (/subscribe)</span>
                    <span class="text-[11px] text-slate-500">Allows external pharmacy owners to register and create new store accounts online.</span>
                  </div>
                </label>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Free Trial Duration (Days)</label>
                    <input v-model.number="settings.defaultTrialDays" type="number" min="0" max="90"
                      class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
                  </div>

                  <div>
                    <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Default Onboarding Plan</label>
                    <select v-model="settings.defaultPlanId"
                      class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                      <option :value="1">Starter Plan ($49/mo)</option>
                      <option :value="2">Pro Tier ($149/mo)</option>
                      <option :value="3">Enterprise ($399/mo)</option>
                    </select>
                  </div>
                </div>

                <label class="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 cursor-pointer">
                  <input type="checkbox" v-model="settings.requireEmailVerification" class="mt-0.5 text-emerald-600" />
                  <div>
                    <span class="font-normal text-slate-800 dark:text-gray-200 block">Require Email OTP Verification on Sign Up</span>
                    <span class="text-[11px] text-slate-500">Requires pharmacies to verify their email address before accessing the ERP dashboard.</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- TAB 3: Site Maintenance & MySQL Database Management -->
            <div v-show="activeTab === 'maintenance'" class="space-y-4 max-w-3xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🛡️</span> Site Maintenance & MySQL Database Administration
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Control platform live status, run database backup snapshots, and optimize SQL performance.
                </p>
              </div>

              <!-- Maintenance Toggle Box -->
              <div :class="[
                'p-3.5 border space-y-2',
                settings.maintenanceMode ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-800'
              ]">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-base">{{ settings.maintenanceMode ? '⚠️' : '🛡️' }}</span>
                    <span class="font-normal text-slate-900 dark:text-gray-100">Site Maintenance Mode</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="settings.maintenanceMode" class="sr-only peer">
                    <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#107c41]"></div>
                  </label>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-gray-400">
                  When maintenance mode is enabled, non-superadmin users will see the maintenance notice screen during maintenance operations.
                </p>
                <div v-if="settings.maintenanceMode">
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Public Notice Message:</label>
                  <textarea v-model="settings.maintenanceMessage" rows="2"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 p-2 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs"></textarea>
                </div>
              </div>

              <!-- Database Action Toolbar -->
              <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 space-y-3">
                <h4 class="font-normal text-xs text-slate-800 dark:text-gray-200 uppercase tracking-wide">
                  Direct MySQL Maintenance Utilities
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <!-- Backup Action -->
                  <button @click="handleBackupDb" :disabled="isBackingUp"
                    class="bg-white hover:bg-slate-50 border border-slate-300 dark:bg-gray-800 dark:border-gray-700 text-slate-800 dark:text-gray-200 p-2.5 text-left font-normal cursor-pointer transition-colors shadow-xs">
                    <div class="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <span v-if="isBackingUp" class="animate-spin">⏳</span>
                      <span v-else>📦</span>
                      <span>Create Database Backup</span>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-1">Generates .sql backup snapshot</div>
                  </button>

                  <!-- Optimize Action -->
                  <button @click="handleOptimizeDb" :disabled="isOptimizing"
                    class="bg-white hover:bg-slate-50 border border-slate-300 dark:bg-gray-800 dark:border-gray-700 text-slate-800 dark:text-gray-200 p-2.5 text-left font-normal cursor-pointer transition-colors shadow-xs">
                    <div class="flex items-center gap-1.5 text-xs text-blue-700 dark:text-sky-400">
                      <span v-if="isOptimizing" class="animate-spin">⏳</span>
                      <span v-else>⚡</span>
                      <span>Optimize SQL Tables</span>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-1">Defragments and updates index keys</div>
                  </button>

                  <!-- Flush Cache Action -->
                  <button @click="handleFlushCache" :disabled="isFlushing"
                    class="bg-white hover:bg-slate-50 border border-slate-300 dark:bg-gray-800 dark:border-gray-700 text-slate-800 dark:text-gray-200 p-2.5 text-left font-normal cursor-pointer transition-colors shadow-xs">
                    <div class="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-400">
                      <span v-if="isFlushing" class="animate-spin">⏳</span>
                      <span v-else>🧹</span>
                      <span>Flush Cache Buffers</span>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-1">Clears application query cache</div>
                  </button>
                </div>

                <div class="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-gray-800 pt-2 font-mono">
                  <span>Last Backup: <strong>{{ settings.lastBackupAt }}</strong></span>
                  <span>Auto-Backup Schedule: <strong>{{ settings.backupSchedule }}</strong></span>
                </div>
              </div>
            </div>

            <!-- TAB 4: Security & POS Defaults -->
            <div v-show="activeTab === 'pos'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔒</span> Security Policy & Default POS Settings
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Establish baseline rules for session expiration, inventory warnings, and invoice numbering.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Session Inactive Timeout (Minutes)</label>
                  <input v-model.number="settings.sessionTimeoutMinutes" type="number" min="15" max="1440"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Default Invoice Prefix</label>
                  <input v-model="settings.invoicePrefix" type="text" placeholder="INV-"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Default Low Stock Alert Threshold (Units)</label>
                  <input v-model.number="settings.lowStockThreshold" type="number" min="1"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
                </div>

                <div>
                  <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Near Expiry Warning Window (Days)</label>
                  <input v-model.number="settings.expiryWarningDays" type="number" min="7"
                    class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <label class="flex items-center gap-2 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="settings.enableRxStrictVerification" class="text-emerald-600" />
                  <span>Strict Rx Verification Required for Prescription Drugs at Checkout</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="checkbox" v-model="settings.twoFactorAuthRequired" class="text-emerald-600" />
                  <span>Enforce Two-Factor Authentication (2FA) for Store Admins</span>
                </label>
              </div>
            </div>

            <!-- TAB 5: Payment Gateways -->
            <div v-show="activeTab === 'payments'" class="space-y-4 max-w-2xl">
              <div class="border-b border-slate-200 dark:border-gray-800 pb-2">
                <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💳</span> Payment Gateway Activation & Official Numbers
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Select which payment gateways subscribers can use during 2-step onboarding and enter official merchant numbers.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- bKash Config Card -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-gray-100">
                      <input type="checkbox" v-model="settings.bkashEnabled" class="text-emerald-600 rounded" />
                      <span>Enable bKash Mobile Banking</span>
                    </label>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border uppercase" :class="settings.bkashEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-gray-800'">
                      {{ settings.bkashEnabled ? 'Active for Subscribers' : 'Disabled' }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-gray-400 mb-1">bKash Merchant / Personal Number</label>
                    <input 
                      v-model="settings.bkashNumber" 
                      type="text" 
                      :disabled="!settings.bkashEnabled"
                      placeholder="e.g. 01700-000000"
                      class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-mono font-bold focus:outline-none focus:border-[#107c41] text-xs disabled:opacity-50" 
                    />
                  </div>
                </div>

                <!-- Nagad Config Card -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-gray-100">
                      <input type="checkbox" v-model="settings.nagadEnabled" class="text-emerald-600 rounded" />
                      <span>Enable Nagad Mobile Banking</span>
                    </label>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border uppercase" :class="settings.nagadEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-gray-800'">
                      {{ settings.nagadEnabled ? 'Active for Subscribers' : 'Disabled' }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-gray-400 mb-1">Nagad Merchant / Personal Number</label>
                    <input 
                      v-model="settings.nagadNumber" 
                      type="text" 
                      :disabled="!settings.nagadEnabled"
                      placeholder="e.g. 01800-000000"
                      class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-mono font-bold focus:outline-none focus:border-[#107c41] text-xs disabled:opacity-50" 
                    />
                  </div>
                </div>

                <!-- Upay Config Card -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-gray-100">
                      <input type="checkbox" v-model="settings.upayEnabled" class="text-emerald-600 rounded" />
                      <span>Enable Upay Mobile Banking</span>
                    </label>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border uppercase" :class="settings.upayEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-gray-800'">
                      {{ settings.upayEnabled ? 'Active for Subscribers' : 'Disabled' }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-gray-400 mb-1">Upay Merchant / Personal Number</label>
                    <input 
                      v-model="settings.upayNumber" 
                      type="text" 
                      :disabled="!settings.upayEnabled"
                      placeholder="e.g. 01900-000000"
                      class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-mono font-bold focus:outline-none focus:border-[#107c41] text-xs disabled:opacity-50" 
                    />
                  </div>
                </div>

                <!-- Rocket Config Card -->
                <div class="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-gray-100">
                      <input type="checkbox" v-model="settings.rocketEnabled" class="text-emerald-600 rounded" />
                      <span>Enable Rocket Mobile Banking</span>
                    </label>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border uppercase" :class="settings.rocketEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-gray-800'">
                      {{ settings.rocketEnabled ? 'Active for Subscribers' : 'Disabled' }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-gray-400 mb-1">Rocket Merchant / Personal Number</label>
                    <input 
                      v-model="settings.rocketNumber" 
                      type="text" 
                      :disabled="!settings.rocketEnabled"
                      placeholder="e.g. 01600-000000"
                      class="w-full bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-mono font-bold focus:outline-none focus:border-[#107c41] text-xs disabled:opacity-50" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bar -->
        <div
          class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-normal">
          <div>Platform Settings & Maintenance Control Panel</div>
          <div class="text-[10px] text-slate-400 font-normal">
            Status: <span class="text-emerald-600 font-bold">Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const activeTab = ref<'general' | 'onboarding' | 'maintenance' | 'pos' | 'payments'>('general');
const isLoading = ref(false);
const isSaving = ref(false);
const isBackingUp = ref(false);
const isOptimizing = ref(false);
const isFlushing = ref(false);
const toastMessage = ref('');

const settings = reactive({
  platformName: 'PharmaCare Multi-Tenant SaaS ERP',
  supportEmail: 'support@pharmacare.com',
  supportPhone: '+1 (800) 555-PHARMA',
  currencySymbol: '$',
  currencyCode: 'USD',
  timezone: 'Asia/Dhaka',
  dateFormat: 'YYYY-MM-DD',
  selfRegistrationEnabled: true,
  defaultTrialDays: 14,
  requireEmailVerification: false,
  defaultPlanId: 1,
  maintenanceMode: false,
  maintenanceMessage: 'System is currently undergoing scheduled database maintenance. Please check back shortly.',
  defaultTaxRate: 0.00,
  invoicePrefix: 'INV-',
  enableRxStrictVerification: true,
  lowStockThreshold: 10,
  expiryWarningDays: 60,
  twoFactorAuthRequired: false,
  sessionTimeoutMinutes: 120,
  backupSchedule: 'Daily at 02:00 AM UTC',
  lastBackupAt: '2026-08-25 02:00:00',
  stripeEnabled: false,
  sslCommerzEnabled: false,
  bkashEnabled: true,
  nagadEnabled: true,
  upayEnabled: true,
  rocketEnabled: true,
  cardEnabled: false,
  bkashNumber: '01700-000000',
  nagadNumber: '01800-000000',
  upayNumber: '01900-000000',
  rocketNumber: '01600-000000'
});

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

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
};

const loadSettings = async () => {
  isLoading.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/settings', {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json && json.settings) {
      Object.assign(settings, json.settings);
    }
  } catch (err: any) {
    console.error('Failed to load settings:', err.message);
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = async () => {
  isSaving.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (json && json.success) {
      showToast('Platform settings and maintenance configuration saved successfully.');
    } else {
      alert(json.message || 'Failed to save settings');
    }
  } catch (err: any) {
    alert(err.message || 'Error saving settings');
  } finally {
    isSaving.value = false;
  }
};

const handleBackupDb = async () => {
  isBackingUp.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/maintenance/backup', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json && json.success) {
      settings.lastBackupAt = json.timestamp;
      showToast(json.message || 'Database backup completed.');
    } else {
      alert(json.message || 'Backup failed');
    }
  } catch (err: any) {
    alert(err.message || 'Error executing backup');
  } finally {
    isBackingUp.value = false;
  }
};

const handleOptimizeDb = async () => {
  isOptimizing.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/maintenance/optimize', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json && json.success) {
      showToast('All MySQL database tables analyzed and optimized.');
    } else {
      alert(json.message || 'Optimize failed');
    }
  } catch (err: any) {
    alert(err.message || 'Error optimizing database');
  } finally {
    isOptimizing.value = false;
  }
};

const handleFlushCache = async () => {
  isFlushing.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/super-admin/maintenance/cache', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json && json.success) {
      showToast('Query buffers and application cache flushed successfully.');
    } else {
      alert(json.message || 'Flush cache failed');
    }
  } catch (err: any) {
    alert(err.message || 'Error flushing cache');
  } finally {
    isFlushing.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
