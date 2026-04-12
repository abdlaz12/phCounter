import React, { useState } from 'react';
import { 
  User, Settings, Shield, Bell, Mail, Briefcase, Camera, Lock,
  Eye, EyeOff, Download, Trash2, LogOut, MapPin, Calendar, Edit2, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = () => toast.success('Profile updated successfully!');
  const handleSaveSettings = () => toast.success('Settings saved successfully!');
  const handleChangePassword = () => toast.success('Password changed successfully!');
  const handleExportData = () => toast.info('Preparing your data export...');
  const handleDeleteAccount = () => toast.error('Account deletion requested');
  const handleLogout = () => toast.info('Logging out...');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      {/* Profile Header */}
      <div className="bg-[#10B981] rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1586073305502-5c5cc4a594bd?fit=max&w=400" 
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

          <button 
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm border border-white/20"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        <div c  lassName="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>

      {/* Tab Navigation */}
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

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
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
                  <option>Quality Control</option>
                  <option>Research & Development</option>
                  <option>Management</option>
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
            <button 
              onClick={handleSaveProfile}
              className="px-8 py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Notification Preferences */}
          <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#064E3B] mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#10B981]" /> Notification Preferences
            </h2>
            <div className="space-y-5">
              {[
                { label: 'Critical pH Alerts', desc: 'Get notified when pH levels fall outside optimal range', checked: true },
                { label: 'Email Notifications', desc: 'Receive daily summary reports via email', checked: true },
                { label: 'Desktop Notifications', desc: 'Enable browser push notifications', checked: false },
              ].map((item) => (
                <label key={item.label} className="flex items-start gap-4 cursor-pointer group">
                  <input type="checkbox" defaultChecked={item.checked} className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                  <div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#10B981]">{item.label}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* pH Monitoring Settings */}
          <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#064E3B] mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#10B981]" /> pH Monitoring Settings
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField label="Optimal pH Range (Min)" defaultValue="3.5" type="number" />
                <InputField label="Optimal pH Range (Max)" defaultValue="4.5" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Alert Threshold</label>
                <select className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-600 appearance-none">
                  <option>Immediate (Any deviation)</option>
                  <option defaultValue>Warning (±0.2 pH units)</option>
                  <option>Critical (±0.5 pH units)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-200">
              Reset to Default
            </button>
            <button 
              onClick={handleSaveSettings}
              className="px-8 py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#064E3B] mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#10B981]" /> Change Password
            </h2>
            <div className="space-y-5 max-w-md">
              <InputField label="Current Password" defaultValue="" type="password" />
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full px-5 py-3.5 pr-12 bg-[#F8FAFC] border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">Minimum 8 characters with letters and numbers</p>
              </div>
              <InputField label="Confirm New Password" defaultValue="" type="password" />
              <button 
                onClick={handleChangePassword}
                className="w-full py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#064E3B] mb-6">Data & Privacy</h2>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <Download className="w-5 h-5 text-[#10B981]" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Export Your Data</p>
                    <p className="text-xs text-slate-400">Download a copy of all your data</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Delete Account</p>
                    <p className="text-xs text-red-400">Permanently delete your account and all data</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}