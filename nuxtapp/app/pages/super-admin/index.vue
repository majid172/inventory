<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-4 select-none">
      <!-- Top Desktop Executive Metric KPI Panels Grid (Matching Admin Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Card 1: SaaS Monthly Recurring Revenue (MRR) -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>SaaS Platform MRR</span>
            <span class="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-black">+24.2% MoM</span>
          </div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${{ analytics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono font-medium">ARR Projection: ${{ analytics.arr.toLocaleString('en-US') }}</div>
        </div>

        <!-- Card 2: Subscriber Pharmacy Stores -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Subscriber Pharmacy Stores</span>
            <span class="text-amber-600 dark:text-amber-400">🏥</span>
          </div>
          <div class="text-2xl font-black text-slate-900 dark:text-gray-100 font-mono">{{ analytics.totalSubscribers }} Stores</div>
          <div class="flex items-center gap-2 mt-1 text-[10px] font-mono font-bold">
            <span class="text-emerald-600 dark:text-emerald-400">{{ analytics.activeTenants }} Active</span>
            <span class="text-amber-600 dark:text-amber-400">{{ analytics.trialTenants }} Trial</span>
            <span class="text-rose-600 dark:text-rose-400">{{ analytics.suspendedTenants }} Suspended</span>
          </div>
        </div>

        <!-- Card 3: Global Master Drug Catalog -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>Master Drug Dictionary</span>
            <span class="text-sky-600 dark:text-sky-400">💊</span>
          </div>
          <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">{{ analytics.masterDrugsTotal.toLocaleString() }} Items</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-medium">Categorized across 3 Plan Tiers</div>
        </div>

        <!-- Card 4: Platform Health & Latency -->
        <div class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-slate-600 dark:text-gray-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <span>System Uptime & RLS</span>
            <span class="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-900 px-1.5 py-0.2 rounded text-[10px] font-black animate-pulse">HEALTHY</span>
          </div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ analytics.systemUptime }}</div>
          <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono font-medium">PostgreSQL RLS Latency: {{ analytics.dbResponseLatencyMs }}ms</div>
        </div>
      </div>

      <!-- Main Overview Content: Data Grid & Plan Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent Subscriber Directory Feed (Matching Admin Audit Table Style) -->
        <div class="lg:col-span-2 border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🏥</span> Subscriber Pharmacy Directory Feed
            </h3>
            <NuxtLink to="/super-admin/tenants" class="text-xs text-blue-700 dark:text-sky-400 hover:underline font-bold">View Full Directory →</NuxtLink>
          </div>

          <!-- Table Viewport with 1px Gridlines (Matching Admin Style) -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
              <thead>
                <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">STORE NAME</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">OWNER / EMAIL</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">PLAN TIER</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                  <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-right">MRR</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="tenant in tenants" 
                  :key="tenant.id" 
                  @click="selectedRow = tenant.id"
                  :class="[
                    'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                    selectedRow === tenant.id 
                      ? 'bg-sky-500 text-white font-bold' 
                      : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                  ]"
                >
                  <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800">
                    <div class="font-extrabold" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-900 dark:text-gray-100'">{{ tenant.storeName }}</div>
                    <div class="text-[10px] font-mono" :class="selectedRow === tenant.id ? 'text-sky-100' : 'text-blue-700 dark:text-sky-400'">{{ tenant.slug }}.pharmacare.com</div>
                  </td>
                  <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === tenant.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                    <div>{{ tenant.ownerName }}</div>
                    <div class="text-[10px] font-mono text-slate-500" :class="selectedRow === tenant.id ? 'text-white/80' : 'text-slate-500 dark:text-gray-400'">{{ tenant.email }}</div>
                  </td>
                  <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-mono">
                    <span :class="selectedRow === tenant.id ? 'bg-white/20 text-white border-white/40' : tenant.planTier === 'enterprise' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' : tenant.planTier === 'pro' ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'" class="px-1.5 py-0.2 rounded border text-[10px] font-extrabold uppercase">
                      {{ tenant.planTier }}
                    </span>
                  </td>
                  <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                    <span :class="selectedRow === tenant.id ? 'bg-white text-emerald-900 border-white' : tenant.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' : tenant.status === 'trial' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'" class="px-2 py-0.2 rounded text-[10px] font-black border uppercase">
                      {{ tenant.status }}
                    </span>
                  </td>
                  <td class="py-2 px-2.5 text-right font-mono font-black border border-slate-300 dark:border-gray-800" :class="selectedRow === tenant.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">
                    ${{ tenant.mrr.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-3 py-1.5 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400">
            <div>Showing subscriber directory feed</div>
            <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL RLS Active</div>
          </div>
        </div>

        <!-- Plan Tier Distribution Panel (Matching Admin Alert Card Style) -->
        <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
          <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
            <h3 class="font-extrabold text-xs text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>💳</span> Subscription Plan Tier Breakdown
            </h3>
            <NuxtLink to="/super-admin/plans" class="text-xs text-blue-700 dark:text-sky-400 hover:underline font-bold">Manage Tiers →</NuxtLink>
          </div>

          <div class="p-3 space-y-3">
            <div class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2.5 rounded shadow-sm">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-emerald-700 dark:text-emerald-400">🟢 Starter Plan ($49/mo)</span>
                <span class="font-mono text-slate-900 dark:text-gray-100 font-black">{{ analytics.planDistribution.starter }} Stores</span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono">1 Terminal • 10,000 Essential Drug Catalog</div>
              <div class="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: 32%"></div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2.5 rounded shadow-sm">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-sky-700 dark:text-sky-400">🟦 Pro Plan ($149/mo)</span>
                <span class="font-mono text-slate-900 dark:text-gray-100 font-black">{{ analytics.planDistribution.pro }} Stores</span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono">Up to 3 Terminals • 50,000+ National Drug Catalog</div>
              <div class="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-sky-500 h-full rounded-full" style="width: 52%"></div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-2.5 rounded shadow-sm">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-purple-700 dark:text-purple-400">🟧 Enterprise Chain ($399/mo)</span>
                <span class="font-mono text-slate-900 dark:text-gray-100 font-black">{{ analytics.planDistribution.enterprise }} Stores</span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-gray-500 mt-1 font-mono">Unlimited Terminals • Multi-Branch • Biologics Catalog</div>
              <div class="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-purple-600 h-full rounded-full" style="width: 16%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';

const { analytics, tenants, fetchAnalytics, fetchTenants } = useSuperAdmin();
const selectedRow = ref<string | null>(null);

onMounted(() => {
  fetchAnalytics();
  fetchTenants();
});
</script>
