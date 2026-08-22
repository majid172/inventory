<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-4 select-none">
      <!-- Top Action Bar & Plan-Wise Filters (Matching Admin Toolbar Style) -->
      <div
        class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <!-- Search input -->
          <div class="relative min-w-[260px] flex-1 max-w-md">
            <input v-model="searchFilter" type="text" placeholder="Search generic chemical, brand name, barcode..."
              class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded pl-8 pr-3 py-1 text-xs focus:ring-1 focus:ring-sky-500 font-sans outline-none shadow-inner" />
            <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">💊</span>
          </div>

          <!-- Plan-Wise Access Tier Filter -->
          <select v-model="masterDrugTierFilter"
            class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-200 outline-none shadow-sm">
            <option value="all">All Subscription Plan Tiers</option>
            <option value="starter">🟢 Starter Tier Access (Essential Generics)</option>
            <option value="pro">🟦 Pro Tier Access (National Brands & Rx)</option>
            <option value="enterprise">🟧 Enterprise Tier Access (Biologics & Specialty)</option>
          </select>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <button @click="triggerSync"
            class="px-3 py-1.5 bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 border border-slate-300 dark:border-gray-700 text-blue-700 dark:text-sky-400 font-black rounded text-xs hover:border-blue-500 shadow-sm transition-all flex items-center gap-1">
            <span>🔄 Push Sync to Subscriber Stores</span>
          </button>

          <button @click="openAddModal()"
            class="px-3 py-1.5 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black text-xs hover:from-sky-600 hover:to-blue-700 shadow-sm transition-all">
            + Add Master Medicine
          </button>
        </div>
      </div>

      <!-- Plan-Wise Drug Metric Stats Banner (Matching Admin Metric Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div @click="masterDrugTierFilter = 'starter'"
          class="p-3 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors shadow-sm">
          <div
            class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between uppercase">
            <span>🟢 STARTER CATALOG TIER</span>
            <span class="font-mono font-bold">{{ starterDrugsCount }} Items</span>
          </div>
          <div class="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Essential Generics & OTC (Paracetamol,
            Amoxicillin, Metformin)</div>
        </div>

        <div @click="masterDrugTierFilter = 'pro'"
          class="p-3 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg cursor-pointer hover:border-sky-500 transition-colors shadow-sm">
          <div class="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center justify-between uppercase">
            <span>🟦 PRO CATALOG TIER</span>
            <span class="font-mono font-bold">{{ proDrugsCount }} Items</span>
          </div>
          <div class="text-[10px] text-slate-500 dark:text-gray-500 mt-1">National Brands, Controlled Rx & Statins
            (Lipitor, Nexium)</div>
        </div>

        <div @click="masterDrugTierFilter = 'enterprise'"
          class="p-3 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg cursor-pointer hover:border-purple-500 transition-colors shadow-sm">
          <div
            class="text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between uppercase">
            <span>🟧 ENTERPRISE CATALOG TIER</span>
            <span class="font-mono font-bold">{{ enterpriseDrugsCount }} Items</span>
          </div>
          <div class="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Specialty Biologics, Oncology & Compounding
            (Humira, Keytruda)</div>
        </div>
      </div>

      <!-- Master Drug Catalog Table (Matching Admin Grid Style) -->
      <div
        class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <div
          class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
          <h2
            class="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>💊</span> Central Master Drug Dictionary ({{ filteredMasterDrugs.length }} Items Dynamic DB)
          </h2>
          <span class="font-mono text-[10px] text-slate-500">Global Master Drug Ref ID</span>
        </div>

        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr
                class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th
                  class="py-2 px-2.5 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">
                  #</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">BRAND NAME & GENERIC CHEMICAL</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">DOSAGE FORM</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700">MANUFACTURER</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">PLAN ACCESS TIER</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center">RX MANDATORY</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-right">DEFAULT PRICE</th>
                <th class="py-2 px-2.5 border border-slate-300 dark:border-gray-700 text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(drug, idx) in filteredMasterDrugs" :key="drug.id" @click="selectedRow = drug.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                selectedRow === drug.id
                  ? 'bg-sky-500 text-white font-bold'
                  : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
              ]">
                <td
                  class="py-2 px-2.5 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === drug.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'">
                  {{ idx + 1 }}
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800">
                  <div class="font-extrabold flex items-center gap-1.5"
                    :class="selectedRow === drug.id ? 'text-white' : 'text-slate-900 dark:text-gray-100'">
                    <span>{{ drug.brandName }}</span>
                    <span class="text-[9px] font-mono px-1 rounded"
                      :class="selectedRow === drug.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300'">{{
                        drug.drugCode }}</span>
                  </div>
                  <div class="text-[11px] font-medium"
                    :class="selectedRow === drug.id ? 'text-sky-100' : 'text-blue-700 dark:text-sky-400'">{{
                      drug.genericName }}</div>
                  <div class="text-[9px] font-mono"
                    :class="selectedRow === drug.id ? 'text-white/80' : 'text-slate-400'">{{ drug.therapeuticClass }}
                  </div>
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium"
                  :class="selectedRow === drug.id ? 'text-white' : 'text-slate-800 dark:text-gray-200'">
                  {{ drug.dosageForm }}
                </td>
                <td class="py-2 px-2.5 border border-slate-300 dark:border-gray-800 font-medium"
                  :class="selectedRow === drug.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  {{ drug.manufacturer }}
                </td>
                <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800 font-mono">
                  <span
                    :class="selectedRow === drug.id ? 'bg-white/20 text-white border-white/40' : drug.planTierAccess === 'enterprise' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' : drug.planTierAccess === 'pro' ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'"
                    class="px-1.5 py-0.2 rounded border text-[10px] font-black uppercase">
                    {{ drug.planTierAccess }} Tier
                  </span>
                </td>
                <td class="py-2 px-2.5 text-center border border-slate-300 dark:border-gray-800">
                  <span v-if="drug.rxRequired"
                    :class="selectedRow === drug.id ? 'bg-white text-rose-900 border-white' : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'"
                    class="px-1.5 py-0.2 rounded text-[10px] font-black border uppercase">
                    🩺 Rx Required
                  </span>
                  <span v-else
                    :class="selectedRow === drug.id ? 'bg-white/20 text-white border-white/40' : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-700'"
                    class="px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase">
                    OTC
                  </span>
                </td>
                <td class="py-2 px-2.5 text-right font-mono font-black border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === drug.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">
                  ${{ Number(drug.defaultRetailPrice || 0).toFixed(2) }}
                </td>
                <td class="py-2 px-1 text-center border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click.stop="openEditDrugModal(drug)"
                      class="px-1.5 py-0.5 bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 rounded font-black text-[10px] hover:bg-sky-500 hover:text-white transition-colors"
                      title="Edit Master Drug">
                      ✏️ Edit
                    </button>
                    <button @click.stop="handleDeleteMasterDrug(drug)"
                      class="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-black text-[10px] hover:bg-rose-600 hover:text-white transition-colors"
                      title="Delete Master Drug">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredMasterDrugs.length === 0">
                <td colspan="8" class="py-10 text-center bg-slate-50/50 dark:bg-gray-900/50">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <span class="text-3xl">💊</span>
                    <p class="font-extrabold text-sm text-slate-700 dark:text-gray-300">
                      No Master Catalog Items Found
                    </p>
                    <p class="text-xs text-slate-500 dark:text-gray-500 max-w-sm">
                      There are currently 0 certified medicines matching your filter. Click below to add a new medicine
                      to the dictionary.
                    </p>
                    <button @click="openAddModal()"
                      class="mt-2 px-3.5 py-1.5 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black text-xs hover:brightness-105 shadow-sm transition-all flex items-center gap-1">
                      <span>➕</span> Add Certified Master Medicine
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Master Drug Modal -->
      <div v-if="showAddDrugModal"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
          <div
            class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-black text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>💊</span> Add Certified Master Medicine to DB Dictionary
            </h3>
            <button @click="showAddDrugModal = false" class="text-slate-500 font-bold hover:text-slate-800">✕</button>
          </div>

          <form @submit.prevent="handleAddMasterDrug" class="p-3.5 space-y-3 text-xs font-sans">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Brand Name *</label>
                <input v-model="drugForm.brandName" type="text" required placeholder="e.g. Augmentin 625mg"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Generic Chemical Name *</label>
                <input v-model="drugForm.genericName" type="text" required placeholder="Amoxicillin + Clavulanate"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <input v-model="drugForm.dosageForm" type="text" placeholder="Tablet / Capsule / Injection"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Manufacturer</label>
                <input v-model="drugForm.manufacturer" type="text" placeholder="GSK / Pfizer / Novartis"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Assign Plan Access Tier *</label>
                <select v-model="drugForm.planTierAccess"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none">
                  <option value="starter">🟢 Starter Tier (Essential Generics)</option>
                  <option value="pro">🟦 Pro Tier (National Catalog & Rx)</option>
                  <option value="enterprise">🟧 Enterprise Tier (Biologics & Specialty)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Default Retail Price ($)</label>
                <input v-model.number="drugForm.defaultRetailPrice" type="number" step="0.01" placeholder="15.00"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Therapeutic Class</label>
                <input v-model="drugForm.therapeuticClass" type="text" placeholder="Antibiotic / Analgesic"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Barcode / GTIN</label>
                <input v-model="drugForm.barcode" type="text" placeholder="e.g. 8901234567890"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input v-model="drugForm.rxRequired" type="checkbox" id="addRxRequiredCheck"
                class="rounded text-sky-600 focus:ring-sky-500" />
              <label for="addRxRequiredCheck" class="font-bold text-slate-700 dark:text-gray-300">
                Prescription Required (Doctor Rx Verification mandatory)
              </label>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button type="button" @click="showAddDrugModal = false"
                class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold">
                Cancel
              </button>
              <button type="submit"
                class="px-3.5 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm">
                Save to DB Table
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Master Drug Modal -->
      <div v-if="editingDrug"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl">
          <div
            class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-black text-xs uppercase text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>✏️</span> Edit Master Medicine: {{ editingDrug.id }} (DB Aligned)
            </h3>
            <button @click="editingDrug = null" class="text-slate-500 font-bold hover:text-slate-800">✕</button>
          </div>

          <form @submit.prevent="handleSaveEditMasterDrug" class="p-3.5 space-y-3 text-xs font-sans">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Brand Name *</label>
                <input v-model="drugForm.brandName" type="text" required
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Generic Chemical Name *</label>
                <input v-model="drugForm.genericName" type="text" required
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <input v-model="drugForm.dosageForm" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Manufacturer</label>
                <input v-model="drugForm.manufacturer" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Plan Access Tier *</label>
                <select v-model="drugForm.planTierAccess"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-bold outline-none">
                  <option value="starter">🟢 Starter Tier Access</option>
                  <option value="pro">🟦 Pro Tier Access</option>
                  <option value="enterprise">🟧 Enterprise Tier Access</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Default Retail Price ($)</label>
                <input v-model.number="drugForm.defaultRetailPrice" type="number" step="0.01"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Therapeutic Class</label>
                <input v-model="drugForm.therapeuticClass" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">Barcode / GTIN</label>
                <input v-model="drugForm.barcode" type="text"
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 font-mono outline-none" />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input v-model="drugForm.rxRequired" type="checkbox" id="editRxRequiredCheck"
                class="rounded text-sky-600 focus:ring-sky-500" />
              <label for="editRxRequiredCheck" class="font-bold text-slate-700 dark:text-gray-300">
                Prescription Required (Doctor Rx Verification mandatory)
              </label>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-300 dark:border-gray-800">
              <button type="button" @click="editingDrug = null"
                class="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded font-bold">
                Cancel
              </button>
              <button type="submit"
                class="px-3.5 py-1 bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-400 text-white rounded font-black shadow-sm">
                Update DB Specs
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';
import type { MasterDrug } from '~/stores/superAdmin';

const {
  filteredMasterDrugs,
  searchFilter,
  masterDrugTierFilter,
  starterDrugsCount,
  proDrugsCount,
  enterpriseDrugsCount,
  fetchMasterDrugs,
  createMasterDrug,
  updateMasterDrug,
  deleteMasterDrug,
  syncMasterCatalogToStores
} = useSuperAdmin();

const showAddDrugModal = ref(false);
const editingDrug = ref<MasterDrug | null>(null);
const selectedRow = ref<string | null>(null);

const drugForm = reactive({
  brandName: '',
  genericName: '',
  dosageForm: 'Tablet',
  manufacturer: '',
  defaultRetailPrice: 15.00,
  rxRequired: true,
  planTierAccess: 'starter' as 'starter' | 'pro' | 'enterprise',
  barcode: '',
  therapeuticClass: 'General Pharmaceutical'
});

onMounted(() => {
  fetchMasterDrugs();
});

const openAddModal = () => {
  drugForm.brandName = '';
  drugForm.genericName = '';
  drugForm.dosageForm = 'Tablet';
  drugForm.manufacturer = '';
  drugForm.defaultRetailPrice = 15.00;
  drugForm.rxRequired = true;
  drugForm.planTierAccess = 'starter';
  drugForm.barcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  drugForm.therapeuticClass = 'General Pharmaceutical';
  showAddDrugModal.value = true;
};

const handleAddMasterDrug = async () => {
  await createMasterDrug({
    drugCode: `MDRUG_${Date.now().toString().slice(-6)}`,
    brandName: drugForm.brandName,
    genericName: drugForm.genericName,
    dosageForm: drugForm.dosageForm,
    manufacturer: drugForm.manufacturer,
    defaultRetailPrice: drugForm.defaultRetailPrice,
    rxRequired: drugForm.rxRequired,
    planTierAccess: drugForm.planTierAccess,
    barcode: drugForm.barcode,
    therapeuticClass: drugForm.therapeuticClass
  });
  showAddDrugModal.value = false;
  alert("New master drug added to central database dictionary successfully!");
};

const openEditDrugModal = (drug: MasterDrug) => {
  editingDrug.value = drug;
  drugForm.brandName = drug.brandName;
  drugForm.genericName = drug.genericName;
  drugForm.dosageForm = drug.dosageForm;
  drugForm.manufacturer = drug.manufacturer;
  drugForm.defaultRetailPrice = drug.defaultRetailPrice;
  drugForm.rxRequired = drug.rxRequired;
  drugForm.planTierAccess = drug.planTierAccess;
  drugForm.barcode = drug.barcode;
  drugForm.therapeuticClass = drug.therapeuticClass;
};

const handleSaveEditMasterDrug = async () => {
  if (!editingDrug.value) return;
  await updateMasterDrug(editingDrug.value.id, {
    brandName: drugForm.brandName,
    genericName: drugForm.genericName,
    dosageForm: drugForm.dosageForm,
    manufacturer: drugForm.manufacturer,
    defaultRetailPrice: drugForm.defaultRetailPrice,
    rxRequired: drugForm.rxRequired,
    planTierAccess: drugForm.planTierAccess,
    barcode: drugForm.barcode,
    therapeuticClass: drugForm.therapeuticClass
  });
  editingDrug.value = null;
  alert("Master drug updated in central database successfully!");
};

const handleDeleteMasterDrug = async (drug: MasterDrug) => {
  if (confirm(`Are you sure you want to delete '${drug.brandName}' (${drug.genericName}) from central Master Drug Dictionary?`)) {
    await deleteMasterDrug(drug.id);
    alert(`Master drug '${drug.brandName}' deleted from central dictionary!`);
  }
};

const triggerSync = async () => {
  await syncMasterCatalogToStores();
  alert("Pushed plan-restricted Master Drug Catalog sync across all active subscriber stores!");
};
</script>
