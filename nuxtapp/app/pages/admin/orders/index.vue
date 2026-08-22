<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <div class="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <h2 class="text-base font-extrabold text-gray-100 flex items-center gap-2">
          <span>🛍️ Dispensed Prescription Sales Orders History</span>
        </h2>
        <div class="text-xs text-emerald-400 font-mono">Verified Rx Sales Log</div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-sans">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 font-extrabold uppercase tracking-wider">
                <th class="py-3.5 px-4">Rx REF ID</th>
                <th class="py-3.5 px-4">PATIENT NAME</th>
                <th class="py-3.5 px-4">PRESCRIBING DOCTOR</th>
                <th class="py-3.5 px-4">DISPENSED MEDICINES</th>
                <th class="py-3.5 px-4">PAYMENT METHOD</th>
                <th class="py-3.5 px-4 text-right">TOTAL PAID</th>
                <th class="py-3.5 px-4 text-center">DISPENSE STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60">
              <tr v-for="order in mockOrders" :key="order.id" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">{{ order.id }}</td>
                <td class="py-3.5 px-4 font-extrabold text-gray-100">{{ order.patient }}</td>
                <td class="py-3.5 px-4 text-gray-400 font-medium">{{ order.doctor }}</td>
                <td class="py-3.5 px-4 text-gray-200">🧪 {{ order.items }}</td>
                <td class="py-3.5 px-4 font-mono text-gray-300">
                  <span class="bg-gray-950 border border-gray-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    {{ order.method }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-mono font-black text-emerald-400">${{ order.total }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const mockOrders = [
  { id: "RX_2841", patient: "Eleanor Vance", doctor: "Dr. A. Miller", items: "1x Amoxicillin 500mg, 1x Panadol Extra", method: "INSURANCE", total: "17.30", status: "DISPENSED" },
  { id: "RX_2840", patient: "Marcus Brody", doctor: "N/A (OTC)", items: "1x Benadryl Allergy Syrup", method: "CASH", total: "8.20", status: "DISPENSED" },
  { id: "RX_2839", patient: "Sophia Martinez", doctor: "Dr. K. Patel", items: "1x Ventolin HFA Inhaler, 1x Lipitor 20mg", method: "CARD", total: "62.00", status: "DISPENSED" },
  { id: "RX_2838", patient: "Walk-in Patient", doctor: "N/A (OTC)", items: "1x Neosporin Antibiotic Ointment", method: "MOBILE", total: "6.90", status: "DISPENSED" },
  { id: "RX_2837", patient: "David Kim", doctor: "Dr. R. Hayes", items: "1x Metformin 850mg", method: "CARD", total: "14.00", status: "DISPENSED" }
];
</script>
