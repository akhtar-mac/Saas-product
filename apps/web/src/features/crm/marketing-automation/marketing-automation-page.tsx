import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';
import { useAuthStore } from '@/store/auth-store';

type Stage = 'generation' | 'nurturing' | 'retention';

interface Channel {
  id: string;
  name: string;
  category: 'organic' | 'paid';
  stages: Stage[];
  phase: string;
  aiHandles: string;
  humanHandles: string;
}

interface Approval {
  id: number;
  channel: string;
  kind: string;
  title: string;
  body: string;
  status: string;
  confidence: number;
  stage: Stage;
}

interface Workflow {
  id: number;
  name: string;
  trigger: string;
  stage: Stage;
  channels: string;
  quietHours: boolean;
  enabled: boolean;
  description: string;
}

interface Campaign {
  id: number;
  name: string;
  platform: string;
  dailyCap: number;
  proposedDaily: number;
  status: string;
  launched: boolean;
  capViolation: string | null;
}

interface Overview {
  executionMode: string;
  brandName: string;
  pendingApprovals: number;
  activeWorkflows: number;
  paidDrafts: number;
  overCapDrafts: number;
  quietHours: string;
  dailySpendCap: number;
  funnel: { stage: Stage; label: string; contacts: number; detail: string }[];
}

const TABS = [
  'Overview',
  'Channels',
  'Inbox',
  'Brand Brain',
  'Workflows',
  'Paid',
  'Guardrails',
] as const;

function Badge({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const tones = {
    blue: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function MarketingAutomationPage() {
  const token = useAuthStore((s) => s.staffToken);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [category, setCategory] = useState<'all' | 'organic' | 'paid'>('all');
  const [stage, setStage] = useState<'all' | Stage>('all');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [inbox, setInbox] = useState<Approval[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cap, setCap] = useState(0);
  const [brain, setBrain] = useState<Record<string, string>>({});
  const [guards, setGuards] = useState<Record<string, unknown>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const load = async () => {
    const get = async (path: string) => {
      const res = await fetch(`${API_BASE_URL}/v1/crm/marketing-automation${path}`, { headers });
      const body = await res.json();
      if (!res.ok || body.success === false) throw new Error(body.error || 'Request failed');
      return body;
    };
    const [ov, ch, box, flows, ads, mind, rail] = await Promise.all([
      get('/overview'),
      get('/channels'),
      get('/inbox'),
      get('/workflows'),
      get('/campaigns'),
      get('/brand-brain'),
      get('/guardrails'),
    ]);
    setOverview(ov.data);
    setChannels(ch.data || []);
    setInbox(box.data || []);
    setWorkflows(flows.data || []);
    setCampaigns(ads.data || []);
    setCap(Number(ads.dailySpendCap || ov.data?.dailySpendCap || 0));
    setBrain(mind.data || {});
    setGuards(rail.data || {});
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const act = async (path: string, body?: unknown) => {
    setError(null);
    const res = await fetch(`${API_BASE_URL}/v1/crm/marketing-automation${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      setError(json.error || 'Action failed');
      return;
    }
    setNotice(json.message || json.note || 'Saved in dry-run. Nothing was sent.');
    await load();
  };

  const filtered = useMemo(
    () =>
      channels.filter((row) => {
        const catOk = category === 'all' || row.category === category;
        const stageOk = stage === 'all' || row.stages.includes(stage);
        return catOk && stageOk;
      }),
    [channels, category, stage]
  );

  const saveBrain = async () => {
    const res = await fetch(`${API_BASE_URL}/v1/crm/marketing-automation/brand-brain`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(brain),
    });
    const json = await res.json();
    if (!res.ok || !json.success) setError(json.error || 'Could not save Brand Brain');
    else setNotice('Brand Brain saved. No external publish.');
  };

  const saveGuards = async () => {
    const res = await fetch(`${API_BASE_URL}/v1/crm/marketing-automation/guardrails`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        dailySpendCap: Number(guards.dailySpendCap),
        monthlySpendCap: Number(guards.monthlySpendCap),
        quietHoursStart: guards.quietHoursStart,
        quietHoursEnd: guards.quietHoursEnd,
        promoCooldownHours: Number(guards.promoCooldownHours),
        minAutoSendConfidence: Number(guards.minAutoSendConfidence),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) setError(json.error || 'Could not save guardrails');
    else {
      setGuards(json.data);
      setNotice('Guardrails saved. Launch stays locked to dry-run.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-[#1E3A8A]">Marketing automation</h1>
          <Badge>Dry-run</Badge>
          <Badge tone="green">1 operator + local drafts</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {overview?.brandName || 'Workspace'} · quiet hours{' '}
          {overview?.quietHours || '21:00–09:00 Asia/Kolkata'}. Approvals stay on this server. No
          post, message, or ad spend leaves the building.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
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

      {tab === 'Overview' && overview && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Waiting in inbox', overview.pendingApprovals],
              ['Workflows on', overview.activeWorkflows],
              ['Paid drafts', overview.paidDrafts],
              ['Over the cap', overview.overCapDrafts],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-[#1E3A8A]">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {overview.funnel.map((bucket) => (
              <div
                key={bucket.stage}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-800">{bucket.label}</h2>
                  <Badge>{bucket.contacts}</Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{bucket.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Channels' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'organic', 'paid'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="text-xs font-semibold text-[#1E3A8A]"
                onClick={() => setCategory(value)}
              >
                {value}
              </button>
            ))}
            <span className="text-slate-300">|</span>
            {(['all', 'generation', 'nurturing', 'retention'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="text-xs font-semibold text-[#1E3A8A]"
                onClick={() => setStage(value)}
              >
                {value === 'all' ? 'all stages' : value}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E3A8A] text-white">
                <tr>
                  {['Channel', 'Type', 'Stages', 'AI drafts', 'You approve', 'Phase'].map(
                    (head) => (
                      <th key={head} className="px-3 py-2 font-semibold">
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-3 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-3 py-3">
                      <Badge tone={row.category === 'paid' ? 'amber' : 'green'}>
                        {row.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.stages.join(', ')}</td>
                    <td className="px-3 py-3 text-slate-600">{row.aiHandles}</td>
                    <td className="px-3 py-3 text-slate-600">{row.humanHandles}</td>
                    <td className="px-3 py-3">
                      <Badge>{row.phase}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Inbox' && (
        <div className="space-y-3">
          {inbox.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">{item.title}</h2>
                <Badge>{item.channel}</Badge>
                <Badge tone={item.confidence < 0.75 ? 'rose' : 'green'}>
                  {Math.round(item.confidence * 100)}% confidence
                </Badge>
                <Badge tone="amber">{item.status}</Badge>
              </div>
              {editId === item.id ? (
                <textarea
                  className="w-full min-h-24 rounded-lg border border-slate-200 p-2 text-xs"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              ) : (
                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {item.body}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => act(`/inbox/${item.id}/approve`)}
                >
                  Approve
                </button>
                {editId === item.id ? (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    onClick={() =>
                      act(`/inbox/${item.id}/edit`, { body: editBody }).then(() => setEditId(null))
                    }
                  >
                    Save edit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    onClick={() => {
                      setEditId(item.id);
                      setEditBody(item.body);
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                  onClick={() => act(`/inbox/${item.id}/regenerate`)}
                >
                  Regenerate
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'Brand Brain' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid gap-3">
          {(
            ['businessName', 'offers', 'icp', 'tone', 'faqs', 'disclaimers', 'proofPoints'] as const
          ).map((key) => (
            <label key={key} className="block space-y-1">
              <span className="text-xs font-semibold capitalize text-slate-700">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <textarea
                className="w-full min-h-16 rounded-lg border border-slate-200 p-2 text-sm"
                value={brain[key] || ''}
                onChange={(e) => setBrain((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
          <button
            type="button"
            className="w-fit rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => void saveBrain()}
          >
            Save Brand Brain
          </button>
        </div>
      )}

      {tab === 'Workflows' && (
        <div className="space-y-3">
          {workflows.map((flow) => (
            <article
              key={flow.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">{flow.name}</h2>
                  <p className="text-xs text-slate-500">{flow.description}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1E3A8A]"
                  onClick={() => act(`/workflows/${flow.id}/toggle`, { enabled: !flow.enabled })}
                >
                  {flow.enabled ? 'On' : 'Off'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {flow.trigger} · {flow.stage} · {flow.channels}
                {flow.quietHours ? ' · respects quiet hours' : ''}
              </p>
            </article>
          ))}
        </div>
      )}

      {tab === 'Paid' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Hard daily cap ₹{cap.toLocaleString('en-IN')}. Launch never calls an ad network.
          </p>
          {campaigns.map((row) => (
            <article
              key={row.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">{row.name}</h2>
                <Badge tone="amber">{row.platform}</Badge>
                <Badge tone={row.capViolation ? 'rose' : 'green'}>{row.status}</Badge>
              </div>
              <p className="text-xs text-slate-600">
                Proposed ₹{row.proposedDaily.toLocaleString('en-IN')} / day · cap ₹
                {row.dailyCap.toLocaleString('en-IN')}
              </p>
              {row.capViolation ? (
                <p className="text-xs text-rose-700">{row.capViolation}</p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => act(`/campaigns/${row.id}/approve`)}
                >
                  Approve inside cap
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                  onClick={() => act(`/campaigns/${row.id}/launch`)}
                >
                  Launch (dry-run)
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'Guardrails' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid gap-3 md:grid-cols-2">
          {[
            ['dailySpendCap', 'Daily spend cap (INR)'],
            ['monthlySpendCap', 'Monthly spend cap (INR)'],
            ['quietHoursStart', 'Quiet hours start'],
            ['quietHoursEnd', 'Quiet hours end'],
            ['promoCooldownHours', 'Promo cooldown (hours)'],
            ['minAutoSendConfidence', 'Auto-send confidence floor'],
          ].map(([key, label]) => (
            <label key={key} className="block space-y-1">
              <span className="text-xs font-semibold text-slate-700">{label}</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={String(guards[key] ?? '')}
                onChange={(e) => setGuards((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
          <div className="md:col-span-2 space-y-2 text-xs text-slate-600">
            <p>
              SMS requires a DLT template. WhatsApp outside 24 hours requires a Meta template. Email
              requires unsubscribe.
            </p>
            <p>Execution mode stays dry-run even after you save.</p>
            <button
              type="button"
              className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void saveGuards()}
            >
              Save guardrails
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
