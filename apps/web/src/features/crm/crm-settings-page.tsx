import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';
import { useAuthStore } from '@/store/auth-store';

type SecretStatus = { configured: boolean; masked: string | null };

interface SettingsForm {
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
  bankAccountsText: string;
  whatsappPhoneNumberId: string;
  smsSenderId: string;
  smsDltEntityId: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpFromEmail: string;
  smtpFromName: string;
}

const EMPTY: SettingsForm = {
  companyName: '',
  legalName: '',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#1E3A8A',
  accentColor: '#06B6D4',
  supportEmail: '',
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
  workingHours: '',
  upiPrimary: '',
  upiSecondary: '',
  bankAccountsText: '[]',
  whatsappPhoneNumberId: '',
  smsSenderId: '',
  smsDltEntityId: '',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpFromEmail: '',
  smtpFromName: '',
};

const TABS = ['Branding', 'Domain', 'Payments', 'Messaging'] as const;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-slate-500">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]';

export default function CrmSettingsPage() {
  const token = useAuthStore((s) => s.staffToken);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Branding');
  const [form, setForm] = useState<SettingsForm>(EMPTY);
  const [secrets, setSecrets] = useState<Record<string, SecretStatus>>({});
  const [secretDraft, setSecretDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const load = async () => {
    const res = await fetch(`${API_BASE_URL}/v1/crm/settings`, { headers });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error || 'Could not load settings');
    const data = body.data;
    setForm({
      ...EMPTY,
      ...data,
      smtpPort: data.smtpPort == null ? '' : String(data.smtpPort),
      bankAccountsText: JSON.stringify(data.bankAccounts || [], null, 2),
    });
    setSecrets({
      razorpayKeyId: data.razorpayKeyId,
      razorpayKeySecret: data.razorpayKeySecret,
      razorpayWebhookSecret: data.razorpayWebhookSecret,
      whatsappToken: data.whatsappToken,
      smsApiKey: data.smsApiKey,
      smtpPass: data.smtpPass,
    });
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const set = (key: keyof SettingsForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      let bankAccounts: unknown = [];
      try {
        bankAccounts = JSON.parse(form.bankAccountsText || '[]');
      } catch {
        throw new Error('Bank accounts must be a JSON array.');
      }
      const payload: Record<string, unknown> = {
        ...form,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : null,
        bankAccounts,
      };
      delete payload.bankAccountsText;
      for (const [key, value] of Object.entries(secretDraft)) {
        if (value.trim()) payload[key] = value.trim();
      }
      const res = await fetch(`${API_BASE_URL}/v1/crm/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error || 'Save failed');
      setSecretDraft({});
      setNotice('Saved. Secrets stay masked and are not sent back in full.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const testChannel = async (channel: string) => {
    setError(null);
    const res = await fetch(`${API_BASE_URL}/v1/crm/settings/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ channel }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      setError(body.error || 'Status check failed');
      return;
    }
    setNotice(
      `${channel}: ${body.data?.note || 'checked'} Configured: ${body.data?.configured ? 'yes' : 'no'}. Dry-run only.`
    );
  };

  const upload = async (file: File, field: 'file' | 'favicon') => {
    const data = new FormData();
    data.append(field, file);
    const res = await fetch(`${API_BASE_URL}/v1/crm/settings/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      setError(body.error || 'Upload failed');
      return;
    }
    setNotice('Logo saved on this server.');
    await load();
  };

  const secretBox = (key: string, label: string) => {
    const status = secrets[key];
    return (
      <Field
        label={label}
        hint={
          status?.configured
            ? `Stored ${status.masked}. Leave blank to keep it.`
            : 'Not stored yet.'
        }
      >
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          placeholder={status?.masked || 'Paste a new secret'}
          value={secretDraft[key] || ''}
          onChange={(e) => setSecretDraft((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      </Field>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#1E3A8A]">Workspace settings</h1>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A8A]">
            Single tenant
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Brand, domain, and integration credentials for this deployment. Secrets are encrypted at
          rest and returned masked.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              tab === name
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {notice}
        </p>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {tab === 'Branding' && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Company name">
              <input
                className={inputClass}
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </Field>
            <Field label="Legal name">
              <input
                className={inputClass}
                value={form.legalName}
                onChange={(e) => set('legalName', e.target.value)}
              />
            </Field>
            <Field label="Tagline">
              <input
                className={inputClass}
                value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)}
              />
            </Field>
            <Field label="Quote prefix">
              <input
                className={inputClass}
                value={form.quotePrefix}
                onChange={(e) => set('quotePrefix', e.target.value)}
              />
            </Field>
            <Field label="Logo URL">
              <input
                className={inputClass}
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
              />
            </Field>
            <Field label="Upload logo">
              <input
                className={inputClass}
                type="file"
                accept="image/*,.svg,.ico"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file, 'file');
                }}
              />
            </Field>
            <Field label="Primary color">
              <input
                className={inputClass}
                value={form.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
              />
            </Field>
            <Field label="Accent color">
              <input
                className={inputClass}
                value={form.accentColor}
                onChange={(e) => set('accentColor', e.target.value)}
              />
            </Field>
            <Field label="Support email">
              <input
                className={inputClass}
                value={form.supportEmail}
                onChange={(e) => set('supportEmail', e.target.value)}
              />
            </Field>
            <Field label="Support phone">
              <input
                className={inputClass}
                value={form.supportPhone}
                onChange={(e) => set('supportPhone', e.target.value)}
              />
            </Field>
            <Field label="Address">
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </Field>
            <Field label="State">
              <input
                className={inputClass}
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
              />
            </Field>
            <Field label="GSTIN">
              <input
                className={inputClass}
                value={form.gstin}
                onChange={(e) => set('gstin', e.target.value)}
              />
            </Field>
            <Field label="PAN">
              <input
                className={inputClass}
                value={form.pan}
                onChange={(e) => set('pan', e.target.value)}
              />
            </Field>
            <Field label="Working hours">
              <input
                className={inputClass}
                value={form.workingHours}
                onChange={(e) => set('workingHours', e.target.value)}
              />
            </Field>
          </div>
        )}

        {tab === 'Domain' && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="App URL" hint="The web origin staff and clients use.">
              <input
                className={inputClass}
                value={form.appUrl}
                onChange={(e) => set('appUrl', e.target.value)}
              />
            </Field>
            <Field label="Public website">
              <input
                className={inputClass}
                value={form.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
              />
            </Field>
            <Field
              label="Custom domain"
              hint="Point an A or CNAME record at this VPS, then set the domain here."
            >
              <input
                className={inputClass}
                value={form.customDomain}
                onChange={(e) => set('customDomain', e.target.value)}
              />
            </Field>
            <Field
              label="Extra CORS origins"
              hint="Comma-separated. Also set CORS_ORIGINS in the API environment, then restart."
            >
              <input
                className={inputClass}
                value={form.corsOrigins}
                onChange={(e) => set('corsOrigins', e.target.value)}
              />
            </Field>
          </div>
        )}

        {tab === 'Payments' && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {secretBox('razorpayKeyId', 'Razorpay key id')}
              {secretBox('razorpayKeySecret', 'Razorpay key secret')}
              {secretBox('razorpayWebhookSecret', 'Razorpay webhook secret')}
              <Field label="Primary UPI (shown to clients)">
                <input
                  className={inputClass}
                  value={form.upiPrimary}
                  onChange={(e) => set('upiPrimary', e.target.value)}
                />
              </Field>
              <Field label="Secondary UPI">
                <input
                  className={inputClass}
                  value={form.upiSecondary}
                  onChange={(e) => set('upiSecondary', e.target.value)}
                />
              </Field>
            </div>
            <Field
              label="Bank accounts JSON"
              hint="Public payment details for this tenant. Leave [] until you add your own accounts."
            >
              <textarea
                className={`${inputClass} min-h-40 font-mono text-xs`}
                value={form.bankAccountsText}
                onChange={(e) => set('bankAccountsText', e.target.value)}
              />
            </Field>
            <button
              type="button"
              className="text-xs font-semibold text-[#1E3A8A]"
              onClick={() => testChannel('razorpay')}
            >
              Check Razorpay status
            </button>
          </div>
        )}

        {tab === 'Messaging' && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {secretBox('whatsappToken', 'WhatsApp token')}
              <Field label="WhatsApp phone number id">
                <input
                  className={inputClass}
                  value={form.whatsappPhoneNumberId}
                  onChange={(e) => set('whatsappPhoneNumberId', e.target.value)}
                />
              </Field>
              {secretBox('smsApiKey', 'SMS API key')}
              <Field label="SMS sender id">
                <input
                  className={inputClass}
                  value={form.smsSenderId}
                  onChange={(e) => set('smsSenderId', e.target.value)}
                />
              </Field>
              <Field label="DLT entity id">
                <input
                  className={inputClass}
                  value={form.smsDltEntityId}
                  onChange={(e) => set('smsDltEntityId', e.target.value)}
                />
              </Field>
              <Field label="SMTP host">
                <input
                  className={inputClass}
                  value={form.smtpHost}
                  onChange={(e) => set('smtpHost', e.target.value)}
                />
              </Field>
              <Field label="SMTP port">
                <input
                  className={inputClass}
                  value={form.smtpPort}
                  onChange={(e) => set('smtpPort', e.target.value)}
                />
              </Field>
              <Field label="SMTP user">
                <input
                  className={inputClass}
                  value={form.smtpUser}
                  onChange={(e) => set('smtpUser', e.target.value)}
                />
              </Field>
              {secretBox('smtpPass', 'SMTP password')}
              <Field label="From email">
                <input
                  className={inputClass}
                  value={form.smtpFromEmail}
                  onChange={(e) => set('smtpFromEmail', e.target.value)}
                />
              </Field>
              <Field label="From name">
                <input
                  className={inputClass}
                  value={form.smtpFromName}
                  onChange={(e) => set('smtpFromName', e.target.value)}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#1E3A8A]">
              <button type="button" onClick={() => testChannel('smtp')}>
                Check email
              </button>
              <button type="button" onClick={() => testChannel('sms')}>
                Check SMS
              </button>
              <button type="button" onClick={() => testChannel('whatsapp')}>
                Check WhatsApp
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Status checks confirm that a value is stored. They do not log in to the provider or
              send a message.
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
