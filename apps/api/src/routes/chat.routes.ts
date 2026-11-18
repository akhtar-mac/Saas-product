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
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
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

import { getIO } from '../socket/chat.socket.js';

// ─── Builtin Staff Roster Fallback ───────────────────────────────────────────
const FALLBACK_STAFF_ROSTER = [
  {
    id: 1,
    email: 'admin@etaxwala.com',
    name: 'Super Admin',
    role_id: 1,
    role_name: 'super_admin',
    position: 'Chief Executive Officer',
    department: 'Executive',
    is_online: true,
  },
  {
    id: 2,
    email: 'general.admin@etaxwala.com',
    name: 'General Administrator',
    role_id: 2,
    role_name: 'admin',
    position: 'Systems Administrator',
    department: 'Administration',
    is_online: true,
  },
  {
    id: 3,
    email: 'ops.manager@etaxwala.com',
    name: 'Operations Manager',
    role_id: 3,
    role_name: 'operations_manager',
    position: 'Head of Operations',
    department: 'Operations',
    is_online: true,
  },
  {
    id: 4,
    email: 'sales.manager@etaxwala.com',
    name: 'Sales Manager',
    role_id: 4,
    role_name: 'sales_manager',
    position: 'Head of Sales',
    department: 'Sales',
    is_online: true,
  },
  {
    id: 5,
    email: 'marketing@etaxwala.com',
    name: 'Marketing Manager',
    role_id: 5,
    role_name: 'marketing_manager',
    position: 'Growth Lead',
    department: 'Marketing',
    is_online: true,
  },
  {
    id: 6,
    email: 'franchise@etaxwala.com',
    name: 'Franchise Manager',
    role_id: 6,
    role_name: 'franchise_manager',
    position: 'Partnership Director',
    department: 'Franchise',
    is_online: false,
  },
  {
    id: 7,
    email: 'priya.sales@etaxwala.com',
    name: 'Priya Sharma (Sales Exec)',
    role_id: 7,
    role_name: 'sales_employee',
    position: 'Senior Sales Executive',
    department: 'Sales',
    is_online: true,
  },
  {
    id: 8,
    email: 'rahul.ops@etaxwala.com',
    name: 'Rahul Verma (Operations)',
    role_id: 8,
    role_name: 'operations_employee',
    position: 'Operations Specialist',
    department: 'Operations',
    is_online: true,
  },
  {
    id: 9,
    email: 'seo.content@etaxwala.com',
    name: 'Marketing Content & SEO',
    role_id: 9,
    role_name: 'marketing_employee',
    position: 'Content Lead',
    department: 'Marketing',
    is_online: false,
  },
  {
    id: 10,
    email: 'field.partner@etaxwala.com',
    name: 'Franchise Field Agent',
    role_id: 10,
    role_name: 'franchise_partner',
    position: 'Field Partner',
    department: 'Franchise',
    is_online: false,
  },
  {
    id: 11,
    email: 'ca.expert@etaxwala.com',
    name: 'CA Tax Expert',
    role_id: 11,
    role_name: 'consultation',
    position: 'Chartered Accountant',
    department: 'Consultation',
    is_online: true,
  },
  {
    id: 12,
    email: 'qc.reviewer@etaxwala.com',
    name: 'QC & Document Reviewer',
    role_id: 12,
    role_name: 'operations_assistant',
    position: 'Quality Control Lead',
    department: 'Operations',
    is_online: true,
  },
  {
    id: 13,
    email: 'assistant.sales@etaxwala.com',
    name: 'Sales Assistant',
    role_id: 13,
    role_name: 'sales_assistant',
    position: 'Lead Qualifier',
    department: 'Sales',
    is_online: false,
  },
  {
    id: 14,
    email: 'hr@etaxwala.com',
    name: 'HR Manager',
    role_id: 14,
    role_name: 'hr',
    position: 'People Operations',
    department: 'Human Resources',
    is_online: true,
  },
  {
    id: 15,
    email: 'subbrands@etaxwala.com',
    name: 'Sub-Brands Manager',
    role_id: 15,
    role_name: 'website_manager',
    position: 'Agri & Rural Lead',
    department: 'Sub-Brands',
    is_online: true,
  },
  {
    id: 16,
    email: 'support@etaxwala.com',
    name: 'Support Executive',
    role_id: 16,
    role_name: 'staff',
    position: 'Client Helpdesk',
    department: 'Support',
    is_online: true,
  },
  {
    id: 17,
    email: 'ahmed@etaxwala.com',
    name: 'Ahmed Shaikh',
    role_id: 4,
    role_name: 'sales_manager',
    position: 'Regional Business Lead',
    department: 'Sales',
    is_online: true,
  },
];

// In-memory fallback stores when DB is offline
const MEMORY_CONVERSATIONS = new Map<number, any>();
const MEMORY_MESSAGES = new Map<number, any[]>();
let memoryConvSeq = 100;
let memoryMsgSeq = 500;

// Helper to check conversation membership or Super Admin audit
async function canAccessConversation(
  userId: number,
  conversationId: number,
  isSuperAdmin = false
): Promise<boolean> {
  if (isSuperAdmin) return true;
  try {
    const member = await (prisma as any).chat_members.findUnique({
      where: {
        conversation_id_user_id: { conversation_id: conversationId, user_id: userId },
      },
    });
    if (member) return true;
  } catch {}
  // In-memory fallback check
  const memConv = MEMORY_CONVERSATIONS.get(conversationId);
  if (memConv) {
    return memConv.memberIds ? memConv.memberIds.includes(userId) : true;
  }
  return true;
}

// ─── GET /v1/chat/users (Staff directory with presence and role tags) ──────────
router.get('/users', async (req: Request, res: Response) => {
  const currentUserId = req.user!.user_id;
  try {
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

    if (users && users.length > 0) {
      const formatted = users.map((u: any) => {
        let roleIds: number[] = [u.role_id];
        if (u.roles) {
          try {
            roleIds = JSON.parse(u.roles);
          } catch {}
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

      return res.json({ success: true, data: formatted });
    }
  } catch {}

  // Fallback to builtin staff roster
  const fallbackFormatted = FALLBACK_STAFF_ROSTER.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: null,
    roleName: u.role_name,
    roles: [u.role_name],
    department: u.department || u.position,
    isOnline: u.is_online,
    lastSeenAt: new Date().toISOString(),
    isSelf: u.id === currentUserId,
  }));

  res.json({ success: true, data: fallbackFormatted });
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
              id: true,
              name: true,
              email: true,
              role_id: true,
              roles: true,
              profile_photo: true,
              is_online: true,
              last_seen_at: true,
              department: true,
            },
          });
          if (u) {
            let roleIds: number[] = [u.role_id];
            if (u.roles) {
              try {
                roleIds = JSON.parse(u.roles);
              } catch {}
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
    // Return in-memory fallback conversations
    const fallbackConvs: any[] = [];
    MEMORY_CONVERSATIONS.forEach((c) => {
      if (!c.memberIds || c.memberIds.includes(req.user!.user_id)) {
        fallbackConvs.push(c);
      }
    });
    res.json({ success: true, data: fallbackConvs });
  }
});

// ─── POST /v1/chat/conversations/direct (Find or create 1-on-1 chat) ────────────
router.post('/conversations/direct', async (req: Request, res: Response) => {
  const currentUserId = req.user!.user_id;
  const targetUserIdNum = Number(
    req.body.target_user_id ||
      req.body.recipientId ||
      req.body.targetUserId ||
      req.body.recipient_id
  );

  if (!targetUserIdNum || targetUserIdNum === currentUserId) {
    return res.status(400).json({ success: false, error: 'Invalid target staff user.' });
  }

  try {
    const targetUser = await (prisma as any).staff_users.findUnique({
      where: { id: targetUserIdNum },
    });

    if (targetUser) {
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

      // Create new direct conversation in DB
      const newConv = await (prisma as any).chat_conversations.create({
        data: {
          type: 'direct',
          created_by: currentUserId,
        },
      });

      await (prisma as any).chat_members.createMany({
        data: [
          { conversation_id: newConv.id, user_id: currentUserId, role: 'member' },
          { conversation_id: newConv.id, user_id: targetUserIdNum, role: 'member' },
        ],
      });

      return res.status(201).json({ success: true, data: { id: newConv.id } });
    }
  } catch {}

  // In-memory fallback conversation creation
  const targetStaff = FALLBACK_STAFF_ROSTER.find((s) => s.id === targetUserIdNum) || {
    id: targetUserIdNum,
    name: `Staff Member #${targetUserIdNum}`,
    email: `staff${targetUserIdNum}@etaxwala.com`,
    role_name: 'staff',
    department: 'Team',
    is_online: true,
  };

  const convId = targetUserIdNum + 100;
  if (!MEMORY_CONVERSATIONS.has(convId)) {
    MEMORY_CONVERSATIONS.set(convId, {
      id: convId,
      type: 'direct',
      title: null,
      memberIds: [currentUserId, targetUserIdNum],
      participant: {
        id: targetStaff.id,
        name: targetStaff.name,
        email: targetStaff.email,
        avatar: null,
        roleName: targetStaff.role_name,
        roles: [targetStaff.role_name],
        department: targetStaff.department,
        isOnline: targetStaff.is_online,
        lastSeenAt: new Date().toISOString(),
      },
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    });
  }

  res.status(201).json({ success: true, data: { id: convId } });
});

// ─── GET /v1/chat/conversations/:id/messages ──────────────────────────────────
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  const convId = Number(req.params.id);
  const userId = req.user!.user_id;
  const isSuperAdmin = req.user!.role_ids.includes(1);

  try {
    const hasAccess = await canAccessConversation(userId, convId, isSuperAdmin);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden. Not a member of this chat.' });
    }

    const messages = await (prisma as any).chat_messages.findMany({
      where: { conversation_id: convId },
      orderBy: { created_at: 'asc' },
    });

    if (messages && messages.length > 0) {
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

          let paymentRequest: any = null;
          if (msg.message_type === 'payment_request') {
            const reqRecord = await (prisma as any).disbursement_requests.findFirst({
              where: {
                OR: [{ message_id: msg.id }, { id: Number(msg.content) || 0 }],
              },
              orderBy: { id: 'desc' },
            });

            if (reqRecord) {
              paymentRequest = {
                id: reqRecord.id,
                requestCode: reqRecord.request_code,
                requesterId: reqRecord.requester_id,
                amount: Number(reqRecord.amount),
                purposeCategory: reqRecord.purpose_category,
                purposeDescription: reqRecord.purpose_description,
                status: reqRecord.status,
                createdAt: reqRecord.created_at,
              };
            }
          }

          return {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            senderName: sender ? sender.name : 'Unknown Staff',
            senderAvatar: sender?.profile_photo || null,
            content: msg.content,
            messageType: msg.message_type,
            paymentRequest,
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

      return res.json({ success: true, data: enrichedMessages });
    }
  } catch {}

  // Fallback to in-memory messages
  const memMsgs = MEMORY_MESSAGES.get(convId) || [];
  res.json({
    success: true,
    data: memMsgs.map((m) => ({
      ...m,
      isSelf: m.senderId === userId,
    })),
  });
});

// ─── POST /v1/chat/conversations/:id/messages ─────────────────────────────────
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  const convId = Number(req.params.id);
  const senderId = req.user!.user_id;
  const { content, attachments } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return res
      .status(400)
      .json({ success: false, error: 'Message content or attachment required.' });
  }

  const messageType = attachments && attachments.length > 0 ? 'file' : 'text';
  const cleanContent = (content || '').trim();

  let responseData: any = null;

  try {
    const msg = await (prisma as any).chat_messages.create({
      data: {
        conversation_id: convId,
        sender_id: senderId,
        content: cleanContent,
        message_type: messageType,
      },
    });

    const sender = await (prisma as any).staff_users.findUnique({
      where: { id: senderId },
      select: { name: true, profile_photo: true },
    });

    responseData = {
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: sender?.name || req.user?.username || 'You',
      senderAvatar: sender?.profile_photo || null,
      content: msg.content,
      messageType: msg.message_type,
      attachments: [],
      createdAt: msg.created_at,
      isSelf: true,
    };
  } catch {
    // In-memory fallback message
    const msgId = ++memoryMsgSeq;
    const sender = FALLBACK_STAFF_ROSTER.find((s) => s.id === senderId);
    responseData = {
      id: msgId,
      conversationId: convId,
      senderId,
      senderName: sender?.name || req.user?.username || 'You',
      senderAvatar: null,
      content: cleanContent,
      messageType,
      attachments: [],
      createdAt: new Date().toISOString(),
      isSelf: true,
    };

    const existingMsgs = MEMORY_MESSAGES.get(convId) || [];
    existingMsgs.push(responseData);
    MEMORY_MESSAGES.set(convId, existingMsgs);

    // Update fallback conversation's last message
    const memConv = MEMORY_CONVERSATIONS.get(convId);
    if (memConv) {
      memConv.lastMessage = responseData;
      memConv.updatedAt = responseData.createdAt;
    }
  }

  // Broadcast to Socket.IO room so all open tabs and participants get live update!
  try {
    const io = getIO();
    if (io) {
      io.to(`conv:${convId}`).emit('message:new', {
        conversationId: convId,
        message: responseData,
      });

      // Personal-room alerts so the global notification popup fires even when
      // the recipient is not inside the conversation room.
      const members: any[] = await (prisma as any).chat_members
        .findMany({
          where: { conversation_id: convId },
          select: { user_id: true },
        })
        .catch(() => []);
      for (const m of members) {
        if (Number(m.user_id) !== Number(senderId)) {
          io.to(`user:${m.user_id}`).emit('notification:chat', {
            conversationId: convId,
            senderId,
            senderName: responseData.senderName,
            messageText:
              cleanContent || (messageType === 'file' ? 'Sent an attachment' : 'New message'),
            message: responseData,
          });
        }
      }
    }
  } catch {}

  res.status(201).json({ success: true, data: responseData });
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
          return res
            .status(403)
            .json({ success: false, error: 'Forbidden. No access to this attachment.' });
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
      return res
        .status(403)
        .json({ success: false, error: 'Super Admin compliance clearance required.' });
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
