import React, { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  Phone,
  Mail,
  Activity,
  Briefcase,
  PhoneCall,
  Shield,
  Building,
  Headphones,
  Code,
  BarChart3,
  Star,
  Clock,
  CheckCircle2,
  RefreshCw,
  Filter,
} from 'lucide-react';

/* ─── Data ─── */
type StaffStatus = 'Online' | 'On Call' | 'In Review' | 'Offline';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  dept: string;
  deptKey: string;
  contact: string;
  email: string;
  activeCases: string;
  status: StaffStatus;
  joiningDate: string;
}

const STAFF_DATA: StaffMember[] = [
  // Executive
  { id: 1, name: 'Amit Deshmukh', role: 'Super Admin', dept: 'Executive', deptKey: 'executive', contact: '9800000001', email: 'amit@etaxwala.com', activeCases: 'All Access', status: 'Online', joiningDate: '2018-03-12' },
  { id: 2, name: 'Priya Nair', role: 'General Administrator', dept: 'Executive', deptKey: 'executive', contact: '9800000002', email: 'priya@etaxwala.com', activeCases: 'Platform Ops', status: 'Online', joiningDate: '2019-06-01' },
  // Sales
  { id: 3, name: 'Rahul Sharma', role: 'Sales Manager', dept: 'Sales', deptKey: 'sales', contact: '9822011223', email: 'rahul@etaxwala.com', activeCases: '48 Leads', status: 'Online', joiningDate: '2020-01-10' },
  { id: 4, name: 'Sneha Jadhav', role: 'Sales Agent', dept: 'Sales', deptKey: 'sales', contact: '9822011224', email: 'sneha@etaxwala.com', activeCases: '62 Calls today', status: 'On Call', joiningDate: '2021-03-15' },
  { id: 5, name: 'Rohan Pawar', role: 'Sales Agent', dept: 'Sales', deptKey: 'sales', contact: '9822011225', email: 'rohan@etaxwala.com', activeCases: '41 Calls today', status: 'On Call', joiningDate: '2021-07-20' },
  { id: 6, name: 'Meera Kulkarni', role: 'Sales Assistant', dept: 'Sales', deptKey: 'sales', contact: '9822011226', email: 'meera@etaxwala.com', activeCases: '29 Calls today', status: 'Online', joiningDate: '2022-01-05' },
  // Operations
  { id: 7, name: 'CA Pooja Kulkarni', role: 'Operations Manager', dept: 'Operations', deptKey: 'operations', contact: '9833000101', email: 'pooja@etaxwala.com', activeCases: '26 Cases', status: 'Online', joiningDate: '2019-09-01' },
  { id: 8, name: 'Vikas Shinde', role: 'Operations Specialist', dept: 'Operations', deptKey: 'operations', contact: '9833000102', email: 'vikas@etaxwala.com', activeCases: '14 Filings', status: 'Offline', joiningDate: '2020-06-10' },
  { id: 9, name: 'Ravi Kumar', role: 'Operations Specialist', dept: 'Operations', deptKey: 'operations', contact: '9833000103', email: 'ravi@etaxwala.com', activeCases: '11 Filings', status: 'In Review', joiningDate: '2021-02-14' },
  { id: 10, name: 'Sunita Patil', role: 'QC Reviewer', dept: 'Operations', deptKey: 'operations', contact: '9833000104', email: 'sunita@etaxwala.com', activeCases: '8 Reviews', status: 'Online', joiningDate: '2020-11-22' },
  // Finance
  { id: 11, name: 'Anil Mehta', role: 'Accounts Lead', dept: 'Finance', deptKey: 'finance', contact: '9844100101', email: 'anil@etaxwala.com', activeCases: '₹4.2L Reconciled', status: 'Online', joiningDate: '2019-01-15' },
  { id: 12, name: 'Kavita Joshi', role: 'GST Billing Specialist', dept: 'Finance', deptKey: 'finance', contact: '9844100102', email: 'kavita@etaxwala.com', activeCases: '32 Invoices', status: 'Online', joiningDate: '2020-04-01' },
  // Franchise
  { id: 13, name: 'Mohan Rao', role: 'Franchise Manager', dept: 'Partnerships', deptKey: 'franchise', contact: '9855200101', email: 'mohan@etaxwala.com', activeCases: '124 Centers', status: 'Online', joiningDate: '2018-08-01' },
  // CA / Legal
  { id: 14, name: 'CA Deepak Verma', role: 'CA Expert', dept: 'CA/Legal', deptKey: 'ca', contact: '9866300101', email: 'deepak@etaxwala.com', activeCases: '4 Tax Audits', status: 'In Review', joiningDate: '2019-03-10' },
  // HR
  { id: 15, name: 'Anjali Singh', role: 'HR Manager', dept: 'HR', deptKey: 'hr', contact: '9877400101', email: 'anjali@etaxwala.com', activeCases: '200+ Staff', status: 'Online', joiningDate: '2020-07-15' },
  // Support
  { id: 16, name: 'Kiran Das', role: 'Support Executive', dept: 'Support', deptKey: 'support', contact: '9888500101', email: 'kiran@etaxwala.com', activeCases: '18 Tickets', status: 'Online', joiningDate: '2022-03-01' },
];

const DEPARTMENTS = [
  { key: 'all', label: 'All Departments', icon: Users, count: 200, color: '#003A66', bg: 'bg-blue-50' },
  { key: 'sales', label: 'Sales & Telecalling', icon: PhoneCall, count: 52, color: '#059669', bg: 'bg-emerald-50' },
  { key: 'operations', label: 'Operations', icon: CheckCircle2, count: 84, color: '#7C3AED', bg: 'bg-purple-50' },
  { key: 'finance', label: 'Finance & Accounts', icon: Building, count: 12, color: '#D97706', bg: 'bg-amber-50' },
  { key: 'franchise', label: 'Franchise', icon: Briefcase, count: 15, color: '#D97706', bg: 'bg-amber-50' },
  { key: 'ca', label: 'CA / Legal', icon: Shield, count: 14, color: '#003A66', bg: 'bg-blue-50' },
  { key: 'hr', label: 'HR & Admin', icon: UserCheck, count: 8, color: '#059669', bg: 'bg-emerald-50' },
  { key: 'support', label: 'Support & Help', icon: Headphones, count: 15, color: '#64748b', bg: 'bg-slate-50' },
];

const STATUS_CONFIG: Record<StaffStatus, { bg: string; dot: string; label: string }> = {
  Online: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Online' },
  'On Call': { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'On Call' },
  'In Review': { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'In Review' },
  Offline: { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: 'Offline' },
};

export default function HrWorkforcePage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'ALL'>('ALL');

  const filtered = STAFF_DATA.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || s.deptKey === deptFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const onlineCount = STAFF_DATA.filter((s) => s.status === 'Online').length;
  const onCallCount = STAFF_DATA.filter((s) => s.status === 'On Call').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              HR & Workforce Management
            </h1>
            <span className="badge badge-gold font-mono">200+ Staff Members</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time staff roster with department-wise breakdown, live workload counter, and RBAC role management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-700">{onCallCount} On Call</span>
          </div>
        </div>
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const isActive = deptFilter === dept.key;
          return (
            <button
              key={dept.key}
              onClick={() => setDeptFilter(dept.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                isActive
                  ? 'bg-brand-navy text-white border-brand-navy shadow-md'
                  : 'bg-white border-slate-200 hover:border-brand-navy hover:shadow-sm'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : dept.bg}`}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : dept.color }} />
              </div>
              <div>
                <p className={`text-[10px] font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-700'}`}>
                  {dept.label}
                </p>
                <p className={`text-xs font-bold ${isActive ? 'text-white/80' : 'text-brand-navy'}`}>{dept.count}+</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or department..."
            className="w-full bg-[#F7F8FA] border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-navy"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StaffStatus | 'ALL')}
          className="bg-[#F7F8FA] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Online">Online</option>
          <option value="On Call">On Call</option>
          <option value="In Review">In Review</option>
          <option value="Offline">Offline</option>
        </select>
        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} staff shown</span>
      </div>

      {/* Staff Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-800">Staff Roster & Live Activity</h3>
          <span className="badge badge-navy">16 RBAC Role Levels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Active Workload</th>
                <th>Joining Date</th>
                <th className="text-right">Live Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No staff members found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((staff) => {
                  const statusCfg = STATUS_CONFIG[staff.status];
                  return (
                    <tr key={staff.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brand-navy text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{staff.name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs font-semibold text-brand-navy">{staff.role}</td>
                      <td className="text-xs text-slate-500">{staff.dept}</td>
                      <td className="text-xs font-mono text-slate-700">{staff.contact}</td>
                      <td className="text-xs font-semibold text-slate-700">{staff.activeCases}</td>
                      <td className="text-xs text-slate-500">
                        {new Date(staff.joiningDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${staff.status === 'Online' ? 'animate-pulse' : ''}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} of 200+ registered staff members</span>
          <span className="font-medium text-brand-navy">Real-time RBAC System Active</span>
        </div>
      </div>
    </div>
  );
}
