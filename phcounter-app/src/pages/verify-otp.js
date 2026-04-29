import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Leaf, Mail, ArrowRight, RefreshCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyOtp() {
  const router = useRouter();
  const { email, type } = router.query; 
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    try {
      // Gunakan API tunggal yang sudah kita buat sebelumnya
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }), // Key disamakan dengan backend: 'otp'
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || "Verifikasi berhasil!");
        
        if (type === 'reset') {
          // Jika lupa password, lanjut ke halaman ganti password
          router.push(`/auth/reset-password?otp=${otp}&email=${email}`);
        } else {
          // Jika registrasi, langsung ke login
          router.push('/login');
        }
      } else {
        toast.error(result.message || "Kode salah atau kadaluwarsa.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      if (res.ok) {
        toast.success("Kode baru telah dikirim ke email.");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error("Gagal mengirim ulang kode.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-xl shadow-emerald-900/5 border border-emerald-50 p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-100 rounded-2xl mb-6 text-emerald-600">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
          <p className="text-gray-500 font-medium">
            Kami telah mengirimkan kode ke <br />
            <span className="text-emerald-600 font-bold">{email || "email Anda"}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-widest">
              Masukkan 6 Digit OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-[0.5rem] sm:tracking-[1rem] py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-emerald-900"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Verifikasi Sekarang <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium mb-2">Tidak menerima kode?</p>
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm transition-all ${
              canResend ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {canResend ? 'Kirim Ulang Kode' : `Kirim ulang dalam ${timer}s`}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
          <Leaf className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">EcoMonitor Security</span>
        </div>
      </motion.div>
    </div>
  );
}