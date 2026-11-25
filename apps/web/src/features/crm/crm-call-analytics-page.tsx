import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { API_BASE_URL } from '@/lib/api-base';
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Clock,
  TrendingUp,
  Users,
  Search,
  CalendarDays,
  BarChart3,
  Award,
  AlertCircle,
  Filter,
  RefreshCw,
  History,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

const API_BASE = API_BASE_URL;

interface EmployeeAnalytics {
  user_id?: number;
  name?: string;
  role_id?: number;
  total_calls: number;
  incoming_calls?: number;
  outgoing_calls?: number;
  answered: number;
  missed: number;
  rejected: number;
  not_answered: number;
  total_talk_time_seconds: number;
  avg_call_duration_seconds: number;
  unique_leads_called: number;
  answer_rate: number;
}

interface CallSummaryStats {
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  missed_calls: number;
  total_duration: number;
}

interface CallHistoryItem {
  id: number;
  lead_id: number | null;
  lead_name: string;
  lead_contact: string;
  lead_source: string;
  phone_number: string;
  direction: 'incoming' | 'outgoing';
  status: string;
  call_type: string;
  duration_seconds: number;
  user_id: number;
  user_name: string;
  called_at: string;
}

interface StaffOption {
  id: number;
  name: string;
  role_id: number;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-start justify-between mb-1.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-[13px] xl:text-sm font-bold font-display text-slate-900 tabular-nums whitespace-nowrap">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CrmCallAnalyticsPage() {
  const { staffToken, staffUser, activeRole } = useAuthStore();
  const effectiveRole = activeRole || staffUser?.role;
  const roleList = [effectiveRole, staffUser?.role, ...(staffUser?.roles || [])].filter(Boolean);
  const roleIds = staffUser?.roleIds || [];
  const isAdmin =
    roleList.includes(RoleType.SUPER_ADMIN) ||
    roleList.includes(RoleType.ADMIN) ||
    roleIds.includes(1) ||
    roleIds.includes(2);
  const isManager =
    isAdmin ||
    roleList.includes(RoleType.SALES_MANAGER) ||
    roleList.includes(RoleType.OPERATIONS_MANAGER) ||
    roleIds.includes(3) ||
    roleIds.includes(4);

  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');
  const [view, setView] = useState<'me' | 'team' | 'all'>(isManager ? 'team' : 'me');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters state
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState<string>('');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Call Report Summary state
  const [summaryTotal, setSummaryTotal] = useState<CallSummaryStats>({
    total_calls: 0,
    incoming_calls: 0,
    outgoing_calls: 0,
    missed_calls: 0,
    total_duration: 0,
  });
  const [summaryToday, setSummaryToday] = useState<CallSummaryStats>({
    total_calls: 0,
    incoming_calls: 0,
    outgoing_calls: 0,
    missed_calls: 0,
    total_duration: 0,
  });

  // Call History state
  const [historyLogs, setHistoryLogs] = useState<CallHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);

  // Leaderboard / Analytics state
  const [analytics, setAnalytics] = useState<EmployeeAnalytics | null>(null);
  const [teamData, setTeamData] = useState<EmployeeAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  // Fetch staff list for filters
  useEffect(() => {
    if (isManager || isAdmin) {
      fetch(`${API_BASE}/v1/call-logs/staff`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStaffList(data.data || []);
        })
        .catch(() => {});
    }
  }, [isManager, isAdmin, staffToken]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('from', dateFrom);
    if (dateTo) params.append('to', dateTo);
    if (selectedStaff) params.append('user_id', selectedStaff);
    if (callTypeFilter) params.append('call_type', callTypeFilter);
    if (leadSourceFilter) params.append('lead_source', leadSourceFilter);
    if (debouncedSearch) params.append('search', debouncedSearch);
    return params;
  };

  // Load summary stats (Total & Today)
  const loadSummaryStats = async () => {
    try {
      const params = buildQueryParams();
      const res = await fetch(`${API_BASE}/v1/call-logs/summary?${params.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data?.error || 'Could not load call summary.');
        return;
      }
      setErrorMsg(null);
      if (data.data) {
        setSummaryTotal(data.data.total);
        setSummaryToday(data.data.today);
      }
    } catch {
      setErrorMsg('Unable to reach the server for call summary.');
    }
  };

  // Load Call History table
  const loadCallHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = buildQueryParams();
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await fetch(`${API_BASE}/v1/call-logs/history?${params.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data?.error || 'Could not load call history.');
        setHistoryLogs([]);
        return;
      }
      setErrorMsg(null);
      setHistoryLogs(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalHistoryCount(data.pagination.total || 0);
      }
    } catch {
      setErrorMsg('Unable to reach the server for call history.');
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load Leaderboard / Analytics
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (leadSourceFilter) params.append('lead_source', leadSourceFilter);

      if (view === 'me' || (!isManager && !isAdmin)) {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/me?${params.toString()}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data?.error || 'Could not load call analytics.');
          return;
        }
        setErrorMsg(null);
        setAnalytics(data.data);
      } else if (view === 'team') {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/team?${params.toString()}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data?.error || 'Could not load team call report.');
          setTeamData([]);
          return;
        }
        setErrorMsg(null);
        setTeamData(data.data || []);
      } else {
        const res = await fetch(`${API_BASE}/v1/call-logs/analytics/all?${params.toString()}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data?.error || 'Could not load staff call report.');
          setTeamData([]);
          return;
        }
        setErrorMsg(null);
        setTeamData(data.data || []);
      }
    } catch {
      setErrorMsg('Unable to reach the server for call analytics.');
      setTeamData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadSummaryStats();
    if (activeTab === 'history') {
      loadCallHistory();
    } else {
      loadAnalytics();
    }
  }, [
    activeTab,
    view,
    dateFrom,
    dateTo,
    selectedStaff,
    callTypeFilter,
    leadSourceFilter,
    debouncedSearch,
    page,
  ]);

  const handleRefresh = () => {
    loadSummaryStats();
    if (activeTab === 'history') loadCallHistory();
    else loadAnalytics();
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedStaff('');
    setCallTypeFilter('');
    setLeadSourceFilter('');
    setSearch('');
    setPage(1);
  };

  const renderLeadSourceBadge = (source: string) => {
    const srcUpper = (source || '').toUpperCase();
    if (srcUpper.includes('ETAX')) {
      return (
        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
          ETax
        </span>
      );
    } else if (srcUpper.includes('SAHAKAR')) {
      return (
        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          Sahakar
        </span>
      );
    } else if (srcUpper.includes('UDYAMI')) {
      return (
        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
          Udyami
        </span>
      );
    }
    return (
      <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
        {source || 'Direct'}
      </span>
    );
  };

  const renderCallTypeBadge = (direction: string, status: string) => {
    if (status === 'missed' || status === 'rejected') {
      return (
        <span className="inline-flex items-center whitespace-nowrap gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
          <PhoneMissed className="w-3 h-3 text-red-500" />
          Missed Call
        </span>
      );
    }
    if (direction === 'incoming') {
      return (
        <span className="inline-flex items-center whitespace-nowrap gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
          Incoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center whitespace-nowrap gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <ArrowUpRight className="w-3 h-3 text-sky-500" />
        Outgoing
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-brand-navy" />
            Call Report & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time call tracking, activity logs, and team performance report
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 self-start">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Call History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics & Leaderboard
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Overview Stat Cards (Total vs Today breakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Total Call Summary
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Filtered Period</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <StatCard
              icon={PhoneCall}
              label="Total Calls"
              value={summaryTotal.total_calls}
              color="#003A66"
              bg="#EFF6FF"
            />
            <StatCard
              icon={ArrowDownLeft}
              label="Incoming"
              value={summaryTotal.incoming_calls}
              color="#059669"
              bg="#F0FDF4"
            />
            <StatCard
              icon={ArrowUpRight}
              label="Outgoing"
              value={summaryTotal.outgoing_calls}
              color="#0284C7"
              bg="#F0F9FF"
            />
            <StatCard
              icon={PhoneMissed}
              label="Missed"
              value={summaryTotal.missed_calls}
              color="#DC2626"
              bg="#FEF2F2"
            />
            <StatCard
              icon={Clock}
              label="Duration"
              value={formatDuration(summaryTotal.total_duration)}
              color="#D97706"
              bg="#FFFBEB"
            />
          </div>
        </div>

        {/* Today Summary */}
        <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/60 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              Today's Calls (
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Live sync</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <StatCard
              icon={PhoneCall}
              label="Total"
              value={summaryToday.total_calls}
              color="#047857"
              bg="#ECFDF5"
            />
            <StatCard
              icon={ArrowDownLeft}
              label="Incoming"
              value={summaryToday.incoming_calls}
              color="#059669"
              bg="#F0FDF4"
            />
            <StatCard
              icon={ArrowUpRight}
              label="Outgoing"
              value={summaryToday.outgoing_calls}
              color="#0284C7"
              bg="#F0F9FF"
            />
            <StatCard
              icon={PhoneMissed}
              label="Missed"
              value={summaryToday.missed_calls}
              color="#DC2626"
              bg="#FEF2F2"
            />
            <StatCard
              icon={Clock}
              label="Duration"
              value={formatDuration(summaryToday.total_duration)}
              color="#D97706"
              bg="#FFFBEB"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filters & Controls
          </span>
          <div className="flex items-center gap-2">
            {(dateFrom ||
              dateTo ||
              selectedStaff ||
              callTypeFilter ||
              leadSourceFilter ||
              search) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-700 underline font-medium"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Staff Filter */}
          {(isManager || isAdmin) && (
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Staff</label>
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setPage(1);
                }}
                className="input text-xs py-1.5 w-full"
              >
                <option value="">All Staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date From */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="input text-xs py-1.5 w-full"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="input text-xs py-1.5 w-full"
            />
          </div>

          {/* Call Type Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Call Type</label>
            <select
              value={callTypeFilter}
              onChange={(e) => {
                setCallTypeFilter(e.target.value);
                setPage(1);
              }}
              className="input text-xs py-1.5 w-full"
            >
              <option value="">All Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="missed">Missed</option>
            </select>
          </div>

          {/* Lead Source Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Lead Source
            </label>
            <select
              value={leadSourceFilter}
              onChange={(e) => {
                setLeadSourceFilter(e.target.value);
                setPage(1);
              }}
              className="input text-xs py-1.5 w-full"
            >
              <option value="">All Sources</option>
              <option value="ETax">ETax</option>
              <option value="Sahakar">Sahakar Samridhi</option>
              <option value="Udyami">Udyami Kisan</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Search Lead/Contact
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input text-xs py-1.5 pl-8 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'history' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Call Logs & Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {historyLogs.length} of {totalHistoryCount} total calls
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-crm w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Lead
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Duration & Time
                  </th>
                  {(isManager || isAdmin) && (
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                      Staff User
                    </th>
                  )}
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: isManager || isAdmin ? 7 : 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : historyLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isManager || isAdmin ? 7 : 6}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      No call history records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{log.lead_name}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                        {log.lead_contact}
                      </td>
                      <td className="px-4 py-3">{renderLeadSourceBadge(log.lead_source)}</td>
                      <td className="px-4 py-3">
                        {renderCallTypeBadge(log.direction, log.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatDuration(log.duration_seconds)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(log.called_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      {(isManager || isAdmin) && (
                        <td className="px-4 py-3 text-slate-700 text-xs font-medium">
                          {log.user_name}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right text-xs text-slate-500">
                        {new Date(log.called_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Leaderboard & Employee Analytics Tab */
        <div className="space-y-6">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 self-start w-fit">
            {(
              [...(isManager ? ['team'] : []), ...(isAdmin ? ['all'] : []), 'me'] as (
                'me' | 'team' | 'all'
              )[]
            ).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  view === v
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v === 'me' ? 'My Analytics' : v === 'team' ? 'Employee Report' : 'All Staff'}
              </button>
            ))}
          </div>

          {view === 'me' && analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={PhoneCall}
                label="Total Calls"
                value={analytics.total_calls}
                color="#003A66"
                bg="#EFF6FF"
              />
              <StatCard
                icon={Phone}
                label="Answered"
                value={analytics.answered}
                sub={`${analytics.answer_rate}% answer rate`}
                color="#059669"
                bg="#F0FDF4"
              />
              <StatCard
                icon={PhoneMissed}
                label="Not Answered"
                value={analytics.not_answered}
                sub={`${analytics.missed} missed`}
                color="#DC2626"
                bg="#FEF2F2"
              />
              <StatCard
                icon={Users}
                label="Unique Leads"
                value={analytics.unique_leads_called}
                color="#7C3AED"
                bg="#F5F3FF"
              />
              <StatCard
                icon={Clock}
                label="Talk Time"
                value={formatDuration(analytics.total_talk_time_seconds)}
                color="#D97706"
                bg="#FFFBEB"
              />
              <StatCard
                icon={BarChart3}
                label="Avg Duration"
                value={formatDuration(analytics.avg_call_duration_seconds)}
                color="#0891B2"
                bg="#F0F9FF"
              />
              <StatCard
                icon={TrendingUp}
                label="Answer Rate"
                value={`${analytics.answer_rate}%`}
                color="#059669"
                bg="#F0FDF4"
              />
              <StatCard
                icon={Award}
                label="Score"
                value={analytics.answer_rate >= 70 ? 'Excellent' : 'Good'}
                color="#7C3AED"
                bg="#F5F3FF"
              />
            </div>
          )}

          {(view === 'team' || view === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Team Performance Ranking</h3>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="table-crm w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Total Calls
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Incoming
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Outgoing
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Missed
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Answered
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Talk Time
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                        Answer Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">
                          Loading employee call report...
                        </td>
                      </tr>
                    ) : teamData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">
                          No employee call records found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      teamData.map((m, idx) => (
                        <tr key={m.user_id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-bold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <button
                              type="button"
                              onClick={() => {
                                if (m.user_id) {
                                  setSelectedStaff(String(m.user_id));
                                  setActiveTab('history');
                                  setPage(1);
                                }
                              }}
                              className="hover:text-[#0284c7] hover:underline text-left"
                              title="View call history for this employee"
                            >
                              {m.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">
                            {m.total_calls.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                            {(m.incoming_calls ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-sky-700 font-medium">
                            {(m.outgoing_calls ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-rose-600 font-medium">
                            {(m.missed ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                            {m.answered.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">
                            {formatDuration(m.total_talk_time_seconds)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">
                            {m.answer_rate}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {teamData.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800 text-xs">
                        <td className="px-4 py-3" colSpan={2}>
                          Total ({teamData.length} staff)
                        </td>
                        <td className="px-4 py-3 text-right">
                          {teamData.reduce((s, r) => s + r.total_calls, 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700">
                          {teamData
                            .reduce((s, r) => s + (r.incoming_calls ?? 0), 0)
                            .toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-sky-700">
                          {teamData
                            .reduce((s, r) => s + (r.outgoing_calls ?? 0), 0)
                            .toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-rose-600">
                          {teamData
                            .reduce((s, r) => s + (r.missed ?? 0), 0)
                            .toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700">
                          {teamData.reduce((s, r) => s + r.answered, 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {formatDuration(
                            teamData.reduce((s, r) => s + r.total_talk_time_seconds, 0)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(() => {
                            const t = teamData.reduce((s, r) => s + r.total_calls, 0);
                            const a = teamData.reduce((s, r) => s + r.answered, 0);
                            return `${t > 0 ? Math.round((a / t) * 100) : 0}%`;
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Sync Status:</strong> Call logs are synchronized automatically from Android sales
          devices via the ETaxwala mobile application.
        </p>
      </div>
    </div>
  );
}
