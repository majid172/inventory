"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockCategories = [
  { id: 1, categoryId: "CAT_001", name: "Hot Drinks", slug: "hot-drinks", productCount: 15, status: "ACTIVE", createdAt: "2026-07-10 08:30:00.000000000 AM", updatedAt: "2026-07-24 15:30:16.000000000 PM" },
  { id: 2, categoryId: "CAT_002", name: "Cold Drinks", slug: "cold-drinks", productCount: 8, status: "ACTIVE", createdAt: "2026-07-11 08:30:00.000000000 AM", updatedAt: "2026-07-26 15:54:41.000000000 PM" },
  { id: 3, categoryId: "CAT_003", name: "Bakery", slug: "bakery", productCount: 10, status: "ACTIVE", createdAt: "2026-07-11 08:45:00.000000000 AM", updatedAt: "2026-07-26 15:18:38.000000000 PM" },
  { id: 4, categoryId: "CAT_004", name: "Brunch", slug: "brunch", productCount: 6, status: "ACTIVE", createdAt: "2026-07-12 08:11:00.000000000 AM", updatedAt: "2026-07-23 15:36:28.000000000 PM" },
  { id: 5, categoryId: "CAT_005", name: "Retail Coffee", slug: "retail-coffee", productCount: 4, status: "ACTIVE", createdAt: "2026-07-12 08:19:00.000000000 AM", updatedAt: "2026-07-23 15:29:57.000000000 PM" },
  { id: 6, categoryId: "CAT_006", name: "Merchandise", slug: "merchandise", productCount: 5, status: "ACTIVE", createdAt: "2026-07-13 08:28:00.000000000 AM", updatedAt: "2026-07-29 15:16:58.000000000 PM" },
  { id: 7, categoryId: "CAT_007", name: "Equipment", slug: "equipment", productCount: 3, status: "ACTIVE", createdAt: "2026-07-13 08:49:00.000000000 AM", updatedAt: "2026-07-28 15:17:45.000000000 PM" },
  { id: 8, categoryId: "CAT_008", name: "Seasonal Special", slug: "seasonal-special", productCount: 0, status: "INACTIVE", createdAt: "2026-07-14 08:33:00.000000000 AM", updatedAt: "2026-07-23 15:28:25.000000000 PM" }
];

export default function CategoriesTable() {
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");

  const filteredData = mockCategories.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) ||
    item.categoryId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.slug.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/categories/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Category
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
          <thead>
            <tr>
              <th className="px-1 py-1 w-8 text-center bg-[#e8e8e8]"></th>
              
              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>CATEGORY_ID</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>NAME</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>SLUG</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>PRODUCT_COUNT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>STATUS</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>CREATED_AT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>UPDATED_AT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row) => {
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
                    {row.categoryId}
                  </td>
                  <td className="db-grid-td font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.slug}
                  </td>
                  <td className="db-grid-td text-right font-mono">
                    {row.productCount}
                  </td>
                  <td className={`db-grid-td ${row.status === 'ACTIVE' ? 'db-grid-status-active' : 'db-grid-status-inactive'}`}>
                    {row.status}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.createdAt}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.updatedAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="db-grid-footer">
        <div>{filteredData.length} rows fetched.</div>
        <div>Categories Database - Connected (0.010s)</div>
      </div>
    </div>
  );
}
