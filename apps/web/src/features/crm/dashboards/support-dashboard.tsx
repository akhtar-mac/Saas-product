import React from 'react';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  UserCheck,
  Send,
} from 'lucide-react';

export default function SupportDashboard() {
  const tickets = [
    { id: 'TCK-901', client: 'Rajesh Sharma', subject: 'SPICe+ MCA name search update', priority: 'High', status: 'In Progress', created: '20 mins ago' },
    { id: 'TCK-902', client: 'Kavita Sundaram', subject: 'Invoice duplicate copy download', priority: 'Low', status: 'Resolved', created: '2 hours ago' },
    { id: 'TCK-903', client: 'Siddharth Roy', subject: 'FSSAI renewal queries clarification', priority: 'Medium', status: 'Open', created: '3 hours ago' },
    { id: 'TCK-904', client: 'Anand Shinde', subject: 'DSC token USB courier tracking number', priority: 'Medium', status: 'In Progress', created: '4 hours ago' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Customer Support & Grievance Desk
            </h1>
            <span className="badge badge-gold">Client Helpdesk</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resolve client tickets, handle WhatsApp support inquiries, and manage first response time SLA.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          Avg Resolution: 2.4 Hours
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Open Tickets', value: '6 Tickets', sub: '2 High priority', icon: LifeBuoy, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Resolved Today', value: '28 Tickets', sub: '98.4% client CSAT', icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'First Response Time', value: '18 Mins', sub: 'SLA Target < 30 mins', icon: Clock, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
          { title: 'SLA Escalations', value: '0 Breaches', sub: '100% on-time resolution', icon: AlertCircle, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
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

      {/* Tickets Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Support Ticket Inbox & Response Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Assigned client tickets and urgent inquiries</p>
          </div>
          <span className="badge badge-navy">Inbox</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Client Name</th>
                <th>Subject / Query</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs font-bold text-brand-navy">{t.id}</td>
                  <td className="text-xs font-bold text-slate-800">{t.client}</td>
                  <td className="text-xs text-slate-600 font-medium">{t.subject}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.priority === 'High' ? 'bg-red-50 text-red-700' :
                      t.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                      t.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-primary btn-sm">
                      Open Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
