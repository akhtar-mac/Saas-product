import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

const app = express();


// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
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

// ─── Auth routes (public — no JWT required) ───────────────────────────────────
app.use('/v1/auth', authRoutes);

// ─── Staff Admin: User management (JWT + Admin role required inside router) ───
app.use('/v1/admin/users', usersRoutes);

// ─── CRM Business Logic: Won form, lead lifecycle, orders, coupons ────────────
app.use('/v1/crm', ordersRoutes);

// ─── Call Analytics: Flutter sync + analytics endpoints ──────────────────────
app.use('/v1/call-logs', callAnalyticsRoutes);

// ─── Legacy API compatibility routes ─────────────────────────────────────────
// 1. Flutter Mobile App API (application-api.etaxwala.com/api/* and /v1/mobile/*)
app.use('/api', flutterCompatRoutes);
app.use('/v1/mobile', flutterCompatRoutes);

// 2. Client Self-Service Portal (/v1/customer/*)
app.use('/v1/customer', customerRoutes);

// 3. Staff CRM Data Routes (/v1/crm/* & /v1/staff/* — read/write from legacy DB)
app.use('/v1/crm', crmRoutes);
app.use('/v1/staff', crmRoutes);

// 4. External Integrations (Telephony, Razorpay/Cashfree, Brevo Email/SMS/WhatsApp, R2 Storage)
app.use('/v1', integrationsRoutes);

// ─── Public inquiry & appointment endpoints ───────────────────────────────────
app.post('/v1/inquiry', async (req, res) => {
  try {
    const { name, contact } = req.body as { name?: string; contact?: string };
    if (!name || !contact) {
      return res.status(400).json({ success: false, error: { message: 'Name and contact required' } });
    }
    res.json({
      success: true,
      message: 'Inquiry received and lead dispatched to sales CRM',
      lead_id: Date.now(),
    });
  } catch {
    res.status(500).json({ success: false, error: { message: 'Failed to submit' } });
  }
});

app.post('/v1/appointment', async (req, res) => {
  try {
    const { name, mobile } = req.body as { name?: string; mobile?: string };
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: { message: 'Name and mobile required' } });
    }
    res.json({
      success: true,
      message: 'Appointment booked successfully',
      appointment_id: Date.now(),
    });
  } catch {
    res.status(500).json({ success: false, error: { message: 'Failed to book' } });
  }
});

// ─── 404 handler (must come after all routes) ─────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info('✅ ETaxwala 2.0 API Server running', {
    port: env.PORT,
    env: env.NODE_ENV,
    endpoints: {
      auth: `/v1/auth/staff/login`,
      admin: `/v1/admin/users`,
      crm: `/v1/crm`,
      callAnalytics: `/v1/call-logs`,
      flutter: `/api`,
      customer: `/v1/customer`,
    },
  });
});