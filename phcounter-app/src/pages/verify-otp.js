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

  // LOGIKA TIMER: Menghitung mundur untuk kirim ulang OTP
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

  // LOGIKA VERIFIKASI: Menghubungi API Backend
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Masukkan 6 digit kode OTP yang dikirim ke email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || "Verifikasi berhasil!");
        
        // --- PERBAIKAN REDIRECT ---
        if (type === 'reset') {
          // Diarahkan langsung ke root pages karena file reset-password.js ada di sana
          router.push(`/reset-password?otp=${otp}&email=${email}`);
        } else {
          router.push('/login');
        }
      } else {
        toast.error(result.message || "Kode salah atau sudah kadaluwarsa.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // LOGIKA KIRIM ULANG: Meminta kode OTP baru
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
        toast.success("Kode OTP baru telah dikirim ke email Anda.");
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
        className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-emerald-50 p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-100 rounded-2xl mb-6 text-emerald-600">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Verifikasi Email</h2>
          <p className="text-slate-500 font-medium">
            Kode verifikasi telah dikirim ke <br />
            <span className="text-emerald-600 font-bold">{email || "Email Anda"}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-widest">
              Masukkan 6 Digit Kode
            </label>
            <input 
              type="text" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
              placeholder="000000" 
              className="w-full text-center text-3xl font-bold tracking-[1rem] py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900" 
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
          <p className="text-slate-500 text-sm font-medium mb-2">Belum menerima kode?</p>
          <button 
            onClick={handleResend} 
            disabled={!canResend || loading} 
            className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm transition-all ${
              canResend ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${loading && canResend ? 'animate-spin' : ''}`} />
            {canResend ? 'Kirim Ulang Kode' : `Kirim ulang dalam ${timer} detik`}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
          <Leaf className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">EcoMonitor Security</span>
        </div>
      </motion.div>
    </div>
  );
}