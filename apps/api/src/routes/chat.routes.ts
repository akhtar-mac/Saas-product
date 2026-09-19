import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { ROLE_MAP } from './users.routes.js';

const router = Router();
router.use(verifyJWT);

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads/chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup with strict validation
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Allowed: Images, PDF, Word, Excel, CSV, Text.'));
    }
  },
});

// Helper to check conversation membership or Super Admin audit
async function canAccessConversation(userId: number, conversationId: number, isSuperAdmin = false): Promise<boolean> {
  if (isSuperAdmin) return true;
  const member = await (prisma as any).chat_members.findUnique({
    where: {
      conversation_id_user_id: { conversation_id: conversationId, user_id: userId },
    },
  });
  return !!member;
}

// ─── GET /v1/chat/users (Staff directory with presence and role tags) ──────────
router.get('/users', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.user_id;
    const users = await (prisma as any).staff_users.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        roles: true,
        department: true,
        position: true,
        profile_photo: true,
        is_online: true,
        last_seen_at: true,
      },
      orderBy: { name: 'asc' },
    });

    const formatted = users.map((u: any) => {
      let roleIds: number[] = [u.role_id];
      if (u.roles) {
        try { roleIds = JSON.parse(u.roles); } catch {}
      }
      const roleNames = roleIds.map((id) => ROLE_MAP[id] || 'Staff');
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.profile_photo,
        roleName: ROLE_MAP[u.role_id] || 'Staff',
        roles: roleNames,
        department: u.department || u.position || 'ETaxwala Team',
        isOnline: u.is_online || false,
        lastSeenAt: u.last_seen_at,
        isSelf: u.id === currentUserId,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Fetch chat users error:', err);
    res.status(500).json({ success: false, error: 'Failed to load staff directory.' });
  }
});

// ─── GET /v1/chat/conversations ───────────────────────────────────────────────
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.user_id;

    // Get all conversations user is member of
    const memberships = await (prisma as any).chat_members.findMany({
      where: { user_id: userId },
      select: { conversation_id: true, last_read_at: true },
    });

    const conversationIds = memberships.map((m: any) => m.conversation_id);
    if (conversationIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const conversations = await (prisma as any).chat_conversations.findMany({
      where: { id: { in: conversationIds } },
      orderBy: { updated_at: 'desc' },
    });

    // Populate members, last messages, and unread counts
    const enriched = await Promise.all(
      conversations.map(async (conv: any) => {
        const members = await (prisma as any).chat_members.findMany({
          where: { conversation_id: conv.id },
        });
        const otherMemberInfo = members.find((m: any) => m.user_id !== userId);
        const myMembership = members.find((m: any) => m.user_id === userId);

        let participant: any = null;
        if (otherMemberInfo) {
          const u = await (prisma as any).staff_users.findUnique({
            where: { id: otherMemberInfo.user_id },
            select: {
              id: true, name: true, email: true, role_id: true, roles: true,
              profile_photo: true, is_online: true, last_seen_at: true, department: true,
            },
          });
          if (u) {
            let roleIds: number[] = [u.role_id];
            if (u.roles) {
              try { roleIds = JSON.parse(u.roles); } catch {}
            }
            participant = {
              id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.profile_photo,
              roleName: ROLE_MAP[u.role_id] || 'Staff',
              roles: roleIds.map((id) => ROLE_MAP[id] || 'Staff'),
              department: u.department,
              isOnline: u.is_online,
              lastSeenAt: u.last_seen_at,
            };
          }
        }

        // Fetch last message
        const lastMsg = await (prisma as any).chat_messages.findFirst({
          where: { conversation_id: conv.id },
          orderBy: { created_at: 'desc' },
        });

        // Calculate unread count
        let unreadCount = 0;
        if (myMembership?.last_read_at) {
          unreadCount = await (prisma as any).chat_messages.count({
            where: {
              conversation_id: conv.id,
              sender_id: { not: userId },
              created_at: { gt: myMembership.last_read_at },
            },
          });
        } else {
          unreadCount = await (prisma as any).chat_messages.count({
            where: {
              conversation_id: conv.id,
              sender_id: { not: userId },
            },
          });
        }

        return {
          id: conv.id,
          type: conv.type,
          title: conv.title,
          participant,
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                conversationId: lastMsg.conversation_id,
                senderId: lastMsg.sender_id,
                content: lastMsg.content,
                messageType: lastMsg.message_type,
                createdAt: lastMsg.created_at,
              }
            : null,
          unreadCount,
          updatedAt: conv.updated_at,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ success: false, error: 'Failed to load conversations.' });
  }
});

// ─── POST /v1/chat/conversations/direct (Find or create 1-on-1 chat) ────────────
router.post('/conversations/direct', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.user_id;
    const targetUserIdNum = Number(
      req.body.target_user_id || req.body.recipientId || req.body.targetUserId || req.body.recipient_id
    );

    if (!targetUserIdNum || targetUserIdNum === currentUserId) {
      return res.status(400).json({ success: false, error: 'Invalid target staff user.' });
    }

    const targetUser = await (prisma as any).staff_users.findUnique({
      where: { id: targetUserIdNum },
    });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Staff member not found.' });
    }

    // Find existing direct conversation between these two
    const myConvs = await (prisma as any).chat_members.findMany({
      where: { user_id: currentUserId },
      select: { conversation_id: true },
    });
    const myConvIds = myConvs.map((m: any) => m.conversation_id);

    if (myConvIds.length > 0) {
      const mutualMember = await (prisma as any).chat_members.findFirst({
        where: {
          conversation_id: { in: myConvIds },
          user_id: targetUserIdNum,
        },
      });

      if (mutualMember) {
        const existingConv = await (prisma as any).chat_conversations.findUnique({
          where: { id: mutualMember.conversation_id },
        });
        if (existingConv && existingConv.type === 'direct') {
          return res.json({ success: true, data: { id: existingConv.id } });
        }
      }
    }

    // Create new direct conversation
    const newConv = await (prisma as any).chat_conversations.create({
      data: {
        type: 'direct',
        created_by: currentUserId,
      },
    });

    // Add both members
    await (prisma as any).chat_members.createMany({
      data: [
        { conversation_id: newConv.id, user_id: currentUserId, role: 'member' },
        { conversation_id: newConv.id, user_id: targetUserIdNum, role: 'member' },
      ],
    });

    res.status(201).json({ success: true, data: { id: newConv.id } });
  } catch (err) {
    console.error('Create direct conversation error:', err);
    res.status(500).json({ success: false, error: 'Failed to start chat.' });
  }
});

// ─── GET /v1/chat/conversations/:id/messages ──────────────────────────────────
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const convId = Number(req.params.id);
    const userId = req.user!.user_id;
    const isSuperAdmin = req.user!.role_ids.includes(1);

    const hasAccess = await canAccessConversation(userId, convId, isSuperAdmin);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Forbidden. Not a member of this chat.' });
    }

    const messages = await (prisma as any).chat_messages.findMany({
      where: { conversation_id: convId },
      orderBy: { created_at: 'asc' },
    });

    // Populate sender name, avatar, and attachments
    const enrichedMessages = await Promise.all(
      messages.map(async (msg: any) => {
        const sender = await (prisma as any).staff_users.findUnique({
          where: { id: msg.sender_id },
          select: { name: true, profile_photo: true },
        });

        const attachments = await (prisma as any).chat_attachments.findMany({
          where: { message_id: msg.id },
          select: { id: true, file_name: true, file_size: true, mime_type: true },
        });

        return {
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          senderName: sender ? sender.name : 'Unknown Staff',
          senderAvatar: sender?.profile_photo || null,
          content: msg.content,
          messageType: msg.message_type,
          attachments: attachments.map((att: any) => ({
            id: att.id,
            fileName: att.file_name,
            fileSize: att.file_size,
            mimeType: att.mime_type,
            fileUrl: `/v1/chat/attachments/${att.id}`,
          })),
          createdAt: msg.created_at,
          isSelf: msg.sender_id === userId,
        };
      })
    );

    // Auto mark read for this user
    await (prisma as any).chat_members.updateMany({
      where: { conversation_id: convId, user_id: userId },
      data: { last_read_at: new Date() },
    });

    res.json({ success: true, data: enrichedMessages });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ success: false, error: 'Failed to load messages.' });
  }
});

// ─── POST /v1/chat/conversations/:id/messages ─────────────────────────────────
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const convId = Number(req.params.id);
    const senderId = req.user!.user_id;
    const { content, attachments } = req.body;

    const hasAccess = await canAccessConversation(senderId, convId, false);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Cannot send message to this conversation.' });
    }

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, error: 'Message content or attachment required.' });
    }

    const messageType = attachments && attachments.length > 0 ? 'file' : 'text';

    const msg = await (prisma as any).chat_messages.create({
      data: {
        conversation_id: convId,
        sender_id: senderId,
        content: (content || '').trim(),
        message_type: messageType,
      },
    });

    // Associate attachments if present
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.id) {
          await (prisma as any).chat_attachments.update({
            where: { id: Number(att.id) },
            data: { message_id: msg.id },
          }).catch(() => {});
        }
      }
    }

    // Update conversation timestamp
    await (prisma as any).chat_conversations.update({
      where: { id: convId },
      data: {
        last_message_at: new Date(),
        updated_at: new Date(),
      },
    });

    const sender = await (prisma as any).staff_users.findUnique({
      where: { id: senderId },
      select: { name: true, profile_photo: true },
    });

    const attachedList = await (prisma as any).chat_attachments.findMany({
      where: { message_id: msg.id },
      select: { id: true, file_name: true, file_size: true, mime_type: true },
    });

    res.status(201).json({
      success: true,
      data: {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: sender?.name || 'You',
        senderAvatar: sender?.profile_photo || null,
        content: msg.content,
        messageType: msg.message_type,
        attachments: attachedList.map((att: any) => ({
          id: att.id,
          fileName: att.file_name,
          fileSize: att.file_size,
          mimeType: att.mime_type,
          fileUrl: `/v1/chat/attachments/${att.id}`,
        })),
        createdAt: msg.created_at,
        isSelf: true,
      },
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// ─── POST /v1/chat/conversations/:id/read ─────────────────────────────────────
router.post('/conversations/:id/read', async (req: Request, res: Response) => {
  try {
    const convId = Number(req.params.id);
    const userId = req.user!.user_id;

    await (prisma as any).chat_members.updateMany({
      where: { conversation_id: convId, user_id: userId },
      data: { last_read_at: new Date() },
    });

    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to mark read.' });
  }
});

// ─── POST /v1/chat/upload (Upload secure attachment) ──────────────────────────
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const attachment = await (prisma as any).chat_attachments.create({
      data: {
        message_id: 0, // Assigned upon sending message
        file_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        mimeType: attachment.mime_type,
        fileUrl: `/v1/chat/attachments/${attachment.id}`,
      },
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(400).json({ success: false, error: err.message || 'File upload failed.' });
  }
});

// ─── GET /v1/chat/attachments/:id (Authorized file stream) ────────────────────
router.get('/attachments/:id', async (req: Request, res: Response) => {
  try {
    const attId = Number(req.params.id);
    const userId = req.user!.user_id;
    const isSuperAdmin = req.user!.role_ids.includes(1);

    const attachment = await (prisma as any).chat_attachments.findUnique({
      where: { id: attId },
    });
    if (!attachment || !fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ success: false, error: 'Attachment not found.' });
    }

    if (attachment.message_id > 0) {
      const msg = await (prisma as any).chat_messages.findUnique({
        where: { id: attachment.message_id },
      });
      if (msg) {
        const canAccess = await canAccessConversation(userId, msg.conversation_id, isSuperAdmin);
        if (!canAccess) {
          return res.status(403).json({ success: false, error: 'Forbidden. No access to this attachment.' });
        }
      }
    }

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.file_name}"`);
    const stream = fs.createReadStream(attachment.file_path);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve attachment.' });
  }
});

// ─── GET /v1/chat/admin/conversations (Super Admin Audit & Compliance) ────────
router.get('/admin/conversations', async (req: Request, res: Response) => {
  try {
    const isSuperAdmin = req.user!.role_ids.includes(1);
    if (!isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Super Admin compliance clearance required.' });
    }

    const conversations = await (prisma as any).chat_conversations.findMany({
      orderBy: { updated_at: 'desc' },
      take: 50,
    });

    const enriched = await Promise.all(
      conversations.map(async (conv: any) => {
        const members = await (prisma as any).chat_members.findMany({
          where: { conversation_id: conv.id },
        });
        const userIds = members.map((m: any) => m.user_id);
        const users = await (prisma as any).staff_users.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role_id: true },
        });

        const msgCount = await (prisma as any).chat_messages.count({
          where: { conversation_id: conv.id },
        });

        return {
          id: conv.id,
          type: conv.type,
          participants: users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: ROLE_MAP[u.role_id] || 'Staff',
          })),
          totalMessages: msgCount,
          lastMessageAt: conv.last_message_at,
          updatedAt: conv.updated_at,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Audit conversations error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve audit log.' });
  }
});

export default router;
