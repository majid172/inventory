"use client";

import React, { useState } from "react";
import Link from "next/link";

const mockSettings = [
  { id: 1, settingId: "CFG_001", keyName: "DATABASE_URL", value: "postgresql://user:pass@localhost:5432/db", group: "DATABASE", status: "ACTIVE", createdAt: "2026-07-10 08:30:00.000000000 AM", updatedAt: "2026-07-24 15:30:16.000000000 PM" },
  { id: 2, settingId: "CFG_002", keyName: "BACKUP_INTERVAL", value: "24h", group: "SYSTEM", status: "ACTIVE", createdAt: "2026-07-11 08:30:00.000000000 AM", updatedAt: "2026-07-26 15:54:41.000000000 PM" },
  { id: 3, settingId: "CFG_003", keyName: "SMTP_HOST", value: "smtp.mailtrap.io", group: "MAIL", status: "ACTIVE", createdAt: "2026-07-11 08:45:00.000000000 AM", updatedAt: "2026-07-26 15:18:38.000000000 PM" },
  { id: 4, settingId: "CFG_004", keyName: "SMTP_PORT", value: "587", group: "MAIL", status: "ACTIVE", createdAt: "2026-07-12 08:11:00.000000000 AM", updatedAt: "2026-07-23 15:36:28.000000000 PM" },
  { id: 5, settingId: "CFG_005", keyName: "MAX_CONNECTIONS", value: "100", group: "DATABASE", status: "ACTIVE", createdAt: "2026-07-12 08:19:00.000000000 AM", updatedAt: "2026-07-23 15:29:57.000000000 PM" },
  { id: 6, settingId: "CFG_006", keyName: "JWT_EXPIRY", value: "3600s", group: "SECURITY", status: "ACTIVE", createdAt: "2026-07-13 08:28:00.000000000 AM", updatedAt: "2026-07-29 15:16:58.000000000 PM" },
  { id: 7, settingId: "CFG_007", keyName: "DEBUG_MODE", value: "false", group: "SYSTEM", status: "DRAFT", createdAt: "2026-07-13 08:49:00.000000000 AM", updatedAt: "2026-07-28 15:17:45.000000000 PM" },
  { id: 8, settingId: "CFG_008", keyName: "CORS_ORIGIN", value: "*", group: "SECURITY", status: "ACTIVE", createdAt: "2026-07-14 08:33:00.000000000 AM", updatedAt: "2026-07-23 15:28:25.000000000 PM" },
  { id: 9, settingId: "CFG_009", keyName: "API_VERSION", value: "v1", group: "SYSTEM", status: "ACTIVE", createdAt: "2026-07-14 08:15:00.000000000 AM", updatedAt: "2026-07-27 15:50:34.000000000 PM" },
  { id: 10, settingId: "CFG_010", keyName: "IDLE_TIMEOUT", value: "15m", group: "SECURITY", status: "ACTIVE", createdAt: "2026-07-15 08:50:00.000000000 AM", updatedAt: "2026-07-25 15:49:55.000000000 PM" }
];

export default function SettingsTable() {
  const [selectedRow, setSelectedRow] = useState<number | null>(1);
  const [filterText, setFilterText] = useState("");

  const filteredData = mockSettings.filter(item => 
    item.keyName.toLowerCase().includes(filterText.toLowerCase()) ||
    item.settingId.toLowerCase().includes(filterText.toLowerCase()) ||
    item.group.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col bg-white text-gray-800 font-sans text-[12px]">
      {/* Top Toolbar */}
      <div className="flex items-center px-2 py-1.5 border-b border-gray-300 bg-[#f0f0f0] gap-4">
        <div className="flex space-x-2">
          <Link href="/admin/settings/new" className="px-2 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 flex items-center shadow-sm">
            <span className="text-green-600 font-bold mr-1">+</span> New Variable
          </Link>
          <button className="px-2 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 flex items-center shadow-sm text-gray-600">
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
            className="border border-gray-300 px-2 py-0.5 w-64 focus:outline-none focus:border-blue-500 text-[12px]"
            placeholder="Enter SQL filter..."
          />
        </div>
      </div>

      {/* Database Grid Container */}
      <div className="w-full overflow-x-auto bg-white">
        <table className="w-full text-left whitespace-nowrap border-collapse" style={{ tableLayout: 'auto' }}>
          <thead className="sticky top-0 bg-[#f0f0f0] text-gray-700 shadow-sm z-10 select-none">
            <tr>
              <th className="px-1 py-1 border border-gray-300 w-8 text-center font-normal bg-[#e8e8e8]"></th>
              
              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>SETTING_ID</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>KEY</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>VALUE</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>GROUP</span>
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
                  <span>CREATED_AT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>

              <th className="px-2 py-1 border border-gray-300 font-normal hover:bg-gray-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span>UPDATED_AT</span>
                  <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {filteredData.map((row) => {
              const isSelected = selectedRow === row.id;
              return (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedRow(row.id)}
                  className={`hover:bg-[#e6f2ff] cursor-default group border-b border-gray-300 ${isSelected ? "bg-[#e2f0fd] hover:bg-[#e2f0fd]" : ""}`}
                >
                  <td className={`px-2 py-0.5 border border-gray-300 text-center text-gray-500 bg-[#f9f9f9] font-medium w-8 ${isSelected ? "bg-[#d0e5ff]" : "group-hover:bg-[#d0e5ff]"}`}>
                    {row.id}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300 font-mono text-[12px] text-[#155bb5] hover:underline cursor-pointer">
                    {row.settingId}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300 font-mono text-gray-900">
                    {row.keyName}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300 text-gray-600 font-mono">
                    {row.value}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300">
                    {row.group}
                  </td>
                  <td className={`px-2 py-0.5 border border-gray-300 ${row.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'}`}>
                    {row.status}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300 text-gray-600 font-mono text-[12px]">
                    {row.createdAt}
                  </td>
                  <td className="px-2 py-0.5 border border-gray-300 text-gray-600 font-mono text-[12px]">
                    {row.updatedAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer StatusBar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#f0f0f0] border-t border-gray-300 text-[11px] text-gray-600">
        <div>{filteredData.length} rows fetched.</div>
        <div>Settings Database - Connected (0.012s)</div>
      </div>
    </div>
  );
}
