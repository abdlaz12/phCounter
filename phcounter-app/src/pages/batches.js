import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Eye, Trash2, Check,
  Loader2, X, Save, Layout, Info, Cpu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const getStatusStyle = (status) => {
  switch (status) {
    case 'Completed': return 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]';
    case 'Processing': return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
    case 'Quality Check': return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
    case 'Failed': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [devices, setDevices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    batchName: '',
    description: '',
    targetYield: '',
    deviceId: '' 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      };

      const [batchRes, deviceRes] = await Promise.all([
        fetch('/api/batches', { headers }),
        fetch('/api/devices', { headers })
      ]);

      if (!batchRes.ok) {
        console.error("Batch Server Error:", await batchRes.text());
        toast.error("Server gagal memuat data Batch.");
      } else {
        const batchResult = await batchRes.json();
        if (batchResult.success) setBatches(batchResult.data);
        else toast.error(batchResult.message || "Gagal mengambil data batches.");
      }

      if (!deviceRes.ok) {
        console.error("Device Server Error:", await deviceRes.text());
        toast.error("Server gagal memuat data Device.");
      } else {
        const deviceResult = await deviceRes.json();
        if (deviceResult.success) setDevices(deviceResult.data);
        else toast.error(deviceResult.message || "Gagal mengambil data devices.");
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Gagal sinkronisasi dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.deviceId) {
      toast.error("Please select a hardware device for this batch.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'Processing' 
        }),
      });

      if (!res.ok) {
        toast.error(`Server error: ${res.status}`);
        return;
      }

      const result = await res.json();
      if (result.success) {
        toast.success("New batch successfully created and linked.");
        setIsModalOpen(false);
        setFormData({ batchName: '', description: '', targetYield: '', deviceId: '' });
        fetchData();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to mark this batch as ${newStatus}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/batches/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("Gagal memperbarui status. Server error.");
        return;
      }

      const result = await res.json();
      if (result.success) {
        toast.success(`Batch status updated to ${newStatus}`);
        fetchData(); 
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this batch? All associated sensor readings will be permanently removed.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/batches/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Batch removed successfully.");
        setBatches(batches.filter(b => b._id !== id));
      } else {
        toast.error("Gagal menghapus batch.");
      }
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  const filteredBatches = batches.filter(batch => 
    batch.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.deviceId?.nameLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-emerald-600 font-medium mt-1">Monitor and control your fermentation infrastructure.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Create New Batch
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-emerald-50 overflow-hidden">
        <div className="p-6 border-b border-emerald-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input 
              type="text" 
              placeholder="Search by Batch Name or Device Label..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[#064E3B] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Batch Identity</th>
                <th className="px-8 py-5">Assigned Hardware</th>
                <th className="px-8 py-5">Lifecycle Status</th>
                <th className="px-8 py-5">Start Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500" /></td>
                </tr>
              ) : filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800">{batch.batchName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">System ID: {batch._id}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-600">{batch.deviceId?.nameLabel || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {new Date(batch.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {batch.status === 'Processing' && (
                          <button 
                            onClick={() => handleUpdateStatus(batch._id, 'Completed')}
                            className="p-2.5 bg-white border border-emerald-100 rounded-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Mark as Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2.5 bg-white border border-emerald-100 rounded-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(batch._id)} className="p-2.5 bg-white border border-red-100 rounded-xl text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic">No batch records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-emerald-50 overflow-hidden" >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">New Batch Configuration</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><X /></button>
                </div>

                <form onSubmit={handleCreateBatch} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                       <Layout className="w-3 h-3" /> Batch Name
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Tank A - Fermentation Phase 1" 
                      value={formData.batchName} 
                      onChange={(e) => setFormData({...formData, batchName: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900 placeholder:text-slate-400" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                       <Cpu className="w-3 h-3" /> Hardware Assignment
                    </label>
                    <select 
                      required 
                      value={formData.deviceId} 
                      onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900 appearance-none"
                    >
                      <option value="" className="text-slate-400">Select an available device...</option>
                      {devices.map(dev => (
                        <option key={dev._id} value={dev._id} className="text-slate-900 font-bold">
                          {dev.nameLabel} ({dev.deviceId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                         <Info className="w-3 h-3" /> Target Yield (Kg)
                      </label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        value={formData.targetYield} 
                        onChange={(e) => setFormData({...formData, targetYield: e.target.value})} 
                        className="w-full px-5 py-4 bg-slate-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900 placeholder:text-slate-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Default Status</label>
                      <div className="px-5 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-center border border-emerald-100 uppercase text-[10px] tracking-widest">Processing</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Technical Notes</label>
                    <textarea 
                      placeholder="Ingredients, environment conditions, etc." 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900 placeholder:text-slate-400 min-h-[80px] resize-none" 
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                    <button disabled={isSaving} className="flex-1 py-4 bg-[#10B981] text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Configuration</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}