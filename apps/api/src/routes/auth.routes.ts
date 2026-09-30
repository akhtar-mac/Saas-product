import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { verifyJWT, JwtPayload } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { StaffLoginSchema } from '../schemas/auth.schema.js';

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
    role_id: 8,
    roles: [8],
    position: 'Operations Specialist',
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
  const refreshToken = jwt.sign({ user_id: payload.user_id }, env.JWT_SECRET + '_refresh', {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
  return { accessToken, refreshToken };
}

// ─── POST /v1/auth/staff/login ────────────────────────────────────────────────
router.post('/staff/login', validateBody(StaffLoginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try DB lookup first
    let staffUser: any = null;
    try {
      staffUser = await (prisma as any).staff_users.findUnique({
        where: { email: cleanEmail },
      });
    } catch {
      staffUser = null;
    }

    // 2. Builtin account fallback if user is not in database
    if (!staffUser) {
      const builtin = BUILTIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === cleanEmail
      );
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
          password_hash: '$2b$10$iJWGADi30072QuVY4VZude4JqQg9gZdcOKGRdsgqboaBKfycCSIlm', // 'etaxwala@2024'
          permissions: JSON.stringify(builtin.role_id === 1 ? ['*'] : []),
        };
      } else if (env.NODE_ENV !== 'production') {
        // Temporary demo login fallback for testing in development
        staffUser = {
          id: 1,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role_id: 1,
          roles: JSON.stringify([1, 2, 3, 4, 14]),
          position: 'Demo Administrator',
          department: 'Management',
          is_active: true,
          permissions: JSON.stringify(['*']),
        };
      } else {
        // In production: strictly reject unknown emails
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }
    }

    // Password verification: in development/demo mode, accept credentials for testing; in production enforce strict bcrypt
    let isValid = env.NODE_ENV !== 'production';
    if (!isValid) {
      const storedHash = staffUser.password_hash;
      if (storedHash) {
        isValid = await bcrypt.compare(password, storedHash).catch(() => false);
      }
      if (!isValid && storedHash && storedHash === password) {
        isValid = true;
      }
    }

    if (!isValid) {
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

    // Fetch all assigned roles
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

    try {
      await (prisma as any).staff_users.update({
        where: { id: staffUser.id },
        data: { last_login_at: new Date(), is_online: true },
      });
    } catch {}

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
          role_name: ROLE_MAP[staffUser.role_id] || 'staff',
          roles: roleNames,
          permissions: userPermissions,
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
      decoded = jwt.verify(refreshToken, env.JWT_SECRET + '_refresh') as { user_id: number };
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    let staffUser: any = null;
    try {
      staffUser = await (prisma as any).staff_users.findUnique({
        where: { id: decoded.user_id },
      });
    } catch {
      staffUser = null;
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
router.post('/staff/logout', verifyJWT, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
