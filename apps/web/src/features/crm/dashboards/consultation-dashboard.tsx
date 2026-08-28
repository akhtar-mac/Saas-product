import React from 'react';
import {
  Calendar,
  Clock,
  PhoneCall,
  Video,
  UserCheck,
  CheckCircle2,
  Users,
  Building,
} from 'lucide-react';

export default function ConsultationDashboard() {
  const appointments = [
    { client: 'Vikram Joshi', phone: '+91 98234 11223', topic: 'Startup Tax Exemption (Section 80-IAC) Consultation', time: 'Today, 2:30 PM', mode: 'Google Meet Video', status: 'Confirmed' },
    { client: 'Anand Kulkarni', phone: '+91 97654 44332', topic: 'Pvt Ltd vs LLP Structure Advisory', time: 'Today, 4:00 PM', mode: 'Telephonic', status: 'Confirmed' },
    { client: 'Manisha Reddy', phone: '+91 99887 66554', topic: 'Export-Import Tax Incentive Planning', time: 'Tomorrow, 11:00 AM', mode: 'Telephonic', status: 'Scheduled' },
    { client: 'Rajendra Deshmukh', phone: '+91 98900 12345', topic: 'FPC NABARD Subsidy Scheme Guidance', time: '26 Aug, 10:30 AM', mode: 'Google Meet Video', status: 'Confirmed' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Consultation & Client Appointment Desk
            </h1>
            <span className="badge badge-gold">Advisory Hub</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage booked business consultations, advisory video calls, and convert advisory clients into services.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          Google Meet & Telephony Synced
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Appointments Today', value: '4 Calls', sub: '2 Video, 2 Phone', icon: Calendar, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Consultation Conversion', value: '45.8%', sub: 'Converted to paid service', icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Completed This Week', value: '18 Sessions', sub: 'Rated 4.9 / 5.0 CSAT', icon: UserCheck, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
          { title: 'Pipeline Value Created', value: '₹3,40,000', sub: 'From advisory calls', icon: Clock, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
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

      {/* Scheduled Appointments Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Upcoming Advisory Appointments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Direct link to join Google Meet or call the client</p>
          </div>
          <span className="badge badge-navy">Appointments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Client Name / Phone</th>
                <th>Advisory Topic</th>
                <th>Schedule Time</th>
                <th>Mode</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, idx) => (
                <tr key={idx}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{a.client}</p>
                    <p className="text-[10px] font-mono text-brand-navy font-bold">{a.phone}</p>
                  </td>
                  <td className="text-xs text-slate-700 font-medium">{a.topic}</td>
                  <td className="text-xs text-slate-600 font-semibold">{a.time}</td>
                  <td>
                    <span className="badge badge-navy text-[10px]">{a.mode}</span>
                  </td>
                  <td>
                    <span className="badge badge-green text-[10px]">{a.status}</span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-primary btn-sm">
                      <PhoneCall className="w-3.5 h-3.5" /> Join Session
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
