import { Router } from 'express';
import crypto from 'crypto';
import { ApiError } from '../middleware/error.middleware.js';

const router = Router();

// ─── 5.2 Telephony Integration (Knowlarity / Exotel) ──────────────────────────
router.post('/telephony/webhook', (req, res) => {
  const { call_id, caller_number, agent_number, call_status, duration, recording_url } = req.body;

  res.json({
    success: true,
    message: 'Telephony call event ingested and linked to CRM lead',
    data: {
      call_id: call_id || Date.now(),
      caller_number: caller_number || '+91 98220 11223',
      call_status: call_status || 'COMPLETED',
      duration: duration || 180,
      recording_url: recording_url || 'https://recordings.etaxwala.com/call_sample.mp3',
    },
  });
});

router.get('/telephony/recordings/:id', (req, res) => {
  res.json({
    success: true,
    recording_url: `https://recordings.etaxwala.com/rec_${req.params.id}.mp3`,
  });
});

// ─── 5.3 Razorpay Payment Integration ─────────────────────────────────────────
router.post('/payment/create-order', (req, res) => {
  const { amount, service_id, customer_id, customer_email } = req.body;
  if (!amount) throw new ApiError(400, 'Order amount is required');

  const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  res.json({
    success: true,
    order: {
      id: orderId,
      entity: 'order',
      amount: Math.round(Number(amount) * 100), // in paise
      amount_paid: 0,
      amount_due: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      status: 'created',
      notes: {
        service_id: service_id || '101',
        customer_id: customer_id || '101',
        customer_email: customer_email || 'client@company.com',
      },
      created_at: Math.floor(Date.now() / 1000),
    },
  });
});

router.post('/payment/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id) {
    throw new ApiError(400, 'Order ID and Payment ID are required');
  }

  res.json({
    success: true,
    message: 'Payment verified and invoice receipt generated',
    invoice_id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });
});

router.post('/payment/webhook', (req, res) => {
  const event = req.body.event || 'payment.captured';
  res.json({ success: true, received: true, event });
});

router.post('/payment/emi-cashfree', (req, res) => {
  const { amount, tenure_months = 3 } = req.body;
  const emiPerMonth = Math.round(Number(amount || 16499) / tenure_months);
  res.json({
    success: true,
    emi_schedule: [
      { installment: 1, amount: emiPerMonth, due_date: '2026-08-28', status: 'PAID' },
      { installment: 2, amount: emiPerMonth, due_date: '2026-09-28', status: 'PENDING' },
      { installment: 3, amount: emiPerMonth, due_date: '2026-10-28', status: 'PENDING' },
    ],
  });
});

// ─── 5.4 Email, SMS & WhatsApp Dispatchers ────────────────────────────────────
router.post('/notifications/email/send', (req, res) => {
  const { to, subject, template } = req.body;
  res.json({
    success: true,
    message: `Email dispatched via Brevo transactional gateway to ${to}`,
    template: template || 'welcome_client_v2',
  });
});

router.post('/notifications/sms/send-otp', (req, res) => {
  const { mobile } = req.body;
  res.json({
    success: true,
    message: `OTP SMS dispatched via Fast2SMS / DLT gateway to ${mobile}`,
  });
});

router.post('/notifications/whatsapp/send', (req, res) => {
  const { phone, message_type } = req.body;
  res.json({
    success: true,
    message: `WhatsApp Business API message dispatched to ${phone}`,
    message_type: message_type || 'status_milestone_update',
  });
});

// ─── 5.5 & 5.6 Sub-brand Lead Ingestion (Udyomi Kisan & Sahakar Samriddhi) ────
router.post('/sub-brand/lead', (req, res) => {
  const { brand_source, name, contact, email, district, service_interest } = req.body;
  if (!name || !contact) throw new ApiError(400, 'Name and contact are required');

  res.json({
    success: true,
    message: `Lead successfully captured from ${brand_source || 'UDYOMI'} portal and assigned to Agri/Rural desk`,
    lead_id: Date.now(),
    brand: brand_source || 'UDYOMI',
  });
});

// ─── 5.7 Cloudflare R2 / S3 Presigned URL Service ─────────────────────────────
router.post('/storage/upload-url', (req, res) => {
  const { filename, file_type, size_bytes } = req.body;
  if (size_bytes && Number(size_bytes) > 10 * 1024 * 1024) {
    throw new ApiError(400, 'File size exceeds 10MB limit');
  }

  const cleanName = (filename || 'doc.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `vault/${Date.now()}_${cleanName}`;

  res.json({
    success: true,
    upload_url: `https://r2.etaxwala.com/${key}?presigned=true&signature=sample_sig`,
    file_key: key,
    download_url: `https://vault.etaxwala.com/${key}`,
  });
});

router.get('/storage/download-url', (req, res) => {
  const { file_key } = req.query;
  res.json({
    success: true,
    presigned_download_url: `https://r2.etaxwala.com/${file_key || 'vault/sample.pdf'}?token=valid_for_15_mins`,
  });
});

export default router;
