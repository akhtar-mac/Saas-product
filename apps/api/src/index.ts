import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestLogger } from './middleware/audit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import flutterCompatRoutes from './routes/flutter-compat.routes.js';
import customerRoutes from './routes/customer.routes.js';
import crmRoutes from './routes/crm.routes.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import callAnalyticsRoutes from './routes/call-analytics.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import chatRoutes from './routes/chat.routes.js';
import hrRoutes from './routes/hr.routes.js';
import marketingRoutes from './routes/marketing.routes.js';
import itDeskRoutes from './routes/it-desk.routes.js';
import infrastructureRoutes from './routes/infrastructure.routes.js';
import aiAutomationRoutes from './routes/ai-automation.routes.js';
import disbursementRoutes from './routes/disbursement.routes.js';
import desktrackRoutes from './routes/desktrack.routes.js';
import desktopClientRoutes from './routes/desktop-client.routes.js';
import { rbacGuard } from './rbac/route-guard.js';
import { auditTrail } from './rbac/audit-trail.js';
import accessRoutes from './rbac/access.routes.js';
import auditLogRoutes from './rbac/logs.routes.js';
import { recycleBinRouter, deleteRoutes } from './rbac/recycle-bin.routes.js';
import { initChatSocket } from './socket/chat.socket.js';
import { prisma } from './config/db.js';
import { authRateLimit, apiRateLimit } from './middleware/rate-limit.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
initChatSocket(httpServer);

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.etaxwala.com') ||
        origin === 'https://etaxwala.com' ||
        origin === env.FRONTEND_URL
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static file serving for uploaded documents ───────────────────────────────
app.use('/Docs', express.static(path.join(process.cwd(), 'public/Docs')));

// ─── Request Logger & Global API Rate Limit ──────────────────────────────────
app.use(requestLogger);
app.use('/v1', apiRateLimit);

// ─── RBAC: per-route permissions (role defaults + per-user grants/revokes) ────
// and the all-user activity log. Both skip /api, /v1/mobile, /v1/customer, /v1/auth.
app.use(rbacGuard);
app.use(auditTrail);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get(['/health', '/v1/health'], async (_req, res) => {
  let db: 'connected' | 'disconnected' = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'connected';
  } catch {
    db = 'disconnected';
  }
  res.json({
    status: db === 'connected' ? 'ok' : 'degraded',
    database: db,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      flutter_api: 'Ready',
      customer_portal: 'Ready',
      staff_crm: 'Ready',
      auth: 'Ready',
      call_analytics: 'Ready',
    },
  });
});

// ─── Auth routes (Rate limited to prevent brute force) ────────────────────────
app.use('/v1/auth', authRateLimit, authRoutes);
app.use('/v1/customer/auth', authRateLimit);

// ─── Staff Admin: User management (JWT + Admin role required inside router) ───
app.use('/v1/admin/users', usersRoutes);

// ─── Staff Internal Chat & Messaging (JWT Protected) ──────────────────────────
app.use('/v1/chat', chatRoutes);

// ─── CRM Business Logic: Won form, lead lifecycle, orders, coupons ────────────
// ─── Desktrack (old DesktopController parity; polled, no WebSockets) ─────────
// ─── Users & Access, Activity Logs, Recycle Bin (admin) ───────────────────────
app.use('/v1/crm/access', accessRoutes);
app.use('/v1/crm/audit-logs', auditLogRoutes);
app.use('/v1/crm/recycle-bin', recycleBinRouter);
// DELETE endpoints now move rows to the Recycle Bin (before crm.routes.ts handlers)
app.use('/v1/crm', deleteRoutes);
app.use('/v1/staff', deleteRoutes);

app.use('/v1/crm/desktrack', desktrackRoutes);
app.use('/v1/staff/desktrack', desktrackRoutes);

app.use('/v1/crm', crmRoutes);

// ─── Call Analytics: Flutter sync + analytics endpoints ──────────────────────
app.use('/v1/call-logs', callAnalyticsRoutes);

// ─── Legacy API compatibility routes ─────────────────────────────────────────
// 1. Flutter Mobile App API (application-api.etaxwala.com/api/* and /v1/mobile/*)
// Old Desktrack desktop-client endpoints (off unless DESKTRACK_CLIENT_API_ENABLED=true)
app.use('/api', desktopClientRoutes);
app.use('/api', flutterCompatRoutes);
app.use('/v1/mobile', flutterCompatRoutes);

// 2. Client Self-Service Portal (/v1/customer/*)
app.use('/v1/customer', customerRoutes);

// 3. Staff CRM Data Routes (/v1/crm/* & /v1/staff/* — read/write from legacy DB)
app.use('/v1/crm', crmRoutes);
app.use('/v1/staff', crmRoutes);

// 4. External Integrations (Telephony, Direct Bank Remittances / UPI, Brevo Email/SMS/WhatsApp, R2 Storage)
app.use('/v1', integrationsRoutes);

// 5. HR, Careers ATS & Accounts Desk
app.use('/v1/careers', hrRoutes);
app.use('/v1/hr', hrRoutes);

// 6. Marketing, Social Media Planner & Paid Ads Desk
app.use('/v1/marketing', marketingRoutes);

// 7. IT Engineering & Client Solutions Command Center
app.use('/v1/it', itDeskRoutes);

// 8. Isolated Infrastructure Telemetry & Health Monitoring
app.use('/v1/infrastructure', infrastructureRoutes);

// 9. AI Automation Extension Points (ATS Match, IT Scoping, Copywriting)
app.use('/v1/ai', aiAutomationRoutes);

// 10. Staff Money Requests & Accounts Float Disbursements
app.use('/v1/disbursements', disbursementRoutes);

// Static uploads are blocked from public access for confidentiality.
// All document downloads require authenticated streaming routes (e.g. /v1/hr/applications/:id/documents/:docId/download).

// ─── Public inquiry & appointment endpoints ───────────────────────────────────
app.post('/v1/inquiry', async (req, res) => {
  try {
    const { name, contact, phone, email, service, state, city, notes } = req.body as any;
    const clientPhone = contact || phone;
    if (!name || !clientPhone) {
      return res
        .status(400)
        .json({ success: false, error: { message: 'Name and contact required' } });
    }

    const maxLead = await prisma.leads.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
    const nextId = (maxLead?.id || 17281) + 1;

    const newLead = await prisma.leads.create({
      data: {
        id: nextId,
        name,
        contact: clientPhone,
        email: email || `${clientPhone}@lead.etaxwala.in`,
        service: service || 'Business Registration Advisory',
        source: 'Website Quick Enquiry',
        state: state || 'Maharashtra',
        city: city || 'Pune',
        lead_note: notes || 'Enquiry submitted from homepage',
        added_by: 1,
        is_assign: 0,
        lead_type: 0,
        is_customer: 0,
        is_payment: 0,
        company_id: 'etaxwala',
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Inquiry received and lead dispatched to PostgreSQL sales CRM',
      lead_id: newLead.id,
    });
  } catch (err) {
    logger.error('Failed to save inquiry to database:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to submit' } });
  }
});

app.post('/v1/appointment', async (req, res) => {
  try {
    const { name, mobile, phone, email, city, message, ap_date, ap_time, ap_mode, service } =
      req.body as any;
    const clientPhone = mobile || phone;
    if (!name || !clientPhone) {
      return res
        .status(400)
        .json({ success: false, error: { message: 'Name and mobile required' } });
    }

    const maxAp = await prisma.appointments.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = (maxAp?.id || 110) + 1;

    const newAppointment = await prisma.appointments.create({
      data: {
        id: nextId,
        name,
        mobile: clientPhone,
        email: email || `${clientPhone}@appointment.etaxwala.in`,
        city: city || 'Pune',
        message: message || service || 'CA Consultation Appointment booked via website',
        ap_date: ap_date || new Date().toISOString().split('T')[0],
        ap_time: ap_time || '11:00 AM',
        ap_mode: ap_mode || 'Video Call / Google Meet',
        is_online: 1,
        is_complete: 0,
        payment_status: 0,
        amount: 499,
        conduct_by: 'CA Senior Partner',
        added_by: 'Website Portal',
        is_delete: 0,
        date: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Appointment booked and saved to PostgreSQL database',
      appointment_id: newAppointment.id,
    });
  } catch (err) {
    logger.error('Failed to save appointment to database:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to book' } });
  }
});

// ─── Static hosting for the marketing website + CRM SPA (single-domain deploy) ─
// Served only when a ./client build exists (production bundle); skipped in dev.
const clientDist = path.join(process.cwd(), 'client');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/v1') ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/Docs') ||
      req.path.startsWith('/socket.io') ||
      req.path.startsWith('/health')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ─── 404 handler (must come after all routes) ─────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server with WebSocket Support ──────────────────────────────────────
httpServer.listen(env.PORT, () => {
  logger.info('✅ ETaxwala 2.0 API Server running with WebSockets', {
    port: env.PORT,
    env: env.NODE_ENV,
    endpoints: {
      auth: `/v1/auth/staff/login`,
      admin: `/v1/admin/users`,
      chat: `/v1/chat`,
      crm: `/v1/crm`,
      callAnalytics: `/v1/call-logs`,
      flutter: `/api`,
      customer: `/v1/customer`,
    },
  });
});
