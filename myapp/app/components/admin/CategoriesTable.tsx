"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function CategoriesTable() {
  const { categories, loading, error, fetchCategories } = useCategoryStore();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredData = categories.filter(item =>
    item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.categoryId?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.slug?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/categories/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Category
          </Link>
          <button 
            onClick={() => fetchCategories()} 
            disabled={loading} 
            className="db-grid-button flex items-center"
          >
            <svg className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
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
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500 font-mono">
                  Loading categories from database...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-red-500 font-mono">
                  Error: {error}
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500 font-mono">
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
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
                      {row.productCount ?? 0}
                    </td>
                    <td className={`db-grid-td ${row.status === 'ACTIVE' ? 'db-grid-status-active' : 'db-grid-status-inactive'}`}>
                      {row.status}
                    </td>
                    <td className="db-grid-td text-gray-600 font-mono">
                      {row.createdAt ? String(row.createdAt).substring(0, 19).replace('T', ' ') : ''}
                    </td>
                    <td className="db-grid-td text-gray-600 font-mono">
                      {row.updatedAt ? String(row.updatedAt).substring(0, 19).replace('T', ' ') : ''}
                    </td>
                  </tr>
                );
              })
            )}
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
