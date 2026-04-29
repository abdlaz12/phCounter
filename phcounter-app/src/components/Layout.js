import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Bell, Settings, LogOut, Leaf, Cpu } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MainLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Ambil data user dari localStorage saat layout dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fungsi Logout Pro
  const handleLogout = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          resolve();
        }, 1000);
      }),
      {
        loading: 'Menghapus session...',
        success: () => {
          router.push('/login');
          return 'Berhasil keluar. Sampai jumpa!';
        },
        error: 'Gagal logout.',
      }
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Batch Management', icon: Package, path: '/batches' },
    { name: 'Device Management', icon: Cpu, path: '/devices' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Profile & Settings', icon: Settings, path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar - Mengikuti warna hijau tua di desain */}
      <aside className="w-64 bg-[#064E3B] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#10B981] p-2 rounded-xl">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">pH Monitor</h1>
            <p className="text-xs text-emerald-400">Eco Tech Sol.</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                router.pathname === item.path 
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' 
                : 'text-gray-300 hover:bg-white/10'
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:text-white transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:text-orange-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header sesuai image_4f133f.png */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-[#064E3B]">pH Monitor</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              Welcome, <span className="text-[#10B981] font-bold">{user ? user.firstName : 'User'}</span>
            </span>
            <div 
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=10B981&color=fff`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}