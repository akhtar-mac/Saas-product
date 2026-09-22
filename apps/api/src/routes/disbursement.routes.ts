import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getIO } from '../socket/chat.socket.js';
import { sendNotification } from '../services/notification.service.js';
import { recordAuditLog } from '../services/audit.service.js';

const router = Router();
router.use(verifyJWT);

// Ensure upload directories exist
const uploadDirBase = path.resolve(process.cwd(), 'uploads/disbursements');
const qrUploadDir = path.join(uploadDirBase, 'qr');
const proofUploadDir = path.join(uploadDirBase, 'proofs');

for (const dir of [uploadDirBase, qrUploadDir, proofUploadDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage configuration
const qrStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, qrUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `qr-${uniqueSuffix}${ext}`);
  },
});

const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, proofUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image file (PNG, JPG, WEBP) or PDF.'));
  }
};

const uploadQr = multer({
  storage: qrStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Helper to check if user is Admin or Super Admin
function isAdmin(user: any): boolean {
  if (!user) return false;
  const roleIds = user.role_ids || [user.role_id];
  return roleIds.includes(1) || roleIds.includes(2);
}

// Helper to get active Accounts Officer & Wallet
async function getActiveAccountsOfficer() {
  const wallet = await (prisma as any).disbursement_wallets.findFirst({
    where: { is_active: true },
    orderBy: { updated_at: 'desc' },
  });

  if (!wallet) return null;

  const officer = await (prisma as any).staff_users.findUnique({
    where: { id: wallet.officer_id },
    select: {
      id: true,
      name: true,
      email: true,
      profile_photo: true,
      position: true,
      department: true,
      is_online: true,
    },
  });

  return { wallet, officer };
}

// Format request object for API response
function formatRequest(r: any, requester?: any, officer?: any) {
  return {
    id: r.id,
    requestCode: r.request_code,
    requesterId: r.requester_id,
    requesterName: requester?.name || 'Staff Member',
    requesterEmail: requester?.email || '',
    officerId: r.officer_id,
    officerName: officer?.name || null,
    conversationId: r.conversation_id,
    messageId: r.message_id,
    amount: Number(r.amount),
    purposeCategory: r.purpose_category,
    purposeDescription: r.purpose_description,
    clientRef: r.client_ref,
    upiId: r.upi_id,
    qrCodeUrl: r.qr_code_url,
    status: r.status,
    rejectionReason: r.rejection_reason,
    paymentProofUrl: r.payment_proof_url,
    utrNumber: r.utr_number,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ─── 1. GET /v1/disbursements/officer (Public to authenticated staff) ────────
router.get('/officer', async (_req: Request, res: Response) => {
  try {
    const active = await getActiveAccountsOfficer();
    if (!active || !active.officer) {
      return res.json({
        success: true,
        data: null,
        message: 'No Accounts Disbursement Officer has been assigned by Admin yet.',
      });
    }

    res.json({
      success: true,
      data: {
        id: active.officer.id,
        name: active.officer.name,
        email: active.officer.email,
        avatar: active.officer.profile_photo,
        position: active.officer.position || 'Accounts Officer',
        department: active.officer.department || 'Finance & Accounts',
        isOnline: active.officer.is_online || false,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 2. POST /v1/disbursements/requests (Submit new Money Request) ─────────────
router.post('/requests', uploadQr.single('qrCode'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.user_id;
    const { amount, purposeCategory, purposeDescription, clientRef, upiId, conversationId } =
      req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    }

    if (!purposeCategory || !purposeDescription) {
      return res
        .status(400)
        .json({ success: false, error: 'Category and description are required.' });
    }

    const qrFile = req.file;
    if (!upiId && !qrFile) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a UPI ID or upload a QR Code image.',
      });
    }

    const activeAccounts = await getActiveAccountsOfficer();
    const officerId = activeAccounts?.wallet?.officer_id || null;

    const qrCodeUrl = qrFile ? `/v1/disbursements/files/qr/${qrFile.filename}` : null;
    const requestCode = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newRequest = await (prisma as any).disbursement_requests.create({
      data: {
        request_code: requestCode,
        requester_id: userId,
        officer_id: officerId,
        conversation_id: conversationId ? Number(conversationId) : null,
        amount: parsedAmount,
        purpose_category: purposeCategory,
        purpose_description: purposeDescription,
        client_ref: clientRef || null,
        upi_id: upiId ? upiId.trim() : null,
        qr_code_url: qrCodeUrl,
        status: 'PENDING',
      },
    });

    const requester = await (prisma as any).staff_users.findUnique({
      where: { id: userId },
      select: { name: true, email: true, profile_photo: true },
    });

    const formatted = formatRequest(newRequest, requester, activeAccounts?.officer);

    // If sent from within a chat conversation, inject a rich payment request message into the chat!
    let createdMsg: any = null;
    if (conversationId && Number(conversationId)) {
      const convIdNum = Number(conversationId);

      createdMsg = await (prisma as any).chat_messages.create({
        data: {
          conversation_id: convIdNum,
          sender_id: userId,
          message_type: 'payment_request',
          content: JSON.stringify(formatted),
        },
      });

      await (prisma as any).disbursement_requests.update({
        where: { id: newRequest.id },
        data: { message_id: createdMsg.id },
      });

      await (prisma as any).chat_conversations.update({
        where: { id: convIdNum },
        data: {
          last_message_at: new Date(),
          updated_at: new Date(),
        },
      });

      const io = getIO();
      if (io) {
        io.to(`conv:${convIdNum}`).emit('message:new', {
          conversationId: convIdNum,
          message: {
            id: createdMsg.id,
            conversationId: convIdNum,
            senderId: userId,
            senderName: requester?.name || 'Staff Member',
            senderAvatar: requester?.profile_photo || null,
            content: createdMsg.content,
            messageType: 'payment_request',
            paymentRequest: formatted,
            attachments: [],
            createdAt: createdMsg.created_at,
            isSelf: false,
          },
        });
      }
    }

    // Broadcast notification & real-time event to Accounts Officer & Admins
    const io = getIO();
    if (io) {
      if (officerId) {
        io.to(`user:${officerId}`).emit('disbursement:new_request', {
          request: formatted,
          preview: `New Payment Request: ₹${parsedAmount} for ${purposeCategory}`,
        });
      }

      // Also alert all super admin users
      const admins = await (prisma as any).staff_users.findMany({
        where: { role_id: { in: [1, 2] }, is_active: true },
        select: { id: true },
      });
      for (const a of admins) {
        if (a.id !== userId) {
          io.to(`user:${a.id}`).emit('disbursement:new_request', { request: formatted });
        }
      }
    }

    if (officerId) {
      await sendNotification({
        userId: officerId,
        type: 'disbursement_request',
        title: `Payment Request: ₹${parsedAmount}`,
        message: `${requester?.name || 'Staff'} requested ₹${parsedAmount} for ${purposeCategory} (${clientRef || 'General'}).`,
        redirectUrl: `/crm/chat`,
      });
    }

    res.status(201).json({
      success: true,
      data: formatted,
      message: 'Payment request submitted to Accounts successfully.',
    });
  } catch (err: any) {
    console.error('Create disbursement request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 3. GET /v1/disbursements/requests (List requests with role scoping) ──────
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.user_id;
    const userIsAdmin = isAdmin(req.user);
    const active = await getActiveAccountsOfficer();
    const isOfficer = active?.wallet?.officer_id === userId;

    const { status, limit = '50', page = '1' } = req.query;
    const take = Math.min(parseInt(limit as string, 10) || 50, 100);
    const skip = ((parseInt(page as string, 10) || 1) - 1) * take;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status).toUpperCase();
    }

    // Role-based visibility scoping:
    // Admin sees all. Accounts Officer sees all assigned to accounts. Regular staff see ONLY their own requests!
    if (!userIsAdmin && !isOfficer) {
      where.requester_id = userId;
    }

    const [total, requests] = await Promise.all([
      (prisma as any).disbursement_requests.count({ where }),
      (prisma as any).disbursement_requests.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
    ]);

    const enriched = await Promise.all(
      requests.map(async (r: any) => {
        const [reqUser, offUser] = await Promise.all([
          (prisma as any).staff_users.findUnique({
            where: { id: r.requester_id },
            select: { name: true, email: true },
          }),
          r.officer_id
            ? (prisma as any).staff_users.findUnique({
                where: { id: r.officer_id },
                select: { name: true, email: true },
              })
            : null,
        ]);
        return formatRequest(r, reqUser, offUser);
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: parseInt(page as string, 10) || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4. POST /v1/disbursements/requests/:id/fulfill (Accounts marks Paid) ───────
router.post(
  '/requests/:id/fulfill',
  uploadProof.single('paymentProof'),
  async (req: Request, res: Response) => {
    try {
      const requestId = Number(req.params.id);
      const userId = req.user!.user_id;
      const userIsAdmin = isAdmin(req.user);

      const active = await getActiveAccountsOfficer();
      const isOfficer = active?.wallet?.officer_id === userId;

      if (!userIsAdmin && !isOfficer) {
        return res.status(403).json({
          success: false,
          error: 'Only the designated Accounts Officer or Admin can fulfill payment requests.',
        });
      }

      const proofFile = req.file;
      if (!proofFile) {
        return res.status(400).json({
          success: false,
          error: 'Mandatory payment proof screenshot is required to mark as paid.',
        });
      }

      const { utrNumber, notes } = req.body;

      const requestRecord = await (prisma as any).disbursement_requests.findUnique({
        where: { id: requestId },
      });

      if (!requestRecord) {
        return res.status(404).json({ success: false, error: 'Disbursement request not found.' });
      }

      if (requestRecord.status === 'PAID') {
        return res
          .status(400)
          .json({ success: false, error: 'This request has already been paid.' });
      }

      // Check Accounts Officer Wallet balance
      const wallet = await (prisma as any).disbursement_wallets.findFirst({
        where: { is_active: true },
      });

      if (!wallet) {
        return res.status(400).json({
          success: false,
          error: 'No active disbursement wallet found. Please ask Admin to initialize float.',
        });
      }

      const reqAmount = Number(requestRecord.amount);
      const currentBalance = Number(wallet.balance);

      if (currentBalance < reqAmount) {
        return res.status(400).json({
          success: false,
          error: `Insufficient Accounts Float Balance! Available: ₹${currentBalance.toLocaleString('en-IN')}, Required: ₹${reqAmount.toLocaleString('en-IN')}. Please contact Admin to Top Up.`,
          currentBalance,
          requiredAmount: reqAmount,
        });
      }

      const proofUrl = `/v1/disbursements/files/proofs/${proofFile.filename}`;
      const newBalance = currentBalance - reqAmount;
      const newTotalDisbursed = Number(wallet.total_disbursed) + reqAmount;

      // Deduct float balance
      await (prisma as any).disbursement_wallets.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          total_disbursed: newTotalDisbursed,
          updated_at: new Date(),
        },
      });

      // Update request
      const updated = await (prisma as any).disbursement_requests.update({
        where: { id: requestId },
        data: {
          status: 'PAID',
          officer_id: userId,
          payment_proof_url: proofUrl,
          utr_number: utrNumber ? utrNumber.trim() : null,
          rejection_reason: null,
          paid_at: new Date(),
          updated_at: new Date(),
        },
      });

      const [requester, officer] = await Promise.all([
        (prisma as any).staff_users.findUnique({
          where: { id: updated.requester_id },
          select: { name: true, email: true },
        }),
        (prisma as any).staff_users.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        }),
      ]);

      const formatted = formatRequest(updated, requester, officer);

      // Update chat message content if linked
      if (updated.message_id) {
        await (prisma as any).chat_messages
          .update({
            where: { id: updated.message_id },
            data: { content: JSON.stringify(formatted) },
          })
          .catch(() => {});
      }

      // Socket broadcasts
      const io = getIO();
      if (io) {
        if (updated.conversation_id) {
          io.to(`conv:${updated.conversation_id}`).emit('disbursement:updated', {
            conversationId: updated.conversation_id,
            messageId: updated.message_id,
            request: formatted,
          });
        }

        io.emit('disbursement:wallet_updated', {
          walletId: wallet.id,
          newBalance,
          officerId: wallet.officer_id,
        });
      }

      // Notify staff requester
      await sendNotification({
        userId: updated.requester_id,
        type: 'disbursement_paid',
        title: `Payment Disbursed: ₹${reqAmount}`,
        message: `Accounts Officer has paid ₹${reqAmount} for ${updated.purpose_category} (${updated.request_code}). Payment proof attached.`,
        redirectUrl: `/crm/chat`,
      });

      await recordAuditLog({
        actorId: userId,
        actorEmail: req.user!.email,
        actorRole: userIsAdmin ? 'Admin' : 'Accounts Officer',
        action: 'DISBURSEMENT_PAID',
        resource: 'disbursement_requests',
        resourceId: String(updated.id),
        payload: {
          amount: reqAmount,
          requestCode: updated.request_code,
          utrNumber: utrNumber || null,
          newBalance,
        },
      });

      res.json({
        success: true,
        data: formatted,
        remainingBalance: newBalance,
        message: `Payment of ₹${reqAmount} fulfilled. Float balance updated.`,
      });
    } catch (err: any) {
      console.error('Fulfill payment error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── 5. POST /v1/disbursements/requests/:id/reject (Reject with reason) ────────
router.post('/requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const userId = req.user!.user_id;
    const userIsAdmin = isAdmin(req.user);

    const active = await getActiveAccountsOfficer();
    const isOfficer = active?.wallet?.officer_id === userId;

    if (!userIsAdmin && !isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Only the Accounts Officer or Admin can reject payment requests.',
      });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
    }

    const requestRecord = await (prisma as any).disbursement_requests.findUnique({
      where: { id: requestId },
    });

    if (!requestRecord) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    const updated = await (prisma as any).disbursement_requests.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejection_reason: reason.trim(),
        officer_id: userId,
        updated_at: new Date(),
      },
    });

    const [requester, officer] = await Promise.all([
      (prisma as any).staff_users.findUnique({
        where: { id: updated.requester_id },
        select: { name: true, email: true },
      }),
      (prisma as any).staff_users.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
    ]);

    const formatted = formatRequest(updated, requester, officer);

    if (updated.message_id) {
      await (prisma as any).chat_messages
        .update({
          where: { id: updated.message_id },
          data: { content: JSON.stringify(formatted) },
        })
        .catch(() => {});
    }

    const io = getIO();
    if (io && updated.conversation_id) {
      io.to(`conv:${updated.conversation_id}`).emit('disbursement:updated', {
        conversationId: updated.conversation_id,
        messageId: updated.message_id,
        request: formatted,
      });
    }

    await sendNotification({
      userId: updated.requester_id,
      type: 'disbursement_rejected',
      title: `Payment Request Rejected (${updated.request_code})`,
      message: `Reason: ${reason}`,
      redirectUrl: `/crm/chat`,
    });

    res.json({ success: true, data: formatted, message: 'Request marked as rejected.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 6. GET /v1/disbursements/wallet (Admin or Accounts Officer only) ─────────
router.get('/wallet', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.user_id;
    const userIsAdmin = isAdmin(req.user);

    const active = await getActiveAccountsOfficer();
    const isOfficer = active?.wallet?.officer_id === userId;

    if (!userIsAdmin && !isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Only Admin and the designated Accounts Officer can view wallet balance.',
      });
    }

    if (!active || !active.wallet) {
      return res.json({
        success: true,
        data: null,
        message: 'No active disbursement wallet has been configured yet.',
      });
    }

    const topups = await (prisma as any).disbursement_topups.findMany({
      where: { wallet_id: active.wallet.id },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    const enrichedTopups = await Promise.all(
      topups.map(async (t: any) => {
        const adminUser = await (prisma as any).staff_users.findUnique({
          where: { id: t.admin_id },
          select: { name: true },
        });
        return {
          id: t.id,
          walletId: t.wallet_id,
          officerId: t.officer_id,
          adminId: t.admin_id,
          adminName: adminUser?.name || 'Admin',
          amount: Number(t.amount),
          paymentMode: t.payment_mode,
          referenceNo: t.reference_no,
          notes: t.notes,
          createdAt: t.created_at,
        };
      })
    );

    const balance = Number(active.wallet.balance);
    const threshold = Number(active.wallet.low_balance_threshold);
    const isLowBalance = balance <= threshold;

    res.json({
      success: true,
      data: {
        id: active.wallet.id,
        officerId: active.wallet.officer_id,
        officerName: active.officer?.name || 'Assigned Officer',
        officerEmail: active.officer?.email || '',
        officerAvatar: active.officer?.profile_photo || null,
        balance,
        totalFunded: Number(active.wallet.total_funded),
        totalDisbursed: Number(active.wallet.total_disbursed),
        lowBalanceThreshold: threshold,
        isLowBalance,
        isActive: active.wallet.is_active,
        recentTopups: enrichedTopups,
        updatedAt: active.wallet.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 7. POST /v1/disbursements/topup (Admin only: Top Up Float Balance) ─────────
router.post('/topup', async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.user_id;
    if (!isAdmin(req.user)) {
      return res
        .status(403)
        .json({ success: false, error: 'Only Admin can top up disbursement float.' });
    }

    const { amount, paymentMode = 'BANK_TRANSFER', referenceNo, notes } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Valid positive top-up amount is required.' });
    }

    const active = await getActiveAccountsOfficer();
    if (!active || !active.wallet) {
      return res.status(400).json({
        success: false,
        error: 'Please designate an Accounts Officer before topping up funds.',
      });
    }

    const currentBalance = Number(active.wallet.balance);
    const newBalance = currentBalance + parsedAmount;
    const newTotalFunded = Number(active.wallet.total_funded) + parsedAmount;

    await (prisma as any).disbursement_wallets.update({
      where: { id: active.wallet.id },
      data: {
        balance: newBalance,
        total_funded: newTotalFunded,
        updated_at: new Date(),
      },
    });

    const topup = await (prisma as any).disbursement_topups.create({
      data: {
        wallet_id: active.wallet.id,
        officer_id: active.wallet.officer_id,
        admin_id: adminId,
        amount: parsedAmount,
        payment_mode: paymentMode,
        reference_no: referenceNo || null,
        notes: notes || null,
      },
    });

    const io = getIO();
    if (io) {
      io.emit('disbursement:wallet_updated', {
        walletId: active.wallet.id,
        newBalance,
        officerId: active.wallet.officer_id,
        topupAmount: parsedAmount,
      });

      io.to(`user:${active.wallet.officer_id}`).emit('disbursement:topup_received', {
        amount: parsedAmount,
        newBalance,
      });
    }

    await sendNotification({
      userId: active.wallet.officer_id,
      type: 'float_topup',
      title: `Float Topped Up: +₹${parsedAmount.toLocaleString('en-IN')}`,
      message: `Admin has deposited ₹${parsedAmount.toLocaleString('en-IN')} into your disbursement account. New balance: ₹${newBalance.toLocaleString('en-IN')}.`,
      redirectUrl: `/crm/chat`,
    });

    await recordAuditLog({
      actorId: adminId,
      actorEmail: req.user!.email,
      actorRole: 'Admin',
      action: 'DISBURSEMENT_FLOAT_TOPUP',
      resource: 'disbursement_wallets',
      resourceId: String(active.wallet.id),
      payload: { amount: parsedAmount, newBalance, paymentMode, referenceNo },
    });

    res.json({
      success: true,
      message: `Successfully topped up ₹${parsedAmount.toLocaleString('en-IN')} to Accounts Officer.`,
      newBalance,
      topupId: topup.id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 8. POST /v1/disbursements/assign-officer (Admin only: Designate Officer) ───
router.post('/assign-officer', async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.user_id;
    if (!isAdmin(req.user)) {
      return res
        .status(403)
        .json({ success: false, error: 'Only Admin can assign the Accounts Officer.' });
    }

    const { officerId, initialBalance = 0, lowBalanceThreshold = 5000 } = req.body;
    const targetUserId = Number(officerId);

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Valid staff user ID is required.' });
    }

    const targetUser = await (prisma as any).staff_users.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Staff user not found.' });
    }

    // Deactivate existing active wallets
    await (prisma as any).disbursement_wallets.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    });

    // Check if wallet exists for this officer
    const existing = await (prisma as any).disbursement_wallets.findUnique({
      where: { officer_id: targetUserId },
    });

    let wallet: any;
    if (existing) {
      wallet = await (prisma as any).disbursement_wallets.update({
        where: { id: existing.id },
        data: {
          is_active: true,
          low_balance_threshold: parseFloat(lowBalanceThreshold) || 5000,
          updated_at: new Date(),
        },
      });
    } else {
      wallet = await (prisma as any).disbursement_wallets.create({
        data: {
          officer_id: targetUserId,
          balance: parseFloat(initialBalance) || 0,
          total_funded: parseFloat(initialBalance) || 0,
          total_disbursed: 0,
          low_balance_threshold: parseFloat(lowBalanceThreshold) || 5000,
          is_active: true,
        },
      });
    }

    await recordAuditLog({
      actorId: adminId,
      actorEmail: req.user!.email,
      actorRole: 'Admin',
      action: 'DISBURSEMENT_OFFICER_ASSIGNED',
      resource: 'disbursement_wallets',
      resourceId: String(wallet.id),
      payload: { officerId: targetUserId, officerName: targetUser.name },
    });

    const io = getIO();
    if (io) {
      io.emit('disbursement:officer_changed', {
        officerId: targetUserId,
        officerName: targetUser.name,
      });
    }

    res.json({
      success: true,
      message: `${targetUser.name} is now the designated Accounts Disbursement Officer.`,
      data: {
        walletId: wallet.id,
        officerId: targetUserId,
        officerName: targetUser.name,
        balance: Number(wallet.balance),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 9. File Streaming Endpoints (QR codes and payment proofs) ─────────────────
router.get('/files/qr/:filename', (req: Request, res: Response) => {
  const filePath = path.join(qrUploadDir, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'QR image not found.' });
  }
  res.sendFile(filePath);
});

router.get('/files/proofs/:filename', (req: Request, res: Response) => {
  const filePath = path.join(proofUploadDir, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Payment proof not found.' });
  }
  res.sendFile(filePath);
});

export default router;
