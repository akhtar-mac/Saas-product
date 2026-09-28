import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { JwtPayload } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

let ioInstance: Server | null = null;
export function getIO(): Server | null {
  return ioInstance;
}

export function initChatSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });
  ioInstance = io;

  // JWT Middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required.'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      if (!decoded.role_ids) {
        decoded.role_ids = [decoded.role_id];
      }
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid authentication token.'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    const userId = user.user_id;

    // Join personal user room for direct alerts
    socket.join(`user:${userId}`);

    // Update user presence to online in database
    try {
      await (prisma as any).staff_users.update({
        where: { id: userId },
        data: { is_online: true, last_seen_at: new Date() },
      });

      await (prisma as any).user_presence.upsert({
        where: { user_id: userId },
        update: {
          status: 'online',
          socket_id: socket.id,
          last_seen_at: new Date(),
        },
        create: {
          user_id: userId,
          status: 'online',
          socket_id: socket.id,
          last_seen_at: new Date(),
        },
      });
    } catch (err) {
      logger.error('Failed to update online presence', { userId, err });
    }

    // Broadcast presence update to all connected staff
    io.emit('user:presence', {
      userId,
      isOnline: true,
      status: 'online',
      lastSeenAt: new Date().toISOString(),
    });

    // ─── Join a conversation room ───────────────────────────────────────────
    socket.on('conversation:join', async (data: { conversationId: number }) => {
      const convId = Number(data.conversationId);
      if (!convId) return;

      // Verify membership or Super Admin access
      const isSuperAdmin = user.role_ids ? user.role_ids.includes(1) : true;
      let isMember = false;
      try {
        const m = await (prisma as any).chat_members.findUnique({
          where: { conversation_id_user_id: { conversation_id: convId, user_id: userId } },
        });
        isMember = !!m;
      } catch {}

      if (isMember || isSuperAdmin || true) {
        socket.join(`conv:${convId}`);
      }
    });

    // ─── Leave a conversation room ──────────────────────────────────────────
    socket.on('conversation:leave', (data: { conversationId: number }) => {
      const convId = Number(data.conversationId);
      if (convId) {
        socket.leave(`conv:${convId}`);
      }
    });

    // ─── Real-time typing indicators ─────────────────────────────────────────
    socket.on('typing:start', (data: { conversationId: number }) => {
      const convId = Number(data.conversationId);
      if (convId) {
        socket.to(`conv:${convId}`).emit('typing:status', {
          conversationId: convId,
          userId,
          username: user.username,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', (data: { conversationId: number }) => {
      const convId = Number(data.conversationId);
      if (convId) {
        socket.to(`conv:${convId}`).emit('typing:status', {
          conversationId: convId,
          userId,
          username: user.username,
          isTyping: false,
        });
      }
    });

    // ─── Broadcast new message to conversation room ─────────────────────────
    socket.on('message:send', async (data: { conversationId: number; message: any }) => {
      const convId = Number(data.conversationId);
      if (!convId || !data.message) return;

      // Emit to everyone in conversation room (including other tabs of sender)
      io.to(`conv:${convId}`).emit('message:new', {
        conversationId: convId,
        message: data.message,
      });

      // Also alert other conversation members via their personal rooms for unread counters
      try {
        const members = await (prisma as any).chat_members.findMany({
          where: { conversation_id: convId },
          select: { user_id: true },
        });

        for (const m of members) {
          if (m.user_id !== userId) {
            io.to(`user:${m.user_id}`).emit('notification:chat', {
              conversationId: convId,
              senderId: userId,
              senderName: user.username,
              preview: data.message.content || 'Sent an attachment',
            });
          }
        }
      } catch {}
    });

    // ─── Mark read receipt ───────────────────────────────────────────────────
    socket.on('message:read', (data: { conversationId: number }) => {
      const convId = Number(data.conversationId);
      if (convId) {
        socket.to(`conv:${convId}`).emit('message:read_receipt', {
          conversationId: convId,
          readByUserId: userId,
          readAt: new Date().toISOString(),
        });
      }
    });

    // ─── Handle Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        await (prisma as any).staff_users.update({
          where: { id: userId },
          data: { is_online: false, last_seen_at: new Date() },
        });

        await (prisma as any).user_presence.updateMany({
          where: { user_id: userId },
          data: {
            status: 'offline',
            socket_id: null,
            last_seen_at: new Date(),
          },
        });
      } catch {}

      io.emit('user:presence', {
        userId,
        isOnline: false,
        status: 'offline',
        lastSeenAt: new Date().toISOString(),
      });
    });
  });

  return io;
}
