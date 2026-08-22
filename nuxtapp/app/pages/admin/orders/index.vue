<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame with 1px Gridlines -->
      <div class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-xs font-extrabold text-slate-800 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🛍️</span> Dispensed Prescription Sales Orders History
            </h2>
          </div>

          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-gray-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-gray-800">
            Verified Rx Sales Log • Connected
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Visible 1px Gridlines -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">#</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">Rx REF ID</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">PATIENT NAME</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">PRESCRIBING DOCTOR</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">DISPENSED MEDICINES</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">PAYMENT METHOD</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-right">TOTAL PAID</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">DISPENSE STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(order, idx) in mockOrders" 
                :key="order.id" 
                @click="selectedRow = order.id"
                :class="[
                  'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                  selectedRow === order.id 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
                ]"
              >
                <!-- Index Column -->
                <td 
                  class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === order.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'"
                >
                  {{ idx + 1 }}
                </td>

                <!-- Rx Ref ID -->
                <td class="py-2 px-3 font-mono font-bold border border-slate-300 dark:border-gray-800" :class="selectedRow === order.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                  {{ order.id }}
                </td>

                <!-- Patient Name -->
                <td class="py-2 px-3 font-extrabold border border-slate-300 dark:border-gray-800">
                  <span :class="selectedRow === order.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">{{ order.patient }}</span>
                </td>

                <!-- Prescribing Doctor -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === order.id ? 'text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ order.doctor }}
                </td>

                <!-- Dispensed Medicines -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-medium" :class="selectedRow === order.id ? 'text-white' : 'text-slate-800 dark:text-gray-200'">
                  🧪 {{ order.items }}
                </td>

                <!-- Payment Method -->
                <td class="py-2 px-3 font-mono border border-slate-300 dark:border-gray-800">
                  <span :class="selectedRow === order.id ? 'bg-white/20 text-white border-white/40' : 'bg-slate-100 dark:bg-gray-950 border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300'" class="px-2 py-0.5 rounded border text-[11px] font-bold">
                    {{ order.method }}
                  </span>
                </td>

                <!-- Total Paid -->
                <td class="py-2 px-3 text-right font-mono font-black border border-slate-300 dark:border-gray-800" :class="selectedRow === order.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">
                  ${{ order.total }}
                </td>

                <!-- Status -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider',
                    selectedRow === order.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    ● {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div class="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>Displaying <strong>{{ mockOrders.length }}</strong> dispensed sales orders</div>
          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Dispense Audit Log • Connected</div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedRow = ref<string | null>(null);

const mockOrders = [
  { id: "RX_2841", patient: "Eleanor Vance", doctor: "Dr. A. Miller", items: "1x Amoxicillin 500mg, 1x Panadol Extra", method: "INSURANCE", total: "17.30", status: "DISPENSED" },
  { id: "RX_2840", patient: "Marcus Brody", doctor: "N/A (OTC)", items: "1x Benadryl Allergy Syrup", method: "CASH", total: "8.20", status: "DISPENSED" },
  { id: "RX_2839", patient: "Sophia Martinez", doctor: "Dr. K. Patel", items: "1x Ventolin HFA Inhaler, 1x Lipitor 20mg", method: "CARD", total: "62.00", status: "DISPENSED" },
  { id: "RX_2838", patient: "Walk-in Patient", doctor: "N/A (OTC)", items: "1x Neosporin Antibiotic Ointment", method: "MOBILE", total: "6.90", status: "DISPENSED" },
  { id: "RX_2837", patient: "David Kim", doctor: "Dr. R. Hayes", items: "1x Metformin 850mg", method: "CARD", total: "14.00", status: "DISPENSED" }
];
</script>
