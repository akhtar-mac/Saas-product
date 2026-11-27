import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function ClientLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginCustomer } = useAuthStore();

  const doDirectLogin = async (idVal: string, pwVal: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/v1/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idVal, password: pwVal }),
      });
      const data = await res.json();
      if (data?.success && data.customer && data.token) {
        loginCustomer(data.customer, data.token);
        navigate('/portal');
      } else {
        setError(data?.error || data?.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (useOtp) {
      doDirectLogin(identifier || 'rajesh@apextech.in', otp || '123456');
      return;
    }
    doDirectLogin(identifier || 'rajesh@apextech.in', password || 'Password@123');
  };

  const features = [
    'Track your service status in real-time',
    'Download certificates & documents',
    'Chat directly with your CA',
    'Secure document vault',
    'GST return history & ITR records',
  ];

  return (
    <div className="min-h-screen flex bg-[#FFFDF9]">
      {/* ── Left Panel: Brand illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-[#FAF9F5] flex-col items-center justify-center p-12">
        {/* Multicolour top strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        {/* Logo top-left */}
        <div className="absolute top-8 left-10">
          <Link to="/">
            <img src="/logo_black.png" alt="ETaxwala" className="h-9 w-auto" />
          </Link>
        </div>

        {/* Illustration */}
        <div className="relative w-full max-w-sm mx-auto">
          <img
            src="/ca_login_illus.jpg"
            alt="ETaxwala CA Expert"
            className="w-full rounded-3xl shadow-2xl object-cover"
            style={{ aspectRatio: '3/4' }}
          />
        </div>

        {/* Feature list */}
        <div className="mt-10 max-w-sm w-full space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            What you get inside:
          </p>
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
              <div className="w-5 h-5 rounded-full bg-multicolor flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link to="/">
              <img src="/logo_black.png" alt="ETaxwala" className="h-9 w-auto mx-auto" />
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-[#7C3AED]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Client Self-Service Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Sign in to access your documents, CA chat, and compliance tracker.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DD] shadow-xl p-7 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {/* ⚡ 1-Click Demo Client Access */}
            <div className="bg-amber-50/90 border border-amber-200/90 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Demo Client Portal Access
                  </span>
                  <span className="text-[11px] text-amber-700 font-mono">
                    rajesh@apextech.in • Rajesh Sharma
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('rajesh@apextech.in');
                  setPassword('Password@123');
                  doDirectLogin('rajesh@apextech.in', 'Password@123');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
              >
                1-Click Login
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email / Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Registered Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="you@company.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password / OTP */}
              {!useOtp ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="w-full py-3 rounded-xl border border-[#EAE6DD] text-sm font-semibold text-slate-700 hover:bg-[#FAF9F5] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#0084D1]" /> Send OTP to Mobile / Email
                    </button>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#EAE6DD] text-sm font-mono text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 tracking-[0.3em] transition-all bg-white"
                        required
                      />
                      <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> OTP sent to your registered mobile.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle + Forgot */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setUseOtp(!useOtp);
                    setOtpSent(false);
                  }}
                  className="flex items-center gap-1 text-[#7C3AED] font-semibold hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {useOtp ? 'Use Password' : 'Login via OTP'}
                </button>
                <Link
                  to="/portal/forgot-password"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl btn-multicolor font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Client Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="border-t border-[#EAE6DD] pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Are you staff?{' '}
                <Link to="/crm/login" className="text-[#003A66] font-bold hover:underline">
                  Staff Login →
                </Link>
              </span>
              <Link to="/portal/signup" className="text-[#0084D1] font-bold hover:underline">
                New account
              </Link>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted • MCA / GST Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
