import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Search,
  Filter,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Star,
  X,
  Plus,
  ArrowUpRight,
  Receipt,
  Building2,
  Send,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  experience: string;
  linkedin?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  resumeFileName?: string;
  resumeUrl?: string;
  status: 'new' | 'review' | 'shortlisted' | 'interview_scheduled' | 'offered' | 'rejected';
  interviewDate?: string;
  interviewType?: 'Telephonic' | 'Google Meet' | 'In-Person';
  rating?: number;
  notes?: string[];
  appliedAt: string;
}

export default function HrDashboard() {
  const staffToken = useAuthStore((s) => s.staffToken);
  const [activeTab, setActiveTab] = useState<'ats' | 'workforce' | 'accounts'>('ats');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [newNote, setNewNote] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    offered: 0,
    rejected: 0,
  });

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/v1/hr/applicants`, {
        headers: staffToken ? { Authorization: `Bearer ${staffToken}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data) {
        setApplicants(json.data.applicants);
        setCounts(json.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [staffToken]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: Applicant['status'],
    extra?: { interviewDate?: string; rating?: number; note?: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/v1/hr/applicants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });
      const json = await res.json();
      if (json.success) {
        setApplicants((prev) =>
          prev.map((app) => (app.id === id ? json.data : app))
        );
        if (selectedApplicant?.id === id) {
          setSelectedApplicant(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddNote = async (id: string) => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/v1/hr/applicants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ note: newNote }),
      });
      const json = await res.json();
      if (json.success) {
        setApplicants((prev) =>
          prev.map((app) => (app.id === id ? json.data : app))
        );
        setSelectedApplicant(json.data);
        setNewNote('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.phone.includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">New Applied</span>;
      case 'review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">Shortlisted</span>;
      case 'interview_scheduled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Interview Set</span>;
      case 'offered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Offer Sent</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Archived / Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              HR & Accounts Command Center
            </h1>
            <span className="badge badge-gold">People & Finance</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connected to website <code className="text-[#0084D1] font-semibold">/careers</code> application desk, team workforce rosters & accounts ledger.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ats')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 btn-multicolor"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Careers ATS Funnel
            {counts.new > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
                {counts.new}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('workforce')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 btn-multicolor"
          >
            <Users className="w-3.5 h-3.5" />
            Workforce (218)
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 btn-multicolor"
          >
            <Receipt className="w-3.5 h-3.5" />
            Accounts & Payroll
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CAREERS ATS ────────────────────────────────────────── */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'All Candidates', value: counts.total, color: 'text-slate-800' },
              { label: 'New Applied', value: counts.new, color: 'text-amber-600' },
              { label: 'Under Review', value: counts.review, color: 'text-purple-600' },
              { label: 'Shortlisted', value: counts.shortlisted, color: 'text-sky-600' },
              { label: 'Interviews', value: counts.interview_scheduled, color: 'text-blue-600' },
              { label: 'Offers Given', value: counts.offered, color: 'text-emerald-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[11px] font-semibold text-slate-500">{stat.label}</p>
                <p className={`font-display font-extrabold text-xl mt-0.5 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate name, role, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'new', label: 'New' },
                { id: 'shortlisted', label: 'Shortlisted' },
                { id: 'interview_scheduled', label: 'Interviews' },
                { id: 'offered', label: 'Offered' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-brand-navy text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applicants Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-crm w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Role & Dept</th>
                    <th className="py-3.5 px-4">Experience & CTC</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredApplicants.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApplicant(app)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs uppercase border border-slate-200">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 hover:text-[#0084D1] transition-colors">
                              {app.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-brand-navy">{app.role}</p>
                        <p className="text-[10px] text-slate-400">{app.department}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-700">{app.experience}</p>
                        <p className="text-[11px] text-emerald-600 font-bold">
                          {app.expectedCtc || 'CTC: Discuss'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <a
                            href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`mailto:${app.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          {app.linkedin && (
                            <a
                              href={app.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-colors"
                              title="LinkedIn Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplicant(app);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl btn-multicolor"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: WORKFORCE & ATTENDANCE ───────────────────────────── */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</p>
                <p className="text-3xl font-display font-extrabold text-brand-navy mt-1">218</p>
                <p className="text-xs text-slate-400 mt-1">Across 6 operational divisions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0084D1] flex items-center justify-center font-black">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Today</p>
                <p className="text-3xl font-display font-extrabold text-emerald-600 mt-1">95.8%</p>
                <p className="text-xs text-slate-400 mt-1">209 active staff clocked in</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desktrack Productivity</p>
                <p className="text-3xl font-display font-extrabold text-purple-600 mt-1">8.4 hrs</p>
                <p className="text-xs text-slate-400 mt-1">Avg productive screen time</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-800 mb-4">
              Departmental Roster & Capacity Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Audit & Tax (Chartered Accountants)', staff: 46, present: 45, head: 'CA Sunil Sharma' },
                { name: 'Corporate Sales & Business Dev', staff: 68, present: 65, head: 'Rajesh Verma' },
                { name: 'Operations & ROC Filings', staff: 54, present: 52, head: 'Meera Deshpande' },
                { name: 'IT & Software Engineering', staff: 18, present: 18, head: 'Lead Architect' },
                { name: 'Marketing, Social & Media Hub', staff: 12, present: 11, head: 'Aishwarya Kadam' },
                { name: 'HR, Payroll & Accounts Desk', staff: 20, present: 18, head: 'HR Team Lead' },
              ].map((dept, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-slate-800">{dept.name}</p>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {dept.present}/{dept.staff}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Team Lead: <span className="text-slate-600 font-semibold">{dept.head}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ACCOUNTS & PAYROLL ────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Monthly Payroll</p>
              <p className="text-2xl font-display font-extrabold text-brand-navy mt-1">₹54,80,000</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">₹51.2L disbursed on 1st</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Sales Commissions</p>
              <p className="text-2xl font-display font-extrabold text-amber-600 mt-1">₹2,10,000</p>
              <p className="text-xs text-slate-400 mt-1">Based on closed Won deals</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Franchise Payouts</p>
              <p className="text-2xl font-display font-extrabold text-purple-600 mt-1">₹1,50,000</p>
              <p className="text-xs text-slate-400 mt-1">12 branches payout scheduled</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Receivables Pending</p>
              <p className="text-2xl font-display font-extrabold text-rose-600 mt-1">₹14,25,000</p>
              <p className="text-xs text-slate-400 mt-1">11 overdue client invoices</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-slate-800">
                Recent Billing & Commission Disbursement Queue
              </h3>
              <span className="badge badge-navy">Accounts Receivable</span>
            </div>
            <div className="space-y-3">
              {[
                { client: 'M/s Phoenix Auto Components', inv: 'INV-2026-881', amount: '₹48,000', service: 'Annual ROC Compliance & Tax Audit', status: 'Paid via Razorpay' },
                { client: 'Apex Biotech Innovations LLP', inv: 'INV-2026-882', amount: '₹22,500', service: 'GST Notice Response Section 73', status: 'Pending Approval' },
                { client: 'Zenith Logistics Hub', inv: 'INV-2026-883', amount: '₹65,000', service: 'Custom SaaS Fleet Module (Advance 50%)', status: 'Paid via RTGS' },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{inv.client}</p>
                    <p className="text-slate-400 text-[11px]">{inv.inv} • {inv.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-800 text-sm">{inv.amount}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status.includes('Paid') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CANDIDATE PROFILE DETAIL DRAWER / MODAL ────────────────── */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-sm">
                  {selectedApplicant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">
                    {selectedApplicant.name}
                  </h3>
                  <p className="text-xs text-brand-navy font-semibold">{selectedApplicant.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Status Badge & Stage Actions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Current Stage</p>
                  <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'shortlisted')}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'interview_scheduled', { interviewDate: 'Scheduled for Tomorrow 3 PM' })}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                  >
                    Set Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'offered')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Give Offer
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-semibold">Phone Number</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApplicant.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Email Address</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApplicant.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Experience</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApplicant.experience}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Expected CTC</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedApplicant.expectedCtc || 'Not specified'}</p>
                </div>
                {selectedApplicant.noticePeriod && (
                  <div>
                    <p className="text-slate-400 font-semibold">Notice Period</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedApplicant.noticePeriod}</p>
                  </div>
                )}
                {selectedApplicant.linkedin && (
                  <div>
                    <p className="text-slate-400 font-semibold">Portfolio / Profile</p>
                    <a
                      href={selectedApplicant.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#0084D1] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Resume File */}
              {selectedApplicant.resumeUrl && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0084D1]" />
                    <div>
                      <p className="font-bold text-slate-800">Uploaded Resume Attachment</p>
                      <p className="text-[11px] text-slate-500">{selectedApplicant.resumeFileName || 'resume.pdf'}</p>
                    </div>
                  </div>
                  <a
                    href={`${API_BASE}${selectedApplicant.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl btn-multicolor font-bold"
                  >
                    Download CV
                  </a>
                </div>
              )}

              {/* Notes & Feedback */}
              <div className="space-y-3">
                <p className="font-bold text-slate-800">HR & Interview Notes</p>
                <div className="space-y-2">
                  {selectedApplicant.notes && selectedApplicant.notes.length > 0 ? (
                    selectedApplicant.notes.map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                        {n}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No interview notes recorded yet.</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add interview assessment note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote(selectedApplicant.id)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 font-medium"
                  />
                  <button
                    onClick={() => handleAddNote(selectedApplicant.id)}
                    className="px-3.5 py-2 btn-multicolor rounded-lg font-bold transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
