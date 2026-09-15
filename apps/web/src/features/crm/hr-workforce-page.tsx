import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Filter,
  UserPlus,
  Plus,
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import {
  PERMISSIONS_CATALOG,
  ROLE_DEFAULT_PERMISSIONS,
  ALL_PERMISSIONS,
} from './permissions';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ROLES = [
  { id: 1, name: 'Super Admin', color: '#003A66', group: 'Executive' },
  { id: 2, name: 'Admin', color: '#004d87', group: 'Executive' },
  { id: 3, name: 'Operations Manager', color: '#7C3AED', group: 'Operations' },
  { id: 4, name: 'Sales Manager', color: '#059669', group: 'Sales' },
  { id: 5, name: 'Marketing Manager', color: '#DB2777', group: 'Marketing' },
  { id: 6, name: 'Franchise Manager', color: '#0891B2', group: 'Partners' },
  { id: 7, name: 'Sales Employee', color: '#10B981', group: 'Sales' },
  { id: 8, name: 'Operations Employee', color: '#8B5CF6', group: 'Operations' },
  { id: 9, name: 'Marketing Employee', color: '#E11D48', group: 'Marketing' },
  { id: 10, name: 'Franchise Partner', color: '#0E7490', group: 'Partners' },
  { id: 11, name: 'Consultation', color: '#D97706', group: 'Experts' },
  { id: 12, name: 'Operations Assistant', color: '#DC2626', group: 'Operations' },
  { id: 13, name: 'Sales Assistant', color: '#047857', group: 'Sales' },
  { id: 14, name: 'HR', color: '#4F46E5', group: 'Administration' },
  { id: 15, name: 'Website Manager', color: '#16A34A', group: 'Administration' },
];

type StaffStatus = 'Online' | 'On Call' | 'In Review' | 'Offline';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  roleId: number;
  dept: string;
  deptKey: string;
  contact: string;
  email: string;
  activeCases: string;
  status: StaffStatus;
  joiningDate: string;
  permissions?: string[];
}

const INITIAL_STAFF_DATA: StaffMember[] = [
  { id: 1, name: 'Ganesh Nikam', role: 'Operations Employee', roleId: 8, dept: 'Operations', deptKey: 'operations', contact: '7020408012', email: 'ganesh.etaxwala@gmail.com', activeCases: 'Active', status: 'Online', joiningDate: '2025-09-02' },
  { id: 2, name: 'Shaikh Akhtar', role: 'Operations Manager', roleId: 3, dept: 'Operations', deptKey: 'operations', contact: '9876543210', email: 'akhtarshaikh0299@gmail.com', activeCases: 'Active', status: 'Online', joiningDate: '2025-07-20' },
  { id: 3, name: 'Pritam Amcure', role: 'Sales Employee', roleId: 7, dept: 'Sales', deptKey: 'sales', contact: '9822011223', email: 'pritam.etaxwala@gmail.com', activeCases: 'Active', status: 'Offline', joiningDate: '2025-06-06' },
  { id: 4, name: 'Shreya Joshi', role: 'Sales Employee', roleId: 7, dept: 'Sales', deptKey: 'sales', contact: '9822011224', email: 'shreya@gmail.com', activeCases: 'Active', status: 'Online', joiningDate: '2025-04-07' },
  { id: 5, name: 'Sneha Muley', role: 'Operations Assistant', roleId: 12, dept: 'Operations', deptKey: 'operations', contact: '9833000102', email: 'sneha.etaxwala@gmail.com', activeCases: 'Active', status: 'Offline', joiningDate: '2025-10-31' },
  { id: 6, name: 'Vardhaman Gandhi', role: 'Sales Assistant', roleId: 13, dept: 'Sales', deptKey: 'sales', contact: '9822011226', email: 'vardhaman.etaxwala@gmail.com', activeCases: 'Active', status: 'Offline', joiningDate: '2025-10-30' },
  { id: 7, name: 'Madhur Choudhari', role: 'Super Admin', roleId: 1, dept: 'Executive', deptKey: 'executive', contact: '9800000001', email: 'madhur.etaxwala@gmail.com', activeCases: 'All Access', status: 'Online', joiningDate: '2025-09-09' },
  { id: 8, name: 'Rutuja Gawande', role: 'Operations Employee', roleId: 8, dept: 'Operations', deptKey: 'operations', contact: '9833000104', email: 'rutuja.etaxwala@gmail.com', activeCases: 'Active', status: 'Online', joiningDate: '2025-05-13' },
  { id: 9, name: 'Shubhangi Gaikwad', role: 'Operations Employee', roleId: 8, dept: 'Operations', deptKey: 'operations', contact: '9833000105', email: 'shubhangi.etaxwala@gmail.com', activeCases: 'Active', status: 'Offline', joiningDate: '2025-05-13' },
  { id: 10, name: 'Kailas Gadekar', role: 'Operations Manager', roleId: 3, dept: 'Operations', deptKey: 'operations', contact: '1234567890', email: 'kailas@gmail.com', activeCases: 'Active', status: 'Offline', joiningDate: '2025-03-03' },
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
  Online: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', label: 'Online' },
  'On Call': { bg: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'On Call' },
  'In Review': { bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', label: 'In Review' },
  Offline: { bg: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500', label: 'Offline' },
};

export default function HrWorkforcePage() {
  const { staffToken } = useAuthStore();
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF_DATA);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'ALL'>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    role_id: 8, // Operations Employee default
    permissions: ROLE_DEFAULT_PERMISSIONS[8] || [],
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  // Open Modal
  const openAddModal = () => {
    const defaultRoleId = 8;
    setForm({
      name: '',
      email: '',
      contact: '',
      password: '',
      role_id: defaultRoleId,
      permissions: ROLE_DEFAULT_PERMISSIONS[defaultRoleId] || [],
    });
    setActionError(null);
    setShowAddModal(true);
  };

  // Role Change Handler -> update permissions
  const handleRoleChange = (roleId: number) => {
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[roleId] || [];
    setForm((prev) => ({
      ...prev,
      role_id: roleId,
      permissions: defaultPerms,
    }));
  };

  // Permission Checkbox Toggle
  const togglePermission = (key: string) => {
    setForm((prev) => {
      let updated: string[];
      if (prev.permissions.includes('*')) {
        updated = ALL_PERMISSIONS.filter((p) => p !== key);
      } else if (prev.permissions.includes(key)) {
        updated = prev.permissions.filter((p) => p !== key);
      } else {
        updated = [...prev.permissions, key];
      }
      return { ...prev, permissions: updated };
    });
  };

  // Reset to Role Defaults
  const resetToRoleDefaults = () => {
    const defaults = ROLE_DEFAULT_PERMISSIONS[form.role_id] || [];
    setForm((prev) => ({ ...prev, permissions: defaults }));
  };

  // Select All Permissions
  const selectAllPermissions = () => {
    setForm((prev) => ({ ...prev, permissions: ['*'] }));
  };

  // Fetch staff users from DB on page load
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          const mapped: StaffMember[] = data.data.map((u: any) => {
            const roleObj = ROLES.find((r) => r.id === u.role_id);
            return {
              id: u.id,
              name: u.name || u.username || 'Staff User',
              role: u.role_name || u.position || roleObj?.name || 'Staff Employee',
              roleId: u.role_id || 8,
              dept: roleObj?.group || 'Operations',
              deptKey: roleObj?.group.toLowerCase() || 'operations',
              contact: u.phone || '9876543210',
              email: u.email || 'staff@etaxwala.com',
              activeCases: u.is_active ? 'Active' : 'Inactive',
              status: u.is_active ? 'Online' : 'Offline',
              joiningDate: u.created_at ? u.created_at.split('T')[0] : '2026-09-01',
              permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : u.permissions || [],
            };
          });
          setStaffList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Add Employee Form Submit
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const selectedRole = ROLES.find((r) => r.id === form.role_id);
    const roleName = selectedRole?.name || 'Staff Employee';
    const deptKey = selectedRole?.group.toLowerCase() || 'operations';

    try {
      // Save directly to CRM users DB endpoint
      const res = await fetch(`${API_BASE}/v1/crm/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.contact,
          password: form.password || 'Password@123',
          role_id: form.role_id,
          position: roleName,
          permissions: form.permissions,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const newStaff: StaffMember = {
          id: data.data.id || Date.now(),
          name: data.data.name || form.name,
          role: data.data.role_name || roleName,
          roleId: data.data.role_id || form.role_id,
          dept: selectedRole?.group || 'Operations',
          deptKey,
          contact: data.data.phone || form.contact || '9876543210',
          email: data.data.email || form.email,
          activeCases: 'Active',
          status: 'Online',
          joiningDate: new Date().toISOString().split('T')[0],
          permissions: form.permissions,
        };
        setStaffList((prev) => [newStaff, ...prev]);
        setActionSuccess(`Employee "${form.name}" saved to database successfully as ${roleName}.`);
        setShowAddModal(false);
      } else {
        setActionError(data.error || 'Failed to save employee to database.');
      }
    } catch {
      setActionError('Network error: Failed to save employee to database.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = staffList.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.includes(search);
    const matchDept = deptFilter === 'all' || s.deptKey === deptFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const onlineCount = staffList.filter((s) => s.status === 'Online').length;
  const onCallCount = staffList.filter((s) => s.status === 'On Call').length;

  const categories = Array.from(new Set(PERMISSIONS_CATALOG.map((p) => p.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner matching ETaxwala Operations UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-[#1B365D]">
              MANAGE OPERATION EMPLOYEES
            </h1>
            <span className="badge badge-navy font-mono">{staffList.length} Active Staff</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational staff management, live attendance status, and role-based permissions assignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">{onlineCount} Online</span>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#A80038] hover:bg-[#88002E] text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" /> Add New Employeer
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="ml-auto">
            <X className="w-4 h-4 text-emerald-600 hover:text-emerald-800" />
          </button>
        </div>
      )}

      {/* Department Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const isActive = deptFilter === dept.key;
          return (
            <button
              key={dept.key}
              onClick={() => setDeptFilter(dept.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${isActive
                  ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-md'
                  : 'bg-white border-slate-200 hover:border-[#1B365D] hover:shadow-xs'
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
                <p className={`text-xs font-bold ${isActive ? 'text-white/80' : 'text-[#1B365D]'}`}>{dept.count}+</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Data..."
            className="w-full bg-[#F7F8FA] border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1B365D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#A80038] hover:bg-[#88002E] text-white font-bold text-xs rounded-xl shadow-xs"
            title="Add New Employee"
          >
            <UserPlus className="w-4 h-4" /> Add Employeer
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>User Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No employee found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((staff) => {
                  const statusCfg = STATUS_CONFIG[staff.status] || STATUS_CONFIG.Offline;
                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-bold text-slate-800 text-xs">{staff.name}</td>
                      <td className="text-xs text-slate-600">{staff.email}</td>
                      <td className="text-xs font-mono text-slate-700">{staff.contact}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${staff.status === 'Online' ? 'animate-pulse' : ''}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">
                        {staff.joiningDate}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-500">
                          <button onClick={openAddModal} className="hover:text-blue-600" title="Edit Employee">
                            ✏️
                          </button>
                          <button
                            onClick={() => setStaffList((prev) => prev.filter((s) => s.id !== staff.id))}
                            className="hover:text-red-600"
                            title="Delete Employee"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filtered.length} of {staffList.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 bg-slate-100 text-slate-600 rounded">Previous</button>
            <button className="px-2.5 py-1 bg-[#1B365D] text-white font-bold rounded">1</button>
            <button className="px-2 py-1 bg-slate-100 text-slate-600 rounded">Next</button>
          </div>
        </div>
      </div>

      {/* Add New Employeer & Role Permissions Modal matching Screenshot */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200">
            {/* Crimson Red Modal Header matching screenshot */}
            <div className="bg-[#A80038] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-wide">Add New Employeer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateEmployee} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F3EF]">
              {/* Name */}
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-xs font-bold text-white bg-[#A80038] px-3 py-2 rounded-lg text-center">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input text-xs w-full bg-white border-slate-300 focus:border-[#A80038]"
                />
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-xs font-bold text-white bg-[#A80038] px-3 py-2 rounded-lg text-center">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input text-xs w-full bg-white border-slate-300 focus:border-[#A80038]"
                />
              </div>

              {/* Contact */}
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-xs font-bold text-white bg-[#A80038] px-3 py-2 rounded-lg text-center">
                  Contact
                </label>
                <input
                  type="tel"
                  placeholder="Contact"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="input text-xs w-full bg-white border-slate-300 focus:border-[#A80038]"
                />
              </div>

              {/* Password */}
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-xs font-bold text-white bg-[#A80038] px-3 py-2 rounded-lg text-center">
                  Password
                </label>
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input text-xs w-full bg-white border-slate-300 focus:border-[#A80038] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Assigned Role Dropdown */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  Assigned Role (Pre-loads Default Permissions) *
                </label>
                <select
                  required
                  value={form.role_id}
                  onChange={(e) => handleRoleChange(Number(e.target.value))}
                  className="input text-xs w-full bg-white border-slate-300 font-bold text-[#1B365D]"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.group})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Permissions Customization Section */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#A80038] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Customize Permissions for this Employee
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetToRoleDefaults}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Role Defaults
                    </button>
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <CheckSquare className="w-3 h-3" /> Grant All (*)
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                  {categories.map((cat) => {
                    const catItems = PERMISSIONS_CATALOG.filter((p) => p.category === cat);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 block border-b border-slate-100 pb-0.5">
                          {cat}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {catItems.map((item) => {
                            const isChecked =
                              form.permissions.includes('*') || form.permissions.includes(item.key);
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition-all ${isChecked
                                    ? 'bg-red-50/70 border-red-200 text-slate-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(item.key)}
                                  className="rounded text-[#A80038] focus:ring-[#A80038]"
                                />
                                <span className="truncate">{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  {actionError}
                </div>
              )}

              {/* Action Buttons matching screenshot */}
              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#1B365D] hover:bg-[#0f2444] text-white font-bold text-xs rounded-lg shadow-md"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
