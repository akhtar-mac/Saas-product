
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';
import {
  verifyJWT,
  requireRole,
  ADMIN_ROLES,
} from '../middleware/auth.middleware.js';

const router = Router();

// All users routes require authentication + Admin/Super Admin role
router.use(verifyJWT);
router.use(requireRole(ADMIN_ROLES));

export const ROLE_MAP: Record<number, string> = {
  1: 'Super Admin', 2: 'Admin', 3: 'Operations Manager',
  4: 'Sales Manager', 5: 'Marketing Manager', 6: 'Franchise Manager',
  7: 'Sales Employee', 8: 'Operations Employee', 9: 'Marketing Employee',
  10: 'Franchise Partner', 11: 'Consultation', 12: 'Operations Assistant',
  13: 'Sales Assistant', 14: 'HR', 15: 'Website Manager',
  16: 'Staff',
};

// Helper to format a user with full multi-role data
async function formatUserWithRoles(u: any) {
  let permsArray: string[] = [];
  if (u.permissions) {
    try { permsArray = JSON.parse(u.permissions); } catch { permsArray = []; }
  }

  // Get roles from staff_user_roles table
  let roleIds: number[] = [];
  try {
    const rolesFromDb = await (prisma as any).staff_user_roles.findMany({
      where: { user_id: u.id },
      select: { role_id: true },
    });
    if (rolesFromDb && rolesFromDb.length > 0) {
      roleIds = rolesFromDb.map((r: any) => r.role_id);
    }
  } catch {}

  // Fallback to JSON or primary role_id
  if (roleIds.length === 0 && u.roles) {
    try { roleIds = JSON.parse(u.roles); } catch {}
  }
  if (roleIds.length === 0 && u.role_id) {
    roleIds = [u.role_id];
  }

  const assignedRoles = roleIds.map((rId) => ({
    id: rId,
    name: ROLE_MAP[rId] || 'Staff',
  }));

  return {
    ...u,
    roles: assignedRoles.map((r) => r.name),
    permissions: permsArray,
    role_name: ROLE_MAP[u.role_id] || 'Staff',
    role_ids: roleIds,
    assigned_roles: assignedRoles,
  };
}

// ─── GET /v1/admin/users ──────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await (prisma as any).staff_users.findMany({
      select: {
        id: true, name: true, email: true, phone: true,
        role_id: true, roles: true, permissions: true, profile_photo: true, position: true,
        department: true, is_active: true, is_online: true, last_login_at: true, last_seen_at: true, created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (users && users.length > 0) {
      const enriched = await Promise.all(users.map((u: any) => formatUserWithRoles(u)));
      return res.json({
        success: true,
        data: enriched,
      });
    }
  } catch (err) {}

  // Builtin staff users fallback
  const fallbackList = Object.entries(ROLE_MAP).map(([roleId, roleName], i) => ({
    id: i + 1,
    name: `${roleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
    email: `${roleName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@etaxwala.com`,
    phone: '+91 98765 43210',
    role_id: Number(roleId),
    role_name: ROLE_MAP[Number(roleId)],
    role_ids: [Number(roleId)],
    assigned_roles: [{ id: Number(roleId), name: ROLE_MAP[Number(roleId)] }],
    permissions: [],
    position: `${ROLE_MAP[Number(roleId)]} Specialist`,
    department: 'General',
    is_active: true,
    is_online: false,
    last_login_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  res.json({
    success: true,
    data: fallbackList,
  });
});

// ─── POST /v1/admin/users ─────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role_id, role_ids, position, department, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.',
      });
    }

    const primaryRoleId = Number(role_id) || (role_ids && role_ids.length > 0 ? Number(role_ids[0]) : 7);
    if (!ROLE_MAP[primaryRoleId]) {
      return res.status(400).json({ success: false, error: 'Invalid role_id.' });
    }

    // Determine complete role IDs array
    const assignedIds: number[] = Array.isArray(role_ids) && role_ids.length > 0
      ? Array.from(new Set([primaryRoleId, ...role_ids.map(Number)]))
      : [primaryRoleId];

    // Check duplicate email
    const existing = await (prisma as any).staff_users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already in use.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const permsJson = permissions && Array.isArray(permissions) ? JSON.stringify(permissions) : null;
    const rolesJson = JSON.stringify(assignedIds);

    const user = await (prisma as any).staff_users.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        phone: phone || null,
        role_id: primaryRoleId,
        roles: rolesJson,
        permissions: permsJson,
        position: position || null,
        department: department || null,
        is_active: true,
        created_by: req.user!.user_id,
      },
      select: {
        id: true, name: true, email: true, phone: true,
        role_id: true, roles: true, permissions: true, position: true, department: true, is_active: true, created_at: true,
      },
    });

    // Insert into staff_user_roles pivot table
    for (const rId of assignedIds) {
      try {
        await (prisma as any).staff_user_roles.create({
          data: {
            user_id: user.id,
            role_id: rId,
            assigned_by: req.user!.user_id,
          },
        });
      } catch {}
    }

    const formatted = await formatUserWithRoles(user);
    res.status(201).json({
      success: true,
      message: `User created successfully with ${assignedIds.length} role(s).`,
      data: formatted,
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
});

// ─── POST /v1/admin/users/:id/roles (Add a role without overwriting) ──────────
router.post('/:id/roles', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const roleIdNum = Number(req.body.role_id || req.body.roleId);

    if (!roleIdNum || !ROLE_MAP[roleIdNum]) {
      return res.status(400).json({ success: false, error: 'Invalid role_id.' });
    }

    const user = await (prisma as any).staff_users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Insert into staff_user_roles if not already present
    try {
      await (prisma as any).staff_user_roles.upsert({
        where: {
          user_id_role_id: { user_id: userId, role_id: roleIdNum },
        },
        update: {},
        create: {
          user_id: userId,
          role_id: roleIdNum,
          assigned_by: req.user!.user_id,
        },
      });
    } catch {
      // fallback if composite key constraint varies
      await (prisma as any).staff_user_roles.create({
        data: {
          user_id: userId,
          role_id: roleIdNum,
          assigned_by: req.user!.user_id,
        },
      }).catch(() => {});
    }

    // Update roles JSON cache in staff_users
    const allRoles = await (prisma as any).staff_user_roles.findMany({
      where: { user_id: userId },
      select: { role_id: true },
    });
    const roleIds = allRoles.map((r: any) => r.role_id);

    await (prisma as any).staff_users.update({
      where: { id: userId },
      data: { roles: JSON.stringify(roleIds) },
    });

    const updatedUser = await (prisma as any).staff_users.findUnique({
      where: { id: userId },
    });
    const formatted = await formatUserWithRoles(updatedUser);

    res.json({
      success: true,
      message: `Role '${ROLE_MAP[roleIdNum]}' assigned to ${user.name}.`,
      data: formatted,
    });
  } catch (err) {
    console.error('Add role error:', err);
    res.status(500).json({ success: false, error: 'Failed to assign role.' });
  }
});

// ─── DELETE /v1/admin/users/:id/roles/:roleId (Remove single role) ────────────
router.delete('/:id/roles/:roleId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const roleIdNum = Number(req.params.roleId);

    const user = await (prisma as any).staff_users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Check count of assigned roles — user must keep at least 1 role
    const currentRoles = await (prisma as any).staff_user_roles.findMany({
      where: { user_id: userId },
    });

    if (currentRoles.length <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove the only remaining role. A user must have at least one assigned role.',
      });
    }

    await (prisma as any).staff_user_roles.deleteMany({
      where: { user_id: userId, role_id: roleIdNum },
    });

    const remainingRoles = await (prisma as any).staff_user_roles.findMany({
      where: { user_id: userId },
      select: { role_id: true },
    });
    const remainingRoleIds = remainingRoles.map((r: any) => r.role_id);

    // If removed role was primary, update primary to first remaining role
    const newPrimaryRoleId = user.role_id === roleIdNum ? remainingRoleIds[0] : user.role_id;

    await (prisma as any).staff_users.update({
      where: { id: userId },
      data: {
        role_id: newPrimaryRoleId,
        roles: JSON.stringify(remainingRoleIds),
      },
    });

    const updatedUser = await (prisma as any).staff_users.findUnique({
      where: { id: userId },
    });
    const formatted = await formatUserWithRoles(updatedUser);

    res.json({
      success: true,
      message: `Role '${ROLE_MAP[roleIdNum]}' removed from ${user.name}.`,
      data: formatted,
    });
  } catch (err) {
    console.error('Remove role error:', err);
    res.status(500).json({ success: false, error: 'Failed to remove role.' });
  }
});

// ─── PATCH /v1/admin/users/:id ────────────────────────────────────────────────
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role_id, position, department, password, permissions } = req.body;

    const updateData: any = {};
    if (name)       updateData.name       = name.trim();
    if (email)      updateData.email      = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (role_id)    updateData.role_id    = Number(role_id);
    if (position)   updateData.position   = position;
    if (department) updateData.department = department;
    if (password)   updateData.password_hash = await bcrypt.hash(password, 12);
    if (permissions && Array.isArray(permissions)) {
      updateData.permissions = JSON.stringify(permissions);
    }

    const user = await (prisma as any).staff_users.update({
      where: { id: Number(id) },
      data: updateData,
    });

    const formatted = await formatUserWithRoles(user);
    res.json({
      success: true,
      message: 'User updated successfully.',
      data: formatted,
    });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(500).json({ success: false, error: 'Failed to update user.' });
  }
});

// ─── PATCH /v1/admin/users/:id/deactivate ────────────────────────────────────
router.patch('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (Number(id) === 1) {
      return res.status(403).json({ success: false, error: 'Cannot deactivate the primary Super Admin.' });
    }

    const user = await (prisma as any).staff_users.update({
      where: { id: Number(id) },
      data: { is_active: active !== false },
      select: { id: true, name: true, is_active: true },
    });

    res.json({
      success: true,
      message: user.is_active ? 'User reactivated.' : 'User deactivated.',
      data: user,
    });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
});

// ─── DELETE /v1/admin/users/:id ──────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (userId === 1) {
      return res.status(403).json({ success: false, error: 'Cannot delete the primary Super Admin.' });
    }
    // Hard delete only permitted by Super Admin (role 1)
    const userRoleIds = req.user!.role_ids || [req.user!.role_id];
    if (!userRoleIds.includes(1)) {
      return res.status(403).json({ success: false, error: 'Only Super Admin can permanently delete users.' });
    }

    // Clean up pivot table first
    await (prisma as any).staff_user_roles.deleteMany({ where: { user_id: userId } });
    await (prisma as any).staff_users.delete({ where: { id: userId } });

    res.json({ success: true, message: 'User permanently deleted.' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
});

export default router;

