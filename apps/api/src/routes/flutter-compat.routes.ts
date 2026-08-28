import { Router } from 'express';

const router = Router();

// In-memory data store for mobile operations
let mobileLeads = [
  {
    id: 541,
    name: 'Ramesh Patel',
    contact: '+91 98220 11223',
    email: 'ramesh.patel@gmail.com',
    service: 'Private Limited Company Incorporation',
    city: 'Ahmedabad',
    state: 'Gujarat',
    lead_status: '1',
    lead_score: 85,
    quoted_price: 16499,
    lead_note: 'Inquired via Google Ads. Interested in 2 director Pvt Ltd.',
    created_at: '2026-08-25 11:20:00',
  },
  {
    id: 542,
    name: 'Sunil Jagtap',
    contact: '+91 94230 44556',
    email: 'sunil.jagtap@agri.in',
    service: 'Farmer Producer Company (FPC) Registration',
    city: 'Nashik',
    state: 'Maharashtra',
    lead_status: '2',
    lead_score: 92,
    quoted_price: 24999,
    lead_note: '10 farmers ready for FPC board. Needs SFAC equity grant.',
    created_at: '2026-08-26 14:15:00',
  },
];

let mobileFollowups = [
  { id: 1, lead_id: 541, remarks: 'Client requested call back in evening after 6 PM', next_followup_date: '2026-08-29', created_at: '2026-08-28 10:00:00' },
  { id: 2, lead_id: 542, remarks: 'FPC docs checklist shared on WhatsApp', next_followup_date: '2026-08-30', created_at: '2026-08-28 11:30:00' },
];

let mobileAppointments = [
  { id: 1, lead_id: 541, name: 'Ramesh Patel', mobile: '9822011223', city: 'Ahmedabad', date: '2026-08-29', time: '16:00', mode: 'Video Call', status: 'CONFIRMED' },
];

let mobileQuotations = [
  { id: 1, quote_number: 'Q-2026-108', client_name: 'Ramesh Patel', total: 19468.82, status: 'SENT', date: '2026-08-27' },
];

// ─── 5.1.1 - 5.1.4: Mobile Auth ──────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, mobile } = req.body;
  res.json({
    status: true,
    message: 'Login successful',
    data: {
      token: 'flutter_sales_jwt_token_verified',
      refresh_token: 'flutter_sales_refresh_token_verified',
      user: {
        id: 7,
        name: 'Priya Sharma',
        email: email || 'priya.sales@etaxwala.com',
        mobile: mobile || '9876543210',
        role: 'SALES_EMPLOYEE',
      },
    },
  });
});

router.post('/register', (req, res) => {
  res.json({ status: true, message: 'User registered successfully for field CRM' });
});

router.get('/me', (_req, res) => {
  res.json({
    status: true,
    data: {
      id: 7,
      name: 'Priya Sharma',
      email: 'priya.sales@etaxwala.com',
      mobile: '9876543210',
      role: 'SALES_EMPLOYEE',
      assigned_leads: mobileLeads.length,
      today_calls: 38,
    },
  });
});

router.post('/refresh', (_req, res) => {
  res.json({ status: true, token: 'flutter_sales_jwt_refreshed_token' });
});

// ─── 5.1.5 - 5.1.13: Mobile Leads ────────────────────────────────────────────
router.get('/get_all_leads', (req, res) => {
  res.json({ status: true, data: mobileLeads, count: mobileLeads.length });
});

router.get('/get_lead_detail', (req, res) => {
  const leadId = parseInt(req.query.id as string, 10);
  const lead = mobileLeads.find((l) => l.id === leadId) || mobileLeads[0];
  res.json({ status: true, data: lead });
});

router.get('/get_all_services', (_req, res) => {
  res.json({
    status: true,
    data: [
      { id: 1, service_name: 'Private Limited Company Registration', service_price: 16499 },
      { id: 2, service_name: 'LLP Registration', service_price: 11999 },
      { id: 3, service_name: 'One Person Company (OPC) Registration', service_price: 12999 },
      { id: 4, service_name: 'GST Registration', service_price: 999 },
      { id: 5, service_name: 'Income Tax Return (ITR)', service_price: 499 },
      { id: 6, service_name: 'Trademark Registration', service_price: 6999 },
      { id: 7, service_name: 'FSSAI Food License', service_price: 1499 },
      { id: 8, service_name: 'Farmer Producer Company (FPC)', service_price: 24999 },
    ],
  });
});

router.post('/update-lead-status', (req, res) => {
  const { lead_id, lead_status } = req.body;
  mobileLeads = mobileLeads.map((l) => (l.id === Number(lead_id) ? { ...l, lead_status } : l));
  res.json({ status: true, message: 'Status updated' });
});

router.post('/add_lead', (req, res) => {
  const newLead = {
    id: Date.now(),
    name: req.body.name || 'New Mobile Lead',
    contact: req.body.contact || req.body.mobile || '9999999999',
    email: req.body.email || 'lead@example.com',
    service: req.body.service || 'GST Registration',
    city: req.body.city || 'Pune',
    state: req.body.state || 'Maharashtra',
    lead_status: '1',
    lead_score: 75,
    quoted_price: req.body.quoted_price || 999,
    lead_note: req.body.remarks || 'Captured via Flutter field agent',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  mobileLeads.unshift(newLead);
  res.json({ status: true, message: 'Lead added successfully', data: newLead });
});

router.post('/update-lead', (req, res) => {
  const { lead_id, remarks, next_followup_date } = req.body;
  if (remarks) {
    mobileFollowups.push({
      id: Date.now(),
      lead_id: Number(lead_id),
      remarks,
      next_followup_date: next_followup_date || '2026-08-30',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  }
  res.json({ status: true, message: 'Lead remarks & followup recorded' });
});

router.post('/add-lead-followup', (req, res) => {
  mobileFollowups.push({
    id: Date.now(),
    lead_id: Number(req.body.lead_id),
    remarks: req.body.remarks || 'Call logged',
    next_followup_date: req.body.next_followup_date || '2026-08-30',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  });
  res.json({ status: true, message: 'Followup logged' });
});

router.get('/get-followup-calls', (_req, res) => {
  res.json({ status: true, data: mobileFollowups });
});

router.get('/get_lead_remarks', (req, res) => {
  const leadId = Number(req.query.lead_id);
  const remarks = mobileFollowups.filter((f) => f.lead_id === leadId);
  res.json({ status: true, data: remarks });
});

// ─── 5.1.14 - 5.1.17: Appointments ───────────────────────────────────────────
router.post('/new_appointment', (req, res) => {
  const appt = {
    id: Date.now(),
    lead_id: Number(req.body.lead_id || 0),
    name: req.body.name || 'Client Name',
    mobile: req.body.mobile || '9876543210',
    city: req.body.city || 'Pune',
    date: req.body.date || '2026-08-30',
    time: req.body.time || '15:00',
    mode: req.body.mode || 'Phone Call',
    status: 'SCHEDULED',
  };
  mobileAppointments.push(appt);
  res.json({ status: true, message: 'Appointment created', data: appt });
});

router.post('/update_appointment', (req, res) => {
  res.json({ status: true, message: 'Appointment updated' });
});

router.get('/appointments', (_req, res) => {
  res.json({ status: true, data: mobileAppointments });
});

router.get('/appointments/:id', (req, res) => {
  const appt = mobileAppointments.find((a) => a.id === Number(req.params.id)) || mobileAppointments[0];
  res.json({ status: true, data: appt });
});

// ─── 5.1.18 - 5.1.19: Profile & Location ──────────────────────────────────────
router.post('/update_profile', (_req, res) => {
  res.json({ status: true, message: 'Profile updated' });
});

router.post('/update-location', (req, res) => {
  const { latitude, longitude } = req.body;
  res.json({ status: true, message: 'GPS coordinates recorded for field tracking', lat: latitude, lng: longitude });
});

// ─── 5.1.20 - 5.1.24: Quotations ─────────────────────────────────────────────
router.post('/create_quotation', (req, res) => {
  const quote = {
    id: Date.now(),
    quote_number: `Q-${Date.now().toString().slice(-4)}`,
    client_name: req.body.client_name || 'Client',
    total: req.body.total || 1499,
    status: 'DRAFT',
    date: new Date().toISOString().split('T')[0],
  };
  mobileQuotations.push(quote);
  res.json({ status: true, message: 'Quotation generated', data: quote });
});

router.put('/update_quotation/:id', (_req, res) => {
  res.json({ status: true, message: 'Quotation updated' });
});

router.get('/quotation/view', (_req, res) => {
  res.json({ status: true, data: mobileQuotations[0] });
});

router.get('/quotation/all', (_req, res) => {
  res.json({ status: true, data: mobileQuotations });
});

router.get('/quotation/:id', (req, res) => {
  const quote = mobileQuotations.find((q) => q.id === Number(req.params.id)) || mobileQuotations[0];
  res.json({ status: true, data: quote });
});

// ─── 5.1.25 - 5.1.26: Customers & Products ───────────────────────────────────
router.get('/get_all_customers', (_req, res) => {
  res.json({
    status: true,
    data: [
      { id: 101, name: 'Rajesh Sharma', business: 'Sharma Agri Exports Pvt Ltd', mobile: '+91 98765 43210', city: 'Pune' },
    ],
  });
});

router.get('/get_all_products', (_req, res) => {
  res.json({
    status: true,
    data: [
      { id: 1, name: 'Pvt Ltd Company Incorporation', price: 16499 },
      { id: 2, name: 'GST Regular Registration', price: 999 },
    ],
  });
});

// ─── 5.1.27 - 5.1.35: Mobile Telephony & Call Analytics ───────────────────────
router.post('/calls/store', (req, res) => {
  res.json({ status: true, message: 'Call log stored from mobile dialer' });
});

router.get('/calls/history', (_req, res) => {
  res.json({ status: true, data: [], count: 79900 });
});

router.get('/calls/dashboard-stats', (_req, res) => {
  res.json({ status: true, total: 38, connected: 31, missed: 7, total_duration_minutes: 142 });
});

router.get('/calls/lead/:id', (req, res) => {
  res.json({ status: true, lead_id: req.params.id, calls: [] });
});

router.get('/sales/calls/today-summary', (_req, res) => {
  res.json({ status: true, total_calls: 38, avg_duration_sec: 224, followups_scheduled: 8 });
});

router.get('/sales/calls/stats', (_req, res) => {
  res.json({ status: true, total_calls: 1240, monthly_connected_rate: '82.4%' });
});

router.get('/sales/calls/history', (_req, res) => {
  res.json({ status: true, data: [] });
});

router.get('/sales/calls/lead/:id', (req, res) => {
  res.json({ status: true, lead_id: req.params.id, history: [] });
});

router.get('/sales/calls/export', (_req, res) => {
  res.json({ status: true, message: 'Export generated' });
});

export default router;
