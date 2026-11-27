import { Router, Request, Response } from 'express';
import { verifyPassword } from '../services/password.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { verifyJWT, JwtPayload } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { StaffLoginSchema } from '../schemas/auth.schema.js';
import { getAccessProfile, RBAC_SENTINEL, UserSource } from '../rbac/rbac.service.js';
import { ROLE_BY_ID } from '../rbac/catalog.js';
import { recordAuditLog } from '../services/audit.service.js';

const router = Router();

// ─── Role seed map (matches enum in packages/types) ───────────────────────────
const ROLE_MAP: Record<number, string> = {
  1: 'super_admin',
  2: 'admin',
  3: 'operations_manager',
  4: 'sales_manager',
  5: 'marketing_manager',
  6: 'franchise_manager',
  7: 'sales_employee',
  8: 'operations_employee',
  9: 'marketing_employee',
  10: 'franchise_partner',
  11: 'consultation',
  12: 'operations_assistant',
  13: 'sales_assistant',
  14: 'hr',
  15: 'website_manager',
  16: 'staff',
};

// ─── Builtin System Accounts for Instant 1-Click Access ────────────────────────
const BUILTIN_ACCOUNTS: Array<{
  id: number;
  email: string;
  name: string;
  role_id: number;
  roles?: number[];
  position: string;
}> = [
  {
    id: 1,
    email: 'admin@etaxwala.com',
    name: 'Super Admin',
    role_id: 1,
    roles: [1, 2, 3, 4, 14],
    position: 'Chief Executive Officer',
  },
  {
    id: 2,
    email: 'general.admin@etaxwala.com',
    name: 'General Administrator',
    role_id: 2,
    roles: [2],
    position: 'Systems Administrator',
  },
  {
    id: 3,
    email: 'ops.manager@etaxwala.com',
    name: 'Operations Manager',
    role_id: 3,
    roles: [3, 8],
    position: 'Head of Operations',
  },
  {
    id: 4,
    email: 'sales.manager@etaxwala.com',
    name: 'Sales Manager',
    role_id: 4,
    roles: [4, 7],
    position: 'Head of Sales',
  },
  {
    id: 5,
    email: 'marketing@etaxwala.com',
    name: 'Marketing Manager',
    role_id: 5,
    roles: [5],
    position: 'Growth Lead',
  },
  {
    id: 6,
    email: 'franchise@etaxwala.com',
    name: 'Franchise Manager',
    role_id: 6,
    roles: [6],
    position: 'Partnership Director',
  },
  {
    id: 7,
    email: 'priya.sales@etaxwala.com',
    name: 'Priya Sharma (Sales Exec)',
    role_id: 7,
    roles: [7],
    position: 'Senior Sales Executive',
  },
  {
    id: 8,
    email: 'rahul.ops@etaxwala.com',
    name: 'Rahul Verma (Operations)',
    role_id: 7,
    roles: [7],
    position: 'Operations Employee',
  },
  {
    id: 9,
    email: 'seo.content@etaxwala.com',
    name: 'Marketing Content & SEO',
    role_id: 9,
    roles: [9],
    position: 'Content Lead',
  },
  {
    id: 10,
    email: 'field.partner@etaxwala.com',
    name: 'Franchise Field Agent',
    role_id: 10,
    roles: [10],
    position: 'Field Partner',
  },
  {
    id: 11,
    email: 'ca.expert@etaxwala.com',
    name: 'CA Tax Expert',
    role_id: 11,
    roles: [11],
    position: 'Chartered Accountant',
  },
  {
    id: 12,
    email: 'qc.reviewer@etaxwala.com',
    name: 'QC & Document Reviewer',
    role_id: 12,
    roles: [12],
    position: 'Quality Control Lead',
  },
  {
    id: 13,
    email: 'assistant.sales@etaxwala.com',
    name: 'Sales Assistant',
    role_id: 13,
    roles: [13],
    position: 'Lead Qualifier',
  },
  {
    id: 14,
    email: 'hr@etaxwala.com',
    name: 'HR Manager',
    role_id: 14,
    roles: [14],
    position: 'People Operations',
  },
  {
    id: 15,
    email: 'subbrands@etaxwala.com',
    name: 'Sub-Brands Manager',
    role_id: 15,
    roles: [15],
    position: 'Agri & Rural Lead',
  },
  {
    id: 16,
    email: 'support@etaxwala.com',
    name: 'Support Executive',
    role_id: 16,
    roles: [16],
    position: 'Client Helpdesk',
  },
  {
    id: 17,
    email: 'ahmed@etaxwala.com',
    name: 'Ahmed Shaikh',
    role_id: 4,
    roles: [4, 14, 16],
    position: 'Regional Business Lead',
  },
];

function signTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
  // Refresh token carries the full claims so /staff/refresh doesn't need a DB
  // lookup — avoids users.id vs staff_users.id collisions between the two tables.
  const refreshToken = jwt.sign(payload, env.JWT_SECRET + '_refresh', {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
  return { accessToken, refreshToken };
}

// ─── POST /v1/auth/staff/login ────────────────────────────────────────────────
router.post('/staff/login', validateBody(StaffLoginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try DB lookup in users table FIRST (for legacy users)
    let staffUser: any = null;
    let fromUsersTable = false;
    try {
      const uRes: any[] = await prisma.$queryRaw`
        SELECT * FROM users
        WHERE LOWER(email) = ${cleanEmail} OR LOWER(username) = ${cleanEmail}
        LIMIT 1
      `;
      if (uRes && uRes[0]) {
        const u = uRes[0];
        fromUsersTable = true;
        console.log('Login user from users table:', {
          id: u.id,
          username: u.username,
          user_type: u.user_type,
        });
        const userTypeToRoleIdMap: Record<number, number> = {
          1: 1, // Super Admin
          2: 2, // Admin
          3: 4, // Sales Manager
          4: 3, // Ops Manager
          5: 6, // Franchise Manager
          6: 7, // Sales Employee (maps to role_id 7 in staff system)
          7: 7, // Ops Employee (maps to role_id 7 in ROLE_MAP = 'operations_employee')
          8: 8, // Franchise Partner
          9: 12, // Ops Assistant
          10: 11, // Consultation
        };
        // Role name mapping by user_type so ops vs sales employees get different role names
        const userTypeToRoleNameMap: Record<number, string> = {
          1: 'super_admin',
          2: 'admin',
          3: 'sales_manager',
          4: 'operations_manager',
          5: 'franchise_manager',
          6: 'sales_employee', // user_type 6 = Sales Employee
          7: 'operations_employee', // user_type 7 = Operations Employee
          8: 'franchise_partner',
          9: 'operations_assistant',
          10: 'consultation',
        };
        const resolvedRoleId = userTypeToRoleIdMap[u.user_type] || 7;
        const resolvedRoleName = userTypeToRoleNameMap[u.user_type] || 'operations_employee';
        // Role-specific permissions based on role name
        const rolePermissionsMap: Record<string, string[]> = {
          super_admin: ['*'],
          admin: ['*'],
          operations_manager: [
            'dashboard:view',
            'operations:view',
            'desktop_tracking:view',
            'operations:employees',
            'operations:customers',
            'operations:tasks',
            'accounts:view',
            'chat:view',
            'chat:send',
          ],
          sales_manager: [
            'dashboard:view',
            'sales:view',
            'leads:view',
            'quotations:view',
            'tasks:view',
            'workforce:view',
            'accounts:view',
            'chat:view',
            'chat:send',
          ],
          franchise_manager: [
            'dashboard:view',
            'franchise:view',
            'franchise:partners',
            'franchise:inquiries',
            'franchise:training',
            'franchise:leads',
            'franchise:orders',
            'chat:view',
            'chat:send',
          ],
          sales_employee: [
            'dashboard:view',
            'sales:view',
            'leads:view',
            'quotations:view',
            'tasks:view',
            'accounts:view',
            'appointments:manage',
            'chat:view',
            'chat:send',
          ],
          operations_employee: [
            'dashboard:view',
            'operations:view',
            'operations:tasks',
            'tasks:view',
            'appointments:manage',
            'chat:view',
            'chat:send',
          ],
          franchise_partner: [
            'dashboard:view',
            'franchise:view',
            'franchise:leads',
            'franchise:inquiries',
            'franchise:orders',
            'franchise:training',
            'chat:view',
            'chat:send',
          ],
          operations_assistant: [
            'dashboard:view',
            'operations:view',
            'operations:tasks',
            'chat:view',
            'chat:send',
          ],
          consultation: [
            'dashboard:view',
            'sales:view',
            'leads:view',
            'quotations:view',
            'tasks:view',
            'chat:view',
            'chat:send',
          ],
        };
        const resolvedPermissions = rolePermissionsMap[resolvedRoleName] || [
          'dashboard:view',
          'operations:tasks',
        ];
        console.log(
          'Resolved role_id:',
          resolvedRoleId,
          'role_name:',
          resolvedRoleName,
          'from user_type:',
          u.user_type
        );
        staffUser = {
          id: Number(u.id),
          email: u.email || cleanEmail,
          name: u.username || cleanEmail.split('@')[0],
          role_id: resolvedRoleId,
          role_name: resolvedRoleName,
          roles: JSON.stringify([resolvedRoleId]),
          is_active: u.status === 1,
          password_hash: u.password,
          permissions: JSON.stringify(resolvedPermissions),
        };
      }
    } catch {
      staffUser = null;
    }

    // 2. Try DB lookup in staff_users table if not in users
    if (!staffUser) {
      try {
        staffUser = await (prisma as any).staff_users.findFirst({
          where: {
            OR: [{ email: cleanEmail }, { name: cleanEmail }],
          },
        });
      } catch {
        staffUser = null;
      }

      if (!staffUser) {
        try {
          const rawRes: any[] = await prisma.$queryRaw`
            SELECT * FROM staff_users
            WHERE LOWER(email) = ${cleanEmail} OR LOWER(name) = ${cleanEmail}
            LIMIT 1
          `;
          if (rawRes && rawRes[0]) {
            staffUser = rawRes[0];
          }
        } catch {}
      }
    }

    // 3. Builtin account fallback if user is not in database
    if (!staffUser) {
      // Built-in demo accounts (fixed password) exist for local/dev only.
      const builtin =
        env.NODE_ENV !== 'production'
          ? BUILTIN_ACCOUNTS.find((a) => a.email.toLowerCase() === cleanEmail)
          : undefined;
      if (builtin) {
        staffUser = {
          id: builtin.id,
          email: builtin.email,
          name: builtin.name,
          role_id: builtin.role_id,
          roles: JSON.stringify(builtin.roles || [builtin.role_id]),
          position: builtin.position,
          department: 'Executive',
          is_active: true,
          password_hash: '$2b$10$19MIJNpQ9rYed7y7chpZ2O5ACUNwF23WbiqmXjgv1/MoPJ6s8JxrO', // Demo@12345
          permissions: JSON.stringify(builtin.role_id === 1 ? ['*'] : []),
        };
      } else if (env.NODE_ENV !== 'production') {
        // Unrecognized email in dev mode -> default to Sales Employee (role 7) with input email
        staffUser = {
          id: 999,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role_id: 7,
          roles: JSON.stringify([7]),
          position: 'Staff Employee',
          department: 'Sales',
          is_active: true,
          permissions: JSON.stringify([
            'dashboard:view',
            'sales:view',
            'leads:view',
            'quotations:view',
          ]),
        };
      } else {
        // In production: strictly reject unknown emails
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }
    }

    // bcrypt only. Plaintext and the old "any password in dev" bypass are not accepted.
    const isValid = await verifyPassword(staffUser.password_hash, password);

    if (!isValid) {
      void recordAuditLog({
        actorId: Number(staffUser.id) || undefined,
        actorEmail: cleanEmail,
        actorName: staffUser.name,
        actorSource: fromUsersTable ? 'users' : 'staff_users',
        action: 'login_failed',
        resource: 'auth',
        module: 'Auth',
        summary: `Failed sign-in for ${cleanEmail}`,
        statusCode: 401,
        method: 'POST',
        path: req.path,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    if (staffUser.is_active === false) {
      return res.status(403).json({
        success: false,
        error: 'This staff account has been deactivated. Please contact an administrator.',
      });
    }

    // Fetch all assigned roles — only for staff_users records; users-table logins
    // carry their role in role_id/role_name already (staff_user_roles is keyed by staff_users.id)
    let assignedRoleIds: number[] = [];
    if (!fromUsersTable) {
      try {
        const userRoles = await (prisma as any).staff_user_roles.findMany({
          where: { user_id: staffUser.id },
        });
        if (userRoles && userRoles.length > 0) {
          assignedRoleIds = userRoles.map((r: any) => r.role_id);
        }
      } catch {}
    }

    if (assignedRoleIds.length === 0 && !fromUsersTable && staffUser.roles) {
      try {
        assignedRoleIds = JSON.parse(staffUser.roles);
      } catch {}
    }
    if (assignedRoleIds.length === 0) {
      assignedRoleIds = [staffUser.role_id];
    }

    if (!fromUsersTable) {
      try {
        await (prisma as any).staff_users.update({
          where: { id: staffUser.id },
          data: { last_login_at: new Date(), is_online: true },
        });
      } catch {}
    }

    // Use explicit role_name from staffUser (set during users table lookup) OR fallback to ROLE_MAP
    const effectiveRoleName = staffUser.role_name || ROLE_MAP[staffUser.role_id] || 'staff';

    // For users-table logins, role_name (from user_type) is authoritative —
    // ROLE_MAP has no sales_employee entry and user_type 6/7 both map to role_id 7,
    // so deriving role names from role_id would wrongly return operations_employee.
    const roleNames = fromUsersTable
      ? [effectiveRoleName]
      : assignedRoleIds.map((id) => ROLE_MAP[id] || 'staff');

    let userPermissions: string[] = [];
    if (staffUser.permissions) {
      try {
        userPermissions = JSON.parse(staffUser.permissions);
      } catch {}
    }
    if (assignedRoleIds.includes(1)) {
      userPermissions = ['*'];
    }

    // RBAC: role defaults + per-user extra grants / revokes (rbac/rbac.service.ts).
    // Falls back to the values above when the user row cannot be read.
    const userSource: UserSource = fromUsersTable ? 'users' : 'staff_users';
    let access = await getAccessProfile(userSource, Number(staffUser.id), { fresh: true }).catch(
      () => null
    );
    if (
      access &&
      String(access.email || '').toLowerCase() !== String(staffUser.email || '').toLowerCase()
    ) {
      access = null; // dev built-in account whose id collides with a real row
    }
    if (access) {
      assignedRoleIds = access.roleIds;
      userPermissions = [...access.effective, RBAC_SENTINEL];
      staffUser.role_id = access.primaryRoleId;
      staffUser.role_name = access.roleKey;
    }
    const finalRoleName = access ? access.roleKey : effectiveRoleName;
    const finalRoleNames = access
      ? access.roleIds.map((id) => ROLE_BY_ID.get(id)?.key || 'staff')
      : roleNames;

    const payload: JwtPayload = {
      user_id: staffUser.id,
      role_id: staffUser.role_id,
      role_ids: assignedRoleIds,
      role_name: finalRoleName,
      roles: finalRoleNames,
      permissions: userPermissions,
      username: staffUser.name,
      email: staffUser.email,
      user_source: userSource,
    };

    void recordAuditLog({
      actorId: Number(staffUser.id),
      actorEmail: staffUser.email,
      actorName: staffUser.name,
      actorRole: finalRoleName,
      actorSource: userSource,
      action: 'login',
      resource: 'auth',
      module: 'Auth',
      summary: `Signed in (${access?.roleName || finalRoleName})`,
      statusCode: 200,
      method: 'POST',
      path: req.path,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      userAgent: req.headers['user-agent'],
    });

    const tokens = signTokens(payload);
    return res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: staffUser.id,
          name: staffUser.name,
          email: staffUser.email,
          role_id: staffUser.role_id,
          role_ids: assignedRoleIds,
          role_name: finalRoleName,
          roles: finalRoleNames,
          permissions: userPermissions,
          user_source: userSource,
          access: access
            ? { grants: access.grants, revokes: access.revokes, role_label: access.roleName }
            : null,
          profile_photo: staffUser.profile_photo,
          position: staffUser.position,
          department: staffUser.department,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// ─── POST /v1/auth/staff/refresh ─────────────────────────────────────────────
router.post('/staff/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required.' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET + '_refresh');
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    // New-style refresh tokens carry the full JWT claims — re-issue directly,
    // with the user's live RBAC role/permissions (so changes apply on next refresh).
    if (decoded && decoded.role_name && decoded.user_id) {
      if (decoded.user_source === 'users' || decoded.user_source === 'staff_users') {
        const access = await getAccessProfile(decoded.user_source, Number(decoded.user_id), {
          fresh: true,
        }).catch(() => null);
        if (access && !access.active) {
          return res
            .status(403)
            .json({ success: false, error: 'This staff account has been deactivated.' });
        }
        if (access) {
          const fresh: JwtPayload = {
            user_id: decoded.user_id,
            role_id: access.primaryRoleId,
            role_ids: access.roleIds,
            role_name: access.roleKey,
            roles: access.roleIds.map((id) => ROLE_BY_ID.get(id)?.key || 'staff'),
            permissions: [...access.effective, RBAC_SENTINEL],
            username: decoded.username,
            email: decoded.email,
            user_source: decoded.user_source,
          };
          return res.json({ success: true, data: signTokens(fresh) });
        }
      }
      const payload: JwtPayload = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_ids: decoded.role_ids || [decoded.role_id],
        role_name: decoded.role_name,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        username: decoded.username,
        email: decoded.email,
      };
      return res.json({ success: true, data: signTokens(payload) });
    }

    let staffUser: any = null;
    try {
      staffUser = await (prisma as any).staff_users.findUnique({
        where: { id: decoded.user_id },
      });
    } catch {
      staffUser = null;
    }

    if (!staffUser && env.NODE_ENV === 'production') {
      // Never fall back to a built-in (super admin) account in production.
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }
    if (!staffUser) {
      const builtin = BUILTIN_ACCOUNTS.find((a) => a.id === decoded.user_id) || BUILTIN_ACCOUNTS[0];
      staffUser = {
        id: builtin.id,
        email: builtin.email,
        name: builtin.name,
        role_id: builtin.role_id,
        roles: JSON.stringify(builtin.roles || [builtin.role_id]),
        position: builtin.position,
        department: 'Executive',
        is_active: true,
      };
    }

    let assignedRoleIds: number[] = [];
    try {
      const userRoles = await (prisma as any).staff_user_roles.findMany({
        where: { user_id: staffUser.id },
      });
      if (userRoles && userRoles.length > 0) {
        assignedRoleIds = userRoles.map((r: any) => r.role_id);
      }
    } catch {}

    if (assignedRoleIds.length === 0 && staffUser.roles) {
      try {
        assignedRoleIds = JSON.parse(staffUser.roles);
      } catch {}
    }
    if (assignedRoleIds.length === 0) {
      assignedRoleIds = [staffUser.role_id];
    }

    const roleNames = assignedRoleIds.map((id) => ROLE_MAP[id] || 'staff');
    let userPermissions: string[] = [];
    if (staffUser.permissions) {
      try {
        userPermissions = JSON.parse(staffUser.permissions);
      } catch {}
    }
    if (assignedRoleIds.includes(1)) {
      userPermissions = ['*'];
    }

    const payload: JwtPayload = {
      user_id: staffUser.id,
      role_id: staffUser.role_id,
      role_ids: assignedRoleIds,
      role_name: ROLE_MAP[staffUser.role_id] || 'staff',
      roles: roleNames,
      permissions: userPermissions,
      username: staffUser.name,
      email: staffUser.email,
    };

    const tokens = signTokens(payload);
    res.json({ success: true, data: tokens });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Token refresh failed.' });
  }
});

// ─── GET /v1/auth/staff/me ────────────────────────────────────────────────────
router.get('/staff/me', verifyJWT, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      data: {
        id: user.user_id,
        name: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
});

// ─── POST /v1/auth/staff/logout ───────────────────────────────────────────────
router.post('/staff/logout', verifyJWT, (req: Request, res: Response) => {
  const u = req.user!;
  void recordAuditLog({
    actorId: u.user_id,
    actorEmail: u.email,
    actorName: u.username,
    actorRole: u.role_name,
    actorSource: u.user_source,
    action: 'logout',
    resource: 'auth',
    module: 'Auth',
    summary: 'Signed out',
    statusCode: 200,
    method: 'POST',
    path: req.path,
    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
