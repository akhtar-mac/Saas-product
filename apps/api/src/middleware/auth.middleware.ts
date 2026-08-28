import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  user_id: number;
  role_id: number;
  role_name: string;
  username: string;
  email: string;
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
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
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
 * Role-based access control middleware factory.
 * Usage: router.get('/admin-only', verifyJWT, requireRole([1, 2]), handler)
 *
 * Role IDs:
 *  1 = super_admin
 *  2 = admin
 *  3 = operations_manager
 *  4 = sales_manager
 *  5 = marketing_manager
 *  6 = franchise_manager
 *  7 = sales_employee
 *  8 = operations_employee
 *  9 = marketing_employee
 * 10 = franchise_partner
 * 11 = consultation
 * 12 = operations_assistant
 * 13 = sales_assistant
 * 14 = hr
 * 15 = website_manager
 */
export function requireRole(allowedRoleIds: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    if (!allowedRoleIds.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This action requires one of: ${allowedRoleIds.join(', ')}`,
      });
    }
    next();
  };
}

// Convenient shorthand role sets
export const SUPER_ADMIN = [1];
export const ADMIN_ROLES = [1, 2];
export const SALES_TEAM = [1, 2, 4, 7, 13];         // includes managers + employees + assistants
export const SALES_MANAGERS = [1, 2, 4];
export const OPS_TEAM = [1, 2, 3, 8, 12];
export const OPS_MANAGERS = [1, 2, 3];
export const FRANCHISE_ROLES = [1, 2, 6, 10];
export const MARKETING_TEAM = [1, 2, 5, 9];
export const FINANCE_ROLES = [1, 2];                  // expand when Finance role added
export const ALL_STAFF = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
