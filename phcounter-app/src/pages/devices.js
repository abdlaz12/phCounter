import React, { useState, useEffect } from 'react';
import { Plus, Cpu, Copy, Check, Trash2, X, Save, Loader2, Info, Leaf, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ deviceId: '', nameLabel: '' });
  const [copiedId, setCopiedId] = useState(null);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setDevices(result.data);
    } catch (err) {
      toast.error("Failed to sync infrastructure data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Device registered successfully!");
        setIsModalOpen(false);
        setFormData({ deviceId: '', nameLabel: '' });
        fetchDevices();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("System communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!confirm("Are you sure? This will also delete all batches connected to this device.")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchDevices(); 
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to communicate with server.");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("API Key copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Device Management</h1>
          <p className="text-emerald-600 font-medium mt-1 text-sm sm:text-base">Register and monitor your IoT hardware infrastructure.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all justify-center self-start sm:self-auto text-sm"
        >
          <Plus className="w-5 h-5" /> Register New Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500 mb-4 opacity-30" />
            Synchronizing...
          </div>
        ) : devices.length > 0 ? (
          devices.map((device) => (
            <div key={device._id} className="bg-white p-6 rounded-[32px] border border-emerald-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${device.statusOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${device.statusOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {device.statusOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteDevice(device._id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-1">{device.nameLabel}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mb-6">Device ID: {device.deviceId}</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group/key">
                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1 tracking-widest">IoT API Access Key</label>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-bold text-emerald-700 truncate mr-8">{device.apiKey}</code>
                  <button 
                    onClick={() => copyToClipboard(device.apiKey, device._id)}
                    className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all"
                  >
                    {copiedId === device._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-emerald-200 text-slate-400 font-medium italic">
            No devices registered yet. Click the button above to start.
          </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl overflow-hidden border border-emerald-50">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Hardware</h2>
                    <p className="text-sm text-emerald-600 font-medium">Link your Wokwi simulation device.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><X /></button>
              </div>

              <form onSubmit={handleAddDevice} className="space-y-6">
                {/* Input 1: Hardware ID */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
                    <Cpu className="w-3 h-3" /> Hardware ID (Wokwi ID)
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: ESP32-LAB-01" 
                    value={formData.deviceId} 
                    onChange={(e) => setFormData({...formData, deviceId: e.target.value})} 
                    className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white transition-all" 
                  />
                </div>

                {/* Input 2: Asset Label */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Asset Label
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Tangki Utama A" 
                    value={formData.nameLabel} 
                    onChange={(e) => setFormData({...formData, nameLabel: e.target.value})} 
                    className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white transition-all" 
                  />
                </div>

                <button disabled={isSaving} className="w-full py-4 bg-[#10B981] text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Asset</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}