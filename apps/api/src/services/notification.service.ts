import { prisma } from '../config/db.js';
import { getIO } from '../socket/chat.socket.js';
import { logger } from '../utils/logger.js';

export interface SendNotificationParams {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number | string;
  redirectUrl?: string;
  urgent?: boolean;
}

export async function sendNotification(params: SendNotificationParams): Promise<any> {
  try {
    // Generate safe incremented ID
    const maxIdRes = await prisma.$queryRawUnsafe<[{ max_id: number | null }]>(
      `SELECT COALESCE(MAX(id), 0) + 1 as max_id FROM notifications;`
    );
    const nextId = Number(maxIdRes[0]?.max_id || Date.now() % 1000000);

    const safeRelatedId =
      typeof params.relatedId === 'number'
        ? params.relatedId
        : params.relatedId
        ? parseInt(String(params.relatedId).replace(/[^0-9]/g, ''), 10) || null
        : null;

    const record = await (prisma as any).notifications.create({
      data: {
        id: nextId,
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        related_id: safeRelatedId,
        redirect_url: params.redirectUrl ?? null,
        is_read: 0,
      },
    });

    // Real-time broadcast via Socket.io
    const io = getIO();
    if (io) {
      const payload = {
        id: String(record.id),
        type: params.type,
        title: params.title,
        detail: params.message,
        time: 'Just now',
        isRead: false,
        urgent: !!params.urgent,
        redirectUrl: params.redirectUrl,
      };

      io.to(`user:${params.userId}`).emit('notification:new', payload);
    }
    return record;
  } catch (err: any) {
    logger.warn('Failed to dispatch notification:', { error: err.message, userId: params.userId });
    return null;
  }
}

/**
 * Broadcast notification to all staff possessing specific role IDs (e.g., HR Manager: 14, IT: 15)
 */
export async function broadcastRoleNotification(
  roleIds: number[],
  notification: Omit<SendNotificationParams, 'userId'>
): Promise<number> {
  try {
    const staffList = await (prisma as any).staff_users.findMany({
      where: {
        OR: [
          { role_id: { in: roleIds } },
          { is_active: true }, // will filter by roles below
        ],
      },
      select: { id: true, role_id: true, roles: true },
    });

    const targetUserIds = staffList
      .filter((s: any) => {
        if (roleIds.includes(s.role_id)) return true;
        try {
          const parsed = typeof s.roles === 'string' ? JSON.parse(s.roles) : s.roles;
          return Array.isArray(parsed) && parsed.some((r: number) => roleIds.includes(r));
        } catch {
          return false;
        }
      })
      .map((s: any) => s.id);

    let sentCount = 0;
    for (const uId of targetUserIds) {
      await sendNotification({ ...notification, userId: uId });
      sentCount++;
    }
    return sentCount;
  } catch (err: any) {
    logger.warn('Failed to broadcast role notifications:', { error: err.message, roleIds });
    return 0;
  }
}

export default {
  sendNotification,
  broadcastRoleNotification,
};
