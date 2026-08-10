"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockStockIn = Array.from({ length: 20 }).map((_, i) => {
  const ingredients = ["Espresso Beans (Dark Roast)", "Whole Milk (Organic)", "Oat Milk (Barista)", "Brown Sugar Syrups", "Paper Coffee Cups (12oz)"];
  const suppliers = ["Farm Co-op", "Dairy Fresh Inc.", "Oat Organic Ltd.", "Global Foods", "Eco Pack Co."];
  const quantities = ["50 kg", "60 liters", "40 liters", "15 liters", "500 pieces"];
  const costs = ["625.00", "120.00", "140.00", "45.00", "75.00"];

  const index = i % ingredients.length;
  const createdDay = 10 + (i % 20);

  return {
    id: i + 1,
    transactionId: `TXIN_${String(i).padStart(3, '0')}`,
    ingredient: ingredients[index],
    quantity: quantities[index],
    supplier: suppliers[index],
    receivedBy: "Sarah Jenkins",
    cost: costs[index],
    receivedAt: `2026-07-${createdDay} 09:15:00.000000000 AM`
  };
});

export default function StockInTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockStockIn.filter(item => 
    item.transactionId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.ingredient.toLowerCase().includes(filterText.toLowerCase()) ||
    item.supplier.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/stock-in/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Stock In
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
              <th className="cursor-pointer group"><span>SUPPLIER</span></th>
              <th className="cursor-pointer group"><span>RECEIVED_BY</span></th>
              <th className="cursor-pointer group text-right"><span>COST</span></th>
              <th className="cursor-pointer group"><span>RECEIVED_AT</span></th>
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
                  <td className="db-grid-td text-gray-600">{row.supplier}</td>
                  <td className="db-grid-td text-gray-600">{row.receivedBy}</td>
                  <td className="db-grid-td text-right font-mono text-green-700">${row.cost}</td>
                  <td className="db-grid-td text-gray-600 font-mono">{row.receivedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="db-grid-footer">
        <div>{filteredData.length} rows fetched.</div>
        <div>Stock In Database - Connected (0.010s)</div>
      </div>
    </div>
  );
}
