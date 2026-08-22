<template>
  <NuxtLayout name="admin">
    <div class="space-y-4 select-none">
      <!-- Desktop Application Database Data Grid Frame with 1px Gridlines -->
      <div
        class="border border-slate-300 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        <!-- Top Desktop Data Grid Toolbar Bar -->
        <div
          class="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-b border-slate-300 dark:border-gray-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="openAddModal"
              class="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white dark:text-gray-950 font-bold px-3 py-1.5 rounded border border-emerald-600 text-xs flex items-center gap-1 shadow-sm cursor-pointer active:scale-95">
              <span class="text-sm font-black mr-1">+</span> Add New Medicine
            </button>
            <button @click="fetchProducts" :disabled="loading"
              class="bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 hover:bg-slate-100 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer">
              <svg :class="['w-3.5 h-3.5 mr-1 text-slate-500 dark:text-gray-400', { 'animate-spin': loading }]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Refresh Catalog
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-extrabold text-[11px] text-slate-600 dark:text-gray-400 uppercase tracking-wider">FILTER
              SEARCH:</label>
            <div class="relative">
              <input type="text" v-model="filterText" placeholder="Search generic, brand, supplier..."
                class="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans shadow-inner w-56 sm:w-72" />
              <button v-if="filterText" @click="filterText = ''"
                class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 text-xs">✕</button>
            </div>
          </div>
        </div>

        <!-- Desktop Grid Table Viewport with Visible 1px Gridlines -->
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs font-sans border-collapse border border-slate-300 dark:border-gray-800">
            <thead>
              <tr
                class="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-gray-200 font-extrabold text-[11px] uppercase tracking-wider">
                <th
                  class="py-2.5 px-3 w-10 text-center border border-slate-300 dark:border-gray-700 bg-slate-300/80 dark:bg-gray-800">
                  #</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">BRAND NAME</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">GENERIC COMPOUND</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">FORM & STRENGTH</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">CATEGORY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">SUPPLIER / DISTRIBUTOR</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-right">PRICE / COST</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">STOCK QTY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">Rx FLAG</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700">BATCH & EXPIRY</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">STATUS</th>
                <th class="py-2.5 px-3 border border-slate-300 dark:border-gray-700 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colSpan="12"
                  class="py-8 text-center text-slate-400 dark:text-gray-500 font-mono text-xs border border-slate-300 dark:border-gray-800">
                  No medicines found in database catalog.
                </td>
              </tr>
              <tr v-for="(row, idx) in filteredProducts" :key="row.id" @click="selectedRow = row.id" :class="[
                'transition-colors cursor-pointer border-b border-slate-300 dark:border-gray-800',
                selectedRow === row.id
                  ? 'bg-sky-500 text-white font-bold'
                  : 'even:bg-slate-50/80 dark:even:bg-gray-900/50 hover:bg-sky-100 dark:hover:bg-gray-800/80'
              ]">
                <!-- Index Column -->
                <td class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800 w-10"
                  :class="selectedRow === row.id ? 'bg-sky-600 text-white' : 'bg-slate-100/90 dark:bg-gray-900 text-slate-600 dark:text-gray-400'">
                  {{ idx + 1 }}
                </td>

                <!-- Brand Name -->
                <td class="py-2 px-3 font-extrabold border border-slate-300 dark:border-gray-800">
                  <div class="flex items-center gap-2">
                    <span>{{ row.icon || '💊' }}</span>
                    <span
                      :class="selectedRow === row.id ? 'text-white' : 'text-blue-700 dark:text-sky-400 hover:underline'">{{
                        row.name }}</span>
                  </div>
                </td>

                <!-- Generic -->
                <td class="py-2 px-3 font-semibold border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === row.id ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'">
                  🧪 {{ row.genericName || row.name }}
                </td>

                <!-- Form & Strength -->
                <td class="py-2 px-3 font-mono border border-slate-300 dark:border-gray-800"
                  :class="selectedRow === row.id ? 'text-white' : 'text-slate-700 dark:text-gray-300'">
                  <span
                    :class="selectedRow === row.id ? 'bg-white/20 border-white/40 text-white' : 'bg-slate-100 dark:bg-gray-950 border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300'"
                    class="px-2 py-0.5 rounded border text-[11px] font-semibold">
                    {{ row.dosageForm }} ({{ row.strength }})
                  </span>
                </td>

                <!-- Category -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-medium"
                  :class="selectedRow === row.id ? 'text-white' : 'text-slate-600 dark:text-gray-400'">
                  {{ row.category }}
                </td>

                <!-- Supplier -->
                <td class="py-2 px-3 border border-slate-300 dark:border-gray-800 font-semibold"
                  :class="selectedRow === row.id ? 'text-white' : 'text-sky-700 dark:text-sky-400'">
                  🏭 {{ row.manufacturer || 'GSK Pharmaceuticals' }}
                </td>

                <!-- Price / Cost -->
                <td class="py-2 px-3 text-right font-mono border border-slate-300 dark:border-gray-800">
                  <div class="font-extrabold"
                    :class="selectedRow === row.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'">${{
                      row.price.toFixed(2) }}</div>
                  <div class="text-[10px]"
                    :class="selectedRow === row.id ? 'text-sky-100' : 'text-slate-400 dark:text-gray-500'">Cost: ${{
                      row.cost.toFixed(2) }}</div>
                </td>

                <!-- Stock Qty -->
                <td class="py-2 px-3 text-center font-mono font-bold border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-xs border font-bold',
                    (row.stockQuantity || 0) <= (row.minReorderLevel || 15) ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800' : selectedRow === row.id ? 'bg-white text-slate-900 border-white' : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800'
                  ]">
                    {{ row.stockQuantity || 0 }}
                  </span>
                </td>

                <!-- Rx Flag -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black font-mono border uppercase tracking-wider',
                    row.rxRequired ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800' : selectedRow === row.id ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                  ]">
                    {{ row.rxRequired ? 'Rx Required' : 'OTC' }}
                  </span>
                </td>

                <!-- Batch & Expiry -->
                <td class="py-2 px-3 font-mono text-[11px] border border-slate-300 dark:border-gray-800">
                  <div class="font-semibold"
                    :class="selectedRow === row.id ? 'text-white' : 'text-slate-800 dark:text-gray-200'">Lot: {{
                      row.batchNumber }}</div>
                  <div class="font-semibold"
                    :class="selectedRow === row.id ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'">Exp: {{
                      row.expiryDate }}</div>
                </td>

                <!-- Status -->
                <td class="py-2 px-3 text-center font-bold border border-slate-300 dark:border-gray-800">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider',
                    row.status == 1 || row.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                  ]">
                    {{ row.status == 1 || row.status === 'AVAILABLE' ? 'Available' : 'Out of Stock' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-2 px-3 text-center border border-slate-300 dark:border-gray-800" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="openEditModal(row)"
                      class="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      title="Edit Medicine">
                      ✏️ Edit
                    </button>
                    <button @click="handleDeleteMedicine(row.id, row.name)"
                      class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-900 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      title="Delete Medicine">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Grid Footer Bar -->
        <div
          class="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-950 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between text-xs text-slate-600 dark:text-gray-400">
          <div>Displaying <strong>{{ filteredProducts.length }}</strong> medicine entries (Page 1 of 1)</div>
          <div class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL Medicines
            Catalog • Grid Connected</div>
        </div>
      </div>

      <!-- Add Medicine Modal Form -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base flex items-center gap-2">
              <span>💊</span> Add New Medicine to Catalog
            </h3>
            <button @click="showAddModal = false"
              class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">BRAND NAME *</label>
                <input type="text" v-model="newProd.name" placeholder="e.g. Amoxicillin 500mg"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">GENERIC COMPOUND NAME</label>
                <input type="text" v-model="newProd.genericName" placeholder="e.g. Amoxicillin Trihydrate"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">DOSAGE FORM</label>
                <select v-model="newProd.dosageForm"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STRENGTH</label>
                <input type="text" v-model="newProd.strength" placeholder="e.g. 500mg"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CATEGORY</label>
                <select v-model="newProd.categoryId"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">SUPPLIER / DISTRIBUTOR</label>
                <select v-model="newProd.manufacturer"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="" disabled>Select Supplier</option>
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">
                    {{ sup.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">SHELF / RACK LOCATION</label>
                <input type="text" v-model="newProd.rackLocation" placeholder="Shelf A-04"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">RETAIL PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.price"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">COST PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="newProd.cost"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STOCK QTY</label>
                <input type="number" v-model.number="newProd.stockQuantity"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-bold" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">MIN REORDER</label>
                <input type="number" v-model.number="newProd.minReorderLevel"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">BATCH LOT #</label>
                <input type="text" v-model="newProd.batchNumber" placeholder="BATCH-2026-X1"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">EXPIRY DATE</label>
                <input type="date" v-model="newProd.expiryDate"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="rxReq" v-model="newProd.rxRequired"
                  class="w-4 h-4 rounded bg-slate-50 dark:bg-gray-950 border-slate-300 dark:border-gray-800 text-emerald-600 focus:ring-emerald-500" />
                <label for="rxReq" class="font-bold text-rose-600 dark:text-rose-400 cursor-pointer">Prescription
                  Required (Rx
                  Medicine)</label>
              </div>

              <div class="flex items-center gap-2">
                <label class="font-bold text-slate-700 dark:text-gray-300">STATUS:</label>
                <select v-model="newProd.status"
                  class="bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-1 text-xs text-slate-800 dark:text-gray-200">
                  <option value="1">AVAILABLE</option>
                  <option value="0">OUT OF STOCK</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
            <button @click="showAddModal = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              Cancel
            </button>
            <button @click="handleSaveProduct" :disabled="!newProd.name"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
              Save Medicine to Catalog
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Medicine Modal Form -->
      <div v-if="showEditModal"
        class="fixed inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          class="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
            <h3 class="font-black text-emerald-600 dark:text-emerald-400 text-base flex items-center gap-2">
              <span>✏️</span> Edit Medicine: {{ editProd.name }}
            </h3>
            <button @click="showEditModal = false"
              class="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 font-bold">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">BRAND NAME *</label>
                <input type="text" v-model="editProd.name"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">GENERIC COMPOUND NAME</label>
                <input type="text" v-model="editProd.genericName"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">DOSAGE FORM</label>
                <select v-model="editProd.dosageForm"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Eye Drops">Eye Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STRENGTH</label>
                <input type="text" v-model="editProd.strength"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">CATEGORY</label>
                <select v-model="editProd.categoryId"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">SUPPLIER / DISTRIBUTOR</label>
                <select v-model="editProd.manufacturer"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans">
                  <option v-for="sup in supplierList" :key="sup.id" :value="sup.name">
                    {{ sup.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">SHELF / RACK LOCATION</label>
                <input type="text" v-model="editProd.rackLocation"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">RETAIL PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.price"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">COST PRICE ($)</label>
                <input type="number" step="0.10" v-model.number="editProd.cost"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">STOCK QTY</label>
                <input type="number" v-model.number="editProd.stockQuantity"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-bold" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">MIN REORDER</label>
                <input type="number" v-model.number="editProd.minReorderLevel"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 font-mono text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">BATCH LOT #</label>
                <input type="text" v-model="editProd.batchNumber"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-gray-300 mb-1">EXPIRY DATE</label>
                <input type="date" v-model="editProd.expiryDate"
                  class="w-full bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-xl p-2.5 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 font-sans" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="rxReqEdit" v-model="editProd.rxRequired"
                  class="w-4 h-4 rounded bg-slate-50 dark:bg-gray-950 border-slate-300 dark:border-gray-800 text-emerald-600 focus:ring-emerald-500" />
                <label for="rxReqEdit" class="font-bold text-rose-600 dark:text-rose-400 cursor-pointer">Prescription
                  Required (Rx
                  Medicine)</label>
              </div>

              <div class="flex items-center gap-2">
                <label class="font-bold text-slate-700 dark:text-gray-300">STATUS:</label>
                <select v-model="editProd.status"
                  class="bg-slate-50 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 rounded-lg p-1 text-xs text-slate-800 dark:text-gray-200">
                  <option value="1">AVAILABLE</option>
                  <option value="0">OUT OF STOCK</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
            <button @click="showEditModal = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-950 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              Cancel
            </button>
            <button @click="handleUpdateProduct" :disabled="!editProd.name"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-gray-950 font-black py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
              Update Medicine Record
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore, type ProductItem } from '~/stores/products';
import { useCategoryStore } from '~/stores/categories';
import { useAdminSuppliers } from '~/composables/useAdminSuppliers';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const { suppliers: supplierList } = useAdminSuppliers();

const { products, loading } = storeToRefs(productStore);
const { fetchProducts, addProduct, updateProduct, deleteProduct } = productStore;

const { categories: dbCategories } = storeToRefs(categoryStore);
const { fetchCategories } = categoryStore;

const filterText = ref('');
const selectedRow = ref<number | null>(null);

// Add Modal State
const showAddModal = ref(false);
const newProd = ref<Partial<ProductItem>>({
  name: '',
  genericName: '',
  dosageForm: 'Tablet',
  strength: '500mg',
  categoryId: 1,
  manufacturer: 'GSK Pharmaceuticals Ltd.',
  price: 0.00,
  cost: 0.00,
  taxRate: 0,
  status: 'AVAILABLE',
  rxRequired: false,
  batchNumber: 'BATCH-2026-NEW',
  expiryDate: '2028-06-30',
  rackLocation: 'Shelf A-01',
  stockQuantity: 100,
  minReorderLevel: 15
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
  const query = filterText.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.genericName && p.genericName.toLowerCase().includes(query)) ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes(query)) ||
    (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
    (p.category && p.category.toLowerCase().includes(query))
  );
});

const openAddModal = () => {
  if (dbCategories.value && dbCategories.value.length > 0) {
    newProd.value.categoryId = dbCategories.value[0].id;
  }
  showAddModal.value = true;
};

const handleSaveProduct = async () => {
  if (!newProd.value.name) return;
  await addProduct(newProd.value);
  newProd.value = {
    name: '',
    genericName: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    categoryId: dbCategories.value?.[0]?.id || 1,
    manufacturer: supplierList.value?.[0]?.name || 'GSK Pharmaceuticals Ltd.',
    price: 0.00,
    cost: 0.00,
    taxRate: 0,
    status: 'AVAILABLE',
    rxRequired: false,
    batchNumber: 'BATCH-2026-NEW',
    expiryDate: '2028-06-30',
    rackLocation: 'Shelf A-01',
    stockQuantity: 100,
    minReorderLevel: 15
  };
  showAddModal.value = false;
};

const openEditModal = (product: ProductItem) => {
  editingId.value = product.id;
  editProd.value = { ...product };
  showEditModal.value = true;
};

const handleUpdateProduct = async () => {
  if (!editingId.value || !editProd.value.name) return;
  await updateProduct(editingId.value, editProd.value);
  showEditModal.value = false;
  editingId.value = null;
};

const handleDeleteMedicine = async (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete medicine "${name}" from database?`)) {
    await deleteProduct(id);
  }
};
</script>
