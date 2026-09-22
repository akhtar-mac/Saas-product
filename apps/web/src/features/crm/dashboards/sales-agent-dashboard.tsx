import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  MessageCircle,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Send,
  Calendar,
  Zap,
  PhoneForwarded,
  X,
  ArrowRight,
} from 'lucide-react';

export default function SalesAgentDashboard() {
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRemarks, setCallRemarks] = useState('');
  const [callStatus, setCallStatus] = useState('INTERESTED');

  const myLeads = [
    {
      id: 541,
      name: 'Ramesh Patel',
      phone: '+91 98220 11223',
      service: 'Private Limited Company Incorporation',
      source: 'Google Ads',
      status: 'Assigned',
      city: 'Ahmedabad',
      lastCall: 'Never',
    },
    {
      id: 542,
      name: 'Siddharth Roy',
      phone: '+91 97112 33445',
      service: 'FSSAI Food License + GST',
      source: 'Website Inquiry',
      status: 'Follow Up',
      city: 'Kolkata',
      lastCall: 'Yesterday, 4:15 PM (Requested quote)',
    },
    {
      id: 543,
      name: 'Kavita Sundaram',
      phone: '+91 94440 55667',
      service: 'Trademark Registration & Search',
      source: 'Direct Referral',
      status: 'Quote Sent',
      city: 'Chennai',
      lastCall: '2 hrs ago (Quote ₹6,999 sent)',
    },
    {
      id: 544,
      name: 'Gaurav Jain',
      phone: '+91 98100 77889',
      service: 'Income Tax Return (ITR-3 Business)',
      source: 'ITR Funnel',
      status: 'Assigned',
      city: 'Delhi',
      lastCall: 'Never',
    },
  ];

  const handleOpenCallModal = (lead: any) => {
    setSelectedLead(lead);
    setIsCallModalOpen(true);
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallModalOpen(false);
    setCallRemarks('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Telecalling & Lead Workbench
            </h1>
            <span className="badge badge-gold">Sales Executive</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dial assigned leads directly, log conversation outcomes, trigger WhatsApp templates & send instant quotations.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/crm/quotations" className="btn btn-gold btn-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> + Create New Quote
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'My Assigned Queue', value: '18 Leads', sub: '4 pending 1st call', icon: Clock, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Calls Logged Today', value: '24 Calls', sub: 'Daily Target: 40 calls', icon: PhoneCall, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Quotations Sent', value: '7 Quotes', sub: 'Total Value: ₹94,500', icon: FileSpreadsheet, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Deals Converted', value: '2 Closed', sub: 'Revenue: ₹32,998', icon: CheckCircle2, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display font-bold text-2xl text-slate-800">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leads Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Active Assigned Priority Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click call to dial and save conversation logs</p>
          </div>
          <span className="badge badge-navy">Priority Leads</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Lead / City</th>
                <th>Phone Number</th>
                <th>Inquired Service</th>
                <th>Source</th>
                <th>Status</th>
                <th className="text-right">Quick Dial Actions</th>
              </tr>
            </thead>
            <tbody>
              {myLeads.map((lead) => (
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
                    <span className="badge badge-navy text-[10px]">{lead.source}</span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      lead.status === 'Assigned' ? 'bg-blue-50 text-blue-700' :
                      lead.status === 'Follow Up' ? 'bg-amber-50 text-amber-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
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
                  {selectedLead?.phone} • {selectedLead?.service}
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
    </div>
  );
}
