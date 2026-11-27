import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';

export interface BrandBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  accountType: string;
  upiId?: string;
  badge?: string;
}

export interface PublicBrand {
  companyName: string;
  legalName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  websiteUrl: string;
  appUrl: string;
  customDomain: string;
  corsOrigins: string;
  quotePrefix: string;
  workingHours: string;
  upiPrimary: string;
  upiSecondary: string;
  bankAccounts: BrandBankAccount[];
}

export const NEUTRAL_BRAND: PublicBrand = {
  companyName: 'Your Company',
  legalName: 'Your Company',
  tagline: 'Client relationship workspace',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#1E3A8A',
  accentColor: '#06B6D4',
  supportEmail: 'support@example.com',
  supportPhone: '',
  address: '',
  city: '',
  state: '',
  gstin: '',
  pan: '',
  websiteUrl: '',
  appUrl: '',
  customDomain: '',
  corsOrigins: '',
  quotePrefix: 'QT',
  workingHours: '9:30 AM – 6:30 PM IST, Monday to Saturday',
  upiPrimary: '',
  upiSecondary: '',
  bankAccounts: [],
};

const BrandContext = createContext<PublicBrand>(NEUTRAL_BRAND);

export function useBrand(): PublicBrand {
  return useContext(BrandContext);
}

export function brandAsset(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))
    return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function BrandMark({ className = 'h-8', alt }: { className?: string; alt?: string }) {
  const brand = useBrand();
  if (brand.logoUrl) {
    return (
      <img
        src={brandAsset(brand.logoUrl)}
        alt={alt || brand.companyName}
        className={`${className} w-auto object-contain`}
      />
    );
  }
  const initials = brand.companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ background: brand.primaryColor || '#1E3A8A' }}
      >
        {initials || 'CRM'}
      </span>
      <span className="truncate text-sm font-bold text-[#1E3A8A]">{brand.companyName}</span>
    </span>
  );
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<PublicBrand>(NEUTRAL_BRAND);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/v1/public/branding`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled || !body?.data) return;
        setBrand({ ...NEUTRAL_BRAND, ...body.data, bankAccounts: body.data.bankAccounts || [] });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = brand.companyName;
    const color = brand.primaryColor || '#1E3A8A';
    document.documentElement.style.setProperty('--brand-primary', color);
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (theme) theme.content = color;
    if (brand.faviconUrl) {
      let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      icon.href = brandAsset(brand.faviconUrl);
    }
  }, [brand]);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}
