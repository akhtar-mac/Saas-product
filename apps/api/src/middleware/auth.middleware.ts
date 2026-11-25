import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  user_id: number;
  role_id: number;
  role_ids: number[];
  role_name: string;
  roles: string[];
  permissions?: string[];
  username: string;
  email: string;
  /** which table the login came from: legacy `users` or new `staff_users` */
  user_source?: 'users' | 'staff_users';
}

// Extend Express Request to carry decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies Bearer JWT on every protected route.
 * Attaches decoded payload to req.user.
 */
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please login.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'demo-staff-token') {
    if (env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        error: 'Demo tokens are strictly prohibited in production environments.',
        code: 'DEMO_TOKEN_BLOCKED',
      });
    }
    req.user = {
      user_id: 1,
      role_id: 1,
      role_ids: [1, 2, 3, 4, 14, 15],
      role_name: 'super_admin',
      roles: [
        'super_admin',
        'admin',
        'operations_manager',
        'sales_manager',
        'hr',
        'website_manager',
      ],
      permissions: ['*'],
      username: 'admin',
      email: 'admin@etaxwala.com',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded.role_ids) {
      decoded.role_ids = [decoded.role_id];
    }
    if (!decoded.roles) {
      decoded.roles = [decoded.role_name];
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

/**
 * Multi-Role access control middleware factory.
 * Super Admin (role_id 1) always has full access.
 * Users with multiple assigned roles pass if ANY assigned role is allowed.
 */
export function requireRole(allowedRoleIds: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    // The global RBAC guard (rbac/route-guard.ts) already checked this route's
    // permission (role defaults + per-user grants/revokes): let it through.
    if (req.rbacGranted) {
      return next();
    }

    const userRoleIds =
      req.user.role_ids && req.user.role_ids.length > 0 ? req.user.role_ids : [req.user.role_id];

    // Super Admin (ID: 1) has complete system bypass
    if (userRoleIds.includes(1)) {
      return next();
    }

    const hasAccess = userRoleIds.some((rId) => allowedRoleIds.includes(rId));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${allowedRoleIds.join(', ')}].`,
      });
    }
    next();
  };
}

/**
 * Granular permission check middleware.
 * Verifies that the user has the required permission key(s).
 */
export function requirePermission(requiredPerms: string[], mode: 'AND' | 'OR' = 'OR') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    // Prefer the live RBAC profile (DB grants/revokes) over the token's list.
    if (req.rbac) {
      const ok =
        mode === 'OR'
          ? requiredPerms.some((p) => req.rbac!.has(p))
          : requiredPerms.every((p) => req.rbac!.has(p));
      if (ok) return next();
      return res.status(403).json({
        success: false,
        error: `Access denied. Missing required permission: ${requiredPerms.join(', ')}`,
        code: 'PERMISSION_DENIED',
      });
    }

    const userRoleIds = req.user.role_ids || [req.user.role_id];
    // Super Admin has all permissions
    if (userRoleIds.includes(1)) {
      return next();
    }

    const userPerms = req.user.permissions || [];
    if (userPerms.includes('*')) {
      return next();
    }

    let hasPerm = false;
    if (mode === 'OR') {
      hasPerm = requiredPerms.some((p) => userPerms.includes(p));
    } else {
      hasPerm = requiredPerms.every((p) => userPerms.includes(p));
    }

    if (!hasPerm) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Missing required permission: ${requiredPerms.join(', ')}`,
      });
    }
    next();
  };
}

// Role shorthand constants
export const SUPER_ADMIN = [1];
export const ADMIN_ROLES = [1, 2];
export const SALES_TEAM = [1, 2, 4, 7, 13];
export const SALES_MANAGERS = [1, 2, 4];
export const OPS_TEAM = [1, 2, 3, 8, 12];
export const OPS_MANAGERS = [1, 2, 3];
export const FRANCHISE_ROLES = [1, 2, 6, 10];
export const MARKETING_TEAM = [1, 2, 5, 9];
export const FINANCE_ROLES = [1, 2];
export const ALL_STAFF = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
