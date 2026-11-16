import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  UserCheck,
  UserX,
  Shield,
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Phone,
  Mail,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { PERMISSIONS_CATALOG, ROLE_DEFAULT_PERMISSIONS, ALL_PERMISSIONS } from './permissions';
import { API_BASE_URL } from '@/lib/api-base';

const API_BASE = API_BASE_URL;

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
  { id: 16, name: 'Staff / Support', color: '#64748B', group: 'Administration' },
];

interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  role_name: string;
  role_ids?: number[];
  assigned_roles?: Array<{ id: number; name: string }>;
  permissions?: string[];
  position?: string;
  department?: string;
  is_active: boolean;
  is_online?: boolean;
  last_login_at?: string;
  last_seen_at?: string;
  created_at: string;
}

interface UserFormState {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role_id: number;
  role_ids: number[];
  position: string;
  department: string;
  permissions: string[];
}

function RoleBadge({ roleId }: { roleId: number }) {
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
      style={{ backgroundColor: role.color }}
    >
      {role.name}
    </span>
  );
}

const MANAGER_ROLE_IDS = [1, 2, 3, 4, 5, 6, 14, 15];

export default function CrmUserManagementPage() {
  const { staffToken, staffUser } = useAuthStore();
  const currentUserId = staffUser?.id;
  const currentRole = staffUser?.role;
  const isExecutive = currentRole === RoleType.SUPER_ADMIN || currentRole === RoleType.ADMIN; // Super Admin / Admin see all
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [filtered, setFiltered] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<StaffUser | null>(null);
  const [additionalRoleId, setAdditionalRoleId] = useState<number>(4);
  const [assigningRole, setAssigningRole] = useState(false);

  const [form, setForm] = useState<UserFormState>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 7,
    role_ids: [7],
    position: '',
    department: '',
    permissions: ROLE_DEFAULT_PERMISSIONS[7] || [],
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
      const crmUrl =
        currentUserId && !isExecutive
          ? `${API_BASE}/v1/crm/users?created_by=${currentUserId}`
          : `${API_BASE}/v1/crm/users`;
      let res = await fetch(`${API_BASE}/v1/admin/users`, { headers: authHeaders });
      let data = await res.json();
      if (!data.success) {
        res = await fetch(crmUrl);
        data = await res.json();
      }
      if (data.success && Array.isArray(data.data)) {
        // Only manager-level users should appear on Manage Manager page
        const managersOnly = data.data.filter(
          (u: StaffUser) =>
            MANAGER_ROLE_IDS.includes(u.role_id) ||
            (u.role_ids && u.role_ids.some((id) => MANAGER_ROLE_IDS.includes(id)))
        );
        setUsers(managersOnly);
        setFiltered(managersOnly);
      }
    } catch {
      try {
        const crmUrl =
          currentUserId && !isExecutive
            ? `${API_BASE}/v1/crm/users?created_by=${currentUserId}`
            : `${API_BASE}/v1/crm/users`;
        const res = await fetch(crmUrl);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const managersOnly = data.data.filter(
            (u: StaffUser) =>
              MANAGER_ROLE_IDS.includes(u.role_id) ||
              (u.role_ids && u.role_ids.some((id) => MANAGER_ROLE_IDS.includes(id)))
          );
          setUsers(managersOnly);
          setFiltered(managersOnly);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          (u.position && u.position.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.assigned_roles && u.assigned_roles.some((r) => r.name.toLowerCase().includes(q))) ||
          u.role_name.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 0) {
      result = result.filter(
        (u) => u.role_id === roleFilter || (u.role_ids && u.role_ids.includes(roleFilter))
      );
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  // Open modal for Creating User
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    const defaultRoleId = 7;
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role_id: defaultRoleId,
      role_ids: [defaultRoleId],
      position: '',
      department: '',
      permissions: ROLE_DEFAULT_PERMISSIONS[defaultRoleId] || [],
    });
    setActionError(null);
    setShowModal(true);
  };

  // Open modal for Editing User
  const openEditModal = (user: StaffUser) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    const userPerms =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : ROLE_DEFAULT_PERMISSIONS[user.role_id] || [];

    const userRoleIds = user.role_ids && user.role_ids.length > 0 ? user.role_ids : [user.role_id];

    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role_id: user.role_id,
      role_ids: userRoleIds,
      position: user.position || '',
      department: user.department || '',
      permissions: userPerms,
    });
    setActionError(null);
    setShowModal(true);
  };

  // Open modal for adding an extra role
  const openRoleAssignModal = (user: StaffUser) => {
    setSelectedUserForRole(user);
    const assigned = user.role_ids || [user.role_id];
    const available = ROLES.find((r) => !assigned.includes(r.id));
    setAdditionalRoleId(available ? available.id : 4);
    setShowRoleModal(true);
  };

  // Add additional role without overwriting
  const handleAssignAdditionalRole = async () => {
    if (!selectedUserForRole || !additionalRoleId) return;
    setAssigningRole(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${selectedUserForRole.id}/roles`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ role_id: additionalRoleId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message || `Role assigned successfully.`);
        setShowRoleModal(false);
        fetchUsers();
      } else {
        setActionError(data.error || 'Failed to assign role.');
      }
    } catch {
      setActionError('Failed to connect to server.');
    } finally {
      setAssigningRole(false);
    }
  };

  // Remove specific role from user
  const handleRemoveRole = async (user: StaffUser, roleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to remove role "${roleName}" from ${user.name}?`)) return;
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${user.id}/roles/${roleId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message || `Role "${roleName}" removed.`);
        fetchUsers();
      } else {
        setActionError(data.error || 'Failed to remove role.');
      }
    } catch {
      setActionError('Failed to remove role.');
    }
  };

  // When primary role changes, auto-set permissions to that role's default set
  const handleRoleChange = (newRoleId: number) => {
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[newRoleId] || [];
    setForm((prev) => ({
      ...prev,
      role_id: newRoleId,
      role_ids: Array.from(new Set([newRoleId, ...prev.role_ids])),
      permissions: defaultPerms,
    }));
  };

  // Toggle individual permission checkbox
  const togglePermission = (key: string) => {
    setForm((prev) => {
      let updated: string[];
      if (prev.permissions.includes('*')) {
        // If wildcard was set and unchecking, start from full catalog minus key
        updated = ALL_PERMISSIONS.filter((p) => p !== key);
      } else if (prev.permissions.includes(key)) {
        updated = prev.permissions.filter((p) => p !== key);
      } else {
        updated = [...prev.permissions, key];
      }
      return { ...prev, permissions: updated };
    });
  };

  // Reset permissions to role defaults
  const resetToRoleDefaults = () => {
    const defaults = ROLE_DEFAULT_PERMISSIONS[form.role_id] || [];
    setForm((prev) => ({ ...prev, permissions: defaults }));
  };

  // Select all permissions
  const selectAllPermissions = () => {
    setForm((prev) => ({ ...prev, permissions: ['*'] }));
  };

  // Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const url = isEditMode
      ? `${API_BASE}/v1/admin/users/${editingUserId}`
      : `${API_BASE}/v1/admin/users`;
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role_id: form.role_id,
        position: form.position,
        permissions: form.permissions,
      };

      if (!isEditMode) {
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      let res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      let data = await res.json();
      if (!res.ok || !data.success) {
        // Fallback to unauthenticated CRM users route
        const crmUrl = isEditMode
          ? `${API_BASE}/v1/crm/users/${editingUserId}`
          : `${API_BASE}/v1/crm/users`;
        const crmMethod = isEditMode ? 'PUT' : 'POST';
        const crmPayload = { ...payload, created_by: currentUserId };
        res = await fetch(crmUrl, {
          method: crmMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crmPayload),
        });
        data = await res.json();
      }

      if (!data.success) {
        setActionError(data.error || 'Request failed.');
        return;
      }

      const roleName = ROLES.find((r) => r.id === form.role_id)?.name || 'Role';
      setActionSuccess(
        isEditMode
          ? `User "${form.name}" updated in database successfully.`
          : `User "${form.name}" created as ${roleName} and saved to database successfully.`
      );

      setShowModal(false);
      fetchUsers();
    } catch {
      setActionError('Failed to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (user: StaffUser) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${user.id}/deactivate`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ active: !user.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message);
        fetchUsers();
      } else {
        setActionError(data.error);
      }
    } catch {
      setActionError('Failed to update user.');
    }
  };

  // Group permission catalog items by category
  const categories = Array.from(new Set(PERMISSIONS_CATALOG.map((p) => p.category)));

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    roles: new Set(users.map((u) => u.role_id)).size,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            User & Role Permission Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Assign custom role-wise menu & feature permissions at the time of user creation
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2 text-sm shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="ml-auto">
            <X className="w-4 h-4 text-emerald-600 hover:text-emerald-800" />
          </button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600 hover:text-red-800" />
          </button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Staff Users',
            value: stats.total,
            icon: Users,
            color: '#003A66',
            bg: '#EFF6FF',
          },
          {
            label: 'Active Accounts',
            value: stats.active,
            icon: UserCheck,
            color: '#059669',
            bg: '#F0FDF4',
          },
          {
            label: 'Inactive Accounts',
            value: stats.inactive,
            icon: UserX,
            color: '#DC2626',
            bg: '#FEF2F2',
          },
          {
            label: 'Active Roles',
            value: stats.roles,
            icon: Shield,
            color: '#7C3AED',
            bg: '#F5F3FF',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(Number(e.target.value))}
          className="input text-sm w-full sm:w-60"
        >
          <option value={0}>All 15 Roles</option>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.group})
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
          <table className="table-crm w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <th className="sticky top-0 z-10 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Permissions
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Contact
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
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
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No users found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const effectivePerms =
                    user.permissions && user.permissions.length > 0
                      ? user.permissions
                      : ROLE_DEFAULT_PERMISSIONS[user.role_id] || [];
                  const isWildcard = effectivePerms.includes('*');

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs"
                            style={{
                              backgroundColor:
                                ROLES.find((r) => r.id === user.role_id)?.color || '#64748b',
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-400 font-medium">
                              {user.position || 'Staff Member'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {user.assigned_roles && user.assigned_roles.length > 0 ? (
                            user.assigned_roles.map((r) => (
                              <span
                                key={r.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                                style={{
                                  backgroundColor:
                                    ROLES.find((rl) => rl.id === r.id)?.color || '#64748b',
                                }}
                              >
                                {r.name}
                                {user.assigned_roles!.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveRole(user, r.id, r.name)}
                                    className="hover:bg-black/30 rounded-full w-3.5 h-3.5 flex items-center justify-center text-white/80 hover:text-white transition-colors ml-0.5"
                                    title={`Remove role ${r.name}`}
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))
                          ) : (
                            <RoleBadge roleId={user.role_id} />
                          )}
                          <button
                            onClick={() => openRoleAssignModal(user)}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold btn-multicolor transition-colors"
                            title="Add an additional role to this user"
                          >
                            <Plus className="w-2.5 h-2.5" /> Role
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {isWildcard ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            <Shield className="w-3 h-3 text-purple-600" /> Full System Access (*)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1B365D] border border-blue-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            <CheckSquare className="w-3 h-3 text-brand-purple" />{' '}
                            {effectivePerms.length} Active Permissions
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#1B365D] transition-colors"
                            title="Edit User & Permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.id !== 1 && (
                            <button
                              onClick={() => handleDeactivate(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.is_active
                                  ? 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                                  : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                              }`}
                              title={user.is_active ? 'Deactivate' : 'Reactivate'}
                            >
                              {user.is_active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit User & Custom Permissions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit User & Permissions' : 'Create New Staff User'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a role to load pre-configured permissions or customize toggles manually
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              {/* User Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="priya@etaxwala.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEditMode ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!isEditMode}
                      placeholder={isEditMode ? 'Leave blank to keep' : 'Min 8 chars'}
                      value={form.password || ''}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input text-sm w-full pr-9"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Manager"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="input text-sm w-full"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#1B365D]">
                    Assigned Role (Pre-loads Role Default Permissions) *
                  </label>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    15 Fixed Roles Available
                  </span>
                </div>

                <select
                  required
                  value={form.role_id}
                  onChange={(e) => handleRoleChange(Number(e.target.value))}
                  className="input text-sm w-full font-semibold text-[#1B365D] bg-white border-blue-200"
                >
                  {Object.entries(
                    ROLES.reduce(
                      (acc, r) => {
                        (acc[r.group] = acc[r.group] || []).push(r);
                        return acc;
                      },
                      {} as Record<string, typeof ROLES>
                    )
                  ).map(([group, roles]) => (
                    <optgroup key={group} label={`── ${group} ──`}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Dynamic Permissions Panel */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-brand-purple" /> Dynamic Role Permissions
                      (Assigned at User Creation)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Custom check/uncheck permissions for this specific user
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetToRoleDefaults}
                      className="text-xs font-semibold flex items-center gap-1 btn-multicolor px-2 py-1 rounded-lg"
                      title="Reset permissions to selected role defaults"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-xs font-semibold flex items-center gap-1 btn-multicolor px-2 py-1 rounded-lg"
                      title="Grant all system permissions"
                    >
                      <CheckSquare className="w-3 h-3" /> Grant All (*)
                    </button>
                  </div>
                </div>

                {/* Categorized Checkbox List */}
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const catItems = PERMISSIONS_CATALOG.filter((p) => p.category === cat);
                    return (
                      <div
                        key={cat}
                        className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80"
                      >
                        <span className="text-xs font-bold text-slate-700 block border-b border-slate-200 pb-1">
                          {cat} Permissions
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {catItems.map((item) => {
                            const isChecked =
                              form.permissions.includes('*') || form.permissions.includes(item.key);
                            return (
                              <label
                                key={item.key}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-blue-50/70 border-blue-200 text-slate-900 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(item.key)}
                                  className="mt-0.5 rounded text-brand-purple focus:ring-brand-purple"
                                />
                                <div>
                                  <p className="font-bold">{item.label}</p>
                                  <p className="text-[10px] text-slate-500 leading-tight">
                                    {item.description}
                                  </p>
                                </div>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn btn-primary text-sm font-bold shadow-md"
                >
                  {submitting
                    ? 'Saving User...'
                    : isEditMode
                      ? 'Update User & Permissions'
                      : 'Create User with Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding an Additional Role */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Additional Role</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  User: <strong className="text-[#1B365D]">{selectedUserForRole.name}</strong> (
                  {selectedUserForRole.email})
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Currently Assigned Roles:
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {selectedUserForRole.assigned_roles &&
                  selectedUserForRole.assigned_roles.length > 0 ? (
                    selectedUserForRole.assigned_roles.map((r) => (
                      <span
                        key={r.id}
                        className="px-2 py-0.5 rounded-md text-xs font-bold text-white shadow-xs"
                        style={{
                          backgroundColor: ROLES.find((rl) => rl.id === r.id)?.color || '#64748B',
                        }}
                      >
                        {r.name}
                      </span>
                    ))
                  ) : (
                    <RoleBadge roleId={selectedUserForRole.role_id} />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Role to Add:
                </label>
                <select
                  value={additionalRoleId}
                  onChange={(e) => setAdditionalRoleId(Number(e.target.value))}
                  className="input text-sm w-full font-semibold text-[#1B365D] bg-white"
                >
                  {ROLES.filter(
                    (r) =>
                      !(selectedUserForRole.role_ids || [selectedUserForRole.role_id]).includes(
                        r.id
                      )
                  ).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.group})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adding this role expands user access. Existing roles will NOT be overwritten.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 btn border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={assigningRole}
                  onClick={handleAssignAdditionalRole}
                  className="flex-1 btn btn-primary text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {assigningRole ? 'Assigning...' : 'Add Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
