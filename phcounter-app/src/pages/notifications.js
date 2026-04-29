import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Helper untuk format waktu (Contoh: "2 mins ago")
const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "just now";
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FUNGSI UTAMA: Ambil data notifikasi dari API
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Opsional: Re-fetch setiap 30 detik agar seolah-olah real-time dari Wokwi
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">Notifications</h1>
          <p className="text-emerald-600/60 mt-1">Stay updated with system alerts and activities.</p>
        </div>
        <button className="text-sm text-emerald-600 hover:text-emerald-800 underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${getBgColor(notif.type)} transition-transform hover:scale-[1.01] cursor-pointer shadow-sm`}
            >
              <div className="p-2 rounded-full bg-white shadow-sm">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                  <span className="text-xs text-gray-400 font-medium">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed">
            No activities recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}