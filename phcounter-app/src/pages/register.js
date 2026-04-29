import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion'; 
import {
  Leaf,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("You must agree to the Terms and Conditions.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Verification code has been sent to your email!");
        
        router.push({
          pathname: '/verify-otp',
          query: { email: formData.email, type: 'register' }
        });
      } else {
        toast.error(result.message || "Failed to create account.");
      }
    } catch (err) {
      toast.error("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Side - Visual Anchor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 to-emerald-800 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1766254678470-99c63158bbd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
          }}
        ></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-16">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">EcoMonitor</h1>
                <p className="text-emerald-100 text-sm">pH Tracking System</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Start Tracking<br />
                Your Eco Journey
              </h2>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
                Join thousands of Eco-Enzyme producers in monitoring the fermentation process with precision.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Real-time pH Monitoring', desc: 'Monitor pH levels continuously with instant alerts.' },
                { title: 'Batch Management', desc: 'Efficiently manage and track multiple batches.' },
                { title: 'Data Export & Analytics', desc: 'Export data and gain insights from your fermentation.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="p-1 bg-white/20 rounded-full mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{item.title}</div>
                    <div className="text-sm text-emerald-100">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="text-sm text-emerald-200 uppercase tracking-widest font-bold">Trusted by eco enzyme producers worldwide</div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium">Begin your digital Eco-Enzyme journey now.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="firstName"
                    onChange={handleChange}
                    placeholder="Habil"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="lastName"
                    onChange={handleChange}
                    placeholder="Dwi"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="habil@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer font-medium">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 font-bold underline underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-600 font-bold underline underline-offset-2">Privacy Policy</a>
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-600 text-sm font-medium">
              Already have an account?{' '}
              <button onClick={() => router.push('/login')} className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 decoration-2">
                Sign In
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}