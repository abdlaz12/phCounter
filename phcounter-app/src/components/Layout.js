import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Bell, Settings, LogOut, Leaf, Cpu, Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MainLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil data user dari localStorage saat layout dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Tutup sidebar otomatis saat route berubah (navigasi mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  // Cegah scroll body saat sidebar mobile terbuka
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Fungsi Logout
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

  const SidebarContent = () => (
    <>
      {/* Logo / Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#10B981] p-2 rounded-xl">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">pH Monitor</h1>
          <p className="text-xs text-emerald-400">Eco Tech Sol.</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
              router.pathname === item.path
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                : 'text-gray-300 hover:bg-white/10'
            }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:text-white transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:text-orange-400 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ===== SIDEBAR DESKTOP (lg ke atas, selalu tampil) ===== */}
      <aside className="hidden lg:flex w-64 bg-[#064E3B] text-white flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ===== SIDEBAR MOBILE — Overlay Drawer ===== */}
      {/* Backdrop / overlay gelap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer slide-in dari kiri */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#064E3B] text-white flex flex-col lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Tombol close di dalam drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — hanya tampil di mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#064E3B] hover:bg-emerald-50 rounded-xl transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-[#064E3B]">pH Monitor</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-sm text-gray-500 font-medium">
              Welcome, <span className="text-[#10B981] font-bold">{user ? user.firstName : 'User'}</span>
            </span>
            <div
              onClick={() => router.push('/profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}