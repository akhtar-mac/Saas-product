import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  PhoneCall,
  Shield,
  Building,
  Headphones,
  CheckCircle2,
  Briefcase,
  UserPlus,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { PERMISSIONS_CATALOG, ROLE_DEFAULT_PERMISSIONS, ALL_PERMISSIONS } from './permissions';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ROLES = [
  { id: 1, name: 'Super Admin', color: '#003A66', group: 'Executive', deptKey: 'hr' },
  { id: 2, name: 'Admin', color: '#004d87', group: 'Executive', deptKey: 'hr' },
  {
    id: 3,
    name: 'Operations Manager',
    color: '#7C3AED',
    group: 'Operations',
    deptKey: 'operations',
  },
  { id: 4, name: 'Sales Manager', color: '#059669', group: 'Sales', deptKey: 'sales' },
  { id: 5, name: 'Marketing Manager', color: '#DB2777', group: 'Marketing', deptKey: 'hr' },
  { id: 6, name: 'Franchise Manager', color: '#0891B2', group: 'Partners', deptKey: 'franchise' },
  { id: 7, name: 'Sales Employee', color: '#10B981', group: 'Sales', deptKey: 'sales' },
  {
    id: 8,
    name: 'Operations Employee',
    color: '#8B5CF6',
    group: 'Operations',
    deptKey: 'operations',
  },
  { id: 9, name: 'Marketing Employee', color: '#E11D48', group: 'Marketing', deptKey: 'hr' },
  { id: 10, name: 'Franchise Partner', color: '#0E7490', group: 'Partners', deptKey: 'franchise' },
  { id: 11, name: 'Consultation', color: '#D97706', group: 'Experts', deptKey: 'ca' },
  {
    id: 12,
    name: 'Operations Asst.',
    color: '#DC2626',
    group: 'Operations',
    deptKey: 'operations',
  },
  { id: 13, name: 'Sales Assistant', color: '#047857', group: 'Sales', deptKey: 'sales' },
  { id: 14, name: 'HR', color: '#4F46E5', group: 'Administration', deptKey: 'hr' },
  { id: 15, name: 'Website Manager', color: '#16A34A', group: 'Administration', deptKey: 'hr' },
];

// Which role IDs a given activeRole can CREATE (assign) in Add Employee modal
const ALLOWED_CREATE_ROLES: Partial<Record<RoleType, number[]>> = {
  [RoleType.SUPER_ADMIN]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // all
  [RoleType.ADMIN]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // all
  [RoleType.SALES_MANAGER]: [7, 13], // Sales EmployeSales Assistant
  [RoleType.OPERATIONS_MANAGER]: [8, 12], // Operations EmployeOperations Asst.
  [RoleType.FRANCHISE_MANAGER]: [10], // Franchise Partner
  [RoleType.MARKETING_MANAGER]: [9], // Marketing Employee
};

// Which departments a given role can see in Manage Employees
// Super Admin / Admin see everything (handled by isSuperAdmin check)
const ROLE_VISIBILITY: Partial<Record<RoleType, string[]>> = {
  [RoleType.SUPER_ADMIN]: null as any,
  [RoleType.ADMIN]: null as any,
  [RoleType.SALES_MANAGER]: ['sales'],
  [RoleType.SALES_EMPLOYEE]: ['sales'],
  [RoleType.SALES_ASSISTANT]: ['sales'],
  [RoleType.OPERATIONS_MANAGER]: ['operations'],
  [RoleType.OPERATIONS_EMPLOYEE]: ['operations'],
  [RoleType.OPERATIONS_ASSISTANT]: ['operations'],
  [RoleType.FRANCHISE_MANAGER]: ['franchise'],
  [RoleType.FRANCHISE_EMPLOYEE]: ['franchise'],
  [RoleType.MARKETING_MANAGER]: ['hr'],
  [RoleType.MARKETING_EMPLOYEE]: ['hr'],
  [RoleType.CONSULTATION]: ['ca'],
  [RoleType.HR]: ['hr'],
  [RoleType.WEBSITE_MANAGER]: ['hr'],
  [RoleType.STAFF]: ['support', 'sales', 'operations'],
};

// Map role_id directly to dept key (most reliable approach)
const ROLE_ID_TO_DEPT: Record<number, string> = {
  1: 'hr', // Super Admin
  2: 'hr', // Admin
  3: 'operations', // Operations Manager
  4: 'sales', // Sales Manager
  5: 'hr', // Marketing Manager
  6: 'franchise', // Franchise Manager
  7: 'sales', // Sales Employee
  8: 'operations', // Operations Employee
  9: 'hr', // Marketing Employee
  10: 'franchise', // Franchise Partner
  11: 'ca', // Consultation
  12: 'operations', // Operations Assistant
  13: 'sales', // Sales Assistant
  14: 'hr', // HR
  15: 'hr', // Website Manager
  16: 'support', // Staff
};

const getDeptKey = (u: any, roleObj: any): string => {
  const rId = Number(u.role_id || u.roleId || roleObj?.id || 0);
  if (rId && ROLE_ID_TO_DEPT[rId]) {
    return ROLE_ID_TO_DEPT[rId];
  }
  const deptStr =
    `${u.department || ''} ${u.position || ''} ${u.role_name || ''} ${roleObj?.group || ''} ${roleObj?.name || ''}`.toLowerCase();
  if (deptStr.includes('sales') || deptStr.includes('telecall')) return 'sales';
  if (deptStr.includes('operation')) return 'operations';
  if (deptStr.includes('franchise')) return 'franchise';
  if (deptStr.includes('finance') || deptStr.includes('account')) return 'finance';
  if (
    deptStr.includes('ca') ||
    deptStr.includes('legal') ||
    deptStr.includes('tax') ||
    deptStr.includes('consult')
  )
    return 'ca';
  if (
    deptStr.includes('hr') ||
    deptStr.includes('admin') ||
    deptStr.includes('people') ||
    deptStr.includes('human')
  )
    return 'hr';
  if (deptStr.includes('support') || deptStr.includes('help')) return 'support';
  return roleObj?.deptKey || 'sales';
};

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
  password?: string;
  status: StaffStatus;
  joiningDate: string;
  permissions?: string[];
}

const DEPARTMENTS = [
  { key: 'all', label: 'All Departments', icon: Users, color: '#003A66', bg: 'bg-blue-50' },
  {
    key: 'sales',
    label: 'Sales & Telecalling',
    icon: PhoneCall,
    color: '#059669',
    bg: 'bg-emerald-50',
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: CheckCircle2,
    color: '#7C3AED',
    bg: 'bg-purple-50',
  },
  {
    key: 'finance',
    label: 'Finance & Accounts',
    icon: Building,
    color: '#D97706',
    bg: 'bg-amber-50',
  },
  { key: 'franchise', label: 'Franchise', icon: Briefcase, color: '#0891B2', bg: 'bg-cyan-50' },
  { key: 'ca', label: 'CA / Legal', icon: Shield, color: '#003A66', bg: 'bg-blue-50' },
  { key: 'hr', label: 'HR & Admin', icon: UserCheck, color: '#4F46E5', bg: 'bg-indigo-50' },
  {
    key: 'support',
    label: 'Support & Help',
    icon: Headphones,
    color: '#64748b',
    bg: 'bg-slate-50',
  },
];

const STATUS_CONFIG: Record<StaffStatus, { cls: string; dot: string }> = {
  Online: {
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  'On Call': { cls: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  'In Review': { cls: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  Offline: { cls: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
};

const PAGE_SIZE = 10;

export default function HrWorkforcePage() {
  const { staffToken, activeRole } = useAuthStore();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    role_id: 7,
    permissions: ROLE_DEFAULT_PERMISSIONS[7] || [],
  });

  // Role-based access — check all variants of Super Admin / Admin
  const activeRoleStr = String(activeRole || '').toLowerCase();
  const isSuperAdmin =
    activeRole === RoleType.SUPER_ADMIN ||
    activeRole === RoleType.ADMIN ||
    activeRoleStr.includes('admin') ||
    activeRoleStr.includes('super');
  // Get allowed departments from visibility map; null = no restriction
  const allowedDepts = isSuperAdmin ? null : (ROLE_VISIBILITY[activeRole] ?? null);

  // Which roles this user can assign in Add Employee modal
  const creatableRoleIds = ALLOWED_CREATE_ROLES[activeRole] ?? ROLES.map((r) => r.id);
  const creatableRoles = ROLES.filter((r) => creatableRoleIds.includes(r.id));
  // Default role_id for Add Employee form based on who's adding
  const defaultCreateRoleId = creatableRoleIds[0] ?? 7;

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(staffToken && staffToken !== 'null' && staffToken !== 'undefined'
      ? { Authorization: `Bearer ${staffToken}` }
      : {}),
  };

  const openAddModal = () => {
    setEditingStaffId(null);
    setForm({
      name: '',
      email: '',
      contact: '',
      password: '',
      role_id: defaultCreateRoleId,
      permissions: ROLE_DEFAULT_PERMISSIONS[defaultCreateRoleId] || [],
    });
    setActionError(null);
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setForm({
      name: staff.name || '',
      email: staff.email || '',
      contact: staff.contact || '',
      password: staff.password || 'Password@123',
      role_id: staff.roleId || defaultCreateRoleId,
      permissions:
        Array.isArray(staff.permissions) && staff.permissions.length > 0
          ? staff.permissions
          : ROLE_DEFAULT_PERMISSIONS[staff.roleId] || [],
    });
    setActionError(null);
    setShowAddModal(true);
  };

  const handleRoleChange = (roleId: number) =>
    setForm((p) => ({
      ...p,
      role_id: roleId,
      permissions: ROLE_DEFAULT_PERMISSIONS[roleId] || [],
    }));

  const togglePermission = (key: string) =>
    setForm((p) => {
      const updated = p.permissions.includes('*')
        ? ALL_PERMISSIONS.filter((x) => x !== key)
        : p.permissions.includes(key)
          ? p.permissions.filter((x) => x !== key)
          : [...p.permissions, key];
      return { ...p, permissions: updated };
    });

  const resetToRoleDefaults = () =>
    setForm((p) => ({ ...p, permissions: ROLE_DEFAULT_PERMISSIONS[p.role_id] || [] }));
  const selectAllPermissions = () => setForm((p) => ({ ...p, permissions: ['*'] }));

  // Auto-reset department filter whenever active role changes
  useEffect(() => {
    setDeptFilter('all');
    setPage(1);
  }, [activeRole]);

  // Fetch staff
  useEffect(() => {
    setLoading(true);
    const loadStaff = async () => {
      const endpoints = [
        '/v1/crm/users',
        `${API_BASE}/v1/crm/users`,
        'http://localhost:5001/v1/crm/users',
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers: authHeaders }).catch(() => null);
          if (res && res.ok) {
            const data = await res.json();
            const list = data?.data || data?.users;
            if (data?.success && Array.isArray(list) && list.length > 0) {
              const mapped: StaffMember[] = list.map((u: any) => {
                const rId = Number(u.role_id || u.roleId || 7);
                const roleObj = ROLES.find((r) => r.id === rId);
                const computedDeptKey = getDeptKey(u, roleObj);
                const dateStr = String(u.created_at || u.createdAt || '');

                let perms: string[] = [];
                if (typeof u.permissions === 'string') {
                  try {
                    perms = JSON.parse(u.permissions);
                  } catch (e) {
                    perms = [];
                  }
                } else if (Array.isArray(u.permissions)) {
                  perms = u.permissions;
                }

                return {
                  id: Number(u.id),
                  name: u.name || u.username || u.email?.split('@')[0] || 'Staff User',
                  role: u.role_name || u.position || roleObj?.name || 'Staff Employee',
                  roleId: rId,
                  dept: u.department || roleObj?.group || 'Sales',
                  deptKey: computedDeptKey,
                  contact: u.phone || u.contact || '',
                  email: u.email || '',
                  password: u.password_hash || u.password || 'Password@123',
                  status: u.is_active ? 'Online' : 'Offline',
                  joiningDate: dateStr.includes('T') ? dateStr.split('T')[0] : dateStr || '—',
                  permissions: perms,
                };
              });

              console.log(`[Workforce] Successfully loaded ${mapped.length} users from API`);
              setStaffList(mapped);
              return; // Success!
            }
          }
        } catch (err) {
          console.warn(`[Workforce] Fetch failed for ${url}:`, err);
        }
      }

      console.warn('[Workforce] All API endpoints failed, using fallback list');
      setStaffList([
        {
          id: 1,
          name: 'Super Admin',
          role: 'Super Admin',
          roleId: 1,
          dept: 'Executive',
          deptKey: 'hr',
          contact: '0123456789',
          email: 'admin@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 2,
          name: 'General Administrator',
          role: 'Admin',
          roleId: 2,
          dept: 'Executive',
          deptKey: 'hr',
          contact: '9876543211',
          email: 'general.admin@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 3,
          name: 'Operations Manager',
          role: 'Operations Manager',
          roleId: 3,
          dept: 'Operations',
          deptKey: 'operations',
          contact: '9876543212',
          email: 'ops.manager@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 4,
          name: 'Sales Manager',
          role: 'Sales Manager',
          roleId: 4,
          dept: 'Sales',
          deptKey: 'sales',
          contact: '9876543213',
          email: 'sales.manager@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 5,
          name: 'Marketing Manager',
          role: 'Marketing Manager',
          roleId: 5,
          dept: 'Marketing',
          deptKey: 'hr',
          contact: '9876543214',
          email: 'marketing@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 6,
          name: 'Franchise Manager',
          role: 'Franchise Manager',
          roleId: 6,
          dept: 'Partners',
          deptKey: 'franchise',
          contact: '9876543215',
          email: 'franchise@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 7,
          name: 'Priya Sharma',
          role: 'Sales Employee',
          roleId: 7,
          dept: 'Sales',
          deptKey: 'sales',
          contact: '9876543216',
          email: 'priya.sales@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 8,
          name: 'Rahul Verma',
          role: 'Operations Employee',
          roleId: 8,
          dept: 'Operations',
          deptKey: 'operations',
          contact: '9876543217',
          email: 'rahul.ops@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 10,
          name: 'Franchise Partner',
          role: 'Franchise Partner',
          roleId: 10,
          dept: 'Partners',
          deptKey: 'franchise',
          contact: '9876543218',
          email: 'field.partner@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 12,
          name: 'QC Reviewer',
          role: 'Operations Assistant',
          roleId: 12,
          dept: 'Operations',
          deptKey: 'operations',
          contact: '9876543219',
          email: 'qc.reviewer@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
        {
          id: 13,
          name: 'Sales Assistant',
          role: 'Sales Assistant',
          roleId: 13,
          dept: 'Sales',
          deptKey: 'sales',
          contact: '9876543220',
          email: 'assistant.sales@etaxwala.com',
          status: 'Online',
          joiningDate: '2026-01-01',
        },
      ]);
    };

    loadStaff().finally(() => setLoading(false));
  }, []);

  // Save employee (Handles both Add & Edit)
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    const selectedRole = ROLES.find((r) => r.id === form.role_id);
    const roleName = selectedRole?.name || 'Staff Employee';

    try {
      if (editingStaffId) {
        // UPDATE existing employee
        let res = await fetch(`/v1/crm/users/${editingStaffId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.contact,
            password: form.password,
            role_id: form.role_id,
            position: roleName,
            permissions: form.permissions,
          }),
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/v1/crm/users/${editingStaffId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              phone: form.contact,
              password: form.password,
              role_id: form.role_id,
              position: roleName,
              permissions: form.permissions,
            }),
          });
        }

        const computedDeptKey = getDeptKey({ role_id: form.role_id }, selectedRole);

        setStaffList((prev) =>
          prev.map((s) =>
            s.id === editingStaffId
              ? {
                  ...s,
                  name: form.name,
                  email: form.email,
                  contact: form.contact,
                  password: form.password,
                  roleId: form.role_id,
                  role: roleName,
                  dept: selectedRole?.group || 'Sales',
                  deptKey: computedDeptKey,
                  permissions: form.permissions,
                }
              : s
          )
        );
        setActionSuccess(`Employee "${form.name}" updated successfully.`);
        setShowAddModal(false);
      } else {
        // CREATE new employee
        let res = await fetch(`/v1/crm/users`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.contact,
            password: form.password || 'Password@123',
            role_id: form.role_id,
            position: roleName,
            permissions: form.permissions,
          }),
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/v1/crm/users`, {
            method: 'POST',
            headers: authHeaders,
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
        }

        const data = res ? await res.json() : null;
        const createdUser = data?.data;
        const newId = createdUser?.id ? Number(createdUser.id) : Date.now();
        const computedDeptKey = getDeptKey({ role_id: form.role_id }, selectedRole);

        const newStaff: StaffMember = {
          id: newId,
          name: form.name,
          role: roleName,
          roleId: form.role_id,
          dept: selectedRole?.group || 'Sales',
          deptKey: computedDeptKey,
          contact: form.contact,
          email: form.email,
          password: form.password || 'Password@123',
          status: 'Online',
          joiningDate: new Date().toISOString().split('T')[0],
          permissions: form.permissions,
        };

        setStaffList((prev) => [newStaff, ...prev]);
        setActionSuccess(`Employee "${form.name}" added as ${roleName}.`);
        setShowAddModal(false);
      }
    } catch {
      setActionError('Network error. Failed to save employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove employee
  const handleRemoveEmployee = async (id: number) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    fetch(`/v1/crm/users/${id}`, { method: 'DELETE', headers: authHeaders }).catch(() => null);
  };

  // Filtering — Super Admin / Admin see all; others see only their dept
  const visibleStaff = staffList.filter((s) =>
    allowedDepts === null ? true : allowedDepts.includes(s.deptKey)
  );

  const filtered = visibleStaff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.contact.includes(search);
    const matchDept = deptFilter === 'all' || s.deptKey === deptFilter;
    return matchSearch && matchDept;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getDeptCount = (key: string) =>
    key === 'all' ? visibleStaff.length : visibleStaff.filter((s) => s.deptKey === key).length;

  const visibleDepts = isSuperAdmin
    ? DEPARTMENTS
    : DEPARTMENTS.filter((d) => d.key === 'all' || allowedDepts?.includes(d.key));

  const onlineCount = visibleStaff.filter((s) => s.status === 'Online').length;

  const categories = Array.from(new Set(PERMISSIONS_CATALOG.map((p) => p.category)));

  const ROLE_COLORS: Record<number, string> = {
    1: '#003A66',
    2: '#004d87',
    3: '#7C3AED',
    4: '#059669',
    5: '#DB2777',
    6: '#0891B2',
    7: '#10B981',
    8: '#8B5CF6',
    9: '#E11D48',
    10: '#0E7490',
    11: '#D97706',
    12: '#DC2626',
    13: '#047857',
    14: '#4F46E5',
    15: '#16A34A',
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans pb-8">
      {/* ── Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-[#1B365D] tracking-wide">
              MANAGE EMPLOYEES
            </h1>
            <span className="badge badge-navy font-mono">{visibleStaff.length} Staff</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time staff management, role-based access &amp; permissions.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-multicolor py-2 px-4 shadow-2xs flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-xs font-bold">Add Employee</span>
        </button>
      </div>

      {/* ── Success Toast ── */}
      {actionSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="ml-auto">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* ── Department Filter Tiles (old card-style) ── */}
      {visibleDepts.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {visibleDepts.map((dept) => {
            const Icon = dept.icon;
            const isActive = deptFilter === dept.key;
            const count = getDeptCount(dept.key);
            return (
              <button
                key={dept.key}
                onClick={() => {
                  setDeptFilter(dept.key);
                  setPage(1);
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                  isActive
                    ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-md'
                    : 'bg-white border-slate-200 hover:border-[#1B365D] hover:shadow-xs'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : dept.bg}`}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : dept.color }} />
                </div>
                <p
                  className={`text-[10px] font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-700'}`}
                >
                  {dept.label}
                </p>
                <p className={`text-xs font-bold ${isActive ? 'text-white/80' : 'text-[#1B365D]'}`}>
                  {count}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main Table Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#003A66]">
            Employee List
          </h2>
          <button
            onClick={openAddModal}
            className="btn-multicolor w-8 h-8 shadow-2xs flex items-center justify-center rounded-full"
            style={
              {
                '--c-base': '#64748B',
                '--c-light': '#94A3B8',
                '--c-dark': '#334155',
              } as React.CSSProperties
            }
            title="Add New Employee"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>All (500)</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center gap-1">
              {['Copy', 'Excel', 'CSV', 'PDF', 'Print'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export`)}
                  className="px-2.5 py-1 text-[11px] font-semibold btn-multicolor rounded shadow-2xs transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search Data..."
                className="text-xs bg-white border border-slate-300 rounded pl-8 pr-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A66] w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 font-bold">#</th>
                <th className="py-2.5 px-3 font-bold">Name</th>
                <th className="py-2.5 px-3 font-bold">Role</th>
                <th className="py-2.5 px-3 font-bold">Email</th>
                <th className="py-2.5 px-3 font-bold">Mobile</th>
                <th className="py-2.5 px-3 font-bold">Password</th>
                <th className="py-2.5 px-3 font-bold">Department</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold">Joined</th>
                <th className="py-2.5 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                      Loading staff records from database...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-xs text-slate-400">
                    No employees found matching your filter.
                  </td>
                </tr>
              ) : (
                paginated.map((staff, idx) => {
                  const statusCfg = STATUS_CONFIG[staff.status] || STATUS_CONFIG.Offline;
                  const roleColor = ROLE_COLORS[staff.roleId] || '#64748B';
                  const initials = staff.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={staff.id}
                      className={
                        isEven ? 'bg-white hover:bg-sky-50/40' : 'bg-[#F9FAFB] hover:bg-sky-50/40'
                      }
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0"
                            style={{
                              background: `${roleColor}18`,
                              color: roleColor,
                              border: `1.5px solid ${roleColor}30`,
                            }}
                          >
                            {initials}
                          </div>
                          <span className="font-bold text-slate-900">{staff.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: `${roleColor}15`,
                            color: roleColor,
                            border: `1px solid ${roleColor}25`,
                          }}
                        >
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{staff.email || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {staff.contact || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 font-semibold">
                        {staff.password || 'Password@123'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{staff.dept}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.cls}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${staff.status === 'Online' ? 'animate-pulse' : ''}`}
                          />
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {staff.joiningDate}
                      </td>
                      <td className="py-2.5 px-3 text-center relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === staff.id ? null : staff.id)
                          }
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenuId === staff.id && (
                          <div className="absolute right-4 top-8 z-30 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-left text-xs">
                            <button
                              onClick={() => {
                                openEditModal(staff);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                            >
                              Edit Employee
                            </button>
                            <button
                              onClick={() => {
                                handleRemoveEmployee(staff.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium block"
                            >
                              Remove Employee
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      p === page
                        ? 'btn-multicolor text-slate-800 font-extrabold shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Employee Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-2xl w-full animate-scale-in">
            {/* Signature multicolor strip */}
            <div className="h-1 bg-multicolor" />

            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">
                    {editingStaffId ? 'Edit Employee Details' : 'Add New Employee'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {editingStaffId
                      ? 'Update employee information, role & permissions'
                      : 'Fill details and assign role & permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSaveEmployee}
              className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
            >
              {/* Row 1: NamEmail, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Password, Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 pr-9 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Assigned Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.role_id}
                    onChange={(e) => handleRoleChange(Number(e.target.value))}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-[#1B365D] font-bold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
                  >
                    {creatableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Panel */}
              <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-2">
                  <span className="text-[11px] font-bold text-[#A80038] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Customize Permissions
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetToRoleDefaults}
                      className="btn-multicolor py-1 px-2 text-[10px] shadow-2xs"
                    >
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <RotateCcw className="w-3 h-3 text-blue-600" /> Reset Defaults
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="btn-multicolor py-1 px-2 text-[10px] shadow-2xs"
                    >
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <CheckSquare className="w-3 h-3 text-purple-600" /> Grant All
                      </span>
                    </button>
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-3 pr-1">
                  {categories.map((cat) => {
                    const catItems = PERMISSIONS_CATALOG.filter((p) => p.category === cat);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 block border-b border-[#EAE6DD] pb-0.5">
                          {cat}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {catItems.map((item) => {
                            const isChecked =
                              form.permissions.includes('*') || form.permissions.includes(item.key);
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-2 p-1.5 rounded-xl border text-[11px] cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-red-50/70 border-red-200 text-slate-900 font-bold'
                                    : 'bg-white border-[#EAE6DD] text-slate-600 hover:bg-slate-50'
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

              {/* Action Buttons — matching Manage Leads modal buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE6DD]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-multicolor py-2 px-5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <span className="text-xs font-bold">
                    {submitting ? 'Saving...' : editingStaffId ? 'Update Employee' : 'Add Employee'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
