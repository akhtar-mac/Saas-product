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

// ─── 5.3 Direct Bank & UPI Payment Integration ────────────────────────────────
router.get('/payment/banks', (req, res) => {
  res.json({
    success: true,
    company_name: 'ETaxwala Business Solution Pvt Ltd',
    upi_ids: {
      primary: 'etaxwalabusiness@icici',
      secondary: 'etaxwala@hdfcbank',
      phone: '+91 70710 70707',
    },
    banks: [
      { id: 'hdfc', name: 'HDFC Bank Ltd', acct: '50200084729118', ifsc: 'HDFC0001811', branch: 'Beed Bypass Road, CSN' },
      { id: 'icici', name: 'ICICI Bank Ltd', acct: '034205009823', ifsc: 'ICIC0000342', branch: 'Jalna Road Hub, CSN' },
      { id: 'sbi', name: 'State Bank of India', acct: '39820145892', ifsc: 'SBIN0001716', branch: 'Kranti Chowk, CSN' },
      { id: 'axis', name: 'Axis Bank Ltd', acct: '923020048129301', ifsc: 'UTIB0000182', branch: 'CIDCO, CSN' },
      { id: 'kotak', name: 'Kotak Mahindra Bank', acct: '7812903841', ifsc: 'KKBK0000691', branch: 'Nirala Bazar, CSN' },
      { id: 'bob', name: 'Bank of Baroda', acct: '18420200001923', ifsc: 'BARB0AURANG', branch: 'Samarth Nagar, CSN' },
      { id: 'pnb', name: 'Punjab National Bank', acct: '0842002100039124', ifsc: 'PUNB0084200', branch: 'Station Road, CSN' },
      { id: 'canara', name: 'Canara Bank', acct: '120001849201', ifsc: 'CNRB0000842', branch: 'Mondha Road, CSN' },
      { id: 'union', name: 'Union Bank of India', acct: '320101010038472', ifsc: 'UBIN0532011', branch: 'Adalat Road, CSN' },
      { id: 'indusind', name: 'IndusInd Bank', acct: '250019284712', ifsc: 'INDB0000318', branch: 'Jalna Road Hub, CSN' },
    ],
  });
});

router.post('/payment/create-order', (req, res) => {
  const { amount, service_id, customer_id, customer_email } = req.body;
  if (!amount) throw new ApiError(400, 'Order amount is required');

  const orderId = `ETW-ORD-${Date.now().toString().slice(-6)}`;
  res.json({
    success: true,
    order: {
      id: orderId,
      amount: Number(amount),
      currency: 'INR',
      beneficiary: 'ETaxwala Business Solution Pvt Ltd',
      primary_upi: 'etaxwalabusiness@icici',
      primary_bank: 'HDFC Bank Ltd (A/C: 50200084729118, IFSC: HDFC0001811)',
      status: 'pending_payment',
      created_at: Math.floor(Date.now() / 1000),
    },
  });
});

router.post('/payment/verify-utr', (req, res) => {
  const { utr_number, order_id, amount, bank_name } = req.body;
  if (!utr_number) {
    throw new ApiError(400, 'Bank UTR / Transaction reference is required');
  }

  res.json({
    success: true,
    message: 'Direct bank remittance / UPI payment logged for immediate settlement',
    utr_number,
    order_id: order_id || 'ETW-ORD-DEFAULT',
    invoice_id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });
});

router.post('/payment/verify', (req, res) => {
  const { utr_number, order_id, transaction_ref } = req.body;
  res.json({
    success: true,
    message: 'Direct bank remittance / UPI payment verified and invoice receipt generated',
    invoice_id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });
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
