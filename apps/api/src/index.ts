import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'rate-limiter-flexible';
import { env } from './config/env.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = new rateLimit.RateLimiterMemory({
  points: 100,
  duration: 60,
});
app.use((req, res, next) => {
  apiLimiter.consume(req.ip || 'unknown')
    .then(() => next())
    .catch(() => res.status(429).json({ success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth)
app.post('/v1/inquiry', async (req, res) => {
  try {
    const { name, email, contact, service, state, city } = req.body;
    if (!name || !email || !contact) {
      return res.status(400).json({ success: false, error: { message: 'Name, email, contact required' } });
    }
    // In Phase 1, forward to old customer-api
    const response = await fetch(`${env.CUSTOMER_API_URL}/api/add-inquiry-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, contact, service, state, city }),
    });
    res.json({ success: true, message: 'Inquiry submitted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Failed to submit' } });
  }
});

app.post('/v1/appointment', async (req, res) => {
  try {
    const { name, email, mobile, city, message, apDate, apTime, apMode } = req.body;
    if (!name || !email || !mobile) {
      return res.status(400).json({ success: false, error: { message: 'Name, email, mobile required' } });
    }
    const response = await fetch(`${env.CUSTOMER_API_URL}/api/book-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, city, message, ap_date: apDate, ap_time: apTime, ap_mode: apMode || 'Telephonic' }),
    });
    res.json({ success: true, message: 'Appointment booked' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Failed to book' } });
  }
});

// Start
app.listen(env.PORT, () => {
  console.log(`✅ ETaxwala API running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Frontend: ${env.FRONTEND_URL}`);
});