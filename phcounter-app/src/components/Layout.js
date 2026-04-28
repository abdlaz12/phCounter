import React, { useState } from 'react';
import { LayoutDashboard, Package, Bell, Settings, LogOut, Leaf, Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MainLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Batch Management', icon: Package, path: '/batches' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Profile & Settings', icon: Settings, path: '/profile' },
  ];

  const SidebarContent = () => (
    <>
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
            <div
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                router.pathname === item.path
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open, always visible on lg+ */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-30
          w-64 bg-[#064E3B] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button — mobile only */}
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-white lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-[#064E3B] hover:text-emerald-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-[#064E3B]">pH Monitor</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Welcome</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1586073305502-5c5cc4a594bd"
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