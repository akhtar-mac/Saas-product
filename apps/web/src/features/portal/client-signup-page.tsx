import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck, Lock, Mail, Phone, User, Building,
  ArrowRight, Search, Check, Sparkles, CheckCircle2, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import { services } from '@/lib/constants/services';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  mobile: z.string().min(10, '10-digit mobile number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  city: z.string().min(1, 'City is required'),
  service: z.string().min(1, 'Please choose an initial service of interest'),
});

type FormData = z.infer<typeof schema>;

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

export default function ClientSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const navigate = useNavigate();
  const { loginCustomer } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      service: 'Private Limited Company Registration',
    },
  });

  const selectedService = watch('service');

  // Filter 250+ services via searchable type-ahead (2.1.3)
  const filteredServices = services
    .filter((s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category.toLowerCase().includes(serviceSearch.toLowerCase()))
    .slice(0, 20);

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      // Create inquiry lead on customer backend
      await fetch(`${CUSTOMER_API}/add-inquiry-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          contact: data.mobile,
          city: data.city,
          state: 'Maharashtra',
          service: data.service,
          message: `Self Registered via Client Portal. Initial Service: ${data.service}`,
          consent: true,
        }),
      });

      // Auto-authenticate customer session
      loginCustomer(
        {
          id: Date.now(),
          leadId: Date.now(),
          name: data.name,
          business: `${data.name}'s Enterprise`,
          email: data.email,
          contact: data.mobile,
          service: data.service,
          servicePrice: 16499,
          state: 'Maharashtra',
          city: data.city,
          addedBy: 1,
          companyId: 'etaxwala',
          isPayment: false,
          isActive: true,
          isApprove: true,
          isPartner: 0,
          customerToken: `token_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        },
        `jwt_client_${Date.now()}`
      );

      setStatus('success');
      setTimeout(() => navigate('/portal'), 800);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/logo_black.png" alt="ETaxwala" className="h-10 w-auto" />
          </Link>
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0084D1] border border-blue-200 text-xs font-bold uppercase tracking-wider">
              Client Portal Account
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Create Your Client Account
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Track compliance progress, upload KYC documents securely, and get dedicated Chartered Accountant support.
            </p>
          </div>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE6DD] shadow-sm space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('name')}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('mobile')}
                    placeholder="10-digit phone"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile.message}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / State *
                </label>
                <input
                  {...register('city')}
                  placeholder="e.g. Pune, MH"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
                {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city.message}</p>}
              </div>
            </div>

            {/* Searchable Service Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Service of Primary Interest *
              </label>
              <div
                onClick={() => setIsDropdownOpen(true)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm cursor-pointer flex items-center justify-between"
              >
                <span className="font-semibold text-slate-800 truncate">
                  {selectedService || 'Search from 250+ services...'}
                </span>
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white border border-[#EAE6DD] shadow-xl overflow-hidden p-2 space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type to search (e.g. GST, Pvt Ltd, Trademark)..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredServices.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setValue('service', s.name);
                          setIsDropdownOpen(false);
                          setServiceSearch('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700 group cursor-pointer"
                      >
                        <span className="truncate group-hover:text-[#0084D1] font-medium">{s.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0 ml-2">{s.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 rounded-xl btn-multicolor text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Access Portal</span> <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-[#EAE6DD] text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/portal/login" className="text-[#0084D1] font-bold hover:underline">
              Sign In →
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
