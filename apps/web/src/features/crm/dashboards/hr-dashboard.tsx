import React from 'react';
import {
  UserCheck,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';

export default function HrDashboard() {
  const applicants = [
    { name: 'Snehal Deshmukh', role: 'Semi-Qualified CA / Audit Senior', exp: '3 Years', status: 'Interview Scheduled', date: 'Today, 3:00 PM' },
    { name: 'Aditya Shirole', role: 'Telecaller / Inside Sales Exec', exp: '1.5 Years', status: 'Shortlisted', date: 'Tomorrow, 11:30 AM' },
    { name: 'Prajakta Patil', role: 'GST Operations Executive', exp: '2 Years', status: 'Offer Sent', date: 'Pending Joining' },
    { name: 'Kunal Joshi', role: 'Full Stack React Developer', exp: '4 Years', status: 'Technical Review', date: '26 Aug 2026' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Human Resources & Talent Desk
            </h1>
            <span className="badge badge-gold">People Operations</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Staff roster across 16 role definitions, daily attendance tracking, Desktrack productivity & candidate recruitment.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          200+ Total Team Members
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Headcount', value: '200+ Staff', sub: 'Across 16 role levels', icon: Users, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Attendance Today', value: '96.2%', sub: '192 / 200 present', icon: UserCheck, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Open Job Positions', value: '6 Roles', sub: 'Sales, CA, Operations', icon: Briefcase, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Applications in Funnel', value: '24 Candidates', sub: 'From Careers portal', icon: Calendar, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Recruitment Pipeline Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Active Candidate Recruitment Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Interview schedules and hiring lifecycle status</p>
          </div>
          <span className="badge badge-navy">Recruitment</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Applied Role</th>
                <th>Experience</th>
                <th>Interview Schedule</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800 text-xs">{app.name}</td>
                  <td className="text-xs text-brand-navy font-semibold">{app.role}</td>
                  <td className="text-xs text-slate-600">{app.exp}</td>
                  <td className="text-xs text-slate-700 font-semibold">{app.date}</td>
                  <td className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      app.status === 'Offer Sent' ? 'bg-emerald-50 text-emerald-700' :
                      app.status === 'Interview Scheduled' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {app.status}
                    </span>
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
