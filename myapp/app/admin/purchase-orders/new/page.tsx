"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("Dairy Fresh Inc.");
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Purchase Order created successfully!");
    router.push("/admin/purchase-orders");
  };

  return (
    <div className="w-full flex flex-col p-6 font-sans bg-[#fbfbfb] min-h-screen text-slate-800 max-w-2xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Purchase Order</h1>
        <p className="text-slate-500 text-[13px]">Issue a new procurement purchase order statement to a supplier.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col w-full">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-[#f8f9fa]">
          <h2 className="text-[14px] font-semibold text-slate-800">Order Information</h2>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Supplier</label>
            <div className="relative">
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-[13px] bg-white text-slate-800 w-full appearance-none pr-8 cursor-pointer"
              >
                <option value="Dairy Fresh Inc.">Dairy Fresh Inc.</option>
                <option value="Farm Co-op">Farm Co-op</option>
                <option value="Oat Organic Ltd.">Oat Organic Ltd.</option>
                <option value="Global Foods">Global Foods</option>
                <option value="Sweet Toppings Co.">Sweet Toppings Co.</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 250.00"
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Expected Delivery Date</label>
            <input
              type="date"
              required
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Initial Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-[13px] bg-white text-slate-800 w-full appearance-none pr-8 cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="SENT">SENT</option>
                <option value="RECEIVED">RECEIVED</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Notes / Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the supplier..."
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={() => router.push("/admin/purchase-orders")}
            className="h-8 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[13px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 px-4 bg-[#3b2013] hover:bg-[#29160d] text-white rounded text-[13px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            Save Purchase Order
          </button>
        </div>
      </form>
    </div>
  );
}
