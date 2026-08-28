import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Edit2, UserCheck, UserX,
  Shield, ChevronDown, X, Eye, EyeOff, Check,
  AlertTriangle, Briefcase, Phone, Mail, Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

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

interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  role_name: string;
  position?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role_id: number;
  position: string;
}

function RoleBadge({ roleId }: { roleId: number }) {
  const role = ROLES.find(r => r.id === roleId);
  if (!role) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: role.color }}
    >
      {role.name}
    </span>
  );
}

export default function CrmUserManagementPage() {
  const { staffToken } = useAuthStore();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [filtered, setFiltered] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUserForm>({
    name: '', email: '', password: '', phone: '', role_id: 7, position: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setFiltered(data.data);
      }
    } catch {
      // Use demo data if API not connected
      const demo: StaffUser[] = ROLES.slice(0, 8).map((r, i) => ({
        id: i + 1, name: `Demo User ${i + 1}`, email: `user${i + 1}@etaxwala.com`,
        role_id: r.id, role_name: r.name, is_active: i !== 2,
        created_at: new Date().toISOString(),
      }));
      setUsers(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter) {
      result = result.filter(u => u.role_id === roleFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setActionError(data.error); return; }
      setActionSuccess(`User "${form.name}" created as ${ROLES.find(r => r.id === form.role_id)?.name}.`);
      setShowCreateModal(false);
      setForm({ name: '', email: '', password: '', phone: '', role_id: 7, position: '' });
      fetchUsers();
    } catch { setActionError('Failed to connect to server.'); }
    finally { setSubmitting(false); }
  };

  const handleDeactivate = async (user: StaffUser) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${user.id}/deactivate`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ active: !user.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message);
        fetchUsers();
      } else {
        setActionError(data.error);
      }
    } catch { setActionError('Failed to update user.'); }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    roles: new Set(users.map(u => u.role_id)).size,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create, manage and assign roles to all 15 staff positions</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setActionError(null); }}
          className="btn btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
          <Check className="w-4 h-4 shrink-0" /> {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#003A66', bg: '#EFF6FF' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: '#059669', bg: '#F0FDF4' },
          { label: 'Inactive', value: stats.inactive, icon: UserX, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Roles Used', value: stats.roles, icon: Shield, color: '#7C3AED', bg: '#F5F3FF' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(Number(e.target.value))}
          className="input text-sm w-full sm:w-56"
        >
          <option value={0}>All Roles</option>
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: ROLES.find(r => r.id === user.role_id)?.color || '#64748b' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.position || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge roleId={user.role_id} /></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />{user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />{user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Never logged in'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditUser(user)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-navy transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeactivate(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.is_active
                              ? 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                              : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          {user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New User</h2>
                <p className="text-xs text-slate-500 mt-0.5">Assign a role from the 15 fixed CRM roles</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text" required placeholder="e.g. Priya Sharma"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email" required placeholder="priya@etaxwala.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input text-sm w-full pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Position</label>
                  <input
                    type="text" placeholder="e.g. Senior Sales"
                    value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Role *</label>
                <select
                  required value={form.role_id}
                  onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}
                  className="input text-sm w-full"
                >
                  {Object.entries(
                    ROLES.reduce((acc, r) => {
                      (acc[r.group] = acc[r.group] || []).push(r);
                      return acc;
                    }, {} as Record<string, typeof ROLES>)
                  ).map(([group, roles]) => (
                    <optgroup key={group} label={group}>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Role grants fixed menu permissions — no per-user customization needed.
                </p>
              </div>
              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{actionError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 btn btn-primary text-sm"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
