import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Save, Leaf, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const router = useRouter();
  // Ambil data dari URL query params
  const { email, otp } = router.query; 

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    // Validasi Sederhana di Frontend
    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      // PERBAIKAN: Endpoint disesuaikan dengan folder api/auth/reset-password.js
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword: formData.password 
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Password berhasil diperbarui!");
        router.push('/login');
      } else {
        toast.error(result.message || "Gagal mereset password.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-emerald-900/5 border border-emerald-50"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-emerald-50 rounded-3xl mb-6 text-emerald-600 border border-emerald-100">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">New Password</h2>
          <p className="text-slate-500 font-medium">Buat password baru yang kuat untuk akun Anda.</p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-5">
          {/* Input Password Baru */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-600"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Input Konfirmasi Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-600"
                required
              />
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            type="submit" 
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <><Save className="w-5 h-5" /> Reset Password</>
            )}
          </motion.button>
        </form>

        <button 
          onClick={() => router.push('/login')}
          className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </button>
      </motion.div>
    </div>
  );
}