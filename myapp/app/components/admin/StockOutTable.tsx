"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockStockOut = Array.from({ length: 20 }).map((_, i) => {
  const ingredients = ["Espresso Beans (Dark Roast)", "Whole Milk (Organic)", "Oat Milk (Barista)", "Brown Sugar Syrups", "Paper Coffee Cups (12oz)"];
  const quantities = ["4 kg", "15 liters", "12 liters", "3 liters", "120 pieces"];
  const reasons = ["Daily Bar Consumption", "Daily Bar Consumption", "Spill & Spoilage", "Daily Bar Consumption", "Daily Bar Consumption"];

  const index = i % ingredients.length;
  const createdDay = 10 + (i % 20);

  return {
    id: i + 1,
    transactionId: `TXOUT_${String(i).padStart(3, '0')}`,
    ingredient: ingredients[index],
    quantity: quantities[index],
    reason: reasons[index],
    dispatchedBy: "Sarah Jenkins",
    dispatchedAt: `2026-07-${createdDay} 19:30:00.000000000 PM`
  };
});

export default function StockOutTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockStockOut.filter(item => 
    item.transactionId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.ingredient.toLowerCase().includes(filterText.toLowerCase()) ||
    item.reason.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/stock-out/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Stock Out
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
              <th className="cursor-pointer group"><span>TRANSACTION_ID</span></th>
              <th className="cursor-pointer group"><span>INGREDIENT</span></th>
              <th className="cursor-pointer group"><span>QUANTITY</span></th>
              <th className="cursor-pointer group"><span>REASON</span></th>
              <th className="cursor-pointer group"><span>DISPATCHED_BY</span></th>
              <th className="cursor-pointer group"><span>DISPATCHED_AT</span></th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((row) => {
              const isSelected = selectedRow === row.id;
              return (
                <tr key={row.id} onClick={() => setSelectedRow(row.id)} className={isSelected ? "isSelected" : ""}>
                  <td className="db-grid-idx">{row.id}</td>
                  <td className="db-grid-td db-grid-link">{row.transactionId}</td>
                  <td className="db-grid-td font-semibold text-slate-800">{row.ingredient}</td>
                  <td className="db-grid-td font-mono">{row.quantity}</td>
                  <td className="db-grid-td text-gray-600">{row.reason}</td>
                  <td className="db-grid-td text-gray-600">{row.dispatchedBy}</td>
                  <td className="db-grid-td text-gray-600 font-mono">{row.dispatchedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="db-grid-footer">
        <div>{filteredData.length} rows fetched.</div>
        <div>Stock Out Database - Connected (0.010s)</div>
      </div>
    </div>
  );
}
