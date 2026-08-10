"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockSuppliers = Array.from({ length: 30 }).map((_, i) => {
  const names = ["Apple Inc", "Nike Logistics", "Farm Co-op", "Sony Distributors", "Levis Apparel", "Global Foods", "Starbucks Supplier", "Toyota Auto Parts", "Dell Enterprise", "Nestle Wholesale"];
  const contacts = ["Sarah Connor", "Michael Scott", "Dwight Schrute", "Bruce Wayne", "Clark Kent", "Peter Parker", "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Barry Allen"];
  const domains = ["apple.com", "nike.com", "farmco.org", "sony.com", "levis.com", "globalfoods.net", "starbucks.com", "toyota.com", "dell.com", "nestle.com"];

  const index = i % names.length;
  const name = names[index] + (i >= names.length ? ` #${Math.ceil(i / names.length)}` : "");
  const contact = contacts[i % contacts.length];
  const email = `${contact.toLowerCase().replace(" ", ".")}@${domains[index]}`;
  const phone = `+1-555-01${String(i).padStart(2, '0')}`;

  const createdDay = 10 + (i % 20);
  const updatedDay = createdDay + (i % 5);

  return {
    id: i + 1,
    supplierId: `SUP_${String(i).padStart(3, '0')}`,
    name: name,
    contactName: contact,
    email: email,
    phone: phone,
    status: i % 6 === 0 ? "INACTIVE" : "ACTIVE",
    createdAt: `2026-07-${createdDay} 08:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 AM`,
    updatedAt: `2026-07-${updatedDay} 15:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}.000000000 PM`
  };
});

export default function SuppliersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(5);
  const [filterText, setFilterText] = useState("");
  const itemsPerPage = 20;

  const filteredData = mockSuppliers.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) ||
    item.supplierId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.contactName.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="db-grid-container">
      {/* Top Toolbar */}
      <div className="db-grid-toolbar">
        <div className="flex space-x-2">
          <Link href="/admin/suppliers/new" className="db-grid-button">
            <span className="text-green-600 font-bold mr-1">+</span> New Supplier
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
                  <span>SUPPLIER_ID</span>
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
                  <span>CONTACT_NAME</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>EMAIL</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>PHONE</span>
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
                    {row.supplierId}
                  </td>
                  <td className="db-grid-td">
                    {row.name}
                  </td>
                  <td className="db-grid-td">
                    {row.contactName}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.email}
                  </td>
                  <td className="db-grid-td text-gray-600 font-mono">
                    {row.phone}
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
        <div className="flex items-center space-x-4">
          <span>{filteredData.length} rows fetched.</span>
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
        </div>
        <div>Suppliers Database - Connected (0.012s)</div>
      </div>
    </div>
  );
}
