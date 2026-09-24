// ETaxwala 2.0 — Role-Wise Permissions & Catalog System

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  category: 'Dashboard' | 'Operations' | 'Sales' | 'Franchise' | 'HR' | 'Marketing' | 'IT & Solutions' | 'Admin & System';
}

export const PERMISSIONS_CATALOG: PermissionDefinition[] = [
  // Dashboard
  {
    key: 'dashboard:view',
    label: 'View Main Dashboard',
    description: 'Access the primary CRM metrics dashboard',
    category: 'Dashboard',
  },

  // Operations Manager
  {
    key: 'operations:view',
    label: 'Operations Module View',
    description: 'Access Operations section menu',
    category: 'Operations',
  },
  {
    key: 'desktop_tracking:view',
    label: 'Desktop Tracking & Idle Reports',
    description: 'View staff desktop active & idle session tracking reports',
    category: 'Operations',
  },
  {
    key: 'operations:employees',
    label: 'Manage Operations Employees',
    description: 'Assign tasks and view operational workforce',
    category: 'Operations',
  },
  {
    key: 'operations:customers',
    label: 'Manage Customers & Accounts',
    description: 'View and manage operational customer accounts',
    category: 'Operations',
  },
  {
    key: 'operations:tasks',
    label: 'Manage Operational Tasks',
    description: 'Create and update client fulfillment tasks',
    category: 'Operations',
  },

  // Sales Manager
  {
    key: 'sales:view',
    label: 'Sales Module View',
    description: 'Access Sales section menu',
    category: 'Sales',
  },
  {
    key: 'leads:view',
    label: 'Manage Leads & Inquiries',
    description: 'View lead lists, lead details, and customer inquiries',
    category: 'Sales',
  },
  {
    key: 'leads:subbrands',
    label: 'Sub-brand Leads (Udyomi & Sahakar)',
    description: 'View leads coming from Udyomi and Sahakar sub-brands',
    category: 'Sales',
  },
  {
    key: 'quotations:view',
    label: 'Quotations & Letterhead',
    description: 'Create, edit, download and send professional quotations',
    category: 'Sales',
  },
  {
    key: 'tasks:view',
    label: 'My Tasks / Sales Tasks',
    description: 'Access task management calendar and lists',
    category: 'Sales',
  },
  {
    key: 'workforce:view',
    label: 'Manage Sales Workforce',
    description: 'View and track sales team performance',
    category: 'Sales',
  },
  {
    key: 'accounts:view',
    label: 'Customer Accounts Details',
    description: 'View detailed profiles of paying clients',
    category: 'Sales',
  },

  // Franchise Manager
  {
    key: 'franchise:view',
    label: 'Franchise Module View',
    description: 'Access Franchise section menu',
    category: 'Franchise',
  },
  {
    key: 'franchise:partners',
    label: 'Manage Partners & Orders',
    description: 'View franchise partners network and orders',
    category: 'Franchise',
  },
  {
    key: 'franchise:inquiries',
    label: 'Partner Leads & Inquiries',
    description: 'Manage incoming franchise partner inquiries',
    category: 'Franchise',
  },
  {
    key: 'franchise:training',
    label: 'Training Videos & Service Documents',
    description: 'Access training materials and standard operating procedure docs',
    category: 'Franchise',
  },

  // HR & ATS
  {
    key: 'hr:view',
    label: 'HR Desk View',
    description: 'Access HR and workforce console',
    category: 'HR',
  },
  {
    key: 'hr:ats',
    label: 'Manage ATS & Candidates',
    description: 'Review applications, schedule interviews, update hiring stages',
    category: 'HR',
  },
  {
    key: 'hr:payroll',
    label: 'View Payroll & Accounts',
    description: 'View salary records and commission disbursements',
    category: 'HR',
  },

  // Marketing & Growth
  {
    key: 'marketing:view',
    label: 'Marketing Hub View',
    description: 'Access marketing console',
    category: 'Marketing',
  },
  {
    key: 'marketing:social',
    label: 'Manage Social Planner',
    description: 'Schedule and manage social media posts',
    category: 'Marketing',
  },
  {
    key: 'marketing:ads',
    label: 'Paid Ads Telemetry',
    description: 'Track Meta and Google Ads performance and spend',
    category: 'Marketing',
  },
  {
    key: 'marketing:attribution',
    label: 'Lead Attribution Analytics',
    description: 'View UTM source and touchpoint attribution',
    category: 'Marketing',
  },

  // IT & Solutions Command Center
  {
    key: 'it:view',
    label: 'IT Command View',
    description: 'Access IT engineering console',
    category: 'IT & Solutions',
  },
  {
    key: 'it:leads',
    label: 'Tech Inquiries & Meetings',
    description: 'Manage custom software leads and discovery calls',
    category: 'IT & Solutions',
  },
  {
    key: 'it:quotations',
    label: 'Proposal & Quotations Studio',
    description: 'Generate versioned milestone proposals',
    category: 'IT & Solutions',
  },
  {
    key: 'it:projects',
    label: 'Active Projects Delivery',
    description: 'Track software sprint milestones and repositories',
    category: 'IT & Solutions',
  },
  {
    key: 'infrastructure:view',
    label: 'System Health Telemetry',
    description: 'View server health, database latency and connection pools',
    category: 'IT & Solutions',
  },

  // Admin & System
  {
    key: 'admin:view',
    label: 'Admin / Support View',
    description: 'Access Admin and System settings menu',
    category: 'Admin & System',
  },
  {
    key: 'users:manage',
    label: 'User Management & Permissions',
    description: 'Create users, assign roles, and edit granular permissions',
    category: 'Admin & System',
  },
  {
    key: 'call_analytics:view',
    label: 'Call Analytics & User Activities',
    description: 'Track Android mobile call logs, session activities and audit logs',
    category: 'Admin & System',
  },
  {
    key: 'categories:manage',
    label: 'Manage Categories',
    description: 'Create, edit and delete service categories',
    category: 'Admin & System',
  },
  {
    key: 'services:manage',
    label: 'Manage Services',
    description: 'Create, edit and delete services and pricing',
    category: 'Admin & System',
  },
  {
    key: 'packages:manage',
    label: 'Manage Packages',
    description: 'Create, edit and delete combo packages',
    category: 'Admin & System',
  },
  {
    key: 'blogs:manage',
    label: 'Manage Blogs',
    description: 'Create, edit and delete blog posts and comments',
    category: 'Admin & System',
  },
  {
    key: 'ads:manage',
    label: 'Manage Ads',
    description: 'Create, edit and delete advertisements and banners',
    category: 'Admin & System',
  },
  {
    key: 'webinars:manage',
    label: 'Manage Webinars',
    description: 'Create webinars and view registrations',
    category: 'Admin & System',
  },
  {
    key: 'appointments:manage',
    label: 'Manage Appointments',
    description: 'View and manage all customer appointments',
    category: 'Admin & System',
  },
  {
    key: 'reports:view',
    label: 'View Reports',
    description: 'Access consolidated business reports',
    category: 'Admin & System',
  },

  // Enterprise Chat
  {
    key: 'chat:view',
    label: 'View Staff Chat',
    description: 'Read messages in staff chat channels',
    category: 'Admin & System',
  },
  {
    key: 'chat:send',
    label: 'Send Staff Chat Messages',
    description: 'Send messages in staff chat channels',
    category: 'Admin & System',
  },
  {
    key: 'chat:attachments',
    label: 'Send Chat Attachments',
    description: 'Upload files in staff chat channels',
    category: 'Admin & System',
  },
];

// All permission keys as array
export const ALL_PERMISSIONS = PERMISSIONS_CATALOG.map((p) => p.key);

/**
 * Returns allowed permission catalog definitions for a specific manager role.
 * Restricts department managers to only their domain permissions.
 */
export function getDepartmentPermissions(creatorRoleId: number): PermissionDefinition[] {
  // Super Admin (1), Admin (2), HR (14) -> Full Catalog
  if (creatorRoleId === 1 || creatorRoleId === 2 || creatorRoleId === 14) {
    return PERMISSIONS_CATALOG;
  }

  // Operations Manager (3) -> Dashboard + Operations domain only
  if (creatorRoleId === 3) {
    return PERMISSIONS_CATALOG.filter(
      (p) => p.category === 'Dashboard' || p.category === 'Operations'
    );
  }

  // Sales Manager (4) -> Dashboard + Sales domain only
  if (creatorRoleId === 4) {
    return PERMISSIONS_CATALOG.filter(
      (p) => p.category === 'Dashboard' || p.category === 'Sales'
    );
  }

  // Marketing Manager (5) / Sub-brands Manager (15) -> Dashboard + Sales + Marketing + IT
  if (creatorRoleId === 5 || creatorRoleId === 15) {
    return PERMISSIONS_CATALOG.filter(
      (p) =>
        p.category === 'Dashboard' ||
        p.category === 'Sales' ||
        p.category === 'Marketing' ||
        p.category === 'IT & Solutions'
    );
  }

  // Franchise Manager (6) -> Dashboard + Franchise domain only
  if (creatorRoleId === 6) {
    return PERMISSIONS_CATALOG.filter(
      (p) => p.category === 'Dashboard' || p.category === 'Franchise'
    );
  }

  // Fallback -> Dashboard only
  return PERMISSIONS_CATALOG.filter((p) => p.category === 'Dashboard');
}

// Default permissions pre-configured for each of the 16 Role IDs
export const ROLE_DEFAULT_PERMISSIONS: Record<number, string[]> = {
  // 1: Super Admin
  1: ['*'],

  // 2: Admin
  2: ['*'],

  // 3: Operations Manager
  3: [
    'dashboard:view',
    'operations:view',
    'desktop_tracking:view',
    'operations:employees',
    'operations:customers',
    'operations:tasks',
    'accounts:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 4: Sales Manager
  4: [
    'dashboard:view',
    'sales:view',
    'leads:view',
    'leads:subbrands',
    'quotations:view',
    'tasks:view',
    'workforce:view',
    'accounts:view',
    'appointments:manage',
    'chat:view',
    'chat:send',
    'chat:attachments',
    'it:view',
    'it:leads',
    'it:quotations',
  ],

  // 5: Marketing Manager
  5: [
    'dashboard:view',
    'marketing:view',
    'marketing:social',
    'marketing:ads',
    'marketing:attribution',
    'sales:view',
    'leads:view',
    'leads:subbrands',
    'call_analytics:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 6: Franchise Manager
  6: [
    'dashboard:view',
    'franchise:view',
    'franchise:partners',
    'franchise:inquiries',
    'franchise:training',
    'leads:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 7: Sales Employee
  7: [
    'dashboard:view',
    'sales:view',
    'leads:view',
    'quotations:view',
    'tasks:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 8: Operations Employee
  8: [
    'dashboard:view',
    'operations:view',
    'operations:tasks',
    'operations:customers',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 9: Marketing Employee
  9: [
    'dashboard:view',
    'marketing:view',
    'marketing:social',
    'sales:view',
    'leads:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 10: Franchise Partner
  10: [
    'dashboard:view',
    'franchise:view',
    'franchise:training',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 11: Consultation
  11: [
    'dashboard:view',
    'sales:view',
    'leads:view',
    'tasks:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 12: Operations Assistant
  12: [
    'dashboard:view',
    'operations:view',
    'operations:tasks',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 13: Sales Assistant
  13: [
    'dashboard:view',
    'sales:view',
    'leads:view',
    'tasks:view',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 14: HR
  14: [
    'dashboard:view',
    'hr:view',
    'hr:ats',
    'hr:payroll',
    'admin:view',
    'workforce:view',
    'operations:employees',
    'users:manage',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 15: Website Manager / IT Lead
  15: [
    'dashboard:view',
    'it:view',
    'it:leads',
    'it:quotations',
    'it:projects',
    'infrastructure:view',
    'admin:view',
    'blogs:manage',
    'chat:view',
    'chat:send',
    'chat:attachments',
  ],

  // 16: Staff / Support
  16: ['dashboard:view', 'chat:view', 'chat:send', 'chat:attachments'],
};

// Also map by RoleType enum string name for convenience
export const ROLE_NAME_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['*'],
  OPERATIONS_MANAGER: ROLE_DEFAULT_PERMISSIONS[3],
  SALES_MANAGER: ROLE_DEFAULT_PERMISSIONS[4],
  MARKETING_MANAGER: ROLE_DEFAULT_PERMISSIONS[5],
  FRANCHISE_MANAGER: ROLE_DEFAULT_PERMISSIONS[6],
  SALES_EMPLOYEE: ROLE_DEFAULT_PERMISSIONS[7],
  OPERATIONS_EMPLOYEE: ROLE_DEFAULT_PERMISSIONS[8],
  MARKETING_EMPLOYEE: ROLE_DEFAULT_PERMISSIONS[9],
  FRANCHISE_EMPLOYEE: ROLE_DEFAULT_PERMISSIONS[10],
  FRANCHISE_PARTNER: ROLE_DEFAULT_PERMISSIONS[10],
  CONSULTATION: ROLE_DEFAULT_PERMISSIONS[11],
  OPERATIONS_ASSISTANT: ROLE_DEFAULT_PERMISSIONS[12],
  SALES_ASSISTANT: ROLE_DEFAULT_PERMISSIONS[13],
  HR: ROLE_DEFAULT_PERMISSIONS[14],
  WEBSITE_MANAGER: ROLE_DEFAULT_PERMISSIONS[15],
  STAFF: ROLE_DEFAULT_PERMISSIONS[16],
};

/**
 * Check if a user has a specific permission.
 * Resolves union of permissions across ALL assigned roles if multi-role.
 */
export function hasUserPermission(
  userPermissions: string[] | undefined,
  roleIdOrName: number | string | undefined,
  requiredPermission: string,
  userRoles?: (number | string)[]
): boolean {
  // Check if any assigned role has Super Admin bypass
  const allRoles =
    userRoles && userRoles.length > 0 ? userRoles : roleIdOrName !== undefined ? [roleIdOrName] : [];

  const isSuperOrAdmin = allRoles.some(
    (r) =>
      r === 1 ||
      r === 2 ||
      r === 'SUPER_ADMIN' ||
      r === 'ADMIN' ||
      r === 'Super Admin' ||
      r === 'Admin'
  );
  if (isSuperOrAdmin) {
    return true;
  }

  // Union of explicit permissions and all role-based permissions
  const activePermsSet = new Set<string>();

  if (userPermissions && userPermissions.length > 0) {
    userPermissions.forEach((p) => activePermsSet.add(p));
  }

  for (const r of allRoles) {
    let perms: string[] = [];
    if (typeof r === 'number' && ROLE_DEFAULT_PERMISSIONS[r]) {
      perms = ROLE_DEFAULT_PERMISSIONS[r];
    } else if (typeof r === 'string' && ROLE_NAME_DEFAULT_PERMISSIONS[r]) {
      perms = ROLE_NAME_DEFAULT_PERMISSIONS[r];
    }
    perms.forEach((p) => activePermsSet.add(p));
  }

  // If no roles specified, fallback to single roleIdOrName
  if (allRoles.length === 0) {
    if (typeof roleIdOrName === 'number' && ROLE_DEFAULT_PERMISSIONS[roleIdOrName]) {
      ROLE_DEFAULT_PERMISSIONS[roleIdOrName].forEach((p) => activePermsSet.add(p));
    } else if (typeof roleIdOrName === 'string' && ROLE_NAME_DEFAULT_PERMISSIONS[roleIdOrName]) {
      ROLE_NAME_DEFAULT_PERMISSIONS[roleIdOrName].forEach((p) => activePermsSet.add(p));
    }
  }

  return activePermsSet.has('*') || activePermsSet.has(requiredPermission);
}
