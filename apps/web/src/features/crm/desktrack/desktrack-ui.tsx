/**
 * Small UI + API helpers for the Desktrack screens, in this app's CRM look
 * (navy #1E3A8A / cyan #06B6D4 buttons, slate borders, compact text-xs).
 * Kept local to Desktrack so no shared component changes.
 */
import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

// ─── API ─────────────────────────────────────────────────────────────────────
export const API_BASE = API_BASE_URL;

export function staffAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().staffToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function crmFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { ...staffAuthHeaders(), ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const errMsg =
      data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(typeof errMsg === 'string' ? errMsg : `Request failed (${res.status})`);
  }
  return data;
}

// ─── Tones ───────────────────────────────────────────────────────────────────
export type Tone = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

export const OLD_SURFACES = {
  tableHeader: '#1E3A8A',
  modalHeader: '#1E3A8A',
} as const;

/** Session states: "(Live)" green and "(Auto-logout)" orange like the old report. */
export const DESKTRACK_STATE_TONE: Record<string, Tone> = {
  live: 'success',
  auto_logout: 'warning',
  logged_out: 'secondary',
  no_logout: 'danger',
};
export const DESKTRACK_STATE_LABEL: Record<string, string> = {
  live: 'Live',
  auto_logout: 'Auto-logout',
  logged_out: 'Logged out',
  no_logout: 'No logout',
};
/** Desktop client status buttons (working / lunch / meeting / outside). */
export const DESKTRACK_ACTIVITY_TONE: Record<string, Tone> = {
  working: 'success',
  lunch: 'warning',
  meeting: 'dark',
  outside: 'info',
};

const SOLID: Record<Tone, string> = {
  primary: 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white border-transparent',
  secondary: 'bg-slate-600 hover:bg-slate-700 text-white border-transparent',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent',
  info: 'bg-[#06B6D4] hover:bg-[#0891B2] text-white border-transparent',
  dark: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent',
};
const SOFT: Record<Tone, string> = {
  primary: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  dark: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

// ─── Buttons ─────────────────────────────────────────────────────────────────
const ACTION_TONE: Record<string, Tone> = {
  primary: 'primary',
  add: 'primary',
  save: 'primary',
  export: 'primary',
  filter: 'primary',
  delete: 'danger',
  danger: 'danger',
  cancel: 'secondary',
  secondary: 'secondary',
  success: 'success',
  view: 'info',
  edit: 'info',
  info: 'info',
  warning: 'warning',
  dark: 'dark',
};
export type ButtonVariant = keyof typeof ACTION_TONE | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function buttonClass({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  block = false,
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  block?: boolean;
  className?: string;
} = {}): string {
  const look =
    variant === 'outline'
      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
      : variant === 'ghost'
        ? 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent'
        : SOLID[ACTION_TONE[variant] ?? 'primary'];
  const pad = iconOnly
    ? 'p-1.5'
    : size === 'sm'
      ? 'px-2.5 py-1 text-[11px]'
      : size === 'lg'
        ? 'px-5 py-2.5 text-sm'
        : 'px-4 py-2 text-xs';
  return [
    'inline-flex items-center justify-center gap-1.5 rounded-md border font-bold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    look,
    pad,
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      block = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClass({ variant, size, iconOnly, block, className })}
      {...props}
    >
      {isLoading ? (
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
);
Button.displayName = 'DesktrackButton';

// ─── Filter pills and badges ─────────────────────────────────────────────────
export interface StatusPillProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  tone: Tone;
  label: React.ReactNode;
  count?: number | string | null;
  active?: boolean;
}

export function StatusPill({
  tone,
  label,
  count,
  active = false,
  className = '',
  type = 'button',
  ...props
}: StatusPillProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors ${
        active ? SOLID[tone] : SOFT[tone]
      } ${className}`.trim()}
      {...props}
    >
      <span>{label}</span>
      {count !== undefined && count !== null && (
        <span className="rounded bg-white/80 px-1.5 text-[10px] text-slate-800">{count}</span>
      )}
    </button>
  );
}

export function ToneBadge({
  tone,
  children,
  className = '',
  title,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${SOFT[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
