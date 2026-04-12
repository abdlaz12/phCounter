import React, { useState } from 'react';
import { User, Settings, Shield, Mail, Phone, Briefcase, Camera, MapPin, Calendar, Edit2, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      {/* Profile Header Card - Sesuai image_4f1375.jpg */}
      <div className="bg-[#10B981] rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1586073305502-5c5cc4a594bd" 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-white text-[#10B981] rounded-full shadow-lg hover:bg-emerald-50 transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">John Doe</h1>
            <p className="text-emerald-50 flex items-center justify-center md:justify-start gap-2 font-medium">
              <Briefcase className="w-4 h-4 text-white/80" /> Senior Eco-Enzyme Specialist
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-emerald-50/90 text-sm">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> john.doe@ecomonitor.com</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Jakarta, Indonesia</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined Jan 2024</span>
            </div>
          </div>

          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm border border-white/20">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        {/* Dekorasi lingkaran transparan khas UI modern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>

      {/* Tab Navigation - Sesuai image_4f1375.jpg */}
      <div className="bg-white rounded-2xl border border-emerald-50 p-1.5 flex gap-2 shadow-sm">
        {[
          { id: 'profile', name: 'Profile', icon: User },
          { id: 'settings', name: 'Settings', icon: Settings },
          { id: 'security', name: 'Security', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
              ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-100' 
              : 'text-slate-500 hover:bg-emerald-50 hover:text-[#10B981]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.name}
          </button>
        ))}
      </div>

      {/* Form Content - Sesuai image_4f137b.png */}
      <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#064E3B] flex items-center gap-2">
              <User className="w-5 h-5 text-[#10B981]" /> Personal Information
            </h2>
            <button className="text-[#10B981] font-bold text-sm flex items-center gap-1.5 hover:underline">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField label="Full Name" defaultValue="John Doe" />
            <InputField label="Email Address" defaultValue="john.doe@ecomonitor.com" type="email" />
            <InputField label="Phone Number" defaultValue="+62 812 3456 7890" />
            <InputField label="Job Title" defaultValue="Senior Eco-Enzyme Specialist" />
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Department</label>
              <select className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-600 appearance-none">
                <option>Production</option>
                <option>R&D</option>
              </select>
            </div>
            
            <InputField label="Location" defaultValue="Jakarta, Indonesia" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#064E3B] mb-4">Bio</h2>
          <textarea 
            rows={4}
            className="w-full px-5 py-4 bg-[#F8FAFC] border border-emerald-100 rounded-3xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-600 resize-none leading-relaxed"
            defaultValue="Passionate about sustainable eco-enzyme production with 5+ years of experience in fermentation process optimization."
          />
        </section>

        <div className="pt-6 border-t border-emerald-50 flex justify-end gap-4">
          <button className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-200">
            Cancel
          </button>
          <button className="px-8 py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, defaultValue, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input 
        type={type}
        defaultValue={defaultValue}
        className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-600 transition-all"
      />
    </div>
  );
}