import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  PhoneCall,
  MessageCircle,
  Plus,
  Send,
  Download,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  X,
  MapPin,
  RefreshCw,
  Eye,
  Columns3,
  Trash2,
  UserCog,
  ChevronDown,
  Trophy,
  Award,
} from 'lucide-react';

export default function CrmLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [callRemarks, setCallRemarks] = useState('');
  const [callStatus, setCallStatus] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(17281);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Service ID → Name map (fetched once)
  const [serviceMap, setServiceMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/v1/crm/services')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) {
          const map: Record<string, string> = {};
          d.data.forEach((s: any) => {
            map[String(s.service_id)] = s.service_name;
          });
          setServiceMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const resolveServiceName = (raw: any): string => {
    if (!raw) return '—';
    const key = String(raw).trim();
    // If it's a numeric key, look up in serviceMap
    if (/^\d+$/.test(key)) {
      return serviceMap[key] || `Service #${key}`;
    }
    return key; // Already a name string
  };


  // Column visibility
  const [colDropOpen, setColDropOpen] = useState(false);
  const colDropRef = useRef<HTMLDivElement>(null);
  const [visibleCols, setVisibleCols] = useState({
    city: true,
    contact: true,
    email: true,
    service: true,
    source: true,
    status: true,
  });
  type ColKey = keyof typeof visibleCols;
  const COL_LABELS: Record<ColKey, string> = {
    city: 'Lead / City', contact: 'Contact Phone', email: 'Email',
    service: 'Service', source: 'Source', status: 'Status',
  };

  // Close col dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colDropRef.current && !colDropRef.current.contains(e.target as Node)) {
        setColDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Export CSV
  const exportToCSV = () => {
    const rows = [
      ['Name', 'City', 'Contact', 'Email', 'Service', 'Source', 'Status'],
      ...leads.map((l) => [
        l.name ?? '',
        l.city ?? '',
        l.contact ?? '',
        l.email ?? '',
        l.service ?? '',
        l.source ?? '',
        l.lead_type === 0 ? 'New' : l.lead_type === 1 ? 'Assigned' : 'Active',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etaxwala-leads-page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadContact, setNewLeadContact] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadService, setNewLeadService] = useState('Private Limited Company Registration');
  const [newLeadCity, setNewLeadCity] = useState('Pune');
  const [newLeadSource, setNewLeadSource] = useState('Direct Inflow');

  const fetchLeads = () => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '50',
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(sourceFilter !== 'ALL' && { source: sourceFilter }),
    });

    fetch(`/v1/crm/leads?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setLeads(data.data);
          if (data.pagination?.total) {
            setTotalCount(data.pagination.total);
          }
        }
      })
      .catch((err) => console.error('Error loading leads:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, sourceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenCallModal = (lead: any) => {
    setSelectedLead(lead);
    setIsCallModalOpen(true);
  };

  const handleSaveCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await fetch('/v1/crm/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          caller_id: 1,
          status: Number(callStatus),
          remarks: callRemarks,
          contact: selectedLead.contact,
        }),
      });
      alert('✅ Call outcome saved to database successfully!');
    } catch (err) {
      console.error('Failed to log call:', err);
    }

    setIsCallModalOpen(false);
    setCallRemarks('');
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadName,
          contact: newLeadContact,
          email: newLeadEmail,
          service: newLeadService,
          city: newLeadCity,
          source: newLeadSource,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        alert('🎉 New lead saved into PostgreSQL database!');
        setIsAddLeadModalOpen(false);
        setNewLeadName('');
        setNewLeadContact('');
        setNewLeadEmail('');
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Lead Pipeline Management
            </h1>
            <span className="badge badge-gold font-mono">{totalCount.toLocaleString()} Live Leads</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter by lead source/campaign, assign to telecallers & log live customer calls in PostgreSQL.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setIsAddLeadModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> + Add Manual Lead
          </button>
          <button onClick={exportToCSV} className="btn btn-outline btn-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchLeads} className="btn btn-outline btn-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by lead name, mobile (+91), email, or city..."
            className="w-full bg-[#F7F8FA] border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-navy"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#F7F8FA] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-navy"
          >
            <option value="ALL">All Statuses</option>
            <option value="0">New Leads</option>
            <option value="1">Assigned</option>
            <option value="2">In Progress</option>
            <option value="3">Follow Up</option>
            <option value="4">Converted / Closed</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#F7F8FA] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-navy"
          >
            <option value="ALL">All Sources</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Website Inquiry">Website Inquiry</option>
            <option value="Direct Referral">Direct Referral</option>
            <option value="Udyomi Sub-brand">Udyami Kisan</option>
            <option value="Sahakar Sub-brand">Sahakar Samriddhi</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display font-bold text-base text-slate-800">
            Live Leads Queue ({leads.length} Showing on Page {page})
          </h3>
          <div className="flex items-center gap-2">
            <span className="badge badge-navy">Connected to PostgreSQL `leads`</span>
            {/* Column Visibility Dropdown */}
            <div className="relative" ref={colDropRef}>
              <button
                onClick={() => setColDropOpen((o) => !o)}
                className="btn btn-outline btn-sm flex items-center gap-1.5"
                id="col-visibility-btn"
              >
                <Columns3 className="w-3.5 h-3.5" /> Columns <ChevronDown className="w-3 h-3" />
              </button>
              {colDropOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg p-3 w-48 space-y-1 animate-fade-in">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Show / Hide Columns</p>
                  {(Object.keys(visibleCols) as ColKey[]).map((col) => (
                    <label key={col} className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleCols[col]}
                        onChange={() => setVisibleCols((prev) => ({ ...prev, [col]: !prev[col] }))}
                        className="w-3.5 h-3.5 accent-brand-navy"
                      />
                      <span className="text-xs font-medium text-slate-700">{COL_LABELS[col]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-brand-navy/5 border border-brand-navy/20 rounded-xl px-4 py-2.5 animate-fade-in">
            <span className="text-xs font-bold text-brand-navy">{selectedIds.size} lead(s) selected</span>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline btn-sm text-xs">
                <UserCog className="w-3.5 h-3.5" /> Reassign
              </button>
              <button className="btn btn-outline btn-sm text-xs text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={clearSelection} className="text-xs text-slate-500 hover:text-slate-700 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                {/* Bulk select checkbox */}
                <th className="w-8">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selectedIds.size === leads.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-brand-navy"
                  />
                </th>
                {visibleCols.city && <th>Lead / City</th>}
                {visibleCols.contact && <th>Contact Phone</th>}
                {visibleCols.service && <th>Inquired Service</th>}
                {visibleCols.source && <th>Source</th>}
                {visibleCols.status && <th>Status</th>}
                <th className="text-right">Quick Dial & Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-navy" />
                    Fetching live leads from database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className={selectedIds.has(lead.id) ? 'bg-blue-50/40' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-3.5 h-3.5 accent-brand-navy"
                      />
                    </td>
                    {visibleCols.city && (
                      <td>
                        <p className="font-bold text-slate-800 text-xs">{lead.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {lead.city || 'India'} • #{lead.id}
                        </p>
                      </td>
                    )}
                    {visibleCols.contact && (
                      <td>
                        <p className="text-xs font-mono font-bold text-brand-navy">{lead.contact}</p>
                        {visibleCols.email && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{lead.email}</p>
                        )}
                      </td>
                    )}
                    {visibleCols.service && (
                      <td className="text-xs text-slate-700 font-medium" title={resolveServiceName(lead.service)}>
                        {resolveServiceName(lead.service).length > 32
                          ? resolveServiceName(lead.service).slice(0, 32) + '…'
                          : resolveServiceName(lead.service)}
                      </td>
                    )}

                    {visibleCols.source && (
                      <td>
                        <span className="badge badge-navy text-[10px]">
                          {lead.source || 'Inbound'}
                        </span>
                      </td>
                    )}
                    {visibleCols.status && (
                      <td>
                        {(() => {
                          const statusConfig: Record<number, { label: string; bg: string; text: string }> = {
                            0: { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700' },
                            1: { label: 'Assigned', bg: 'bg-amber-50', text: 'text-amber-700' },
                            2: { label: 'Contacted', bg: 'bg-indigo-50', text: 'text-indigo-700' },
                            3: { label: 'Follow-up', bg: 'bg-purple-50', text: 'text-purple-700' },
                            4: { label: 'Won', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                            5: { label: 'Lost', bg: 'bg-rose-50', text: 'text-rose-700' },
                          };
                          const sc = statusConfig[lead.lead_type] || { label: 'Active', bg: 'bg-slate-100', text: 'text-slate-700' };
                          return (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}
                            >
                              {sc.label}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/crm/leads/${lead.id}/won`}
                          className="btn btn-sm text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-sm px-2.5"
                          title="Convert to Won Customer"
                        >
                          <Trophy className="w-3 h-3" /> Won
                        </Link>
                        <button onClick={() => handleOpenCallModal(lead)} className="btn btn-primary btn-sm text-xs">
                          <PhoneCall className="w-3 h-3" /> Call
                        </button>
                        <a
                          href={`https://wa.me/${String(lead.contact).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            lead.name
                          )},%20I%20am%20calling%20from%20ETaxwala%20regarding%20your%20inquiry.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm text-xs px-2"
                          style={{ background: '#25D366', color: 'white' }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing page {page} of {Math.ceil(totalCount / 50)}</span>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(totalCount / 50)}
              onClick={() => setPage(page + 1)}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Call Log Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Log Call with {selectedLead?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedLead?.contact} • {selectedLead?.service}
                </p>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCall} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Call Outcome Status
                </label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="input text-xs font-semibold"
                >
                  <option value="1">Interested - Send Quotation</option>
                  <option value="2">Callback Requested / Follow Up Later</option>
                  <option value="3">Ringing / Not Answered</option>
                  <option value="4">Line Busy</option>
                  <option value="5">Payment Committed / Won</option>
                  <option value="6">Not Interested / Closed</option>
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
                  placeholder="e.g. Client agreed on ₹14,999 Pvt Ltd incorporation quote. Follow up tomorrow."
                  className="input text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(false)}
                  className="btn btn-outline btn-sm"
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

      {/* Add Manual Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Add New Manual Lead
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct entry into PostgreSQL `leads` table
                </p>
              </div>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Full Name</label>
                <input
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Mahesh Patil"
                  className="input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    value={newLeadContact}
                    onChange={(e) => setNewLeadContact(e.target.value)}
                    placeholder="9822011223"
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="mahesh@patil.com"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Inquired Service</label>
                  <input
                    type="text"
                    value={newLeadService}
                    onChange={(e) => setNewLeadService(e.target.value)}
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={newLeadCity}
                    onChange={(e) => setNewLeadCity(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Lead to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
