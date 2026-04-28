import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Data dummy disesuaikan dengan field dari BatchSchema
const batches = [
  {
    _id: '69eb49de5282169f33eb0b64',
    nameBatch: 'Batch Dapur Mei',
    status: 'Aktif',
    startDate: '2026-04-24',
    endDate: null,
    notes: 'Resep pertama coba-coba',
    latestReading: { pH: 3.4, timestamp: '2026-04-24T10:45:50.249Z' },
    deviceId: '69eb3d8334e830e79525b4be',
  },
  {
    _id: '69eb49de5282169f33eb0b65',
    nameBatch: 'Batch Enzim #2',
    status: 'Selesai',
    startDate: '2026-04-10',
    endDate: '2026-04-20',
    notes: null,
    latestReading: { pH: 3.8, timestamp: '2026-04-20T08:00:00.000Z' },
    deviceId: '69eb3d8334e830e79525b4be',
  },
  {
    _id: '69eb49de5282169f33eb0b66',
    nameBatch: 'Batch Kulit Nanas',
    status: 'Anomali',
    startDate: '2026-04-15',
    endDate: null,
    notes: 'pH turun drastis di hari ke-3',
    latestReading: { pH: 1.9, timestamp: '2026-04-18T14:22:00.000Z' },
    deviceId: '69eb3d8334e830e79525b4be',
  },
  {
    _id: '69eb49de5282169f33eb0b67',
    nameBatch: 'Batch Pepaya Muda',
    status: 'Aktif',
    startDate: '2026-04-22',
    endDate: null,
    notes: null,
    latestReading: { pH: null, timestamp: null },
    deviceId: '69eb3d8334e830e79525b4be',
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'Selesai':  return 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]';
    case 'Aktif':    return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
    case 'Anomali':  return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
    default:         return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const PHBadge = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-slate-300 font-medium italic text-sm">Belum ada</span>;
  }
  const color =
    value < 2.5 ? 'text-red-600 bg-red-50 border-red-200' :
    value <= 4.5 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                   'text-orange-600 bg-orange-50 border-orange-200';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
      pH {value.toFixed(1)}
    </span>
  );
};

export default function BatchesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const statusOptions = ['Semua', 'Aktif', 'Selesai', 'Anomali'];

  const filtered = batches.filter((b) => {
    const matchSearch = b.nameBatch.toLowerCase().includes(search.toLowerCase()) ||
                        b._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-emerald-600 font-medium mt-1 text-sm sm:text-base">
            Kelola semua batch produksi eco-enzyme Anda.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold shadow-sm hover:bg-emerald-50 transition-all text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#10B981] text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all text-sm">
            <Plus className="w-4 h-4" /> Buat Batch
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-emerald-50 overflow-hidden">

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-emerald-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama batch atau ID..."
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />
          </div>
          {/* Status Filter Pills */}
          <div className="flex gap-2 flex-wrap items-center">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  filterStatus === s
                    ? 'bg-[#10B981] text-white border-[#10B981] shadow-sm'
                    : 'bg-[#F8FAFC] text-slate-500 border-emerald-100 hover:bg-emerald-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[#064E3B] font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Batch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Mulai</th>
                <th className="px-6 py-4">Tanggal Selesai</th>
                <th className="px-6 py-4">pH Terakhir</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Tidak ada batch ditemukan.
                  </td>
                </tr>
              ) : filtered.map((batch) => (
                <tr key={batch._id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{batch.nameBatch}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{batch._id.slice(-8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{formatDate(batch.startDate)}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{formatDate(batch.endDate)}</td>
                  <td className="px-6 py-4">
                    <PHBadge value={batch.latestReading?.pH} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm italic max-w-[160px] truncate">
                    {batch.notes || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-all" title="Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-blue-100 rounded-xl text-blue-600 transition-all" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-xl text-red-600 transition-all" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-emerald-50">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-400 font-medium">Tidak ada batch ditemukan.</p>
          ) : filtered.map((batch) => (
            <div key={batch._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800">{batch.nameBatch}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{batch._id.slice(-8)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${getStatusStyle(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Mulai</p>
                  <p className="text-slate-600 font-semibold">{formatDate(batch.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Selesai</p>
                  <p className="text-slate-600 font-semibold">{formatDate(batch.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">pH Terakhir</p>
                  <PHBadge value={batch.latestReading?.pH} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Catatan</p>
                  <p className="text-slate-500 italic text-xs truncate">{batch.notes || '—'}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-semibold transition-all">
                  <Eye className="w-4 h-4" /> Detail
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-semibold transition-all">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-all">
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC] border-t border-emerald-50 flex items-center justify-between text-sm font-semibold text-slate-500">
          <span>Menampilkan {filtered.length} dari {batches.length} batch</span>
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