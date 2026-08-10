"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockWastage = Array.from({ length: 20 }).map((_, i) => {
  const items = ["Espresso Beans (Dark Roast)", "Whole Milk (Organic)", "Oat Milk (Barista)", "Chocolate Muffin", "Blueberry Scone"];
  const quantities = ["0.5 kg", "2.0 liters", "1.5 liters", "3 pieces", "2 pieces"];
  const costs = ["6.25", "4.00", "5.25", "9.60", "6.00"];
  const reasons = ["Machine Calibration", "Expired / Sour", "Spilled by Staff", "Stale / Day Old", "Dropped / Damaged"];

  const index = i % items.length;
  const createdDay = 10 + (i % 20);

  return {
    id: i + 1,
    wastageId: `WST_${String(i).padStart(3, '0')}`,
    item: items[index],
    quantity: quantities[index],
    costLost: costs[index],
    reason: reasons[index],
    reportedBy: "Sarah Jenkins",
    reportedAt: `2026-07-${createdDay} 10:45:00.000000000 AM`
  };
});

export default function WastageTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockWastage.filter(item => 
    item.wastageId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.item.toLowerCase().includes(filterText.toLowerCase()) ||
    item.reason.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/wastage/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Wastage Record
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
              <th className="cursor-pointer group"><span>WASTAGE_ID</span></th>
              <th className="cursor-pointer group"><span>ITEM_NAME</span></th>
              <th className="cursor-pointer group"><span>QUANTITY</span></th>
              <th className="cursor-pointer group text-right"><span>COST_LOST</span></th>
              <th className="cursor-pointer group"><span>REASON</span></th>
              <th className="cursor-pointer group"><span>REPORTED_BY</span></th>
              <th className="cursor-pointer group"><span>REPORTED_AT</span></th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((row) => {
              const isSelected = selectedRow === row.id;
              return (
                <tr key={row.id} onClick={() => setSelectedRow(row.id)} className={isSelected ? "isSelected" : ""}>
                  <td className="db-grid-idx">{row.id}</td>
                  <td className="db-grid-td db-grid-link">{row.wastageId}</td>
                  <td className="db-grid-td font-semibold text-slate-800">{row.item}</td>
                  <td className="db-grid-td font-mono">{row.quantity}</td>
                  <td className="db-grid-td text-right font-mono text-red-600">${row.costLost}</td>
                  <td className="db-grid-td text-gray-600">{row.reason}</td>
                  <td className="db-grid-td text-gray-600">{row.reportedBy}</td>
                  <td className="db-grid-td text-gray-600 font-mono">{row.reportedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="db-grid-footer">
        <div>{filteredData.length} rows fetched.</div>
        <div>Wastage Database - Connected (0.010s)</div>
      </div>
    </div>
  );
}
