<template>
  <NuxtLayout name="super-admin">
    <div class="space-y-3 font-sans">
      <!-- Desktop Application Header Toolbar Frame (Exact Match with Categories / Products / Users Design) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-[#107c41] hover:bg-[#0e6b37] text-white font-normal px-3 py-1 text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> Add Master Medicine
            </button>
            <button @click="fetchMasterDrugs" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Table
            </button>
          </div>

          <!-- Right: Tier Filter & Search -->
          <div class="flex items-center gap-2">
            <select v-model="tierFilter"
              class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 font-normal outline-none focus:border-[#107c41]">
              <option value="all">All Plan Tiers</option>
              <option value="starter">Starter Tier</option>
              <option value="pro">Pro Tier</option>
              <option value="enterprise">Enterprise Tier</option>
            </select>

            <div class="relative">
              <input type="text" v-model="searchFilter" placeholder="Search brand, generic, manufacturer..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-[#107c41] w-56 sm:w-64" />
              <button v-if="searchFilter" @click="searchFilter = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal"># ID</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Brand Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Generic Chemical Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-28">Dosage Form</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Manufacturer</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-28">Plan Tier</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-center w-24">Rx Required</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="8" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  <span class="inline-block animate-spin mr-1">⏳</span> Loading master medicines from MySQL...
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="displayedMasterDrugs.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 dark:text-gray-500 font-normal">
                  No master medicines found matching your search.
                </td>
              </tr>

              <!-- Rows -->
              <tr v-for="(drug, idx) in displayedMasterDrugs" :key="drug.id" @click="selectedRow = drug.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === drug.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ idx + 1 }}
                </td>

                <!-- Brand Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  {{ drug.brandName || drug.brand_name }}
                </td>

                <!-- Generic Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300">
                  {{ drug.genericName || drug.generic_name }}
                </td>

                <!-- Dosage Form -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal text-slate-700 dark:text-gray-300">
                  <span class="px-1.5 py-0.2 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-[11px]">
                    {{ drug.dosageForm || drug.dosage_form || 'Tablet' }}
                  </span>
                </td>

                <!-- Manufacturer -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300">
                  {{ drug.manufacturer || '—' }}
                </td>

                <!-- Plan Tier -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="[
                    'text-[10px] font-mono px-1.5 py-0.2 border uppercase',
                    (drug.planTier || drug.plan_tier) === 'enterprise'
                      ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                      : (drug.planTier || drug.plan_tier) === 'pro'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    {{ drug.planTier || drug.plan_tier || 'starter' }}
                  </span>
                </td>

                <!-- Rx Required -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span v-if="drug.rxRequired || drug.rx_required"
                    class="text-[10px] font-mono px-1.5 py-0.2 border uppercase bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400">
                    Rx Req
                  </span>
                  <span v-else
                    class="text-[10px] font-mono px-1.5 py-0.2 border uppercase bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-300">
                    OTC
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEditDrugModal(drug)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Edit Master Drug">
                      Edit
                    </button>
                    <button @click="handleDeleteMasterDrug(drug)"
                      class="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-gray-800 dark:text-rose-400 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Delete Master Drug">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div
          class="px-3 py-1.5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 font-normal">
          <div>Total <strong>{{ displayedMasterDrugs.length }}</strong> master medicines in catalog</div>
          <div class="text-[10px] text-slate-400 font-normal">
            MySQL: <code>master_drugs</code>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: ADD MASTER DRUG -->
      <!-- ===================================================================== -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Add Certified Master Medicine
            </h3>
            <button @click="showAddModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="submitAddDrug" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Brand Name *
              </label>
              <input v-model="drugForm.brandName" type="text" required placeholder="e.g. Napa Extra / Amoclav"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Generic Chemical Name *
              </label>
              <input v-model="drugForm.genericName" type="text" required placeholder="e.g. Paracetamol + Caffeine"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <select v-model="drugForm.dosageForm"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drop">Drop</option>
                </select>
              </div>

              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Strength / Power</label>
                <input v-model="drugForm.strength" type="text" placeholder="e.g. 500 mg / 665 mg"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Default MRP Price (৳)</label>
                <input v-model.number="drugForm.defaultPrice" type="number" step="0.10" placeholder="e.g. 5.00"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs font-mono" />
              </div>

              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Plan Access Tier</label>
                <select v-model="drugForm.planTier"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="starter">Starter Tier</option>
                  <option value="pro">Pro Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Manufacturer / Lab
              </label>
              <input v-model="drugForm.manufacturer" type="text" placeholder="e.g. Square Pharmaceuticals Ltd."
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="pt-1">
              <label class="flex items-center gap-2 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                <input type="checkbox" v-model="drugForm.rxRequired" class="text-emerald-600" />
                <span>Doctor Prescription Required (Rx)</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showAddModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Saving...' : 'Save Medicine' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL: EDIT MASTER DRUG -->
      <!-- ===================================================================== -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-md shadow-lg overflow-hidden">
          <!-- Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Edit Master Medicine (#{{ editDrugId }})
            </h3>
            <button @click="showEditModal = false"
              class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="submitEditDrug" class="p-4 space-y-2.5 text-xs font-sans">
            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Brand Name *
              </label>
              <input v-model="drugForm.brandName" type="text" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Generic Chemical Name *
              </label>
              <input v-model="drugForm.genericName" type="text" required
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <select v-model="drugForm.dosageForm"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drop">Drop</option>
                </select>
              </div>

              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Plan Tier</label>
                <select v-model="drugForm.planTier"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs cursor-pointer">
                  <option value="starter">Starter Tier</option>
                  <option value="pro">Pro Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                Manufacturer / Lab
              </label>
              <input v-model="drugForm.manufacturer" type="text"
                class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-[#107c41] text-xs" />
            </div>

            <div class="pt-1">
              <label class="flex items-center gap-2 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                <input type="checkbox" v-model="drugForm.rxRequired" class="text-emerald-600" />
                <span>Doctor Prescription Required (Rx)</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showEditModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-1 bg-[#107c41] hover:bg-[#0e6b37] disabled:opacity-50 text-white font-normal text-xs flex items-center gap-1 cursor-pointer">
                <span>{{ isSaving ? 'Updating...' : 'Update Medicine' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useSuperAdmin } from '~/composables/useSuperAdmin';

const { masterDrugs, fetchMasterDrugs, createMasterDrug, updateMasterDrug, deleteMasterDrug } = useSuperAdmin();

const searchFilter = ref('');
const tierFilter = ref('all');
const showAddModal = ref(false);
const showEditModal = ref(false);
const editDrugId = ref<string | number | null>(null);
const loading = ref(false);
const isSaving = ref(false);
const selectedRow = ref<string | number | null>(null);

const drugForm = reactive({
  brandName: '',
  genericName: '',
  dosageForm: 'Tablet',
  manufacturer: '',
  planTier: 'starter',
  rxRequired: false
});

onMounted(async () => {
  loading.value = true;
  await fetchMasterDrugs();
  loading.value = false;
});

const displayedMasterDrugs = computed(() => {
  return masterDrugs.value.filter(drug => {
    const brand = (drug.brandName || drug.brand_name || '').toLowerCase();
    const generic = (drug.genericName || drug.generic_name || '').toLowerCase();
    const mfg = (drug.manufacturer || '').toLowerCase();
    const q = searchFilter.value.toLowerCase();
    const matchesSearch = !q || brand.includes(q) || generic.includes(q) || mfg.includes(q);

    const tier = (drug.planTier || drug.plan_tier || 'starter').toLowerCase();
    const matchesTier = tierFilter.value === 'all' || tier === tierFilter.value.toLowerCase();

    return matchesSearch && matchesTier;
  });
});

const openAddModal = () => {
  drugForm.brandName = '';
  drugForm.genericName = '';
  drugForm.dosageForm = 'Tablet';
  drugForm.manufacturer = '';
  drugForm.planTier = 'starter';
  drugForm.rxRequired = false;
  showAddModal.value = true;
};

const submitAddDrug = async () => {
  if (!drugForm.brandName || !drugForm.genericName) return;
  isSaving.value = true;
  try {
    await createMasterDrug({
      brandName: drugForm.brandName,
      genericName: drugForm.genericName,
      dosageForm: drugForm.dosageForm,
      manufacturer: drugForm.manufacturer,
      planTier: drugForm.planTier,
      rxRequired: drugForm.rxRequired
    } as any);
    showAddModal.value = false;
    await fetchMasterDrugs();
  } catch (e: any) {
    alert("Error adding master drug: " + (e.message || "Failed to insert into database"));
  } finally {
    isSaving.value = false;
  }
};

const openEditDrugModal = (drug: any) => {
  editDrugId.value = drug.id;
  drugForm.brandName = drug.brandName || drug.brand_name || '';
  drugForm.genericName = drug.genericName || drug.generic_name || '';
  drugForm.dosageForm = drug.dosageForm || drug.dosage_form || 'Tablet';
  drugForm.manufacturer = drug.manufacturer || '';
  drugForm.planTier = drug.planTier || drug.plan_tier || 'starter';
  drugForm.rxRequired = !!(drug.rxRequired || drug.rx_required);
  showEditModal.value = true;
};

const submitEditDrug = async () => {
  if (!editDrugId.value || !drugForm.brandName || !drugForm.genericName) return;
  isSaving.value = true;
  try {
    await updateMasterDrug(editDrugId.value, {
      brandName: drugForm.brandName,
      genericName: drugForm.genericName,
      dosageForm: drugForm.dosageForm,
      manufacturer: drugForm.manufacturer,
      planTier: drugForm.planTier,
      rxRequired: drugForm.rxRequired
    } as any);
    showEditModal.value = false;
    await fetchMasterDrugs();
  } catch (e: any) {
    alert("Error updating master drug: " + (e.message || "Failed to update"));
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteMasterDrug = async (drug: any) => {
  const name = drug.brandName || drug.brand_name || 'Drug';
  if (!confirm(`Are you sure you want to delete "${name}" from master drugs dictionary?`)) return;
  try {
    await deleteMasterDrug(drug.id);
    await fetchMasterDrugs();
  } catch (e: any) {
    alert("Error deleting drug: " + (e.message || "Failed to delete"));
  }
};
</script>
