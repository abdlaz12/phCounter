import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Leaf, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 1. LOGIKA REMEMBER ME: Cek email yang tersimpan saat pertama kali halaman dimuat
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. LOGIKA FORGOT PASSWORD: Kirim token ke email & arahkan ke halaman verifikasi
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Silakan masukkan email Anda di kolom Email Address terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Instruksi pemulihan telah dikirim ke email Anda.");
        // PASTIKAN: Path sesuai dengan nama file kamu (misal: /verify-otp)
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=reset`);
      } else {
        toast.error(result.message || "Gagal memproses permintaan lupa password.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIKA LOGIN: Autentikasi & Simpan Session
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const { token, user } = result.data;
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Selamat datang kembali, ${user.firstName}!`);
        router.push('/dashboard');
      } 
      // TAMBAHAN: Jika akun belum verifikasi (403), tendang ke halaman OTP
      else if (res.status === 403) {
        toast.info("Akun Anda belum aktif. Mengalihkan ke halaman verifikasi...");
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=register`);
      } 
      else {
        toast.error(result.message || "Email atau password salah.");
      }
    } catch (err) {
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Sisi Kiri - Visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1773877149525-47079d416d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-900/90"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"><Leaf className="w-8 h-8" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">EcoMonitor</h1>
              <p className="text-emerald-100 text-sm">pH Tracking System</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">Monitor Your<br />Eco Enzyme Journey</h2>
            <p className="text-emerald-100 text-lg max-w-md">Track pH levels in real-time, manage batches efficiently, and ensure optimal fermentation quality.</p>
            <div className="grid grid-cols-3 gap-4 pt-6 text-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-xs text-emerald-200 uppercase tracking-wider">Accuracy</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-xs text-emerald-200 uppercase tracking-wider">Monitoring</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold">Live</div>
                <div className="text-xs text-emerald-200 uppercase tracking-wider">Updates</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sisi Kanan - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="habil@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline-offset-4 hover:underline transition-all"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}