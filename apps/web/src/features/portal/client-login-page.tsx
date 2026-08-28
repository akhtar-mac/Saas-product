import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Phone, ArrowRight, Building, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function ClientLoginPage() {
  const [identifier, setIdentifier] = useState('rajesh.sharma@example.com');
  const [password, setPassword] = useState('client@2024');
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginCustomer } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      loginCustomer(
        {
          id: 101,
          leadId: 540,
          name: 'Rajesh Sharma',
          business: 'Sharma Agri Exports Pvt Ltd',
          email: identifier.includes('@') ? identifier : 'rajesh.sharma@example.com',
          contact: identifier.includes('@') ? '+91 98765 43210' : identifier,
          service: 'Private Limited Company Registration',
          servicePrice: 16499,
          state: 'Maharashtra',
          city: 'Pune',
          addedBy: 1,
          companyId: 'etaxwala',
          isPayment: true,
          isActive: true,
          isApprove: true,
          isPartner: 0,
          customerToken: 'cust_token_demo',
          date: '2026-08-10',
        },
        'jwt_token_demo_123'
      );
      setIsLoading(false);
      navigate('/portal');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/logo_black.png" alt="ETaxwala" className="h-10 w-auto" />
          </Link>
          <div>
            <span className="badge badge-gold mb-1">Client Self-Service</span>
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Client Portal Sign In
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Access your incorporation certificates, GST returns, document vault, and live CA chat.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. client@company.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {!useOtp ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="btn btn-outline w-full text-xs"
                  >
                    Send OTP to Mobile / Email
                  </button>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input text-xs font-mono"
                      required
                    />
                    <p className="text-[11px] text-emerald-600 mt-1">OTP sent to your registered mobile number.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setUseOtp(!useOtp);
                  setOtpSent(false);
                }}
                className="text-brand-navy font-semibold hover:underline"
              >
                {useOtp ? 'Use Password instead' : 'Login via SMS OTP'}
              </button>
              <a href="#" className="text-slate-400 hover:text-slate-600">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-xs font-bold py-3 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Client Portal'}
            </button>
          </form>

          {/* Switch to Staff Portal */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Are you an employee or partner?{' '}
            <Link to="/crm/login" className="text-brand-navy font-bold hover:underline">
              Staff CRM Login →
            </Link>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted • MCA / GST Compliant</span>
        </div>
      </div>
    </div>
  );
}
