import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import {
  Phone, PhoneCall, PhoneOff, PhoneMissed, Clock, TrendingUp,
  Users, Search, CalendarDays, Download, BarChart3, Award,
  AlertCircle, ChevronDown,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface EmployeeAnalytics {
  user_id?: number;
  name?: string;
  role_id?: number;
  total_calls: number;
  answered: number;
  missed: number;
  rejected: number;
  not_answered: number;
  total_talk_time_seconds: number;
  avg_call_duration_seconds: number;
  unique_leads_called: number;
  answer_rate: number;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatCard({
  icon: Icon, label, value, sub, color, bg,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold font-display text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CrmCallAnalyticsPage() {
  const { staffToken, staffUser } = useAuthStore();
  const [view, setView] = useState<'me' | 'team' | 'all'>('me');
  const [analytics, setAnalytics] = useState<EmployeeAnalytics | null>(null);
  const [teamData, setTeamData] = useState<EmployeeAnalytics[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = (staffUser?.role === RoleType.SUPER_ADMIN || staffUser?.role === RoleType.ADMIN);
  const isManager = isAdmin || staffUser?.role === RoleType.SALES_MANAGER;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const buildQuery = () => {
    const params: string[] = [];
    if (dateFrom) params.push(`from=${dateFrom}`);
    if (dateTo) params.push(`to=${dateTo}`);
    return params.length ? `?${params.join('&')}` : '';
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (view === 'me' || (!isManager && !isAdmin)) {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/me${buildQuery()}`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) setAnalytics(data.data);
      } else if (view === 'team') {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/team${buildQuery()}`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) setTeamData(data.data);
      } else {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/all${buildQuery()}`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) setTeamData(data.data);
      }
    } catch {
      // Demo data for offline mode
      if (view === 'me') {
        setAnalytics({
          total_calls: 127, answered: 89, missed: 24, rejected: 14,
          not_answered: 38, total_talk_time_seconds: 18420,
          avg_call_duration_seconds: 207, unique_leads_called: 63, answer_rate: 70,
        });
      } else {
        setTeamData([
          { user_id: 1, name: 'Priya Sharma', role_id: 7, total_calls: 143, answered: 112, missed: 20, rejected: 11, not_answered: 31, total_talk_time_seconds: 23040, avg_call_duration_seconds: 206, unique_leads_called: 78, answer_rate: 78 },
          { user_id: 2, name: 'Rahul Verma', role_id: 7, total_calls: 98, answered: 61, missed: 28, rejected: 9, not_answered: 37, total_talk_time_seconds: 12240, avg_call_duration_seconds: 201, unique_leads_called: 52, answer_rate: 62 },
          { user_id: 3, name: 'Anjali Singh', role_id: 13, total_calls: 87, answered: 74, missed: 8, rejected: 5, not_answered: 13, total_talk_time_seconds: 16200, avg_call_duration_seconds: 219, unique_leads_called: 45, answer_rate: 85 },
          { user_id: 4, name: 'Vikram Patel', role_id: 7, total_calls: 156, answered: 118, missed: 25, rejected: 13, not_answered: 38, total_talk_time_seconds: 25860, avg_call_duration_seconds: 219, unique_leads_called: 89, answer_rate: 76 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, [view, dateFrom, dateTo]);

  const filteredTeam = teamData.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate team totals for team/all view
  const teamTotal = filteredTeam.reduce((acc, m) => ({
    total_calls: acc.total_calls + m.total_calls,
    answered: acc.answered + m.answered,
    not_answered: acc.not_answered + m.not_answered,
    total_talk_time_seconds: acc.total_talk_time_seconds + m.total_talk_time_seconds,
    unique_leads_called: acc.unique_leads_called + m.unique_leads_called,
  }), { total_calls: 0, answered: 0, not_answered: 0, total_talk_time_seconds: 0, unique_leads_called: 0 });

  const displayData = view === 'me' ? analytics : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Call Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Android call log data synced from the sales app
          </p>
        </div>
        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 self-start">
          {(['me', ...(isManager ? ['team'] : []), ...(isAdmin ? ['all'] : [])] as ('me' | 'team' | 'all')[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'me' ? 'My Analytics' : v === 'team' ? 'My Team' : 'All Staff'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Date Range:</span>
        </div>
        <input
          type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="input text-xs py-1.5 w-36"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="input text-xs py-1.5 w-36"
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* My Analytics view */}
      {view === 'me' && (
        <>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-6 w-16 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : displayData ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={PhoneCall} label="Total Calls" value={displayData.total_calls} color="#003A66" bg="#EFF6FF" />
                <StatCard icon={Phone} label="Answered" value={displayData.answered} sub={`${displayData.answer_rate}% answer rate`} color="#059669" bg="#F0FDF4" />
                <StatCard icon={PhoneMissed} label="Not Answered" value={displayData.not_answered} sub={`${displayData.missed} missed · ${displayData.rejected} rejected`} color="#DC2626" bg="#FEF2F2" />
                <StatCard icon={Users} label="Unique Leads Called" value={displayData.unique_leads_called} color="#7C3AED" bg="#F5F3FF" />
                <StatCard icon={Clock} label="Total Talk Time" value={formatDuration(displayData.total_talk_time_seconds)} color="#D97706" bg="#FFFBEB" />
                <StatCard icon={BarChart3} label="Avg. Call Duration" value={formatDuration(displayData.avg_call_duration_seconds)} color="#0891B2" bg="#F0F9FF" />
                <StatCard icon={TrendingUp} label="Answer Rate" value={`${displayData.answer_rate}%`} sub="Answered / Total" color="#059669" bg="#F0FDF4" />
                <StatCard icon={Award} label="Performance Score" value={displayData.answer_rate >= 70 ? 'Excellent' : displayData.answer_rate >= 50 ? 'Good' : 'Needs Improvement'} color="#7C3AED" bg="#F5F3FF" />
              </div>

              {/* Visual answer rate bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Call Outcome Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Answered', count: displayData.answered, color: '#059669' },
                    { label: 'Missed', count: displayData.missed, color: '#F59E0B' },
                    { label: 'Rejected', count: displayData.rejected, color: '#DC2626' },
                  ].map(({ label, count, color }) => {
                    const pct = displayData.total_calls > 0 ? Math.round((count / displayData.total_calls) * 100) : 0;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-16">{label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-16 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No call log data synced yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">
                Call logs are synced from the Android sales app. Open the app and trigger a sync.
              </p>
            </div>
          )}
        </>
      )}

      {/* Team / All Staff view */}
      {(view === 'team' || view === 'all') && (
        <>
          {/* Team aggregated stats */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard icon={PhoneCall} label="Total Team Calls" value={teamTotal.total_calls} color="#003A66" bg="#EFF6FF" />
              <StatCard icon={Phone} label="Total Answered" value={teamTotal.answered} color="#059669" bg="#F0FDF4" />
              <StatCard icon={PhoneMissed} label="Not Answered" value={teamTotal.not_answered} color="#DC2626" bg="#FEF2F2" />
              <StatCard icon={Clock} label="Total Talk Time" value={formatDuration(teamTotal.total_talk_time_seconds)} color="#D97706" bg="#FFFBEB" />
              <StatCard icon={Users} label="Leads Reached" value={teamTotal.unique_leads_called} color="#7C3AED" bg="#F5F3FF" />
            </div>
          )}

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search employee..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm w-full"
            />
          </div>

          {/* Leaderboard table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Team Leaderboard</h3>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Answered</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Missed</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Talk Time</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}</tr>
                    ))
                  ) : filteredTeam.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No data found.</td></tr>
                  ) : (
                    [...filteredTeam]
                      .sort((a, b) => b.answered - a.answered)
                      .map((member, idx) => (
                        <tr key={member.user_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold ${
                              idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                            }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-brand-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">{member.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-700">{member.total_calls}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-emerald-600">{member.answered}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 hidden md:table-cell">{member.missed}</td>
                          <td className="px-4 py-3 text-right text-slate-500 hidden lg:table-cell">
                            {formatDuration(member.total_talk_time_seconds)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              member.answer_rate >= 70 ? 'bg-emerald-50 text-emerald-700' :
                              member.answer_rate >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {member.answer_rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note about Android-only feature */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Android-only feature:</strong> Call log data is synced from the sales team's Android devices via the ETaxwala Flutter app.
              iOS devices are not supported for call tracking. Staff must have the app installed and permissions granted.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
