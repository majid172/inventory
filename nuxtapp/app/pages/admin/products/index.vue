<template>
  <NuxtLayout name="admin">
    <div class="space-y-3 select-none">
      <!-- Desktop Application Database Data Grid Frame (Clean, Sharp Edges, Regular Font) -->
      <div class="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs">
        <!-- Top Toolbar -->
        <div
          class="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3 py-1 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all">
              <span class="text-sm">+</span> Add New Medicine
            </button>
            <button @click="fetchProducts" :disabled="loading"
              class="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-normal px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
              <svg :class="['w-3.5 h-3.5 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Catalog
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label
              class="font-normal text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">FILTER:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search brand, generic, supplier..."
                class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 font-normal focus:outline-none focus:border-emerald-500 w-56 sm:w-72" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-normal">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Exact Match to Reference Typography -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-200 dark:border-gray-800">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 font-normal text-[11px] uppercase tracking-wide border-b border-slate-200 dark:border-gray-800">
                <th class="py-1.5 px-3 w-12 text-center border-r border-slate-200 dark:border-gray-800 font-normal">SL.
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Generic Name</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Form & Strength</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Category</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Supplier</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">Price</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-right font-normal">Cost
                </th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal"> Qty
                </th>
                <!-- <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Rx Flag
                </th> -->
               <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal">Batch & Exp</th>
                <th class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 text-center font-normal">Status</th>
                <th class="py-1.5 px-3 text-center w-24 font-normal">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="12" class="py-6 text-center text-slate-400 dark:text-gray-500 font-normal text-xs">
                  No medicines found in database catalog.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredProducts" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-200 dark:border-gray-800 font-normal text-slate-700 dark:text-gray-300',
                selectedRow === row.id
                  ? 'bg-[#e8f4fd] dark:bg-sky-950/40 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
              ]">
                <!-- ID Column -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 w-12 font-normal text-slate-500 dark:text-gray-400">
                  {{ ++idx }}
                </td>

                <!-- Brand Name -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  {{ row.name }}
                </td>

                <!-- Generic Compound -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.genericName || row.name }}
                </td>

                <!-- Form & Strength -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.dosageForm || 'Tablet' }}<span v-if="row.strength && row.strength !== '-'"> ({{ row.strength }})</span>
                </td>

                <!-- Category -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.category || 'General' }}
                </td>

                <!-- Supplier -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  {{ row.manufacturer || 'GSK Pharma' }}
                </td>

                <!-- Price / Cost -->
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="text-slate-800 dark:text-gray-200 font-normal">{{ settingsStore.currencySymbol }}{{ Number(row.price || 0).toFixed(2) }}
                  </div>
                
                </td>
                <td class="py-1.5 px-3 text-right border-r border-slate-200 dark:border-gray-800 font-normal">
                  <div class="text-slate-800 dark:text-gray-200 font-normal">{{ settingsStore.currencySymbol }}{{ Number(row.cost || 0).toFixed(2) }}
                  </div>
                 
                </td>

                <!-- Stock Qty -->
                <td
                  class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal text-slate-800 dark:text-gray-200">
                  {{ row.stockQuantity || 0 }}
                </td>

                <!-- Rx Flag -->
                <!-- <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal">
                  <span :class="row.rxRequired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'">
                    {{ row.rxRequired ? 'Rx Req' : 'OTC' }}
                  </span>
                </td> -->

                <!-- Batch & Exp -->
                <td
                  class="py-1.5 px-3 border-r border-slate-200 dark:border-gray-800 font-normal text-slate-600 dark:text-gray-400">
                  <div>{{ row.batchNumber || '-' }}</div>
                  <div class="text-[10px] text-slate-400">{{ row.expiryDate || '-' }}</div>
                </td>

                <!-- Availability -->
                <!-- <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal"> 
                  <span
                    :class="row.status == 1 || row.status === 'AVAILABLE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'">
                    {{ row.status == 1 || row.status === 'AVAILABLE' ? 'Available' : 'Out of Stock' }}
                  </span>
                </td> -->
                <!-- Active / Inactive Status -->
                <td class="py-1.5 px-3 text-center border-r border-slate-200 dark:border-gray-800 font-normal"> 
                  <span
                    :class="row.is_active == 1 ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-rose-600 font-medium'">
                    {{ row.is_active == 1 ? 'Active' : 'Inactive' }}
                  </span> 
                </td>

                <!-- Actions -->
                <td class="py-1.5 px-3 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Edit Medicine">
                      Edit
                    </button>
                    <button @click="handleDeleteMedicine(row.id, row.name)"
                      class="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-gray-800 dark:text-rose-400 dark:border-gray-700 px-2 py-0.5 text-[11px] font-normal cursor-pointer"
                      title="Delete Medicine">
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
          <div>Total <strong>{{ filteredProducts.length }}</strong> products</div>
         
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CLEAN & SHARP DESKTOP MODAL: ADD MEDICINE (REGULAR FONT) -->
      <!-- ===================================================================== -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-2xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Add New Medicine to Catalog
            </h3>
            <button @click="showAddModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleSaveProduct" class="p-4 space-y-3 text-xs font-sans overflow-y-auto flex-1">
            <!-- Product Classification Selector (Medicine vs General Non-Medicine) -->
            <div
              class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2.5 flex items-center justify-between">
              <span class="text-slate-600 dark:text-gray-300 font-normal text-xs">Product Classification:</span>
              <div class="flex items-center gap-4">
                <label
                  class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="radio" value="medicine" v-model="newProd.productType"
                    class="text-emerald-600 focus:ring-emerald-500" />
                  <span>💊 Medicine (Drug)</span>
                </label>
                <label
                  class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="radio" value="general" v-model="newProd.productType"
                    class="text-emerald-600 focus:ring-emerald-500" />
                  <span>📦 General / Non-Medicine</span>
                </label>
              </div>
            </div>

            <!-- Master Drug Auto-Fill Notification Badge -->
            <div v-if="selectedMasterDrug" class="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <span class="text-sm">⚡</span>
                <div>
                  <span class="font-bold">Auto-filled from Master Catalog:</span>
                  <span class="ml-1 font-mono text-[11px]">{{ selectedMasterDrug.brandName }} ({{ selectedMasterDrug.strength || 'N/A' }}) - {{ selectedMasterDrug.genericName }}</span>
                </div>
              </div>
              <button type="button" @click="clearMasterDrug" class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-bold underline cursor-pointer">
                Clear / Manual
              </button>
            </div>

            <div :class="newProd.productType === 'medicine' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'">
              <!-- Medicine Name with Smart Master Drug Autocomplete -->
              <div class="relative">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span>{{ newProd.productType === 'medicine' ? 'Brand / Medicine Name *' : 'Product Name *' }}</span>
                  <span v-if="newProd.productType === 'medicine'" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">⚡ Auto-Complete Powered</span>
                </label>
                <input 
                  type="text" 
                  v-model="newProd.name" 
                  @input="handleMedicineInput" 
                  @focus="handleMedicineInput"
                  required
                  :placeholder="newProd.productType === 'medicine' ? 'Type 2+ letters e.g. Napa, Ace, Seclo...' : 'e.g. Savlon Antiseptic 500ml'"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" 
                />

                <!-- Master Drug Autocomplete Dropdown Panel -->
                <div 
                  v-if="showMasterDrugDropdown && masterDrugSearchResults.length > 0"
                  class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800"
                >
                  <div class="px-2.5 py-1 bg-slate-100 dark:bg-gray-900 text-[10px] uppercase font-bold text-slate-500 flex justify-between">
                    <span>SELECT FROM MASTER CATALOG (AUTO-FILL)</span>
                    <span>{{ masterDrugSearchResults.length }} matches</span>
                  </div>
                  <div 
                    v-for="item in masterDrugSearchResults" 
                    :key="item.id" 
                    @mousedown.prevent="selectMasterDrug(item)"
                    @click="selectMasterDrug(item)"
                    class="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer transition-colors"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-900 dark:text-white text-xs">{{ item.brandName || item.brand_name }}</span>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 border rounded">
                        {{ item.dosageForm || item.dosage_form || 'Tablet' }} {{ item.strength ? `• ${item.strength}` : '' }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 flex justify-between">
                      <span>Generic: <strong class="text-slate-700 dark:text-gray-300">{{ item.genericName || item.generic_name }}</strong></span>
                      <span v-if="item.manufacturer" class="italic">{{ item.manufacturer }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="newProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Generic Compound Name</label>
                <input type="text" v-model="newProd.genericName" placeholder="e.g. Amoxicillin Trihydrate"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div :class="newProd.productType === 'medicine' ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-1 gap-3'">
              <div v-if="newProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <select v-model="newProd.dosageForm"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                </select>
              </div>
              <div v-if="newProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Strength</label>
                <input type="text" v-model="newProd.strength" placeholder="e.g. 500mg"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Category *</label>
                <select v-model="newProd.categoryId" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option value="" disabled>-- Select Category --</option>
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Supplier / Brand</label>
                <select v-model="newProd.manufacturer"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">{{ sup.name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Shelf / Rack Location</label>
                <input type="text" v-model="newProd.rackLocation" placeholder="Shelf A-01"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Retail Price ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.price"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Cost Price ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.cost"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Stock Qty</label>
                <input type="number" v-model.number="newProd.stockQuantity"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Min Reorder</label>
                <input type="number" v-model.number="newProd.minReorderLevel"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Batch / Lot #</label>
                <input type="text" v-model="newProd.batchNumber"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input type="date" v-model="newProd.expiryDate"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <template v-if="newProd.productType === 'medicine'">
                  <input type="checkbox" id="rxReqNew" v-model="newProd.rxRequired"
                    class="w-4 h-4 border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label for="rxReqNew"
                    class="font-normal text-slate-700 dark:text-gray-300 cursor-pointer">Prescription
                    Required (Rx Medicine)</label>
                </template>
                <span v-else class="text-slate-400 font-normal text-[11px]">OTC / General Retail Product</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="font-normal text-slate-700 dark:text-gray-300">Status:</label>
                <select v-model.number="newProd.is_active"
                  class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 font-normal cursor-pointer">
                  <option :value="1">Active </option>
                  <option :value="0">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showAddModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="!newProd.name"
                class="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-normal text-xs cursor-pointer">
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>


      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
        <div
          class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 w-full max-w-2xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Window Titlebar -->
          <div
            class="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3.5 py-2 flex items-center justify-between">
            <h3 class="font-normal text-xs text-slate-800 dark:text-gray-100">
              Edit Product Record (#{{ editingId }})
            </h3>
            <button @click="showEditModal = false"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal text-xs cursor-pointer">✕</button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleUpdateProduct" class="p-4 space-y-3 text-xs font-sans overflow-y-auto flex-1">
            <!-- Product Classification Selector -->
            <div
              class="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-2.5 flex items-center justify-between">
              <span class="text-slate-600 dark:text-gray-300 font-normal text-xs">Product Classification:</span>
              <div class="flex items-center gap-4">
                <label
                  class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="radio" value="medicine" v-model="editProd.productType"
                    class="text-emerald-600 focus:ring-emerald-500" />
                  <span>💊 Medicine (Drug)</span>
                </label>
                <label
                  class="flex items-center gap-1.5 cursor-pointer font-normal text-xs text-slate-800 dark:text-gray-200">
                  <input type="radio" value="general" v-model="editProd.productType"
                    class="text-emerald-600 focus:ring-emerald-500" />
                  <span>📦 General / Non-Medicine</span>
                </label>
              </div>
            </div>

            <div :class="editProd.productType === 'medicine' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">
                  {{ editProd.productType === 'medicine' ? 'Brand / Medicine Name *' : 'Product Name *' }}
                </label>
                <input type="text" v-model="editProd.name" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div v-if="editProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Generic Compound Name</label>
                <input type="text" v-model="editProd.genericName"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div :class="editProd.productType === 'medicine' ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-1 gap-3'">
              <div v-if="editProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Dosage Form</label>
                <select v-model="editProd.dosageForm"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                </select>
              </div>
              <div v-if="editProd.productType === 'medicine'">
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Strength</label>
                <input type="text" v-model="editProd.strength"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Category *</label>
                <select v-model="editProd.categoryId" required
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option value="" disabled>-- Select Category --</option>
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Supplier / Distributor</label>
                <select v-model="editProd.manufacturer"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs cursor-pointer">
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">{{ sup.name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Shelf / Rack Location</label>
                <input type="text" v-model="editProd.rackLocation"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Retail Price ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.price"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Cost Price ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.cost"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Stock Qty</label>
                <input type="number" v-model.number="editProd.stockQuantity"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Min Reorder</label>
                <input type="number" v-model.number="editProd.minReorderLevel"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Batch Lot #</label>
                <input type="text" v-model="editProd.batchNumber"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
              <div>
                <label class="block font-normal text-slate-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input type="date" v-model="editProd.expiryDate"
                  class="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2.5 py-1.5 text-slate-800 dark:text-gray-100 font-normal focus:outline-none focus:border-emerald-500 text-xs" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="rxReqEdit" v-model="editProd.rxRequired"
                  class="w-4 h-4 border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label for="rxReqEdit" class="font-normal text-slate-700 dark:text-gray-300 cursor-pointer">Prescription
                  Required (Rx Medicine)</label>
              </div>
              <div class="flex items-center gap-2">
                <label class="font-normal text-slate-700 dark:text-gray-300">Status:</label>
                <select v-model.number="editProd.is_active"
                  class="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 px-2 py-1 text-xs text-slate-800 dark:text-gray-100 font-normal cursor-pointer">
                  <option :value="1">Active</option>
                  <option :value="0">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button type="button" @click="showEditModal = false"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-normal text-xs cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="!editProd.name"
                class="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-normal text-xs cursor-pointer">
                Update Medicine
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '~/stores/categories';
import { useAdminSuppliers } from '~/composables/useAdminSuppliers';
import { useProductStore, type ProductItem } from '~/stores/products';
import { useSettingsStore } from '~/stores/settings';

const productsStore = useProductStore();
const settingsStore = useSettingsStore();
const categoryStore = useCategoryStore();
const { suppliers: supplierList } = useAdminSuppliers();

const { products, loading } = storeToRefs(productsStore);
const { fetchProducts, addProduct, updateProduct, deleteProduct } = productsStore;
console.log(categoryStore.categories);

const { categories: dbCategories } = storeToRefs(categoryStore);
const { fetchCategories } = categoryStore;

const filterText = ref('');
const selectedRow = ref<number | null>(null);

// Add Modal State
const showAddModal = ref(false);
const newProd = ref<Partial<ProductItem>>({
  productType: 'medicine',
  name: '',
  genericName: '',
  dosageForm: 'Tablet',
  strength: '500mg',
  categoryId: '',
  manufacturer: '',
  price: 0.00,
  cost: 0.00,
  taxRate: 0,
  status: 1,
  rxRequired: false,
  batchNumber: '',
  expiryDate: '',
  rackLocation: 'Shelf A-01',
  stockQuantity: 0,
  minReorderLevel: 10
});

// Edit Modal State
const showEditModal = ref(false);
const editingId = ref<number | null>(null);
const editProd = ref<Partial<ProductItem>>({});

onMounted(() => {
  fetchProducts();
  fetchCategories();
});

const filteredProducts = computed(() => {
  const query = (filterText.value || '').toLowerCase().trim();
  if (!products.value || !Array.isArray(products.value)) return [];
  return products.value.filter(p => {
    if (!p) return false;
    const name = (p.name || '').toLowerCase();
    const generic = (p.genericName || '').toLowerCase();
    const mfg = (p.manufacturer || '').toLowerCase();
    const batch = (p.batchNumber || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return name.includes(query) || generic.includes(query) || mfg.includes(query) || batch.includes(query) || cat.includes(query);
  });
});

// Master Drug Autocomplete & Auto-Fill State
const masterDrugSearchResults = ref<any[]>([]);
const showMasterDrugDropdown = ref(false);
const selectedMasterDrug = ref<any | null>(null);

let searchDebounceTimer: any = null;

const handleMedicineInput = () => {
  if (newProd.value.productType !== 'medicine') {
    showMasterDrugDropdown.value = false;
    return;
  }

  const query = (newProd.value.name || '').trim();
  if (query.length < 2) {
    masterDrugSearchResults.value = [];
    showMasterDrugDropdown.value = false;
    return;
  }

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/master-drugs?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        masterDrugSearchResults.value = data.data;
        showMasterDrugDropdown.value = data.data.length > 0;
        return;
      }
    } catch (e) {
      console.warn("Direct Express fetch failed, trying proxy...", e);
    }

    try {
      const res: any = await $fetch(`/api/super-admin/master-drugs?search=${encodeURIComponent(query)}`);
      if (res && res.success && Array.isArray(res.data)) {
        masterDrugSearchResults.value = res.data;
        showMasterDrugDropdown.value = res.data.length > 0;
      }
    } catch (e) {
      console.warn("Master drug fetch failed:", e);
    }
  }, 150);
};

const selectMasterDrug = (item: any) => {
  selectedMasterDrug.value = item;
  newProd.value.masterDrugId = item.id;
  newProd.value.name = item.brandName || item.brand_name || newProd.value.name;
  newProd.value.genericName = item.genericName || item.generic_name || newProd.value.genericName;
  newProd.value.dosageForm = item.dosageForm || item.dosage_form || newProd.value.dosageForm || 'Tablet';
  if (item.strength) newProd.value.strength = item.strength;
  if (item.manufacturer) newProd.value.manufacturer = item.manufacturer;
  if (item.rxRequired !== undefined || item.rx_required !== undefined) {
    newProd.value.rxRequired = item.rxRequired || !!item.rx_required;
  }
  if (item.defaultPrice || item.default_price) {
    newProd.value.price = Number(item.defaultPrice || item.default_price);
  }
  showMasterDrugDropdown.value = false;
};

const clearMasterDrug = () => {
  selectedMasterDrug.value = null;
  newProd.value.masterDrugId = undefined;
};

const openAddModal = async () => {
  clearMasterDrug();
  await fetchCategories();
  if (dbCategories.value && dbCategories.value.length > 0) {
    newProd.value.categoryId = dbCategories.value[0].id;
  }
  showAddModal.value = true;
};

const handleSaveProduct = async () => {
  if (!newProd.value.name) return;
  try {
    await addProduct(newProd.value);
    newProd.value = {
      productType: 'medicine',
      name: '',
      genericName: '',
      dosageForm: 'Tablet',
      strength: '500mg',
      categoryId: dbCategories.value?.[0]?.id || 1,
      manufacturer: supplierList.value?.[0]?.name || 'GSK Pharmaceuticals Ltd.',
      price: 0.00,
      cost: 0.00,
      taxRate: 0,
      status: 1,
      rxRequired: false,
      batchNumber: '',
      expiryDate: '',
      rackLocation: 'Shelf A-01',
      stockQuantity: 0,
      minReorderLevel: 10
    };
    showAddModal.value = false;
  } catch (e: any) {
    alert("Error saving medicine: " + (e.message || "Failed to save to MySQL"));
  }
};

const openEditModal = async (product: ProductItem) => {
  await fetchCategories();
  editingId.value = product.id;
  const isMed = !!(product.masterDrugId || (product.genericName && product.genericName !== product.name && product.genericName.trim() !== ''));
  editProd.value = {
    ...product,
    is_active: product.is_active !== undefined ? Number(product.is_active) : (product.isActive !== undefined ? Number(product.isActive) : 1),
    productType: isMed ? 'medicine' : 'general'
  };
  showEditModal.value = true;
};

const handleUpdateProduct = async () => {
  if (!editingId.value || !editProd.value.name) return;
  try {
    await updateProduct(editingId.value, editProd.value);
    showEditModal.value = false;
    editingId.value = null;
  } catch (e: any) {
    alert("Error updating medicine: " + (e.message || "Failed to update in MySQL"));
  }
};

const handleDeleteMedicine = async (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete medicine "${name}" from database?`)) {
    try {
      await deleteProduct(id);
    } catch (e: any) {
      alert("Error deleting medicine: " + (e.message || "Failed to delete from MySQL"));
    }
  }
};
</script>
