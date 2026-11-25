/**
 * RBAC catalogue: roles, permission keys and role default sets.
 *
 * This file is the single source of truth. The rbac_* tables (see
 * MIGRATION-RBAC-LOGS-RECYCLE.sql) only store per-user changes (role choice,
 * extra grants, revokes). If those tables are missing the API still works with
 * these defaults, so deploying code before the SQL never locks anyone out.
 *
 * Data scope rule (owner decision 2026-11-25): an employee who is given a
 * manager option sees ALL company data for that option (`*:view_all` keys).
 */

export interface RoleDef {
  id: number;
  key: string;
  name: string;
  /** users.user_type in the legacy table (null = new-app-only role) */
  legacyUserType: number | null;
  category: string;
}

export interface PermissionDef {
  key: string;
  label: string;
  category: string;
  /** manager-level option: shown with a "Manager" tag in the access editor */
  manager?: boolean;
  /** only Super Admin may hold or grant it */
  superAdminOnly?: boolean;
}

export const ROLES: RoleDef[] = [
  { id: 1, key: 'super_admin', name: 'Super Admin', legacyUserType: 1, category: 'Executive' },
  { id: 2, key: 'admin', name: 'Admin', legacyUserType: 2, category: 'Executive' },
  {
    id: 3,
    key: 'operations_manager',
    name: 'Operations Manager',
    legacyUserType: 4,
    category: 'Operations',
  },
  { id: 4, key: 'sales_manager', name: 'Sales Manager', legacyUserType: 3, category: 'Sales' },
  {
    id: 5,
    key: 'marketing_manager',
    name: 'Marketing Manager',
    legacyUserType: 11,
    category: 'Marketing',
  },
  {
    id: 6,
    key: 'franchise_manager',
    name: 'Franchise Manager',
    legacyUserType: 5,
    category: 'Partners',
  },
  { id: 7, key: 'sales_employee', name: 'Sales Employee', legacyUserType: 6, category: 'Sales' },
  {
    id: 8,
    key: 'operations_employee',
    name: 'Operations Employee',
    legacyUserType: 7,
    category: 'Operations',
  },
  {
    id: 9,
    key: 'marketing_employee',
    name: 'Marketing Employee',
    legacyUserType: null,
    category: 'Marketing',
  },
  {
    id: 10,
    key: 'franchise_partner',
    name: 'Franchise Partner / Exec',
    legacyUserType: 8,
    category: 'Partners',
  },
  {
    id: 11,
    key: 'consultation',
    name: 'Consultation (CA Expert)',
    legacyUserType: 10,
    category: 'Experts',
  },
  {
    id: 12,
    key: 'operations_assistant',
    name: 'Operations Assistant',
    legacyUserType: 9,
    category: 'Operations',
  },
  {
    id: 13,
    key: 'sales_assistant',
    name: 'Sales Assistant',
    legacyUserType: null,
    category: 'Sales',
  },
  { id: 14, key: 'hr', name: 'HR Manager', legacyUserType: null, category: 'Administration' },
  {
    id: 15,
    key: 'website_manager',
    name: 'Website / Sub-Brands Manager',
    legacyUserType: null,
    category: 'Administration',
  },
  {
    id: 16,
    key: 'staff',
    name: 'Staff / Support',
    legacyUserType: null,
    category: 'Administration',
  },
];

export const ROLE_BY_ID = new Map(ROLES.map((r) => [r.id, r]));
export const ROLE_BY_KEY = new Map(ROLES.map((r) => [r.key, r]));

/** users.user_type -> rbac role id */
export const USER_TYPE_TO_ROLE: Record<number, number> = Object.fromEntries(
  ROLES.filter((r) => r.legacyUserType !== null).map((r) => [r.legacyUserType as number, r.id])
);

const P = (
  key: string,
  label: string,
  category: string,
  extra: Partial<PermissionDef> = {}
): PermissionDef => ({ key, label, category, ...extra });

export const PERMISSIONS: PermissionDef[] = [
  P('dashboard:view', 'Main dashboard', 'Dashboard'),
  P('chat:view', 'Staff chat: read', 'Chat'),
  P('chat:send', 'Staff chat: send', 'Chat'),
  P('chat:attachments', 'Staff chat: attachments', 'Chat'),

  P('calls:view_own', 'Call report: own calls', 'Calls'),
  P('calls:view_all', 'Call report: all staff (Call Report)', 'Calls', { manager: true }),
  P('calls:log', 'Log calls', 'Calls'),
  P('calls:export', 'Export call report', 'Calls', { manager: true }),

  P('operations:view', 'Operations menu', 'Operations'),
  P('operations:employees', 'Manage Employee (operations)', 'Operations', { manager: true }),
  P('operations:customers_view', 'Manage Customer: view', 'Operations', { manager: true }),
  P('operations:customers_create', 'Manage Customer: add customer / order', 'Operations', {
    manager: true,
  }),
  P('operations:customers_edit', 'Manage Customer: edit', 'Operations', { manager: true }),
  P('operations:customers_delete', 'Manage Customer: delete (to Recycle Bin)', 'Operations', {
    manager: true,
  }),
  P('operations:customer_details', 'Customer Details list', 'Operations', { manager: true }),
  P('operations:customer_timeline', 'Customer work timeline', 'Operations'),
  P('operations:customer_dues', 'Customer dues & EMI', 'Operations', { manager: true }),
  P('operations:tasks_view', 'Manage Tasks: view', 'Operations'),
  P('operations:tasks_view_all', 'Manage Tasks: all staff tasks', 'Operations', { manager: true }),
  P('operations:tasks_assign', 'Manage Tasks: assign', 'Operations', { manager: true }),
  P('operations:tasks_edit', 'Manage Tasks: update status / effort', 'Operations'),
  P('operations:tasks_delete', 'Manage Tasks: delete (to Recycle Bin)', 'Operations', {
    manager: true,
  }),
  P('operations:internal_tasks_view', 'Internal tasks: view', 'Operations'),
  P('operations:internal_tasks_manage', 'Internal tasks: create / edit / delete', 'Operations', {
    manager: true,
  }),
  P('operations:locations_view', 'Staff locations', 'Operations', { manager: true }),
  P('reports:view', 'Reports', 'Operations', { manager: true }),

  P('desktop_tracking:view', 'Desktrack reports & live board', 'Desktrack', { manager: true }),
  P('desktop_tracking:manage_users', 'Desktrack users', 'Desktrack', { manager: true }),
  P('desktop_tracking:manage_ips', 'Desktrack office IPs', 'Desktrack', { manager: true }),
  P('desktop_tracking:block_websites', 'Blocked websites', 'Desktrack', { manager: true }),

  P('sales:view', 'Sales menu', 'Sales & Leads'),
  P('leads:view_own', 'Leads: own assigned leads', 'Sales & Leads'),
  P('leads:view_all', 'Leads: all company leads', 'Sales & Leads', { manager: true }),
  P('leads:create', 'Leads: add / import', 'Sales & Leads'),
  P('leads:edit', 'Leads: status, remarks, follow-ups', 'Sales & Leads'),
  P('leads:assign', 'Leads: assign to staff', 'Sales & Leads', { manager: true }),
  P('leads:delete', 'Leads: delete (to Recycle Bin)', 'Sales & Leads', { manager: true }),
  P('leads:export', 'Leads: export', 'Sales & Leads', { manager: true }),
  P('leads:subbrands', 'Udyami & Sahakar lead books', 'Sales & Leads'),
  P('quotations:view', 'Quotations: view', 'Sales & Leads'),
  P('quotations:create', 'Quotations: create', 'Sales & Leads'),
  P('quotations:edit', 'Quotations: edit', 'Sales & Leads'),
  P('workforce:view', 'Manage Employee (sales team)', 'Sales & Leads', { manager: true }),
  P('accounts:view', 'Customers (accounts)', 'Sales & Leads'),
  P('service_questions:manage', 'Service questions', 'Sales & Leads', { manager: true }),

  P('appointments:view', 'Appointments: view', 'Appointments'),
  P('appointments:create', 'Appointments: book', 'Appointments'),
  P('appointments:edit', 'Appointments: edit', 'Appointments'),

  P('franchise:view', 'Franchise menu & all services', 'Franchise'),
  P('franchise:partners_manage', 'Partners & partner orders', 'Franchise', { manager: true }),
  P('franchise:orders_view', 'Franchise customer orders', 'Franchise'),
  P('franchise:inquiries_manage', 'Franchise inquiries', 'Franchise'),
  P('franchise:leads_manage', 'Franchise leads', 'Franchise'),
  P('franchise:training_view', 'Training videos & documents', 'Franchise'),

  P('marketing:view', 'Marketing hub', 'Marketing'),
  P('blogs:manage', 'Manage blogs', 'Marketing'),
  P('ads:manage', 'Ads', 'Marketing'),
  P('webinars:manage', 'Webinars', 'Marketing'),
  P('hr:view', 'HR desk', 'HR'),
  P('it:view', 'IT command center', 'IT'),

  P('categories:manage', 'Manage categories', 'Catalogue', { manager: true }),
  P('services:manage', 'Manage services', 'Catalogue', { manager: true }),
  P('packages:manage', 'Manage packages', 'Catalogue', { manager: true }),
  P('coupons:manage', 'Coupons', 'Catalogue', { manager: true }),

  P('disbursements:request', 'Request money', 'Finance'),
  P('disbursements:approve', 'Approve money requests', 'Finance', { manager: true }),

  P('admin:view', 'Admin menu', 'Admin'),
  P('users:view', 'Users & Access: view', 'Admin', { manager: true }),
  P('users:create', 'Users & Access: add user', 'Admin', { manager: true }),
  P('users:edit', 'Users & Access: edit profile / role', 'Admin', { manager: true }),
  P('users:deactivate', 'Users & Access: activate / deactivate', 'Admin', { manager: true }),
  P('users:grant_permissions', 'Grant / revoke extra options', 'Admin', { manager: true }),
  P('logs:view', 'Activity logs (all users)', 'Admin', { manager: true }),
  P('logs:export', 'Activity logs: CSV export', 'Admin', { manager: true }),
  P('recycle_bin:view', 'Recycle Bin: view', 'Admin', { manager: true }),
  P('recycle_bin:restore', 'Recycle Bin: restore', 'Admin', { manager: true }),
  P('recycle_bin:purge', 'Recycle Bin: delete forever', 'Admin', {
    manager: true,
    superAdminOnly: true,
  }),
];

export const PERMISSION_KEYS = new Set(PERMISSIONS.map((p) => p.key));
export const PERMISSION_BY_KEY = new Map(PERMISSIONS.map((p) => [p.key, p]));

const CHAT = ['chat:view', 'chat:send', 'chat:attachments'];

/** Role default sets. '*' = every permission except superAdminOnly ones. */
export const ROLE_DEFAULTS: Record<number, string[]> = {
  1: ['*'],
  2: ['*'],
  3: [
    'dashboard:view',
    ...CHAT,
    'calls:view_own',
    'calls:view_all',
    'calls:export',
    'operations:view',
    'operations:employees',
    'operations:customers_view',
    'operations:customers_create',
    'operations:customers_edit',
    'operations:customers_delete',
    'operations:customer_details',
    'operations:customer_timeline',
    'operations:customer_dues',
    'operations:tasks_view',
    'operations:tasks_view_all',
    'operations:tasks_assign',
    'operations:tasks_edit',
    'operations:tasks_delete',
    'operations:internal_tasks_view',
    'operations:internal_tasks_manage',
    'operations:locations_view',
    'reports:view',
    'desktop_tracking:view',
    'desktop_tracking:manage_users',
    'desktop_tracking:manage_ips',
    'desktop_tracking:block_websites',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'accounts:view',
    'coupons:manage',
    'disbursements:request',
  ],
  4: [
    'dashboard:view',
    ...CHAT,
    'calls:view_own',
    'calls:view_all',
    'calls:log',
    'calls:export',
    'sales:view',
    'leads:view_own',
    'leads:view_all',
    'leads:create',
    'leads:edit',
    'leads:assign',
    'leads:delete',
    'leads:export',
    'leads:subbrands',
    'quotations:view',
    'quotations:create',
    'quotations:edit',
    'workforce:view',
    'accounts:view',
    'service_questions:manage',
    'operations:tasks_view',
    'operations:tasks_view_all',
    'operations:tasks_assign',
    'operations:internal_tasks_view',
    'operations:internal_tasks_manage',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'reports:view',
    'coupons:manage',
    'disbursements:request',
  ],
  5: [
    'dashboard:view',
    ...CHAT,
    'marketing:view',
    'blogs:manage',
    'ads:manage',
    'webinars:manage',
    'leads:subbrands',
  ],
  6: [
    'dashboard:view',
    ...CHAT,
    'franchise:view',
    'franchise:partners_manage',
    'franchise:orders_view',
    'franchise:inquiries_manage',
    'franchise:leads_manage',
    'franchise:training_view',
  ],
  7: [
    'dashboard:view',
    ...CHAT,
    'calls:view_own',
    'calls:log',
    'sales:view',
    'leads:view_own',
    'leads:create',
    'leads:edit',
    'quotations:view',
    'quotations:create',
    'accounts:view',
    'operations:internal_tasks_view',
    'appointments:view',
    'appointments:create',
    'disbursements:request',
  ],
  8: [
    'dashboard:view',
    ...CHAT,
    'operations:view',
    'operations:tasks_view',
    'operations:tasks_edit',
    'operations:customer_timeline',
    'operations:internal_tasks_view',
    'appointments:view',
    'disbursements:request',
  ],
  9: ['dashboard:view', ...CHAT, 'marketing:view', 'blogs:manage'],
  10: [
    'dashboard:view',
    ...CHAT,
    'franchise:view',
    'franchise:leads_manage',
    'franchise:inquiries_manage',
    'franchise:orders_view',
    'franchise:training_view',
  ],
  11: [
    'dashboard:view',
    ...CHAT,
    'appointments:view',
    'appointments:edit',
    'webinars:manage',
    'ads:manage',
    'blogs:manage',
  ],
  12: [
    'dashboard:view',
    ...CHAT,
    'operations:view',
    'operations:tasks_view',
    'operations:tasks_edit',
    'operations:internal_tasks_view',
  ],
  13: [
    'dashboard:view',
    ...CHAT,
    'calls:view_own',
    'calls:log',
    'sales:view',
    'leads:view_own',
    'leads:edit',
  ],
  14: [
    'dashboard:view',
    ...CHAT,
    'hr:view',
    'admin:view',
    'users:view',
    'users:create',
    'users:edit',
    'users:deactivate',
    'workforce:view',
    'operations:employees',
    'desktop_tracking:view',
  ],
  15: ['dashboard:view', ...CHAT, 'leads:subbrands', 'blogs:manage', 'it:view'],
  16: ['dashboard:view', ...CHAT],
};

/**
 * Old permission keys still used by older screens / old JWTs -> new keys.
 * A user "has" an old key when they hold ANY of the new keys listed.
 */
export const LEGACY_ALIASES: Record<string, string[]> = {
  'operations:customers': ['operations:customers_view'],
  'operations:tasks': ['operations:tasks_view'],
  'leads:view': ['leads:view_own', 'leads:view_all'],
  'tasks:view': ['operations:internal_tasks_view', 'operations:tasks_view'],
  'appointments:manage': ['appointments:view'],
  'call_analytics:view': ['calls:view_all'],
  'users:manage': ['users:view'],
  'franchise:partners': ['franchise:partners_manage'],
  'franchise:inquiries': ['franchise:inquiries_manage'],
  'franchise:training': ['franchise:training_view'],
  'franchise:leads': ['franchise:leads_manage'],
  'franchise:orders': ['franchise:orders_view'],
};

/** Expand a role default list ('*' -> all keys except superAdminOnly; SA gets everything). */
export function expandRoleDefaults(roleId: number): string[] {
  const list = ROLE_DEFAULTS[roleId] || ROLE_DEFAULTS[16];
  if (list.includes('*')) {
    return PERMISSIONS.filter((p) => roleId === 1 || !p.superAdminOnly).map((p) => p.key);
  }
  return list.filter((k) => PERMISSION_KEYS.has(k));
}
