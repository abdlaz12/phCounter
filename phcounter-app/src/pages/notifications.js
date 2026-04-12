import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const notifications = [
  { id: 2, type: 'success', title: 'Batch Completed', message: 'Batch #B-2024-001 has finished processing.', time: '1 hour ago' },
  { id: 3, type: 'info', title: 'System Update', message: 'System maintenance scheduled for tonight.', time: '2 hours ago' },
  { id: 4, type: 'info', title: 'New User Added', message: 'Sarah Connor joined as Operator.', time: '1 day ago' },
];

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
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 p-4 rounded-xl border ${getBgColor(notif.type)} transition-transform hover:scale-[1.01] cursor-pointer shadow-sm`}
          >
            <div className="p-2 rounded-full bg-white shadow-sm">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}