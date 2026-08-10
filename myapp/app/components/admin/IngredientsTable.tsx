"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockIngredients = Array.from({ length: 45 }).map((_, i) => {
  const names = [
    "Espresso Beans (Dark Roast)", "Whole Milk (Organic)", "Oat Milk (Barista)", "Brown Sugar Syrups",
    "Caramel Drizzle", "Cocoa Powder", "Matcha Green Tea Powder", "Paper Coffee Cups (12oz)",
    "Plastic Cold Cups (16oz)", "Biodegradable Straws", "Vanilla Extract", "Cinnamon Shaker"
  ];
  const categories = ["Coffee Beans", "Dairy", "Dairy Alternatives", "Sweeteners", "Toppings", "Toppings", "Tea Powder", "Packaging", "Packaging", "Packaging", "Additives", "Additives"];
  const units = ["kg", "liters", "liters", "liters", "kg", "kg", "kg", "pieces", "pieces", "pieces", "liters", "kg"];
  const suppliers = ["Farm Co-op", "Dairy Fresh Inc.", "Oat Organic Ltd.", "Global Foods", "Sweet Toppings Co.", "Sweet Toppings Co.", "Zen Tea Distributors", "Eco Pack Co.", "Eco Pack Co.", "Eco Pack Co.", "Additives Direct", "Additives Direct"];
  
  const index = i % names.length;
  const name = names[index];
  const category = categories[index];
  const unit = units[index];
  const supplier = suppliers[index];
  
  const stock = Math.floor(Math.random() * 80) + 2;
  const minRequired = index % 3 === 0 ? 15 : 5;
  const status = stock === 0 ? "OUT OF STOCK" : stock < minRequired ? "LOW STOCK" : "IN STOCK";
  const cost = (Math.random() * 15 + 2).toFixed(2);
  
  const createdDay = 10 + (i % 20);
  const updatedDay = createdDay + (i % 5);

  return {
    id: i + 1,
    ingredientId: `ING_${String(i).padStart(3, '0')}`,
    name: name,
    sku: `RAW-COF-${String(i).padStart(3, '0')}`,
    category: category,
    stock: stock,
    unit: unit,
    minLevel: minRequired,
    cost: cost,
    status: status,
    supplier: supplier,
    createdAt: `2026-07-${createdDay} 08:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 AM`,
    updatedAt: `2026-07-${updatedDay} 15:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 PM`
  };
});

export default function IngredientsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockIngredients.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) ||
    item.ingredientId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.category.toLowerCase().includes(filterText.toLowerCase()) ||
    item.sku.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/ingredients/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Ingredient
          </Link>
          <button className="db-grid-button">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
        <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
          <label className="text-gray-600 font-medium">Filter:</label>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="db-grid-input"
            placeholder="Enter SQL filter..."
          />
        </div>
      </div>

      {/* Database Grid Container */}
      <div className="db-grid-table-wrapper">
        <table className="db-grid-table" style={{ tableLayout: 'auto' }}>
          <thead className="sticky top-0 bg-[#f0f0f0] text-gray-700 shadow-sm z-10 select-none">
            <tr>
              <th className="px-1 py-1 border border-gray-300 w-8 text-center font-normal bg-[#e8e8e8]"></th>
              
              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>INGREDIENT_ID</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>NAME</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>SKU</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>CATEGORY</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>STOCK_QTY</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>UNIT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>MIN_LEVEL</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>COST</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>STATUS</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>SUPPLIER</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((row) => {
              const isSelected = selectedRow === row.id;
              return (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedRow(row.id)}
                  className={isSelected ? "isSelected" : ""}
                >
                  <td className="db-grid-idx">
                    {row.id}
                  </td>
                  <td className="db-grid-td db-grid-link">
                    {row.ingredientId}
                  </td>
                  <td className="db-grid-td">
                    {row.name}
                  </td>
                  <td className="db-grid-td font-mono">
                    {row.sku}
                  </td>
                  <td className="db-grid-td text-gray-600">
                    {row.category}
                  </td>
                  <td className="db-grid-td text-right font-mono">
                    {row.stock}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.unit}
                  </td>
                  <td className="db-grid-td text-right font-mono">
                    {row.minLevel}
                  </td>
                  <td className="db-grid-td text-right font-mono">
                    ${row.cost}
                  </td>
                  <td className={`db-grid-td font-semibold ${
                    row.status === 'IN STOCK' ? 'db-grid-status-active' : row.status === 'LOW STOCK' ? 'db-grid-status-pending' : 'db-grid-status-failed'
                  }`}>
                    {row.status}
                  </td>
                  <td className="db-grid-td text-gray-600">
                    {row.supplier}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="db-grid-footer">
        <div className="flex items-center space-x-4">
          <span>{filteredData.length} rows fetched.</span>
          {totalPages > 0 && (
            <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                disabled={currentPage === 1}
                className="px-1.5 py-0.5 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                disabled={currentPage === totalPages}
                className="px-1.5 py-0.5 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div>Ingredients Database - Connected (0.012s)</div>
      </div>
    </div>
  );
}
