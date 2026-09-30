import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Filter,
  Eye,
  X,
  MessageCircle,
  Search,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface CallSummaryStats {
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  missed_calls: number;
  answered_calls: number;
  total_duration: number;
}

interface CallHistoryRow {
  id: number;
  lead_id: number | null;
  lead_name: string;
  lead_contact: string;
  lead_source: string;
  phone_number: string;
  direction: string;
  status: string;
  call_type: string;
  duration_seconds: number;
  called_at: string;
}

export default function SalesAgentDashboard() {
  const { staffToken } = useAuthStore();

  // Stats State
  const [totalStats, setTotalStats] = useState<CallSummaryStats>({
    total_calls: 0,
    incoming_calls: 0,
    outgoing_calls: 0,
    missed_calls: 0,
    answered_calls: 0,
    total_duration: 0,
  });
  const [todayStats, setTodayStats] = useState<CallSummaryStats>({
    total_calls: 0,
    incoming_calls: 0,
    outgoing_calls: 0,
    missed_calls: 0,
    answered_calls: 0,
    total_duration: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Filters State
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTypeFilter, setCallTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Call History State
  const [callHistory, setCallHistory] = useState<CallHistoryRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  // Lead Details Modal State
  const [selectedLeadModal, setSelectedLeadModal] = useState<any | null>(null);
  const [isLoadingLeadDetails, setIsLoadingLeadDetails] = useState(false);
  const [isLeadDetailsOpen, setIsLeadDetailsOpen] = useState(false);

  // Quick Dial Modal State
  const [selectedQueueLead, setSelectedQueueLead] = useState<any | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRemarks, setCallRemarks] = useState('');
  const [callStatus, setCallStatus] = useState('INTERESTED');

  // Dummy Priority Assigned Queue (fallback)
  const myAssignedLeads = [
    { id: 541, name: 'Ramesh Patel', phone: '+91 98220 11223', service: 'Private Limited Company Incorporation', source: 'ETaxwala', status: 'Assigned', city: 'Ahmedabad' },
    { id: 542, name: 'Siddharth Roy', phone: '+91 97112 33445', service: 'FSSAI Food License + GST', source: 'Udyami Kisan', status: 'Follow Up', city: 'Kolkata' },
    { id: 543, name: 'Kavita Sundaram', phone: '+91 94440 55667', service: 'Trademark Registration & Search', source: 'Sahakar', status: 'Quote Sent', city: 'Chennai' },
    { id: 544, name: 'Gaurav Jain', phone: '+91 98100 77889', service: 'Income Tax Return (ITR-3)', source: 'ETaxwala', status: 'Assigned', city: 'Delhi' },
  ];

  // Fetch Stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/v1/call-logs/summary', {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTotalStats(data.data.total);
        setTodayStats(data.data.today);
      }
    } catch (err) {
      console.error('Failed to fetch call summary:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch Call History
  const fetchHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      if (callTypeFilter) params.append('call_type', callTypeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/v1/call-logs/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setCallHistory(data.data || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch call history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHistory(1);
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchHistory(pagination.page);
  };

  const handleViewLeadDetails = async (leadId: number) => {
    setIsLoadingLeadDetails(true);
    setIsLeadDetailsOpen(true);
    setSelectedLeadModal(null);
    try {
      const res = await fetch(`/api/v1/call-logs/lead-details/${leadId}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedLeadModal(data);
      }
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
    } finally {
      setIsLoadingLeadDetails(false);
    }
  };

  const handleOpenCallModal = (lead: any) => {
    setSelectedQueueLead(lead);
    setIsCallModalOpen(true);
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallModalOpen(false);
    setCallRemarks('');
    fetchStats();
    fetchHistory(1);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sales Employee Workstation
            </h1>
            <span className="badge badge-gold">User Type 6 (SED)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily calls, view call history summary, log outcomes and manage your assigned leads.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleRefresh} className="btn btn-outline btn-multicolor btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link to="/crm/quotations" className="btn btn-gold btn-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> + New Quote
          </Link>
        </div>
      </div>

      {/* 1️⃣ OVERALL STATS CARDS (6 Cards Gradient Theme matching old CRM) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Calls */}
        <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-emerald-200" />
          </div>
          <p className="text-2xl font-display font-bold mt-2">{totalStats.total_calls}</p>
        </div>

        {/* Incoming */}
        <div className="bg-sky-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-100 uppercase tracking-wider">Incoming</span>
            <PhoneIncoming className="w-4 h-4 text-sky-200" />
          </div>
          <p className="text-2xl font-display font-bold mt-2">{totalStats.incoming_calls}</p>
        </div>

        {/* Outgoing */}
        <div className="bg-amber-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider">Outgoing</span>
            <PhoneOutgoing className="w-4 h-4 text-amber-200" />
          </div>
          <p className="text-2xl font-display font-bold mt-2">{totalStats.outgoing_calls}</p>
        </div>

        {/* Missed */}
        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-100 uppercase tracking-wider">Missed</span>
            <PhoneMissed className="w-4 h-4 text-rose-200" />
          </div>
          <p className="text-2xl font-display font-bold mt-2">{totalStats.missed_calls}</p>
        </div>

        {/* Total Duration */}
        <div className="bg-slate-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">Total Duration</span>
            <Clock className="w-4 h-4 text-slate-300" />
          </div>
          <p className="text-xl font-display font-bold mt-2">{formatDuration(totalStats.total_duration)}</p>
        </div>

        {/* Answered */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Answered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold mt-2">{totalStats.answered_calls}</p>
        </div>
      </div>

      {/* 2️⃣ TODAY'S SUMMARY SECTION (Pastel Card Row) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-navy" />
            <h3 className="font-display font-bold text-sm text-slate-800">
              Today's Summary ({new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})
            </h3>
          </div>
          <span className="badge badge-navy text-[10px]">Real-time Updates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Today Total */}
          <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-emerald-800">Today Total</p>
            <p className="text-xl font-bold text-emerald-900 mt-1">{todayStats.total_calls}</p>
          </div>

          {/* Today Incoming */}
          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-blue-800">Today Incoming</p>
            <p className="text-xl font-bold text-blue-900 mt-1">{todayStats.incoming_calls}</p>
          </div>

          {/* Today Outgoing */}
          <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-amber-800">Today Outgoing</p>
            <p className="text-xl font-bold text-amber-900 mt-1">{todayStats.outgoing_calls}</p>
          </div>

          {/* Today Missed */}
          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-rose-800">Today Missed</p>
            <p className="text-xl font-bold text-rose-900 mt-1">{todayStats.missed_calls}</p>
          </div>

          {/* Today Duration */}
          <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-purple-800">Today Duration</p>
            <p className="text-lg font-bold text-purple-900 mt-1">{formatDuration(todayStats.total_duration)}</p>
          </div>

          {/* Today Answered */}
          <div className="bg-teal-50 border border-teal-100 p-3.5 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-teal-800">Today Answered</p>
            <p className="text-xl font-bold text-teal-900 mt-1">{todayStats.answered_calls}</p>
          </div>
        </div>
      </div>

      {/* 3️⃣ MY CALL HISTORY TABLE WITH FILTERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              My Call History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Full audit log of incoming, outgoing and missed call records</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Exporting call history to CSV...');
              }}
              className="btn btn-primary btn-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={handleRefresh} className="btn btn-outline btn-multicolor btn-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input text-xs py-1.5"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input text-xs py-1.5"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Call Type</label>
            <select
              value={callTypeFilter}
              onChange={(e) => setCallTypeFilter(e.target.value)}
              className="input text-xs py-1.5 font-semibold"
            >
              <option value="">All Call Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="missed">Missed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Lead</label>
            <input
              type="text"
              placeholder="Lead name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-xs py-1.5"
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className="btn btn-primary btn-sm w-full py-2">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </form>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead className="bg-[#1E3A8A] text-white">
              <tr>
                <th className="text-white">Lead Name</th>
                <th className="text-white">Lead Contact</th>
                <th className="text-white">Call Type</th>
                <th className="text-white">Duration</th>
                <th className="text-white">Date & Time</th>
                <th className="text-center text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-navy" />
                    Loading call history...
                  </td>
                </tr>
              ) : callHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No call records found for the selected filter criteria.
                  </td>
                </tr>
              ) : (
                callHistory.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <p className="font-bold text-slate-800 text-xs">{row.lead_name}</p>
                      <span className="badge badge-navy text-[9px] mt-0.5">{row.lead_source}</span>
                    </td>
                    <td className="text-xs font-mono font-bold text-brand-navy">
                      {row.lead_contact}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.call_type === 'outgoing'
                            ? 'bg-sky-100 text-sky-800'
                            : row.call_type === 'incoming'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.call_type === 'outgoing' ? 'Outgoing' : row.call_type === 'incoming' ? 'Incoming' : 'Missed'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">
                      {formatDuration(row.duration_seconds)}
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(row.called_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => row.lead_id && handleViewLeadDetails(row.lead_id)}
                        className="btn btn-primary btn-sm p-1.5"
                        title="View Lead Call History"
                        disabled={!row.lead_id}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4️⃣ ACTIVE ASSIGNED QUEUE (TELECALLING WORKBENCH) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              My Assigned Priority Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click call to dial lead and log conversation outcomes</p>
          </div>
          <span className="badge badge-navy">Direct Telecalling</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Lead Name / City</th>
                <th>Phone Number</th>
                <th>Inquired Service</th>
                <th>Source</th>
                <th>Status</th>
                <th className="text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAssignedLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{lead.name}</p>
                    <p className="text-[10px] text-slate-400">{lead.city} • Lead #{lead.id}</p>
                  </td>
                  <td className="text-xs font-mono text-brand-navy font-bold">
                    {lead.phone}
                  </td>
                  <td className="text-xs text-slate-700 font-medium">
                    {lead.service}
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      lead.source === 'ETaxwala' ? 'bg-blue-100 text-blue-800' :
                      lead.source === 'Udyami Kisan' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lead.source}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gold text-[10px]">
                      {lead.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenCallModal(lead)}
                        className="btn btn-primary btn-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call & Log
                      </button>

                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                          lead.name
                        )},%20I%20am%20calling%20from%20ETaxwala%20regarding%20your%20inquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{ background: '#25D366', color: 'white' }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 👁️ VIEW LEAD CALL DETAILS MODAL */}
      {isLeadDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-navy" />
                <h3 className="font-display font-bold text-base text-slate-800">
                  Lead Call Details History
                </h3>
              </div>
              <button
                onClick={() => setIsLeadDetailsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingLeadDetails ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-navy" />
                Fetching lead details...
              </div>
            ) : selectedLeadModal ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Lead Name</span>
                    <span className="font-bold text-slate-800">{selectedLeadModal.lead.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Contact Number</span>
                    <span className="font-bold font-mono text-brand-navy">{selectedLeadModal.lead.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Email Address</span>
                    <span className="font-medium text-slate-700">{selectedLeadModal.lead.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-60">
                  <table className="table-crm text-xs">
                    <thead>
                      <tr>
                        <th>Call Type</th>
                        <th>Duration</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLeadModal.calls && selectedLeadModal.calls.length > 0 ? (
                        selectedLeadModal.calls.map((c: any) => (
                          <tr key={c.id}>
                            <td>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.call_type === 'Outgoing' ? 'bg-sky-100 text-sky-800' :
                                c.call_type === 'Incoming' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {c.call_type}
                              </span>
                            </td>
                            <td className="font-semibold text-slate-700">{formatDuration(c.duration)}</td>
                            <td className="text-slate-500">
                              {new Date(c.call_timestamp).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-slate-400">No recorded calls for this lead yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button onClick={() => setIsLeadDetailsOpen(false)} className="btn btn-primary btn-sm">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-rose-500 text-xs">
                Could not load lead call details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📞 CALL & LOG OUTCOME MODAL */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-200 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Log Call with {selectedQueueLead?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedQueueLead?.phone} • {selectedQueueLead?.service}
                </p>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCallLog} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Call Outcome Status
                </label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="input text-xs font-semibold"
                >
                  <option value="INTERESTED">Interested - Send Quotation</option>
                  <option value="CALLBACK_REQUESTED">Callback Requested / Follow Up Later</option>
                  <option value="NOT_ANSWERED">Ringing / Not Answered</option>
                  <option value="BUSY">Line Busy</option>
                  <option value="CONVERTED">Payment Committed / Won</option>
                  <option value="NOT_INTERESTED">Not Interested / Closed</option>
                  <option value="INVALID_NUMBER">Wrong / Invalid Number</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conversation Remarks & Notes
                </label>
                <textarea
                  rows={3}
                  value={callRemarks}
                  onChange={(e) => setCallRemarks(e.target.value)}
                  placeholder="e.g. Client inquired for 2 director Pvt Ltd registration. Agreed on ₹16,499 quote. Follow up tomorrow at 11 AM."
                  className="input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Next Follow-up Date</label>
                  <input type="date" className="input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Next Follow-up Time</label>
                  <input type="time" className="input text-xs" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(false)}
                  className="btn btn-outline btn-sm btn-multicolor"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
