"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");

  // Automatically generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Category created successfully!");
    router.push("/admin/categories");
  };

  return (
    <div className="w-full flex flex-col p-6 font-sans bg-[#fbfbfb] min-h-screen text-slate-800 max-w-2xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create New Category</h1>
        <p className="text-slate-500 text-[13px]">Create a new menu or inventory category group.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col w-full">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-[#f8f9fa]">
          <h2 className="text-[14px] font-semibold text-slate-800">Category Information</h2>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Hot Drinks"
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., hot-drinks"
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-[13px] bg-white text-slate-800 w-full appearance-none pr-8 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the category..."
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white text-slate-800 w-full resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="h-8 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[13px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 px-4 bg-[#3b2013] hover:bg-[#29160d] text-white rounded text-[13px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            Save Category
          </button>
        </div>
      </form>
    </div>
  );
}
