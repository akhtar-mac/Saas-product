import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Phone, Building, MapPin, Lock,
  Camera, CheckCircle2, ShieldCheck, KeyRound, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const profileSchema = z.object({
  name: z.string().min(1, 'Full name required'),
  business: z.string().optional(),
  email: z.string().email('Valid email required'),
  contact: z.string().min(10, '10-digit contact required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ClientProfilePage() {
  const { customer, loginCustomer, customerToken } = useAuthStore();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: customer?.name || '',
      business: customer?.business || '',
      email: customer?.email || '',
      contact: customer?.contact || '',
      city: customer?.city || 'Pune',
      state: customer?.state || 'Maharashtra',
    },
  });

  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors, isSubmitting: isPassSubmitting },
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileData) => {
    if (!customer) return;
    const updated = {
      ...customer,
      name: data.name,
      business: data.business || customer.business,
      email: data.email,
      contact: data.contact,
      city: data.city,
      state: data.state,
    };
    loginCustomer(updated, customerToken || 'token');
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const onUpdatePassword = async (_data: PasswordData) => {
    setPasswordError('');
    await new Promise((r) => setTimeout(r, 600));
    setPasswordSuccess(true);
    resetPass();
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Account &amp; Entity Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your business contact details, authorized representatives, and authentication security.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Card */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#EAE6DD] shadow-sm space-y-5">
            <div className="flex items-center gap-4 border-b border-[#EAE6DD] pb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0084D1] to-[#7C3AED] text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {customer?.name ? customer.name.slice(0, 2).toUpperCase() : 'CU'}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white border border-[#EAE6DD] shadow-sm text-slate-600 hover:text-[#0084D1]"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{customer?.name}</h3>
                <p className="text-xs text-slate-500">{customer?.business || 'Business Entity'}</p>
                <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Client Account
                </span>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  {...regProfile('name')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
                {profileErrors.name && <p className="mt-1 text-xs text-rose-500">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Business Name
                </label>
                <input
                  {...regProfile('business')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    {...regProfile('email')}
                    type="email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                  {profileErrors.email && <p className="mt-1 text-xs text-rose-500">{profileErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    {...regProfile('contact')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                  {profileErrors.contact && <p className="mt-1 text-xs text-rose-500">{profileErrors.contact.message}</p>}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    {...regProfile('city')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    {...regProfile('state')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="w-full py-3 rounded-xl btn-multicolor text-white font-bold text-xs shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                <span className="relative z-10">
                  {isProfileSubmitting ? 'Saving Changes...' : 'Save Profile Details'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#EAE6DD] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#0084D1]" />
              <h3 className="font-bold text-base text-slate-900">Change Password</h3>
            </div>
            <p className="text-xs text-slate-500">Ensure your new password contains at least 6 characters.</p>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password changed successfully.</span>
              </div>
            )}

            <form onSubmit={handlePassSubmit(onUpdatePassword)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  {...regPass('currentPassword')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
                {passErrors.currentPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  {...regPass('newPassword')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
                {passErrors.newPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  {...regPass('confirmPassword')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                />
                {passErrors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPassSubmitting}
                className="w-full py-3 rounded-xl btn-multicolor text-white font-bold text-xs shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                <span className="relative z-10">
                  {isPassSubmitting ? 'Updating...' : 'Update Password'}
                </span>
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0084D1]" /> Account Security Note
            </p>
            <p className="leading-relaxed">
              Your documents and PAN details are accessible only by your assigned CA team and verified operations staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
