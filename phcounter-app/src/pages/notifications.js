import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, Loader2, Trash2, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const interval = seconds / 60;
  if (interval < 60) return Math.floor(interval) + " mins ago";
  const hours = interval / 60;
  if (hours < 24) return Math.floor(hours) + " hours ago";
  return Math.floor(hours / 24) + " days ago";
};

const getIcon = (type) => {
  switch (type) {
    case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case 'info': return <Info className="w-5 h-5 text-blue-600" />;
    default: return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const getBgColor = (type) => {
  switch (type) {
    case 'alert': return 'bg-amber-50 border-amber-100';
    case 'success': return 'bg-emerald-50 border-emerald-100';
    case 'info': return 'bg-blue-50 border-blue-100';
    default: return 'bg-gray-50 border-gray-100';
  }
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // State untuk Filtering Tabs

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notification', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      toast.error("Failed to sync notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notification/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.filter(n => n._id !== id));
        toast.success("Notification dismissed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Hapus semua riwayat notifikasi?")) return;
    toast.success("All notifications cleared locally");
    setNotifications([]);
    // Tambahkan endpoint DELETE /api/notification/clear jika diperlukan di backend
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Logika Filtering (Sesuai kebutuhan pengorganisasian data)
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">Notifications</h1>
          <p className="text-emerald-600/60 mt-1">Stay updated with system alerts and activities.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Filtering Tabs (Tetap Tema Emerald) */}
      <div className="flex gap-2 border-b border-emerald-100 pb-1">
        {['all', 'alert', 'success', 'info'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 ${
              activeFilter === tab 
                ? 'border-emerald-500 text-emerald-700' 
                : 'border-transparent text-slate-400 hover:text-emerald-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Section */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-4 p-5 rounded-2xl border ${getBgColor(notif.type)} shadow-sm transition-all group`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-sm h-fit">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 leading-tight">{notif.title}</h3>
                    {notif.batchId && (
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-100 text-emerald-700 font-black uppercase tracking-tighter">
                            Batch: {notif.batchId.nameBatch || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {formatTime(notif.createdAt)}
                    </span>
                    {/* Individual Action Button: Delete */}
                    <button 
                        onClick={() => handleDeleteNotif(notif._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{notif.message}</p>
                
                {/* Action Buttons (Sesuai F-10) */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-black/5">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> View Batch
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 italic bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            No {activeFilter === 'all' ? '' : activeFilter} notifications found.
          </div>
        )}
      </div>
    </div>
  );
}