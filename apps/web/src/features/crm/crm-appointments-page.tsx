import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Phone,
  Video,
  MapPin,
  CheckCircle2,
  X,
  Filter,
  Download,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface Appointment {
  id: number;
  name: string;
  mobile: string;
  email: string;
  city: string;
  message: string;
  date: string;
  time: string;
  mode: 'Telephonic' | 'Office Visit' | 'Video Call';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  addedBy: string;
  createdAt: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    name: 'Rahul Deshmukh',
    mobile: '9876543210',
    email: 'rahul@example.com',
    city: 'Pune',
    message: 'Need consultation for Pvt Ltd registration.',
    date: '2026-09-20',
    time: '11:00 AM',
    mode: 'Office Visit',
    status: 'Confirmed',
    addedBy: 'Website',
    createdAt: '2026-09-18',
  },
  {
    id: 2,
    name: 'Sneha Patil',
    mobile: '9123456780',
    email: 'sneha@example.com',
    city: 'Mumbai',
    message: 'GST return filing discussion.',
    date: '2026-09-21',
    time: '02:30 PM',
    mode: 'Video Call',
    status: 'Pending',
    addedBy: 'Sales Agent',
    createdAt: '2026-09-19',
  },
  {
    id: 3,
    name: 'Amit Sharma',
    mobile: '9988776655',
    email: 'amit@example.com',
    city: 'Nashik',
    message: 'Trademark registration query.',
    date: '2026-09-19',
    time: '10:00 AM',
    mode: 'Telephonic',
    status: 'Completed',
    addedBy: 'Website',
    createdAt: '2026-09-17',
  },
  {
    id: 4,
    name: 'Priya Kulkarni',
    mobile: '8899001122',
    email: 'priya@example.com',
    city: 'Aurangabad',
    message: 'FSSAI license guidance required.',
    date: '2026-09-22',
    time: '04:00 PM',
    mode: 'Office Visit',
    status: 'Pending',
    addedBy: 'Website',
    createdAt: '2026-09-19',
  },
];

const MODE_ICONS = {
  Telephonic: Phone,
  'Office Visit': MapPin,
  'Video Call': Video,
};

const STATUS_BADGES = {
  Pending: 'badge-gold',
  Confirmed: 'badge-blue',
  Completed: 'badge-green',
  Cancelled: 'badge-red',
};

export default function CrmAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile.includes(search) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesMode = modeFilter === 'all' || a.mode === modeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = (id: number, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(`Appointment marked as ${status}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter((a) => a.date === today).length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00A896]" />
            Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, confirm and manage all customer appointments across channels.
          </p>
        </div>
        <button
          onClick={() => showToast('Export functionality will be connected to API', 'success')}
          className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Today</p>
          <p className="text-2xl font-bold text-[#1B365D] mt-1">{todayCount}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{confirmedCount}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-3 border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile or city..."
            className="input w-full pl-9 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-xs"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="input text-xs"
        >
          <option value="all">All Modes</option>
          <option value="Telephonic">Telephonic</option>
          <option value="Office Visit">Office Visit</option>
          <option value="Video Call">Video Call</option>
        </select>
      </div>

      {/* Table */}
      <div className="card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-crm w-full text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DD]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Date & Time</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Mode</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">City</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Source</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((appt) => {
                const ModeIcon = MODE_ICONS[appt.mode];
                return (
                  <tr key={appt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{appt.name}</div>
                      <div className="text-[10px] text-slate-500">{appt.mobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {appt.date}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {appt.time}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-navy text-[10px] flex items-center gap-1 w-fit mx-auto">
                        <ModeIcon className="w-3 h-3" />
                        {appt.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{appt.city}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge text-[10px] ${STATUS_BADGES[appt.status]}`}>{appt.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{appt.addedBy}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAppointment(appt)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold btn-multicolor"
                        >
                          View
                        </button>
                        {appt.status === 'Pending' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Confirmed')}
                            className="px-2 py-1 rounded-xl text-[10px] font-semibold btn-multicolor"
                          >
                            Confirm
                          </button>
                        )}
                        {appt.status === 'Confirmed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Completed')}
                            className="px-2 py-1 rounded-xl text-[10px] font-semibold btn-multicolor"
                          >
                            Complete
                          </button>
                        )}
                        {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Cancelled')}
                            className="px-2 py-1 rounded-xl text-[10px] font-semibold btn-multicolor"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No appointments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1B365D]">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Customer</label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAppointment.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile</label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAppointment.mobile}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAppointment.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAppointment.city}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedAppointment.date}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Time</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedAppointment.time}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mode</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedAppointment.mode}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <p className="text-sm font-semibold">
                    <span className={`badge text-[10px] ${STATUS_BADGES[selectedAppointment.status]}`}>
                      {selectedAppointment.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-slate-100 text-xs text-slate-700">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 inline mr-1.5" />
                  {selectedAppointment.message || 'No message provided.'}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
