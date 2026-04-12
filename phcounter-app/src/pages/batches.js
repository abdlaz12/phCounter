import React from 'react';
import { Search, Filter, Download, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const batches = [
  { id: 'B-2024-001', status: 'Completed', date: '2024-02-10', yield: '450kg', operator: 'John Doe', initial: 'J' },
  { id: 'B-2024-002', status: 'Processing', date: '2024-02-11', yield: 'Pending', operator: 'Jane Smith', initial: 'J' },
  { id: 'B-2024-003', status: 'Quality Check', date: '2024-02-12', yield: '420kg', operator: 'Mike Ross', initial: 'M' },
  { id: 'B-2024-004', status: 'Failed', date: '2024-02-12', yield: '0kg', operator: 'John Doe', initial: 'J' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'Completed': return 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]';
    case 'Processing': return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
    case 'Quality Check': return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
    case 'Failed': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function BatchesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-emerald-600 font-medium mt-1">View and manage all production batches.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold shadow-sm hover:bg-emerald-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">
            <Plus className="w-4 h-4" /> Create Batch
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-emerald-50 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-emerald-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input 
              type="text" 
              placeholder="Search batches..." 
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />
          </div>
          <button className="p-3 border border-emerald-100 rounded-2xl hover:bg-emerald-50 text-emerald-600 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[#064E3B] font-bold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Batch ID</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date Started</th>
                <th className="px-8 py-5">Est. Yield</th>
                <th className="px-8 py-5">Operator</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-700">{batch.id}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{batch.date}</td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{batch.yield}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                        {batch.initial}
                      </div>
                      <span className="font-semibold text-slate-600 text-sm">{batch.operator}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-blue-100 rounded-xl text-blue-600 transition-all">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-xl text-red-600 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-[#F8FAFC] border-t border-emerald-50 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>Showing 1-4 of 24 batches</span>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-emerald-100 transition-all disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-white border border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm text-emerald-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}