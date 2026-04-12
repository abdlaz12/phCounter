import React from 'react';
import Link from 'next/link';
import { Leaf, Activity, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-[#10B981] p-1.5 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#064E3B]">pH Monitor</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-[#10B981] transition-colors">Features</a>
          <a href="#technology" className="hover:text-[#10B981] transition-colors">Technology</a>
          <Link href="/login" className="bg-[#064E3B] text-white px-6 py-2.5 rounded-full hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-100">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section - Startup Style */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-8 animate-bounce">
          <Zap className="w-3 h-3" /> NEXT GENERATION IOT MONITORING
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#064E3B] leading-[1.1] mb-6">
          Precision pH Monitoring <br /> 
          <span className="text-[#10B981]">for Eco-Enzyme.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tingkatkan efisiensi produksi Eco-Enzyme Anda dengan sistem monitoring IoT real-time. 
          Pantau, analisis, dan amankan setiap batch produksi dalam satu dashboard terintegrasi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-emerald-200">
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
            <Activity className="w-5 h-5" /> Documentation
          </button>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section id="features" className="bg-[#064E3B] py-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Real-time Analytics</h3>
            <p className="text-emerald-100/60 leading-relaxed">Dapatkan data sensor pH secara instan setiap detik langsung dari perangkat IoT Anda.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Quality Assurance</h3>
            <p className="text-emerald-100/60 leading-relaxed">Sistem peringatan dini (Early Warning) saat kadar pH berada di luar batas optimal produksi.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Eco-System Support</h3>
            <p className="text-emerald-100/60 leading-relaxed">Mendukung keberlanjutan lingkungan dengan optimasi limbah organik menjadi enzim berkualitas tinggi.</p>
          </div>
        </div>
        {/* Dekoratif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      </section>
    </div>
  );
}