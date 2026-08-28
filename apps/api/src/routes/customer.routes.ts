import { Router } from 'express';
import { z } from 'zod';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { ApiError } from '../middleware/error.middleware.js';

const router = Router();

// In-memory mock database store for customer data
let customerProfile = {
  id: 101,
  leadId: 540,
  name: 'Rajesh Sharma',
  business: 'Sharma Agri Exports Pvt Ltd',
  email: 'rajesh.sharma@example.com',
  contact: '+91 98765 43210',
  service: 'Private Limited Company Registration',
  servicePrice: 16499,
  state: 'Maharashtra',
  city: 'Pune',
  companyId: 'etaxwala',
  isActive: true,
  isApprove: true,
  isPayment: true,
};

let customerServices = [
  {
    id: 101,
    name: 'Private Limited Company Registration',
    category: 'Business Registration',
    status: 5, // GOVT_FILING_IN_PROGRESS
    progressPercent: 65,
    price: 16499,
    isPaid: true,
    orderDate: '2026-08-10',
    assignedExecutive: 'Pooja Kulkarni (Senior CA)',
    history: [
      { status: 1, title: 'Order Received & Intake Call Scheduled', date: '2026-08-10', addedBy: 'System Auto' },
      { status: 2, title: 'KYC & Director DSC Documents Verified', date: '2026-08-11', addedBy: 'Pooja Kulkarni' },
      { status: 3, title: 'RUN Name Reservation Submitted on MCA V3', date: '2026-08-13', addedBy: 'Pooja Kulkarni' },
      { status: 4, title: 'RUN Name Approved by Central Scrutiny Centre', date: '2026-08-14', addedBy: 'CRC Portal' },
      { status: 5, title: 'SPICe+ Part B & AGILE-PRO-S Uploaded', date: '2026-08-20', addedBy: 'Pooja Kulkarni' },
    ],
  },
  {
    id: 102,
    name: 'GST Registration (Regular Scheme)',
    category: 'Taxation & Returns',
    status: 2, // KYC_VERIFIED
    progressPercent: 30,
    price: 1499,
    isPaid: true,
    orderDate: '2026-08-22',
    assignedExecutive: 'Suresh Patil (Tax Specialist)',
    history: [
      { status: 1, title: 'Application Drafted', date: '2026-08-22', addedBy: 'System Auto' },
      { status: 2, title: 'Electricity Bill & Landlord NOC Verified', date: '2026-08-24', addedBy: 'Suresh Patil' },
    ],
  },
];

let customerDocuments = [
  { id: 1, serviceId: 101, title: 'Director 1 PAN Card', category: 'KYC', type: 'SENT', status: 'VERIFIED', size: '850 KB', date: '2026-08-10', url: '/docs/pan.pdf' },
  { id: 2, serviceId: 101, title: 'Director 1 Aadhaar Card', category: 'KYC', type: 'SENT', status: 'VERIFIED', size: '1.2 MB', date: '2026-08-10', url: '/docs/aadhaar.pdf' },
  { id: 3, serviceId: 101, title: 'Registered Office Electricity Bill', category: 'Business Proof', type: 'SENT', status: 'VERIFIED', size: '2.4 MB', date: '2026-08-11', url: '/docs/electricity.pdf' },
  { id: 4, serviceId: 101, title: 'MCA RUN Name Approval Letter', category: 'Deliverable', type: 'RECEIVED', status: 'ISSUED', size: '320 KB', date: '2026-08-14', url: '/docs/run_approval.pdf' },
];

let chatMessages = [
  { id: 1, sender: 'Pooja Kulkarni (CA)', role: 'staff', message: 'Hello Rajesh! I have verified your DSC paperwork. We are filing SPICe+ Part B today.', timestamp: '10:30 AM' },
  { id: 2, sender: 'Rajesh Sharma', role: 'client', message: 'Thank you Pooja! When can we expect the Certificate of Incorporation?', timestamp: '10:45 AM' },
  { id: 3, sender: 'Pooja Kulkarni (CA)', role: 'staff', message: 'MCA typically clears SPICe+ within 3 to 4 business days. I will update you as soon as the COI is issued!', timestamp: '11:00 AM' },
];

let supportTickets = [
  { id: 'TCK-1042', subject: 'Corporate Bank Account Opening Assistance', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-08-25', lastReply: 'Executive assigned to ICICI zero-balance bank onboarding desk.' },
  { id: 'TCK-1020', subject: 'Query regarding Trademark Class 31 for Seeds', status: 'RESOLVED', priority: 'MEDIUM', date: '2026-08-15', lastReply: 'Class 31 classification confirmed by IP attorney.' },
];

let customerNotifications = [
  { id: 1, title: 'SPICe+ Part B MCA Uploaded', message: 'Your application has been uploaded on MCA V3 portal.', read: false, time: '2 hours ago' },
  { id: 2, title: 'RUN Approval Letter Ready', message: 'You can now download your RUN approval letter from the Document Vault.', read: true, time: '3 days ago' },
];

// ─── 2.13.1–2.13.5: Client Auth Endpoints ────────────────────────────────────
router.post('/auth/register', (req, res) => {
  const { name, email, mobile, password, city, service } = req.body;
  if (!name || !email || !mobile) {
    throw new ApiError(400, 'Name, email, and mobile are required');
  }

  customerProfile = {
    ...customerProfile,
    id: Date.now(),
    name,
    email,
    contact: mobile,
    city: city || 'Pune',
    service: service || customerProfile.service,
  };

  res.json({
    success: true,
    message: 'Client registered successfully',
    token: `jwt_client_token_${Date.now()}`,
    customer: customerProfile,
  });
});

router.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    throw new ApiError(400, 'Email or mobile number is required');
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: `jwt_client_token_${Date.now()}`,
    customer: customerProfile,
  });
});

router.post('/auth/forgot-password', (req, res) => {
  const { identifier } = req.body;
  res.json({ success: true, message: `OTP sent to ${identifier}` });
});

router.post('/auth/verify-otp', (req, res) => {
  res.json({ success: true, message: 'OTP verified successfully' });
});

router.post('/auth/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password reset successfully' });
});

// ─── 2.13.6: Dashboard ────────────────────────────────────────────────────────
router.get('/dashboard', (_req, res) => {
  res.json({
    success: true,
    data: {
      profile: customerProfile,
      statusCounts: {
        notStarted: 0,
        inProgress: 1,
        pendingClient: 0,
        invoiced: 1,
        paymentPending: 0,
        completed: 2,
      },
      activeServices: customerServices,
      recentMessages: chatMessages.slice(-3),
      recentTickets: supportTickets.slice(0, 3),
      documentsCount: customerDocuments.length,
    },
  });
});

// ─── 2.13.7 & 2.13.8: Services & Service Detail ──────────────────────────────
router.get('/services', (_req, res) => {
  res.json({ success: true, data: customerServices });
});

router.get('/services/:id', (req, res) => {
  const service = customerServices.find((s) => s.id === parseInt(req.params.id, 10)) || customerServices[0];
  res.json({ success: true, data: service });
});

// ─── 2.13.9 & 2.13.10: Catalog & Buy ──────────────────────────────────────────
router.get('/catalog', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Pvt Ltd Company Registration', price: 16499, category: 'Registration' },
      { id: 2, name: 'Trademark Registration', price: 6999, category: 'IP' },
      { id: 3, name: 'GST Annual Return (GSTR-9)', price: 4999, category: 'Taxation' },
      { id: 4, name: 'FPC 10-Day Training Masterclass', price: 3999, category: 'Training' },
    ],
  });
});

router.post('/catalog/buy', (req, res) => {
  const { serviceName, price } = req.body;
  const newOrder = {
    id: Date.now(),
    name: serviceName || 'New Service Request',
    category: 'Client Inquiry',
    status: 1,
    progressPercent: 10,
    price: price || 4999,
    isPaid: false,
    orderDate: new Date().toISOString().split('T')[0],
    assignedExecutive: 'Allocating CA Specialist',
    history: [{ status: 1, title: 'Inquiry Created via Client Portal', date: new Date().toISOString().split('T')[0], addedBy: 'Client' }],
  };
  customerServices.push(newOrder);

  res.json({
    success: true,
    message: 'Order created. Assigned CA will contact you for intake.',
    orderId: newOrder.id,
  });
});

// ─── 2.13.11 & 2.13.12: Documents ─────────────────────────────────────────────
router.get('/documents', (_req, res) => {
  res.json({ success: true, data: customerDocuments });
});

router.post('/documents/upload', uploadSingle, (req, res) => {
  const newDoc = {
    id: Date.now(),
    serviceId: req.body.serviceId ? parseInt(req.body.serviceId, 10) : 101,
    title: req.body.title || (req.file ? req.file.originalname : 'Uploaded Document'),
    category: req.body.category || 'Client Document',
    type: 'SENT',
    status: 'SUBMITTED',
    size: req.file ? `${(req.file.size / 1024).toFixed(1)} KB` : '1.2 MB',
    date: new Date().toISOString().split('T')[0],
    url: req.file ? `/uploads/${req.file.filename}` : '/docs/demo.pdf',
  };
  customerDocuments.push(newDoc);

  res.json({ success: true, message: 'Document uploaded successfully', document: newDoc });
});

// ─── 2.13.13 & 2.13.14: Chat ──────────────────────────────────────────────────
router.get('/chat', (_req, res) => {
  res.json({ success: true, data: chatMessages });
});

router.post('/chat/send', (req, res) => {
  const { message } = req.body;
  if (!message) throw new ApiError(400, 'Message cannot be empty');

  const newMsg = {
    id: Date.now(),
    sender: customerProfile.name,
    role: 'client',
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  chatMessages.push(newMsg);

  res.json({ success: true, data: newMsg });
});

// ─── 2.13.15 & 2.13.16: Tickets ───────────────────────────────────────────────
router.get('/tickets', (_req, res) => {
  res.json({ success: true, data: supportTickets });
});

router.post('/tickets', (req, res) => {
  const { subject, priority, description } = req.body;
  if (!subject) throw new ApiError(400, 'Subject is required');

  const newTicket = {
    id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    subject,
    status: 'OPEN',
    priority: priority || 'MEDIUM',
    date: new Date().toISOString().split('T')[0],
    lastReply: description || 'Ticket logged. CA support desk notified.',
  };
  supportTickets.unshift(newTicket);

  res.json({ success: true, data: newTicket });
});

// ─── 2.13.17: Orders & Invoices ───────────────────────────────────────────────
router.get('/orders', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'INV-2026-0891', date: '2026-08-10', service: 'Private Limited Company Registration', total: 19468.82, status: 'PAID' },
      { id: 'INV-2026-0924', date: '2026-08-22', service: 'GST Registration (Regular Scheme)', total: 1768.82, status: 'PAID' },
    ],
  });
});

// ─── 2.13.18 & 2.13.19: Notifications ────────────────────────────────────────
router.get('/notifications', (_req, res) => {
  res.json({ success: true, data: customerNotifications });
});

router.post('/notifications/read', (req, res) => {
  const { id } = req.body;
  if (id) {
    customerNotifications = customerNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  } else {
    customerNotifications = customerNotifications.map((n) => ({ ...n, read: true }));
  }
  res.json({ success: true, message: 'Notifications marked as read' });
});

// ─── 2.13.20: Videos ─────────────────────────────────────────────────────────
router.get('/videos', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Day 1: FPC Overview, Statutory Framework & Objectives', duration: '1:35:00', unlocked: true },
      { id: 2, title: 'Day 2: Board of Directors & Governance Structure', duration: '1:40:00', unlocked: true },
      { id: 3, title: 'Day 3: Equity Grant & SFAC Matching Grant Schemes', duration: '1:45:00', unlocked: false },
    ],
  });
});

// ─── 2.13.21: Profile ────────────────────────────────────────────────────────
router.get('/profile', (_req, res) => {
  res.json({ success: true, data: customerProfile });
});

router.post('/update-profile', (req, res) => {
  customerProfile = { ...customerProfile, ...req.body };
  res.json({ success: true, message: 'Profile updated successfully', data: customerProfile });
});

export default router;
