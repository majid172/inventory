"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockOrders = Array.from({ length: 25 }).map((_, i) => {
  const suppliers = ["Dairy Fresh Inc.", "Farm Co-op", "Oat Organic Ltd.", "Global Foods", "Sweet Toppings Co.", "Zen Tea Distributors", "Eco Pack Co."];
  const amounts = ["250.00", "1250.50", "420.00", "890.75", "180.00", "320.00", "640.20"];
  const statuses = ["RECEIVED", "SENT", "PENDING", "CANCELLED"];

  const supplier = suppliers[i % suppliers.length];
  const amount = amounts[i % amounts.length];
  const status = i % 8 === 0 ? "CANCELLED" : i % 5 === 0 ? "PENDING" : i % 3 === 0 ? "SENT" : "RECEIVED";
  
  const createdDay = 10 + (i % 20);
  const expectedDay = createdDay + 3;

  return {
    id: i + 1,
    poId: `PO_${String(i).padStart(3, '0')}`,
    supplier: supplier,
    totalAmount: amount,
    status: status,
    orderDate: `2026-07-${createdDay} 09:00:00.000000000 AM`,
    expectedDate: `2026-07-${expectedDay} 17:00:00.000000000 PM`,
    createdAt: `2026-07-${createdDay} 08:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 AM`,
    updatedAt: `2026-07-${createdDay + 1} 15:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 PM`
  };
});

export default function PurchaseOrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockOrders.filter(item => 
    item.poId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.supplier.toLowerCase().includes(filterText.toLowerCase()) ||
    item.status.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/purchase-orders/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Purchase Order
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
                  <span>PO_ID</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>SUPPLIER</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>TOTAL_AMOUNT</span>
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
                  <span>ORDER_DATE</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>EXPECTED_DATE</span>
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
                    {row.poId}
                  </td>
                  <td className="db-grid-td">
                    {row.supplier}
                  </td>
                  <td className="db-grid-td text-right font-mono">
                    ${row.totalAmount}
                  </td>
                  <td className={`db-grid-td font-semibold ${
                    row.status === 'RECEIVED' ? 'db-grid-status-active' : row.status === 'PENDING' ? 'db-grid-status-pending' : row.status === 'SENT' ? 'text-blue-600' : 'db-grid-status-failed'
                  }`}>
                    {row.status}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.orderDate}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.expectedDate}
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
        <div>Purchase Orders Database - Connected (0.015s)</div>
      </div>
    </div>
  );
}
