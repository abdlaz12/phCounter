import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  User, Settings, Shield, Bell, Mail, Briefcase, Lock,
  Eye, EyeOff, LogOut, Calendar, Save, RefreshCcw, Check
} from 'lucide-react';
import { toast } from 'sonner';

// Komponen InputField agar UI tetap konsisten
function InputField({ label, value, type = "text", onChange, name, disabled = false }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input 
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-5 py-3.5 border rounded-2xl outline-none font-medium transition-all ${
          disabled 
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
          : 'bg-[#F8FAFC] border-emerald-100 text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
        }`}
      />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // State khusus ganti password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  // Handler Input untuk Profile & Notifications
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handlePreferenceToggle = (prefKey) => {
    setUserData({
      ...userData,
      preferences: {
        ...userData.preferences,
        [prefKey]: !userData.preferences?.[prefKey]
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    toast.success('Berhasil logout');
  };

  // FUNGSI SAVE: Untuk Profile & Preferences Notifikasi
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          preferences: userData.preferences // Kirim pilihan notifikasi juga
        }),
      });

      const result = await res.json();
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.data));
        toast.success('Perubahan tersimpan! Silakan reload halaman.', {
          duration: 5000,
          action: { label: 'Reload', onClick: () => window.location.reload() }
        });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI SECURITY: Ganti Password
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok.");
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Password diperbarui!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-700">
      {/* Header Banner - UI Sesuai Permintaan */}
      <div className="bg-[#10B981] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-emerald-50">
            <img src={`https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random&size=128`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">{userData.firstName} {userData.lastName}</h1>
            <p className="text-emerald-50 flex items-center justify-center md:justify-start gap-2 font-medium">
              <Briefcase className="w-4 h-4" /> {userData.role}
            </p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 border border-white/20 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>

      {/* Navigasi Tab */}
      <div className="bg-white rounded-2xl border border-emerald-50 p-1.5 flex gap-2 shadow-sm">
        {[
          { id: 'profile', name: 'Profile', icon: User },
          { id: 'security', name: 'Security', icon: Shield },
          { id: 'notifications', name: 'Notification Choice', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:bg-emerald-50 hover:text-[#10B981]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.name}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm p-8 min-h-[400px]">
        
        {/* TAB 1: PROFILE BIODATA */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-[#064E3B] flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#10B981]" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="First Name" name="firstName" value={userData.firstName} onChange={handleInputChange} />
              <InputField label="Last Name" name="lastName" value={userData.lastName} onChange={handleInputChange} />
              <InputField label="Email Address" value={userData.email} disabled={true} />
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                <select name="role" value={userData.role} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-emerald-100 rounded-2xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                  <option value="Pemula">Pemula</option>
                  <option value="UMKM">UMKM</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="pt-6 border-t flex justify-end">
              <button onClick={handleSaveChanges} disabled={loading} className="px-8 py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY (GANTI PASSWORD) */}
        {activeTab === 'security' && (
          <div className="max-w-md space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-[#064E3B] flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#10B981]" /> Change Password
            </h2>
            <InputField label="Current Password" type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} />
            <InputField label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
            <InputField label="Confirm Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
            <button onClick={handleUpdatePassword} disabled={loading} className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all">
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </div>
        )}

        {/* TAB 3: NOTIFICATION CHOICE (PREFERENCES) */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-[#064E3B] flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#10B981]" /> Notification Preferences
            </h2>
            <div className="space-y-4">
              {[
                { id: 'notifyPhAlert', label: 'pH Alert', desc: 'Alert saat pH air tidak stabil.' },
                { id: 'notifyBatchStatus', label: 'Batch Status', desc: 'Info saat batch fermentasi selesai.' },
                { id: 'notifySystemUpdate', label: 'System Update', desc: 'Informasi update fitur aplikasi.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => handlePreferenceToggle(item.id)}
                    className={`w-12 h-6 rounded-full relative transition-all ${userData.preferences?.[item.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userData.preferences?.[item.id] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t flex justify-end">
              <button onClick={handleSaveChanges} disabled={loading} className="px-8 py-3.5 bg-[#10B981] text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}