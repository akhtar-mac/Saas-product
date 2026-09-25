import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLE_DEFAULT_PERMS: Record<number, string[]> = {
  1: ['*'],
  2: ['*'],
  3: [
    'dashboard:view',
    'operations:view',
    'desktop_tracking:view',
    'operations:employees',
    'operations:customers',
    'operations:tasks',
    'accounts:view',
  ],
  4: [
    'dashboard:view',
    'sales:view',
    'leads:view',
    'leads:subbrands',
    'quotations:view',
    'tasks:view',
    'workforce:view',
    'accounts:view',
  ],
  5: ['dashboard:view', 'sales:view', 'leads:view', 'leads:subbrands', 'call_analytics:view'],
  6: [
    'dashboard:view',
    'franchise:view',
    'franchise:partners',
    'franchise:inquiries',
    'franchise:training',
    'leads:view',
  ],
  7: ['dashboard:view', 'sales:view', 'leads:view', 'quotations:view', 'tasks:view'],
  8: ['dashboard:view', 'operations:view', 'operations:tasks', 'operations:customers'],
  9: ['dashboard:view', 'sales:view', 'leads:view'],
  10: ['dashboard:view', 'franchise:view', 'franchise:training'],
  11: ['dashboard:view', 'sales:view', 'leads:view', 'tasks:view'],
  12: ['dashboard:view', 'operations:view', 'operations:tasks'],
  13: ['dashboard:view', 'sales:view', 'leads:view', 'tasks:view'],
  14: ['dashboard:view', 'admin:view', 'workforce:view', 'operations:employees', 'users:manage'],
  15: ['dashboard:view', 'admin:view'],
};

const BUILTIN_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@etaxwala.com',
    name: 'Super Admin',
    role_id: 1,
    position: 'Chief Executive Officer',
    phone: '9876543210',
  },
  {
    id: 2,
    email: 'general.admin@etaxwala.com',
    name: 'General Administrator',
    role_id: 2,
    position: 'Systems Administrator',
    phone: '9876543211',
  },
  {
    id: 3,
    email: 'ops.manager@etaxwala.com',
    name: 'Operations Manager',
    role_id: 3,
    position: 'Head of Operations',
    phone: '9876543212',
  },
  {
    id: 4,
    email: 'sales.manager@etaxwala.com',
    name: 'Sales Manager',
    role_id: 4,
    position: 'Head of Sales',
    phone: '9876543213',
  },
  {
    id: 5,
    email: 'marketing@etaxwala.com',
    name: 'Marketing Manager',
    role_id: 5,
    position: 'Growth Lead',
    phone: '9876543214',
  },
  {
    id: 6,
    email: 'franchise@etaxwala.com',
    name: 'Franchise Manager',
    role_id: 6,
    position: 'Partnership Director',
    phone: '9876543215',
  },
  {
    id: 7,
    email: 'priya.sales@etaxwala.com',
    name: 'Priya Sharma',
    role_id: 7,
    position: 'Senior Sales Executive',
    phone: '9876543216',
  },
  {
    id: 8,
    email: 'rahul.ops@etaxwala.com',
    name: 'Rahul Verma',
    role_id: 8,
    position: 'Operations Specialist',
    phone: '9876543217',
  },
  {
    id: 9,
    email: 'seo.content@etaxwala.com',
    name: 'Marketing Content SEO',
    role_id: 9,
    position: 'Content Lead',
    phone: '9876543218',
  },
  {
    id: 10,
    email: 'field.partner@etaxwala.com',
    name: 'Franchise Field Agent',
    role_id: 10,
    position: 'Field Partner',
    phone: '9876543219',
  },
  {
    id: 11,
    email: 'ca.expert@etaxwala.com',
    name: 'CA Tax Expert',
    role_id: 11,
    position: 'Chartered Accountant',
    phone: '9876543220',
  },
  {
    id: 12,
    email: 'qc.reviewer@etaxwala.com',
    name: 'QC Document Reviewer',
    role_id: 12,
    position: 'Quality Control Lead',
    phone: '9876543221',
  },
  {
    id: 13,
    email: 'assistant.sales@etaxwala.com',
    name: 'Sales Assistant',
    role_id: 13,
    position: 'Lead Qualifier',
    phone: '9876543222',
  },
  {
    id: 14,
    email: 'hr@etaxwala.com',
    name: 'HR Manager',
    role_id: 14,
    position: 'People Operations',
    phone: '9876543223',
  },
  {
    id: 15,
    email: 'subbrands@etaxwala.com',
    name: 'Sub-Brands Manager',
    role_id: 15,
    position: 'Agri Rural Lead',
    phone: '9876543224',
  },
  {
    id: 16,
    email: 'support@etaxwala.com',
    name: 'Support Executive',
    role_id: 2,
    position: 'Client Helpdesk',
    phone: '9876543225',
  },
];

async function main() {
  console.log('🌱 Starting FULL database seeding for ETaxwala 2.0 CRM...');
  const now = new Date();
  const pw = await bcrypt.hash('etaxwala@2024', 10);

  // ── 1. STAFF USERS ────────────────────────────────────────────────────────────
  try {
    console.log('👤 Seeding Staff Users...');
    for (const acc of BUILTIN_ACCOUNTS) {
      const perms = JSON.stringify(ROLE_DEFAULT_PERMS[acc.role_id] || ['dashboard:view']);
      await prisma.staff_users.upsert({
        where: { email: acc.email },
        update: {
          name: acc.name,
          password_hash: pw,
          role_id: acc.role_id,
          permissions: perms,
          position: acc.position,
          phone: acc.phone,
          is_active: true,
        },
        create: {
          id: acc.id,
          email: acc.email,
          name: acc.name,
          password_hash: pw,
          role_id: acc.role_id,
          permissions: perms,
          position: acc.position,
          phone: acc.phone,
          is_active: true,
        },
      });
    }
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('staff_users','id'),(SELECT MAX(id) FROM staff_users));`
    );
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 2. CATEGORIES (manual ID — MySQL migrated) ────────────────────────────────
  try {
    console.log('🏷️ Seeding Categories...');
    await prisma.categories.createMany({
      data: [
        {
          category_id: 1,
          company_id: 'ETAXWALA',
          category_name: 'GST Taxation',
          added_by: 1,
          date: now.toISOString(),
        },
        {
          category_id: 2,
          company_id: 'ETAXWALA',
          category_name: 'Company Incorporation',
          added_by: 1,
          date: now.toISOString(),
        },
        {
          category_id: 3,
          company_id: 'ETAXWALA',
          category_name: 'Audit Accounting',
          added_by: 1,
          date: now.toISOString(),
        },
        {
          category_id: 4,
          company_id: 'ETAXWALA',
          category_name: 'Licenses Registrations',
          added_by: 1,
          date: now.toISOString(),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 3. CORE SERVICES (manual ID) ─────────────────────────────────────────────
  try {
    console.log('🛠️ Seeding Core Services...');
    await prisma.core_services.createMany({
      data: [
        {
          id: 1,
          name: 'GST Return Filing Monthly Quarterly',
          content: 'Complete GSTR-1, GSTR-3B reconciliation and filing.',
        },
        {
          id: 2,
          name: 'Private Limited Company Registration',
          content: 'SPICe+ Form filing, Name Reservation, DSC, DIN, MOA and AOA drafting.',
        },
        {
          id: 3,
          name: 'Income Tax Return ITR-3 ITR-4',
          content: 'Expert CA filing under Section 44ADA.',
        },
        {
          id: 4,
          name: 'FSSAI Food License Registration',
          content: 'Basic, State and Central Food license.',
        },
        {
          id: 5,
          name: 'Trademark Brand Protection',
          content: 'TM search, filing trademark application and objection handling.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 4. CUSTOMERS (manual ID) ──────────────────────────────────────────────────
  try {
    console.log('🏢 Seeding Customers...');
    await prisma.customers.createMany({
      data: [
        {
          id: 101,
          lead_id: 1,
          name: 'Ramesh Kumar',
          business: 'Apex Tech Solutions Pvt Ltd',
          email: 'ramesh@apextech.in',
          contact: '9823011223',
          password: 'password123',
          service: 'Pvt Ltd Registration',
          service_price: 14999,
          state: 'Maharashtra',
          city: 'Pune',
          added_by: 7,
          company_id: 'ETAXWALA',
          is_payment: 1,
          is_active: 1,
          customer_token: 'tok_apex_101',
        },
        {
          id: 102,
          lead_id: 2,
          name: 'Sunita Patil',
          business: 'Green Earth Organics',
          email: 'sunita@greenearth.co.in',
          contact: '9845123456',
          password: 'password123',
          service: 'FSSAI License GST Monthly Filing',
          service_price: 8500,
          state: 'Karnataka',
          city: 'Bengaluru',
          added_by: 7,
          company_id: 'ETAXWALA',
          is_payment: 1,
          is_active: 1,
          customer_token: 'tok_green_102',
        },
        {
          id: 103,
          lead_id: 3,
          name: 'Vikram Singh',
          business: 'Singh Logistics Freight',
          email: 'vikram@singhlogistics.com',
          contact: '9711098765',
          password: 'password123',
          service: 'ITR-4 Annual Audit',
          service_price: 12000,
          state: 'Delhi',
          city: 'New Delhi',
          added_by: 4,
          company_id: 'ETAXWALA',
          is_payment: 0,
          is_active: 1,
          customer_token: 'tok_singh_103',
        },
        {
          id: 104,
          lead_id: 4,
          name: 'Preethi Nair',
          business: 'Preethi Boutique Exports',
          email: 'preethi@boutique.in',
          contact: '9988112233',
          password: 'password123',
          service: 'Trademark Registration',
          service_price: 6499,
          state: 'Kerala',
          city: 'Kochi',
          added_by: 13,
          company_id: 'ETAXWALA',
          is_payment: 1,
          is_active: 1,
          customer_token: 'tok_preethi_104',
        },
        {
          id: 105,
          lead_id: 5,
          name: 'Arjun Mehta',
          business: 'Mehta Builders Developers',
          email: 'arjun@mehtabuilders.com',
          contact: '9099887766',
          password: 'password123',
          service: 'GST Registration Monthly Filing',
          service_price: 2499,
          state: 'Gujarat',
          city: 'Ahmedabad',
          added_by: 7,
          company_id: 'ETAXWALA',
          is_payment: 1,
          is_active: 1,
          customer_token: 'tok_mehta_105',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 5. LEADS (auto-increment — new CRM tables) ────────────────────────────────
  try {
    console.log('📈 Seeding Leads...');
    const l1 = await prisma.leads.create({
      data: {
        id: 1,
        name: 'Amitabh Joshi',
        email: 'amitabh@joshi-consulting.com',
        contact: '9822334455',
        service: 'ITR Filing Sec 44ADA',
        state: 'Maharashtra',
        city: 'Mumbai',
        source: 'Google Ads',
        lead_note: 'Freelance architect 50L income.',
        added_by: 7,
        is_assign: 1,
        lead_type: 1,
        company_id: 'ETAXWALA',
        lead_score: 85,
        quoted_price: 4999.0,
      },
    });
    const l2 = await prisma.leads.create({
      data: {
        id: 2,
        name: 'Neha Verma',
        email: 'neha.verma@craftbox.in',
        contact: '9988776655',
        service: 'Trademark Registration',
        state: 'Karnataka',
        city: 'Bengaluru',
        source: 'Instagram',
        lead_note: 'CraftBox brand Class 35 and 42.',
        added_by: 13,
        is_assign: 1,
        lead_type: 1,
        company_id: 'ETAXWALA',
        lead_score: 90,
        quoted_price: 6999.0,
      },
    });
    const l3 = await prisma.leads.create({
      data: {
        id: 3,
        name: 'Rajesh Agro Corp',
        email: 'contact@rajeshagro.com',
        contact: '9766554433',
        service: 'Agri Startup Incorporation',
        state: 'Madhya Pradesh',
        city: 'Indore',
        source: 'Website Form',
        lead_note: '3 Directors, Cold Storage Unit.',
        added_by: 4,
        is_assign: 1,
        lead_type: 1,
        company_id: 'ETAXWALA',
        lead_score: 95,
        quoted_price: 18500.0,
      },
    });
    const l4 = await prisma.leads.create({
      data: {
        id: 4,
        name: 'Divya Krishnan',
        email: 'divya@dkrestaurants.com',
        contact: '9844123654',
        service: 'FSSAI License',
        state: 'Tamil Nadu',
        city: 'Chennai',
        source: 'WhatsApp Campaign',
        lead_note: 'Restaurant chain, 3 outlets.',
        added_by: 7,
        is_assign: 0,
        lead_type: 1,
        company_id: 'ETAXWALA',
        lead_score: 70,
        quoted_price: 5999.0,
      },
    });
    const l5 = await prisma.leads.create({
      data: {
        id: 5,
        name: 'Sanjay Patel',
        email: 'sanjay@pateltextiles.in',
        contact: '9898765432',
        service: 'GST Registration',
        state: 'Gujarat',
        city: 'Surat',
        source: 'Referral',
        lead_note: 'Textile manufacturer, new GST needed.',
        added_by: 13,
        is_assign: 1,
        lead_type: 1,
        company_id: 'ETAXWALA',
        lead_score: 80,
        quoted_price: 999.0,
      },
    });

    await prisma.leads_sahakarsamridhi.create({
      data: {
        id: 1,
        name: 'Kisan Samriddhi Credit Society',
        email: 'contact@kisancredit.org',
        contact: '9423112233',
        service: 'Cooperative Registration Audit',
        state: 'Gujarat',
        city: 'Anand',
        lead_note: '500 farmer members.',
        added_by: 15,
        is_assign: 1,
        lead_type: 2,
        company_id: 'SAHAKAR',
        lead_score: 92,
        quoted_price: 35000.0,
      },
    });
    await prisma.leads_udyamikisan.create({
      data: {
        id: 1,
        name: 'Babu Rao Krishi Producer',
        email: 'baburao@agrifarm.in',
        contact: '9890123456',
        service: 'FPO Subsidy Tax Return',
        state: 'Maharashtra',
        city: 'Kolhapur',
        lead_note: 'Agri Producer Organization.',
        added_by: 15,
        is_assign: 1,
        lead_type: 3,
        company_id: 'UDYAMI',
        lead_score: 88,
        quoted_price: 15000.0,
      },
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 6. LEAD ASSIGNS ───────────────────────────────────────────────────────────
  try {
    console.log('📌 Seeding Lead Assigns...');
    await prisma.lead_assign.createMany({
      data: [
        { lead_id: l1.id, assign_to: 7, lead_status: 1, lead_type: 1, lead_source: 'etaxwala' },
        { lead_id: l2.id, assign_to: 13, lead_status: 2, lead_type: 1, lead_source: 'etaxwala' },
        { lead_id: l3.id, assign_to: 4, lead_status: 3, lead_type: 1, lead_source: 'etaxwala' },
        { lead_id: l5.id, assign_to: 7, lead_status: 1, lead_type: 1, lead_source: 'etaxwala' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 7. LEAD REMARKS & FOLLOWUPS ───────────────────────────────────────────────
  try {
    console.log('📝 Seeding Lead Remarks...');
    await prisma.lead_remarks.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          lead_status: 1,
          lead_remark: 'Spoke with client. Requested Form 26AS.',
          lead_source: 'etaxwala',
        },
        {
          user_id: 13,
          lead_id: l2.id,
          lead_status: 2,
          lead_remark: 'Client interested, shared quotation for trademark.',
          lead_source: 'etaxwala',
        },
        {
          user_id: 4,
          lead_id: l3.id,
          lead_status: 3,
          lead_remark: 'Documents received, forwarded to ops team.',
          lead_source: 'etaxwala',
        },
        {
          user_id: 7,
          lead_id: l4.id,
          lead_status: 1,
          lead_remark: 'Called, no response. Will try again tomorrow.',
          lead_source: 'etaxwala',
        },
      ],
      skipDuplicates: true,
    });
    await prisma.lead_followups.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          followup_date: new Date(now.getTime() + 86400000 * 2),
          followup_time: '11:30 AM',
          followup_remark: 'Call client for ITR docs.',
          is_called: 0,
          lead_source: 'etaxwala',
        },
        {
          user_id: 13,
          lead_id: l2.id,
          followup_date: new Date(now.getTime() + 86400000 * 1),
          followup_time: '3:00 PM',
          followup_remark: 'Confirm payment for trademark.',
          is_called: 0,
          lead_source: 'etaxwala',
        },
        {
          user_id: 7,
          lead_id: l4.id,
          followup_date: new Date(now.getTime() + 86400000 * 3),
          followup_time: '10:00 AM',
          followup_remark: 'Retry call for FSSAI inquiry.',
          is_called: 0,
          lead_source: 'etaxwala',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 8. LEAD NOTIFICATIONS ─────────────────────────────────────────────────────
  try {
    await prisma.lead_notifications.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          message: 'Followup due today for Amitabh Joshi.',
          is_read: 0,
        },
        {
          user_id: 13,
          lead_id: l2.id,
          message: 'Neha Verma replied to quotation email.',
          is_read: 0,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 9. LEAD ANSWERS (new table) ────────────────────────────────────────────────
  try {
    console.log('❓ Seeding Lead Answers...');
    await prisma.lead_answers.createMany({
      data: [
        {
          lead_id: l1.id,
          question: 'What is your annual income?',
          answer: 'Around 50 lakhs from freelance projects.',
        },
        { lead_id: l1.id, question: 'Do you have Form 26AS?', answer: 'Yes, I can provide it.' },
        {
          lead_id: l2.id,
          question: 'Which trademark class do you need?',
          answer: 'Class 35 and 42 for my brand CraftBox.',
        },
        { lead_id: l3.id, question: 'How many directors?', answer: '3 directors.' },
        {
          lead_id: l4.id,
          question: 'How many outlets?',
          answer: '3 restaurant outlets in Chennai.',
        },
        { lead_id: l5.id, question: 'Business type?', answer: 'Textile manufacturing, B2B sales.' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 10. LEAD QUESTION ANS (manual ID) ────────────────────────────────────────
  try {
    await prisma.lead_question_ans.createMany({
      data: [
        { lead_id: l1.id, question_id: 1, answer: 'Freelance Software Architect' },
        { lead_id: l1.id, question_id: 2, answer: 'Yes, I have Form 26AS' },
        { lead_id: l3.id, question_id: 1, answer: '3 Directors for Cold Storage Unit' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 11. OPERATION TASKS (manual ID) ──────────────────────────────────────────
  try {
    console.log('📋 Seeding Operation Tasks...');
    await prisma.operation_tasks.createMany({
      data: [
        {
          task_id: 1001,
          cust_id: 101,
          service_id: 2,
          task_name: 'File SPICe+ Part B and DSC Approval for Apex Tech',
          original_task_status: 2,
          is_assign: 8,
          added_by: 3,
          is_payment: 1,
          sub_customer_name: 'Apex Tech Solutions',
        },
        {
          task_id: 1002,
          cust_id: 102,
          service_id: 4,
          task_name: 'FSSAI Application Submission and Inspection Review',
          original_task_status: 1,
          is_assign: 8,
          added_by: 3,
          is_payment: 1,
          sub_customer_name: 'Green Earth Organics',
        },
        {
          task_id: 1003,
          cust_id: 103,
          service_id: 3,
          task_name: 'ITR-4 Calculation and Tax Computation Review',
          original_task_status: 3,
          is_assign: 12,
          added_by: 3,
          is_payment: 0,
          sub_customer_name: 'Singh Logistics',
        },
        {
          task_id: 1004,
          cust_id: 104,
          service_id: 5,
          task_name: 'Trademark Application Filing Class 35 and 42',
          original_task_status: 1,
          is_assign: 11,
          added_by: 3,
          is_payment: 1,
          sub_customer_name: 'Preethi Boutique',
        },
        {
          task_id: 1005,
          cust_id: 105,
          service_id: 1,
          task_name: 'GST Monthly Return Filing for Mehta Builders',
          original_task_status: 2,
          is_assign: 8,
          added_by: 3,
          is_payment: 1,
          sub_customer_name: 'Mehta Builders',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 12. TASK ASSIGN (new table — autoincrement) ───────────────────────────────
  try {
    console.log('✅ Seeding Task Assigns...');
    await prisma.task_assign.createMany({
      data: [
        {
          task_id: 1001,
          user_id: 8,
          assigned_by: 3,
          status: 1,
          note: 'Primary assignee for SPICe+ filing.',
        },
        {
          task_id: 1001,
          user_id: 11,
          assigned_by: 3,
          status: 1,
          note: 'CA review of incorporation docs.',
        },
        {
          task_id: 1002,
          user_id: 8,
          assigned_by: 3,
          status: 1,
          note: 'Handle FSSAI inspection coordination.',
        },
        {
          task_id: 1003,
          user_id: 12,
          assigned_by: 3,
          status: 1,
          note: 'QC review of ITR computation.',
        },
        {
          task_id: 1003,
          user_id: 11,
          assigned_by: 3,
          status: 1,
          note: 'CA to finalize ITR-4 numbers.',
        },
        {
          task_id: 1004,
          user_id: 11,
          assigned_by: 3,
          status: 1,
          note: 'Trademark application expert.',
        },
        { task_id: 1005, user_id: 8, assigned_by: 3, status: 1, note: 'File GSTR-1 and GSTR-3B.' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 13. TASK COMMENTS (new table) ────────────────────────────────────────────
  try {
    console.log('💬 Seeding Task Comments...');
    await prisma.task_comments.createMany({
      data: [
        {
          task_id: 1001,
          user_id: 8,
          comment: 'DSC received from client. Filing SPICe+ Part B today.',
        },
        {
          task_id: 1001,
          user_id: 3,
          comment: 'Good progress! Make sure all 3 directors are on board.',
        },
        {
          task_id: 1002,
          user_id: 8,
          comment: 'FSSAI form submitted online. Awaiting inspection date.',
        },
        {
          task_id: 1003,
          user_id: 12,
          comment: 'QC done. Found mismatch in TDS — flagged for CA review.',
        },
        {
          task_id: 1003,
          user_id: 11,
          comment: 'TDS issue resolved. ITR-4 ready for client approval.',
        },
        {
          task_id: 1004,
          user_id: 11,
          comment: 'TM application filed. Government fee paid. Awaiting TM registry.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 14. TASK NOTES (new table) ────────────────────────────────────────────────
  try {
    console.log('📝 Seeding Task Notes...');
    await prisma.task_notes.createMany({
      data: [
        {
          task_id: 1001,
          user_id: 8,
          note: 'Client provided all KYC documents. Aadhar, PAN, and address proof collected.',
        },
        {
          task_id: 1002,
          user_id: 8,
          note: 'FSSAI inspection officer visit expected within 7 working days.',
        },
        {
          task_id: 1003,
          user_id: 11,
          note: 'Sec 44ADA computation done. Presumptive income declared at 50% of receipts.',
        },
        {
          task_id: 1004,
          user_id: 11,
          note: 'Trademark class 35 covers retail; class 42 covers software — both applicable.',
        },
        { task_id: 1005, user_id: 8, note: 'GSTR-1 filed on time. GSTR-3B pending ITC matching.' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 15. TASK UPDATE NOTES (new table) ────────────────────────────────────────
  try {
    await prisma.task_update_notes.createMany({
      data: [
        {
          task_id: 1001,
          user_id: 3,
          note: 'Status updated from Pending to In Progress after receiving DSC.',
          status: 2,
        },
        {
          task_id: 1002,
          user_id: 3,
          note: 'FSSAI inspection date received. Task now in review phase.',
          status: 3,
        },
        {
          task_id: 1003,
          user_id: 12,
          note: 'Moved to QC review after CA computation completed.',
          status: 3,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 16. TASK EXCEL (new table) ────────────────────────────────────────────────
  try {
    await prisma.task_excel.createMany({
      data: [
        {
          task_id: 1001,
          file_name: 'apex_tech_kyc_bundle.xlsx',
          file_path: '/uploads/task_excel/apex_tech_kyc.xlsx',
          uploaded_by: 8,
        },
        {
          task_id: 1003,
          file_name: 'singh_logistics_itr4.xlsx',
          file_path: '/uploads/task_excel/singh_itr4.xlsx',
          uploaded_by: 11,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 17. CRM ORDERS ────────────────────────────────────────────────────────────
  try {
    console.log('🛒 Seeding CRM Orders...');
    await prisma.crm_orders.createMany({
      data: [
        {
          customer_id: 101,
          lead_id: 1,
          category_id: 2,
          service_id: 2,
          total_amount: 14999.0,
          paid_amount: 10000.0,
          unpaid_amount: 4999.0,
          payment_mode: 'UPI Razorpay',
          payment_status: 'advance_paid',
          sales_employee_id: 7,
          comment: 'Balance 4999 due after Certificate of Incorporation.',
        },
        {
          customer_id: 102,
          lead_id: 2,
          category_id: 4,
          service_id: 4,
          total_amount: 8500.0,
          paid_amount: 8500.0,
          unpaid_amount: 0.0,
          payment_mode: 'Net Banking',
          payment_status: 'fully_paid',
          sales_employee_id: 7,
          comment: 'Fully paid. Forwarded to ops.',
        },
        {
          customer_id: 103,
          lead_id: 3,
          category_id: 3,
          service_id: 3,
          total_amount: 12000.0,
          paid_amount: 0.0,
          unpaid_amount: 12000.0,
          payment_mode: 'Pending',
          payment_status: 'unpaid',
          sales_employee_id: 4,
          comment: 'Client yet to make payment.',
        },
        {
          customer_id: 104,
          lead_id: 4,
          category_id: 4,
          service_id: 5,
          total_amount: 6499.0,
          paid_amount: 6499.0,
          unpaid_amount: 0.0,
          payment_mode: 'UPI',
          payment_status: 'fully_paid',
          sales_employee_id: 13,
          comment: 'Payment confirmed.',
        },
        {
          customer_id: 105,
          lead_id: 5,
          category_id: 1,
          service_id: 1,
          total_amount: 2499.0,
          paid_amount: 2499.0,
          unpaid_amount: 0.0,
          payment_mode: 'Cash',
          payment_status: 'fully_paid',
          sales_employee_id: 7,
          comment: 'Monthly retainer.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 18. QUOTATIONS (manual ID) ────────────────────────────────────────────────
  try {
    console.log('📄 Seeding Quotations...');
    await prisma.quotations.createMany({
      data: [
        {
          customer_id: 101,
          lead_id: l1.id,
          service_name: 'Pvt Ltd Incorporation',
          amount: 14999,
          gst_amount: 0,
          total_amount: 14999,
          status: 'accepted',
          created_by: 7,
          company_id: 'ETAXWALA',
          valid_until: new Date(now.getTime() + 86400000 * 30),
        },
        {
          customer_id: 102,
          lead_id: l2.id,
          service_name: 'FSSAI License',
          amount: 8500,
          gst_amount: 0,
          total_amount: 8500,
          status: 'accepted',
          created_by: 7,
          company_id: 'ETAXWALA',
          valid_until: new Date(now.getTime() + 86400000 * 30),
        },
        {
          customer_id: 103,
          lead_id: l3.id,
          service_name: 'ITR-4 Filing',
          amount: 12000,
          gst_amount: 0,
          total_amount: 12000,
          status: 'sent',
          created_by: 4,
          company_id: 'ETAXWALA',
          valid_until: new Date(now.getTime() + 86400000 * 15),
        },
        {
          lead_id: l4.id,
          service_name: 'FSSAI License 3 outlets',
          amount: 7500,
          gst_amount: 0,
          total_amount: 7500,
          status: 'draft',
          created_by: 7,
          company_id: 'ETAXWALA',
          valid_until: new Date(now.getTime() + 86400000 * 7),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 19. CALL LOGS (autoincrement) ─────────────────────────────────────────────
  try {
    console.log('📞 Seeding Call Logs...');
    await prisma.call_logs.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          phone_number: '9822334455',
          direction: 'outgoing',
          status: 'answered',
          duration_seconds: 340,
          called_at: new Date(now.getTime() - 3600000 * 4),
          device_call_id: 'call_9001',
        },
        {
          user_id: 7,
          lead_id: l2.id,
          phone_number: '9988776655',
          direction: 'outgoing',
          status: 'answered',
          duration_seconds: 520,
          called_at: new Date(now.getTime() - 3600000 * 2),
          device_call_id: 'call_9002',
        },
        {
          user_id: 13,
          lead_id: l3.id,
          phone_number: '9766554433',
          direction: 'incoming',
          status: 'answered',
          duration_seconds: 180,
          called_at: new Date(now.getTime() - 3600000 * 8),
          device_call_id: 'call_9003',
        },
        {
          user_id: 7,
          lead_id: l4.id,
          phone_number: '9844123654',
          direction: 'outgoing',
          status: 'missed',
          duration_seconds: 0,
          called_at: new Date(now.getTime() - 3600000 * 24),
          device_call_id: 'call_9004',
        },
        {
          user_id: 7,
          lead_id: l5.id,
          phone_number: '9898765432',
          direction: 'outgoing',
          status: 'answered',
          duration_seconds: 220,
          called_at: new Date(now.getTime() - 3600000 * 1),
          device_call_id: 'call_9005',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 20. CALL HISTORY (manual ID) ─────────────────────────────────────────────
  try {
    await prisma.call_history.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          phone: '9822334455',
          call_type: 'OUTGOING',
          duration: 340,
          call_date: new Date(now.getTime() - 3600000 * 4),
        },
        {
          user_id: 7,
          lead_id: l2.id,
          phone: '9988776655',
          call_type: 'OUTGOING',
          duration: 520,
          call_date: new Date(now.getTime() - 3600000 * 2),
        },
        {
          user_id: 13,
          lead_id: l3.id,
          phone: '9766554433',
          call_type: 'INCOMING',
          duration: 180,
          call_date: new Date(now.getTime() - 3600000 * 8),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 21. CALL REMARKS (manual ID) ─────────────────────────────────────────────
  try {
    await prisma.call_remarks.createMany({
      data: [
        {
          user_id: 7,
          lead_id: l1.id,
          remark: 'Client interested. Sending quotation after call.',
          call_status: 'interested',
        },
        {
          user_id: 7,
          lead_id: l2.id,
          remark: 'Discussed trademark classes. Agreed on fee.',
          call_status: 'converted',
        },
        {
          user_id: 13,
          lead_id: l3.id,
          remark: 'Sending documents, will follow up in 2 days.',
          call_status: 'callback',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 22. NOTIFICATIONS (manual ID) ────────────────────────────────────────────
  try {
    console.log('🔔 Seeding Notifications...');
    await prisma.notifications.createMany({
      data: [
        {
          user_id: 7,
          title: 'New Lead Assigned',
          message: 'Lead Amitabh Joshi has been assigned to you.',
          type: 'lead',
          is_read: 0,
        },
        {
          user_id: 8,
          title: 'Task Assigned',
          message: 'SPICe+ filing task assigned to you for Apex Tech.',
          type: 'task',
          is_read: 0,
        },
        {
          user_id: 11,
          title: 'QC Review Needed',
          message: 'ITR-4 computation for Singh Logistics needs CA review.',
          type: 'task',
          is_read: 0,
        },
        {
          user_id: 14,
          title: 'New Job Application',
          message: 'New application received for Sales Executive position.',
          type: 'hr',
          is_read: 0,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 23. CUSTOMER NOTIFICATIONS ───────────────────────────────────────────────
  try {
    await prisma.customer_notifications.createMany({
      data: [
        {
          customer_id: 101,
          message: 'Your Pvt Ltd registration is in progress. DSC approved.',
          is_read: 0,
          notification_type: 'status_update',
        },
        {
          customer_id: 102,
          message: 'FSSAI inspection scheduled. Please ensure premises are ready.',
          is_read: 0,
          notification_type: 'action_required',
        },
        {
          customer_id: 103,
          message: 'Your ITR-4 draft is ready. Please review and approve.',
          is_read: 0,
          notification_type: 'approval_needed',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 24. CUSTOMER DOCUMENTS (manual ID) ───────────────────────────────────────
  try {
    console.log('📂 Seeding Customer Documents...');
    await prisma.customer_documents.createMany({
      data: [
        {
          customer_id: 101,
          doc_type: 'Aadhar Card',
          doc_path: '/uploads/docs/ramesh_aadhar.pdf',
          uploaded_by: 8,
          status: 'verified',
        },
        {
          customer_id: 101,
          doc_type: 'PAN Card',
          doc_path: '/uploads/docs/ramesh_pan.pdf',
          uploaded_by: 8,
          status: 'verified',
        },
        {
          customer_id: 102,
          doc_type: 'FSSAI Application',
          doc_path: '/uploads/docs/sunita_fssai.pdf',
          uploaded_by: 8,
          status: 'pending',
        },
        {
          customer_id: 103,
          doc_type: 'Form 26AS',
          doc_path: '/uploads/docs/vikram_26as.pdf',
          uploaded_by: 11,
          status: 'verified',
        },
        {
          customer_id: 104,
          doc_type: 'Brand Logo',
          doc_path: '/uploads/docs/preethi_logo.png',
          uploaded_by: 11,
          status: 'verified',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 25. CUSTOMER WORK TIMELINE ───────────────────────────────────────────────
  try {
    await prisma.customer_work_timeline.createMany({
      data: [
        {
          customer_id: 101,
          task_id: 1001,
          title: 'Documents Collected',
          description: 'All KYC documents received from client.',
          status: 'completed',
          updated_by: 8,
        },
        {
          customer_id: 101,
          task_id: 1001,
          title: 'DSC Applied',
          description: 'DSC application submitted for all directors.',
          status: 'completed',
          updated_by: 8,
        },
        {
          customer_id: 101,
          task_id: 1001,
          title: 'SPICe+ Filing',
          description: 'SPICe+ Part A and B filed with MCA.',
          status: 'in_progress',
          updated_by: 8,
        },
        {
          customer_id: 102,
          task_id: 1002,
          title: 'FSSAI Form Submitted',
          description: 'Online FSSAI application submitted.',
          status: 'completed',
          updated_by: 8,
        },
        {
          customer_id: 103,
          task_id: 1003,
          title: 'ITR Computation Done',
          description: 'Tax computation under Sec 44ADA completed.',
          status: 'completed',
          updated_by: 11,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 26. CUSTOMER DUES ─────────────────────────────────────────────────────────
  try {
    await prisma.customer_dues.createMany({
      data: [
        {
          customer_id: 101,
          amount: 4999,
          due_date: new Date(now.getTime() + 86400000 * 30),
          status: 'pending',
          description: 'Balance due after Certificate of Incorporation.',
        },
        {
          customer_id: 103,
          amount: 12000,
          due_date: new Date(now.getTime() + 86400000 * 7),
          status: 'overdue',
          description: 'Full payment for ITR-4 filing.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 27. CUSTOMER EMI ──────────────────────────────────────────────────────────
  try {
    await prisma.customer_emi.createMany({
      data: [
        {
          customer_id: 101,
          total_amount: 14999,
          emi_amount: 5000,
          emi_number: 1,
          due_date: new Date(now.getTime() + 86400000 * 30),
          status: 'paid',
        },
        {
          customer_id: 101,
          total_amount: 14999,
          emi_amount: 5000,
          emi_number: 2,
          due_date: new Date(now.getTime() + 86400000 * 60),
          status: 'pending',
        },
        {
          customer_id: 101,
          total_amount: 14999,
          emi_amount: 4999,
          emi_number: 3,
          due_date: new Date(now.getTime() + 86400000 * 90),
          status: 'pending',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 28. CUSTOMER PAYMENT LINKS ────────────────────────────────────────────────
  try {
    await prisma.customer_payment_links.createMany({
      data: [
        {
          customer_id: 103,
          amount: 12000,
          link_url: 'https://rzp.io/l/etax_singh_itr',
          status: 'pending',
          created_by: 4,
          expires_at: new Date(now.getTime() + 86400000 * 7),
        },
        {
          customer_id: 101,
          amount: 4999,
          link_url: 'https://rzp.io/l/etax_apex_balance',
          status: 'active',
          created_by: 7,
          expires_at: new Date(now.getTime() + 86400000 * 15),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 29. CUSTOMER TICKETS ──────────────────────────────────────────────────────
  try {
    await prisma.customer_tickets.createMany({
      data: [
        {
          customer_id: 101,
          subject: 'DSC not received yet',
          message: 'Its been 5 days, still waiting for DSC.',
          status: 'open',
          priority: 'high',
        },
        {
          customer_id: 102,
          subject: 'FSSAI inspection date?',
          message: 'When will the inspector visit?',
          status: 'in_progress',
          priority: 'medium',
        },
        {
          customer_id: 103,
          subject: 'Need copy of ITR filed',
          message: 'Please share the filed ITR PDF.',
          status: 'resolved',
          priority: 'low',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 30. CUSTOMER CHATTING ─────────────────────────────────────────────────────
  try {
    await prisma.customer_chatting.createMany({
      data: [
        {
          customer_id: 101,
          user_id: 8,
          message: 'Hi Ramesh, your DSC has been approved! Filing SPICe+ now.',
          sender_type: 'staff',
        },
        {
          customer_id: 102,
          user_id: 8,
          message: 'Sunita ji, FSSAI inspection date received — 25th September.',
          sender_type: 'staff',
        },
        {
          customer_id: 103,
          user_id: 11,
          message: 'Vikram ji, ITR-4 computation is complete. Please review.',
          sender_type: 'staff',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 31. CUSTOMER INQUIRIES ────────────────────────────────────────────────────
  try {
    await prisma.customer_inquiries.createMany({
      data: [
        {
          customer_id: 101,
          inquiry_type: 'general',
          message: 'Is trademark registration included in my package?',
          status: 'answered',
          answered_by: 7,
        },
        {
          customer_id: 104,
          inquiry_type: 'billing',
          message: 'Can I get a GST invoice for my payment?',
          status: 'open',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 32. BLOGS ─────────────────────────────────────────────────────────────────
  try {
    console.log('📰 Seeding Blogs...');
    await prisma.blogs.createMany({
      data: [
        {
          title: 'GST Filing Guide 2024-25',
          slug: 'gst-filing-guide-2024',
          content: 'Complete step-by-step guide to filing GSTR-1 and GSTR-3B for FY 2024-25.',
          author_id: 9,
          status: 'published',
          category: 'GST',
          meta_title: 'GST Filing Guide 2024-25 | ETaxwala',
          meta_description: 'Learn how to file GST returns step by step.',
        },
        {
          title: 'How to Register a Private Limited Company',
          slug: 'pvt-ltd-registration-india',
          content: 'Registering a Pvt Ltd company involves SPICe+ form, DSC, DIN and more.',
          author_id: 9,
          status: 'published',
          category: 'Company Registration',
          meta_title: 'Pvt Ltd Registration Guide | ETaxwala',
        },
        {
          title: 'Income Tax vs Presumptive Tax',
          slug: 'income-tax-vs-presumptive',
          content:
            'Section 44ADA and 44AD allow freelancers and small businesses to file presumptive tax.',
          author_id: 9,
          status: 'published',
          category: 'Income Tax',
          meta_title: 'Income Tax vs Presumptive Tax | ETaxwala',
        },
        {
          title: 'FSSAI License Types Explained',
          slug: 'fssai-license-types',
          content: 'Basic, State and Central FSSAI licenses — which one do you need?',
          author_id: 9,
          status: 'draft',
          category: 'Licenses',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 33. ADS ───────────────────────────────────────────────────────────────────
  try {
    await prisma.ads.createMany({
      data: [
        {
          title: 'GST Filing Season Offer',
          description: '50% off on first GST filing!',
          image_url: '/uploads/ads/gst_offer.jpg',
          target_url: '/services/gst',
          placement: 'homepage_banner',
          is_active: 1,
          created_by: 5,
        },
        {
          title: 'Company Registration Fast Track',
          description: 'Get your Pvt Ltd in 7 days!',
          image_url: '/uploads/ads/pvt_ltd.jpg',
          target_url: '/services/pvt-ltd',
          placement: 'sidebar',
          is_active: 1,
          created_by: 5,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 34. CAMPAIGNS & CAMPAIGN LEADS ───────────────────────────────────────────
  try {
    console.log('📣 Seeding Campaigns...');
    const camp1 = await prisma.campaigns.create({
      data: {
        id: 1,
        name: 'GST Season 2024 Campaign',
        description: 'Lead gen campaign for GST services.',
        type: 'google_ads',
        budget: 50000,
        status: 'active',
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-09-30'),
        created_by: 5,
      },
    });
    const camp2 = await prisma.campaigns.create({
      data: {
        id: 2,
        name: 'Diwali Startup Offer',
        description: 'Diwali company registration discount.',
        type: 'social_media',
        budget: 25000,
        status: 'completed',
        start_date: new Date('2024-10-15'),
        end_date: new Date('2024-11-15'),
        created_by: 5,
      },
    });
    await prisma.campaign_leads.createMany({
      data: [
        { campaign_id: camp1.id, lead_id: l1.id, source: 'google_search', status: 'converted' },
        { campaign_id: camp1.id, lead_id: l5.id, source: 'google_display', status: 'new' },
        { campaign_id: camp2.id, lead_id: l2.id, source: 'instagram', status: 'converted' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 35. WHATSAPP CAMPAIGNS (new table) ────────────────────────────────────────
  try {
    console.log('📱 Seeding WhatsApp Campaigns...');
    await prisma.whatsapp_campaigns.createMany({
      data: [
        {
          campaign_name: 'GST Reminder Sept 2024',
          message: 'Hi, your GST filing deadline is approaching. File now at ETaxwala!',
          status: 'SENT',
          total_sent: 1500,
          total_failed: 23,
          sent_at: new Date(now.getTime() - 86400000 * 5),
          created_by: 5,
        },
        {
          campaign_name: 'Diwali Startup Offer Blast',
          message: 'Get 30% off on Pvt Ltd registration this festive season.',
          status: 'SENT',
          total_sent: 3000,
          total_failed: 45,
          sent_at: new Date(now.getTime() - 86400000 * 30),
          created_by: 5,
        },
        {
          campaign_name: 'New Year Compliance Campaign',
          message: 'New year, new compliance! Book your ITR filing early.',
          status: 'DRAFT',
          total_sent: 0,
          total_failed: 0,
          created_by: 5,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 36. JOBS ──────────────────────────────────────────────────────────────────
  try {
    console.log('💼 Seeding Jobs...');
    const job1 = await prisma.jobs.create({
      data: {
        id: 1,
        title: 'Senior Sales Executive',
        department: 'Sales',
        location: 'Pune Remote',
        description: 'Drive lead conversions for GST and Company Registration services.',
        requirements: 'Min 2 years sales experience.',
        salary_range: '4-7 LPA',
        job_type: 'full_time',
        openings: 2,
        status: 'open',
        created_by: 14,
      },
    });
    const job2 = await prisma.jobs.create({
      data: {
        id: 2,
        title: 'Operations Executive',
        department: 'Operations',
        location: 'Pune',
        description: 'Handle client document verification and compliance filing support.',
        requirements: 'Commerce background, GST knowledge preferred.',
        salary_range: '3-5 LPA',
        job_type: 'full_time',
        openings: 3,
        status: 'open',
        created_by: 14,
      },
    });
    const job3 = await prisma.jobs.create({
      data: {
        id: 3,
        title: 'React Frontend Developer',
        department: 'IT',
        location: 'Remote',
        description: 'Build and maintain CRM frontend using React and TypeScript.',
        requirements: '2+ years React, TypeScript required.',
        salary_range: '6-12 LPA',
        job_type: 'full_time',
        openings: 1,
        status: 'open',
        created_by: 14,
      },
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 37. JOB APPLICATIONS & INTERVIEWS ─────────────────────────────────────────
  try {
    console.log('📋 Seeding Job Applications...');
    const app1 = await prisma.job_applications.create({
      data: {
        id: 1,
        job_id: job1.id,
        first_name: 'Ankit',
        last_name: 'Sharma',
        email: 'ankit.sharma@gmail.com',
        phone: '9876012345',
        role_applied: 'Senior Sales Executive',
        department: 'Sales',
        current_company: 'Tax Easy Pvt Ltd',
        current_title: 'Sales Executive',
        experience_years: '3',
        expected_ctc: '6 LPA',
        notice_period_days: '30',
        source: 'Naukri.com',
        status: 'APPLIED',
      },
    });
    const app2 = await prisma.job_applications.create({
      data: {
        id: 2,
        job_id: job1.id,
        first_name: 'Sneha',
        last_name: 'Joshi',
        email: 'sneha.joshi@outlook.com',
        phone: '9834567890',
        role_applied: 'Senior Sales Executive',
        department: 'Sales',
        current_company: 'IndiaFilings',
        current_title: 'BD Executive',
        experience_years: '2',
        expected_ctc: '5 LPA',
        notice_period_days: '15',
        source: 'LinkedIn',
        status: 'SHORTLISTED',
        rating: 4,
      },
    });
    const app3 = await prisma.job_applications.create({
      data: {
        id: 3,
        job_id: job3.id,
        first_name: 'Rohan',
        last_name: 'Patil',
        email: 'rohan.patil@dev.io',
        phone: '9822456789',
        role_applied: 'React Frontend Developer',
        department: 'IT',
        current_company: 'TechStartup Inc.',
        current_title: 'Jr Frontend Dev',
        experience_years: '2.5',
        expected_ctc: '8 LPA',
        notice_period_days: '30',
        source: 'Careers Page',
        status: 'INTERVIEW_SCHEDULED',
        rating: 5,
      },
    });

    await prisma.application_notes.createMany({
      data: [
        {
          application_id: app1.id,
          author_id: 14,
          note: 'Resume looks good. Communication average. Shortlist for written test.',
        },
        {
          application_id: app2.id,
          author_id: 14,
          note: 'Strong profile from IndiaFilings. Recommend for manager round.',
        },
        {
          application_id: app3.id,
          author_id: 14,
          note: 'Excellent GitHub profile. Live coding test scheduled.',
        },
      ],
      skipDuplicates: true,
    });
    await prisma.interviews.createMany({
      data: [
        {
          application_id: app2.id,
          scheduled_at: new Date(now.getTime() + 86400000 * 3),
          mode: 'video',
          interviewer_id: 4,
          status: 'SCHEDULED',
          notes: 'Ask about previous sales numbers.',
        },
        {
          application_id: app3.id,
          scheduled_at: new Date(now.getTime() + 86400000 * 2),
          mode: 'video',
          interviewer_id: 1,
          status: 'SCHEDULED',
          notes: 'React technical round — state management, hooks, TypeScript.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 38. INTERNAL COMMUNICATIONS ───────────────────────────────────────────────
  try {
    console.log('💬 Seeding Internal Communications...');
    await prisma.internal_communications.createMany({
      data: [
        {
          from_id: 1,
          to_id: 7,
          message: 'Great job closing the Apex Tech account! Sync your call logs from mobile.',
        },
        {
          from_id: 3,
          to_id: 8,
          message: 'Rahul, prioritize FSSAI inspection coordination for Green Earth today.',
        },
        {
          from_id: 4,
          to_id: 13,
          message: 'Please send quotation to Divya Krishnan for 3 FSSAI outlets.',
        },
        {
          from_id: 14,
          to_id: 1,
          message: 'We have 3 strong candidates for Sales Executive. Scheduling interviews.',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 39. WEBINARS (new table) ──────────────────────────────────────────────────
  try {
    console.log('🎓 Seeding Webinars...');
    await prisma.webinars.createMany({
      data: [
        {
          title: 'GST Compliance Masterclass 2024',
          description: 'GSTR-1, GSTR-3B and ITC reconciliation guide.',
          host: 'CA Rajesh Kumar',
          webinar_url: 'https://zoom.us/j/etaxwala_gst',
          thumbnail: '/uploads/webinars/gst_masterclass.jpg',
          scheduled_at: new Date(now.getTime() + 86400000 * 7),
          duration_min: 90,
          is_active: 1,
          created_by: 5,
        },
        {
          title: 'How to Start a Business in India - Legal Guide',
          description: 'Pvt Ltd, LLP, OPC — which structure is right?',
          host: 'CA Priya Nair',
          webinar_url: 'https://zoom.us/j/etaxwala_startup',
          thumbnail: '/uploads/webinars/startup_guide.jpg',
          scheduled_at: new Date(now.getTime() + 86400000 * 14),
          duration_min: 60,
          is_active: 1,
          created_by: 5,
        },
        {
          title: 'ITR Filing Made Easy',
          description: 'Step-by-step ITR-1, ITR-3 and ITR-4 walkthrough.',
          host: 'CA Anand Mishra',
          webinar_url: 'https://zoom.us/j/etaxwala_itr',
          thumbnail: '/uploads/webinars/itr_guide.jpg',
          scheduled_at: new Date(now.getTime() - 86400000 * 10),
          duration_min: 75,
          is_active: 0,
          created_by: 5,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 40. USER ACTIVITY (new table) ─────────────────────────────────────────────
  try {
    console.log('📊 Seeding User Activity...');
    await prisma.user_activity.createMany({
      data: [
        {
          user_id: 7,
          user_type: 'staff',
          activity: 'LOGIN',
          description: 'Staff user logged in from Chrome/Windows.',
          ip_address: '192.168.1.101',
        },
        {
          user_id: 7,
          user_type: 'staff',
          activity: 'LEAD_VIEW',
          description: 'Viewed lead profile: Amitabh Joshi.',
          ip_address: '192.168.1.101',
        },
        {
          user_id: 7,
          user_type: 'staff',
          activity: 'QUOTATION_SENT',
          description: 'Quotation sent for ITR-4 filing.',
          ip_address: '192.168.1.101',
        },
        {
          user_id: 8,
          user_type: 'staff',
          activity: 'LOGIN',
          description: 'Staff user logged in from Chrome/Mac.',
          ip_address: '192.168.1.102',
        },
        {
          user_id: 8,
          user_type: 'staff',
          activity: 'TASK_UPDATE',
          description: 'Updated task status for Apex Tech SPICe+ filing.',
          ip_address: '192.168.1.102',
        },
        {
          user_id: 101,
          user_type: 'customer',
          activity: 'LOGIN',
          description: 'Customer portal login.',
          ip_address: '103.15.22.55',
        },
        {
          user_id: 101,
          user_type: 'customer',
          activity: 'DOCUMENT_UPLOAD',
          description: 'Uploaded Aadhar and PAN documents.',
          ip_address: '103.15.22.55',
        },
        {
          user_id: 4,
          user_type: 'staff',
          activity: 'REPORT_VIEW',
          description: 'Viewed monthly sales report.',
          ip_address: '192.168.1.104',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 41. USER ACTION ON BOT (new table) ────────────────────────────────────────
  try {
    await prisma.user_action_on_bot.createMany({
      data: [
        {
          user_id: 101,
          action: 'START',
          payload: '{"intent":"service_inquiry"}',
          bot_session: 'sess_bot_001',
        },
        {
          user_id: 101,
          action: 'MESSAGE',
          payload: '{"text":"What is the status of my registration?"}',
          bot_session: 'sess_bot_001',
        },
        {
          user_id: 102,
          action: 'START',
          payload: '{"intent":"payment_query"}',
          bot_session: 'sess_bot_002',
        },
        {
          user_id: 104,
          action: 'MESSAGE',
          payload: '{"text":"I need my trademark certificate"}',
          bot_session: 'sess_bot_003',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 42. AUDIT LOGS ────────────────────────────────────────────────────────────
  try {
    console.log('🔍 Seeding Audit Logs...');
    await prisma.audit_logs.createMany({
      data: [
        {
          actor_id: 1,
          actor_email: 'admin@etaxwala.com',
          actor_role: 'super_admin',
          action: 'CREATE',
          resource: 'staff_user',
          resource_id: '16',
          payload: '{"email":"support@etaxwala.com","role_id":2}',
          ip_address: '192.168.1.1',
        },
        {
          actor_id: 4,
          actor_email: 'sales.manager@etaxwala.com',
          actor_role: 'sales_manager',
          action: 'ASSIGN',
          resource: 'lead',
          resource_id: String(l3.id),
          payload: '{"assigned_to":4}',
          ip_address: '192.168.1.104',
        },
        {
          actor_id: 3,
          actor_email: 'ops.manager@etaxwala.com',
          actor_role: 'ops_manager',
          action: 'UPDATE',
          resource: 'operation_task',
          resource_id: '1001',
          payload: '{"status":2}',
          ip_address: '192.168.1.103',
        },
        {
          actor_id: 7,
          actor_email: 'priya.sales@etaxwala.com',
          actor_role: 'sales_employee',
          action: 'CREATE',
          resource: 'quotation',
          resource_id: '1',
          payload: '{"amount":14999,"customer_id":101}',
          ip_address: '192.168.1.101',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 43. COUPONS (manual ID) ───────────────────────────────────────────────────
  try {
    await prisma.coupons.createMany({
      data: [
        {
          coupon_id: 1,
          code: 'GSTFREE50',
          discount_type: 'percentage',
          discount_value: 50,
          min_order_value: 999,
          max_uses: 100,
          used_count: 23,
          is_active: 1,
          expires_at: new Date(now.getTime() + 86400000 * 60),
        },
        {
          coupon_id: 2,
          code: 'NEWBIZ500',
          discount_type: 'flat',
          discount_value: 500,
          min_order_value: 5000,
          max_uses: 50,
          used_count: 12,
          is_active: 1,
          expires_at: new Date(now.getTime() + 86400000 * 30),
        },
        {
          coupon_id: 3,
          code: 'DIWALI30',
          discount_type: 'percentage',
          discount_value: 30,
          min_order_value: 2999,
          max_uses: 200,
          used_count: 200,
          is_active: 0,
          expires_at: new Date(now.getTime() - 86400000 * 5),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 44. STATES (manual ID) ────────────────────────────────────────────────────
  try {
    await prisma.states.createMany({
      data: [
        { state_id: 1, state_name: 'Maharashtra', state_code: 'MH' },
        { state_id: 2, state_name: 'Karnataka', state_code: 'KA' },
        { state_id: 3, state_name: 'Tamil Nadu', state_code: 'TN' },
        { state_id: 4, state_name: 'Delhi', state_code: 'DL' },
        { state_id: 5, state_name: 'Gujarat', state_code: 'GJ' },
        { state_id: 6, state_name: 'Uttar Pradesh', state_code: 'UP' },
        { state_id: 7, state_name: 'Rajasthan', state_code: 'RJ' },
        { state_id: 8, state_name: 'Kerala', state_code: 'KL' },
        { state_id: 9, state_name: 'Madhya Pradesh', state_code: 'MP' },
        { state_id: 10, state_name: 'West Bengal', state_code: 'WB' },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 45. SAHAKAR CATEGORIES & SERVICES (manual ID) ────────────────────────────
  try {
    await prisma.sahakar_samriddhi_categories.createMany({
      data: [
        {
          category_id: 1,
          name: 'Cooperative Registration',
          description: 'Registration of farmer cooperatives and credit societies.',
          is_active: 1,
        },
        {
          category_id: 2,
          name: 'Audit Compliance',
          description: 'Annual audit and tax compliance for cooperatives.',
          is_active: 1,
        },
      ],
      skipDuplicates: true,
    });
    await prisma.sahakar_samridhhi_services.createMany({
      data: [
        {
          service_id: 1,
          category_id: 1,
          name: 'Cooperative Society Registration',
          price: 25000,
          description: 'End-to-end cooperative society formation.',
          is_active: 1,
        },
        {
          service_id: 2,
          category_id: 1,
          name: 'Multi-State Cooperative Registration',
          price: 45000,
          description: 'MSCS registration for nationwide operations.',
          is_active: 1,
        },
        {
          service_id: 3,
          category_id: 2,
          name: 'Annual Audit Small Society',
          price: 8000,
          description: 'Statutory audit for societies with turnover less than 1 Cr.',
          is_active: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 46. UDYAMI KISAN CATEGORIES & SERVICES (new tables — autoincrement) ───────
  try {
    console.log('🌾 Seeding Udyami Kisan...');
    await prisma.udyomi_kisan_categories.createMany({
      data: [
        {
          name: 'FPO Registration',
          description: 'Farmer Producer Organization registration and compliance.',
          is_active: 1,
        },
        {
          name: 'Agri Subsidies',
          description: 'Government subsidy application assistance for farmers.',
          is_active: 1,
        },
      ],
      skipDuplicates: true,
    });
    await prisma.udyomi_kisan_services.createMany({
      data: [
        {
          name: 'FPO Registration and Setup',
          description: 'Complete FPO registration with SFAC.',
          price: 15000,
          is_active: 1,
        },
        {
          name: 'PM-Kisan Registration',
          description: 'Assistance with PM-Kisan Samman Nidhi registration.',
          price: 500,
          is_active: 1,
        },
        {
          name: 'Agri Loan Documentation',
          description: 'Help farmers prepare loan documents for KCC and other schemes.',
          price: 2000,
          is_active: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 47. SALES ─────────────────────────────────────────────────────────────────
  try {
    await prisma.sales.createMany({
      data: [
        {
          customer_id: 101,
          service_id: 2,
          amount: 14999,
          payment_status: 'advance_paid',
          sales_by: 7,
          payment_mode: 'UPI',
          company_id: 'ETAXWALA',
        },
        {
          customer_id: 102,
          service_id: 4,
          amount: 8500,
          payment_status: 'fully_paid',
          sales_by: 7,
          payment_mode: 'Net Banking',
          company_id: 'ETAXWALA',
        },
        {
          customer_id: 104,
          service_id: 5,
          amount: 6499,
          payment_status: 'fully_paid',
          sales_by: 13,
          payment_mode: 'UPI',
          company_id: 'ETAXWALA',
        },
        {
          customer_id: 105,
          service_id: 1,
          amount: 2499,
          payment_status: 'fully_paid',
          sales_by: 7,
          payment_mode: 'Cash',
          company_id: 'ETAXWALA',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 48. SALES USER LOCATIONS ──────────────────────────────────────────────────
  try {
    await prisma.sales_user_locations.createMany({
      data: [
        {
          user_id: 7,
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 10.5,
          recorded_at: new Date(now.getTime() - 3600000 * 2),
        },
        {
          user_id: 7,
          latitude: 18.531,
          longitude: 73.8456,
          accuracy: 8.2,
          recorded_at: new Date(now.getTime() - 3600000 * 1),
        },
        {
          user_id: 13,
          latitude: 19.076,
          longitude: 72.8777,
          accuracy: 12.0,
          recorded_at: new Date(now.getTime() - 3600000 * 3),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 49. APPOINTMENTS ─────────────────────────────────────────────────────────
  try {
    await prisma.appointments.createMany({
      data: [
        {
          customer_id: 101,
          staff_id: 11,
          title: 'ITR Filing Consultation',
          description: 'Discuss ITR-4 filing strategy for Sec 44ADA.',
          appointment_date: new Date(now.getTime() + 86400000 * 2),
          appointment_time: '11:00 AM',
          status: 'confirmed',
          mode: 'video_call',
        },
        {
          customer_id: 102,
          staff_id: 8,
          title: 'FSSAI Inspection Prep',
          description: 'Checklist walkthrough before FSSAI inspector.',
          appointment_date: new Date(now.getTime() + 86400000 * 4),
          appointment_time: '3:00 PM',
          status: 'pending',
          mode: 'phone_call',
        },
        {
          customer_id: 104,
          staff_id: 11,
          title: 'Trademark Review',
          description: 'Review trademark application before submission.',
          appointment_date: new Date(now.getTime() - 86400000 * 2),
          appointment_time: '10:00 AM',
          status: 'completed',
          mode: 'video_call',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 50. MEETINGS ──────────────────────────────────────────────────────────────
  try {
    await prisma.meetings.createMany({
      data: [
        {
          title: 'Weekly Sales Review',
          description: 'Review pipeline and conversion rates.',
          meeting_date: new Date(now.getTime() + 86400000 * 1),
          meeting_time: '10:00 AM',
          organizer_id: 4,
          participants: JSON.stringify([4, 7, 13]),
          status: 'scheduled',
          mode: 'video_call',
        },
        {
          title: 'Q3 Operations Planning',
          description: 'Ops team planning for Q3 targets.',
          meeting_date: new Date(now.getTime() + 86400000 * 3),
          meeting_time: '2:00 PM',
          organizer_id: 3,
          participants: JSON.stringify([3, 8, 11, 12]),
          status: 'scheduled',
          mode: 'in_office',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 51. DESKTOP USERS ─────────────────────────────────────────────────────────
  try {
    await prisma.desktop_users.createMany({
      data: [
        {
          user_id: 8,
          device_name: 'Rahul-PC-DELL',
          os: 'Windows 11',
          is_active: 1,
          last_seen: now,
        },
        {
          user_id: 11,
          device_name: 'CA-Laptop-HP',
          os: 'Windows 11',
          is_active: 1,
          last_seen: now,
        },
        {
          user_id: 12,
          device_name: 'QC-Desktop-Lenovo',
          os: 'Windows 10',
          is_active: 0,
          last_seen: new Date(now.getTime() - 86400000 * 2),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 52. SESSIONS ──────────────────────────────────────────────────────────────
  try {
    await prisma.sessions.createMany({
      data: [
        {
          user_id: 7,
          user_type: 'staff',
          session_token: 'sess_priya_001',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 Chrome/120',
          is_active: 1,
          expires_at: new Date(now.getTime() + 86400000),
        },
        {
          user_id: 8,
          user_type: 'staff',
          session_token: 'sess_rahul_002',
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 Chrome/120',
          is_active: 1,
          expires_at: new Date(now.getTime() + 86400000),
        },
        {
          user_id: 4,
          user_type: 'staff',
          session_token: 'sess_salesmgr_003',
          ip_address: '192.168.1.104',
          user_agent: 'Mozilla/5.0 Safari/17',
          is_active: 1,
          expires_at: new Date(now.getTime() + 86400000),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 53. OTPS ──────────────────────────────────────────────────────────────────
  try {
    await prisma.otps.createMany({
      data: [
        {
          email: 'ramesh@apextech.in',
          otp: '459812',
          expires_at: new Date(now.getTime() + 600000),
        },
        {
          email: 'divya@dkrestaurants.com',
          otp: '783421',
          expires_at: new Date(now.getTime() + 600000),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 54. AFFILIATES ────────────────────────────────────────────────────────────
  try {
    await prisma.affiliates.createMany({
      data: [
        {
          name: 'TaxPartner Network',
          email: 'partner@taxpartner.in',
          phone: '9900112233',
          commission_rate: 10,
          referral_code: 'TAXPART001',
          status: 'active',
          total_earnings: 25000,
        },
        {
          name: 'CA Associates Hub',
          email: 'ca@cahub.in',
          phone: '9811223344',
          commission_rate: 12,
          referral_code: 'CAHUB002',
          status: 'active',
          total_earnings: 18500,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 55. PARTNER REFS (BigInt ID) ──────────────────────────────────────────────
  try {
    await prisma.partner_refs.createMany({
      data: [
        {
          id: BigInt(1),
          user_id: BigInt(10),
          code: 'FP_PUNE_001',
          url: 'https://etaxwala.com/ref/FP_PUNE_001',
        },
        {
          id: BigInt(2),
          user_id: BigInt(6),
          code: 'FM_REF_002',
          url: 'https://etaxwala.com/ref/FM_REF_002',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 56. CART (manual ID) ─────────────────────────────────────────────────────
  try {
    await prisma.cart.createMany({
      data: [
        { cart_id: 1, user_id: 103, service_id: 3, quantity: 1, price: 4999 },
        { cart_id: 2, user_id: 103, service_id: 1, quantity: 1, price: 1499 },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 57. SOCIAL ACCOUNTS & POSTS ───────────────────────────────────────────────
  try {
    await prisma.social_accounts.createMany({
      data: [
        {
          platform: 'instagram',
          account_name: '@etaxwala.official',
          account_id: 'etaxwala_official_ig',
          access_token: 'tok_ig_demo',
          is_active: 1,
          connected_by: 5,
        },
      ],
      skipDuplicates: true,
    });
    await prisma.social_posts.createMany({
      data: [
        {
          platform: 'instagram',
          content: 'GST Filing Season is here! File your returns on time. #GSTFiling #ETaxwala',
          status: 'published',
          published_at: new Date(now.getTime() - 86400000 * 3),
          likes: 234,
          created_by: 9,
        },
        {
          platform: 'facebook',
          content: 'Congratulations to our 1000th client! Thank you for trusting ETaxwala.',
          status: 'published',
          published_at: new Date(now.getTime() - 86400000 * 7),
          likes: 567,
          created_by: 9,
        },
        {
          platform: 'instagram',
          content: 'Start your dream business today! Pvt Ltd registration in just 7 days!',
          status: 'scheduled',
          scheduled_at: new Date(now.getTime() + 86400000 * 2),
          created_by: 9,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 58. SYSTEM LOGS ───────────────────────────────────────────────────────────
  try {
    await prisma.system_logs.createMany({
      data: [
        {
          log_level: 'INFO',
          module: 'AUTH',
          message: 'Staff user priya.sales@etaxwala.com logged in successfully.',
          user_id: 7,
        },
        {
          log_level: 'WARN',
          module: 'PAYMENT',
          message: 'Payment gateway timeout for order. Retrying...',
          user_id: null,
        },
        {
          log_level: 'ERROR',
          module: 'EMAIL',
          message: 'Failed to send quotation email to vikram@singhlogistics.com.',
          user_id: 4,
        },
        {
          log_level: 'INFO',
          module: 'CRM',
          message: 'New lead created: Divya Krishnan from WhatsApp Campaign.',
          user_id: 7,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 59. SERVICE DOCS (BigInt ID) ──────────────────────────────────────────────
  try {
    await prisma.service_docs.createMany({
      data: [
        {
          sd_id: BigInt(1),
          service_id: 2,
          doc_name: 'PAN Card',
          doc_description: 'PAN Card of all directors (Mandatory)',
          is_required: 1,
        },
        {
          sd_id: BigInt(2),
          service_id: 2,
          doc_name: 'Aadhar Card',
          doc_description: 'Aadhar of all directors (Mandatory)',
          is_required: 1,
        },
        {
          sd_id: BigInt(3),
          service_id: 2,
          doc_name: 'Address Proof',
          doc_description: 'Registered office address proof',
          is_required: 1,
        },
        {
          sd_id: BigInt(4),
          service_id: 4,
          doc_name: 'Food Handler Certificate',
          doc_description: 'Food safety certification (optional)',
          is_required: 0,
        },
        {
          sd_id: BigInt(5),
          service_id: 4,
          doc_name: 'Premises Photos',
          doc_description: 'Photos of food preparation area',
          is_required: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 60. SERVICE QUESTIONS ─────────────────────────────────────────────────────
  try {
    await prisma.service_questions.createMany({
      data: [
        {
          service_id: 2,
          question: 'How many directors in your company?',
          field_type: 'number',
          is_required: 1,
        },
        {
          service_id: 2,
          question: 'What is your proposed company name?',
          field_type: 'text',
          is_required: 1,
        },
        {
          service_id: 4,
          question: 'What type of food business do you operate?',
          field_type: 'select',
          is_required: 1,
        },
        {
          service_id: 3,
          question: 'What is your approximate annual income?',
          field_type: 'number',
          is_required: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 61. CONTACTS ─────────────────────────────────────────────────────────────
  try {
    await prisma.contacts.createMany({
      data: [
        {
          name: 'Akash Mehta',
          email: 'akash@example.com',
          phone: '9900112233',
          message: 'Interested in GST services for my textile business.',
          source: 'Contact Form',
          status: 'new',
        },
        {
          name: 'Meena Gupta',
          email: 'meena@example.com',
          phone: '9811334455',
          message: 'Need help with company registration.',
          source: 'WhatsApp',
          status: 'contacted',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 62. CA ONBOARDS ───────────────────────────────────────────────────────────
  try {
    await prisma.ca_onboards.create({
      data: {
        id: 1,
        name: 'CA Ramesh Gupta',
        email: 'ca.ramesh@gmail.com',
        phone: '9876123456',
        city: 'Mumbai',
        state: 'Maharashtra',
        experience_years: 8,
        specialization: JSON.stringify(['GST', 'Income Tax', 'Company Law']),
        status: 'approved',
        onboarded_by: 1,
      },
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 63. EVENT LOGS ────────────────────────────────────────────────────────────
  try {
    await prisma.event_logs.createMany({
      data: [
        {
          event_type: 'LEAD_CREATED',
          entity_id: l1.id,
          entity_type: 'lead',
          description: 'New lead Amitabh Joshi created from Google Ads.',
          triggered_by: 7,
        },
        {
          event_type: 'ORDER_PAID',
          entity_id: 102,
          entity_type: 'order',
          description: 'Full payment received from Sunita Patil for FSSAI.',
          triggered_by: 7,
        },
        {
          event_type: 'TASK_COMPLETED',
          entity_id: 1004,
          entity_type: 'task',
          description: 'Trademark application filed for Preethi Boutique.',
          triggered_by: 11,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 64. PASSWORD RESETS ───────────────────────────────────────────────────────
  try {
    await prisma.password_resets.createMany({
      data: [
        {
          email: 'ramesh@apextech.in',
          token: 'reset_tok_abc123def456',
          expires_at: new Date(now.getTime() + 3600000),
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 65. PROFILE ───────────────────────────────────────────────────────────────
  try {
    await prisma.profile.createMany({
      data: [
        {
          user_id: 101,
          full_name: 'Ramesh Kumar',
          company_name: 'Apex Tech Solutions Pvt Ltd',
          gstin: '27AABCT3518Q1ZV',
          pan: 'AABCT3518Q',
          address: 'Office 203, TechPark, Baner, Pune 411045',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411045',
        },
        {
          user_id: 102,
          full_name: 'Sunita Patil',
          company_name: 'Green Earth Organics',
          pan: 'BFFPS8723K',
          address: 'No. 45, Green Layout, Koramangala, Bengaluru 560034',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560034',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 66. OTHER LEADS (manual ID) ───────────────────────────────────────────────
  try {
    await prisma.other_leads.createMany({
      data: [
        { id: 1, lead_id: l4.id, date: now, service_id: 4 },
        { id: 2, lead_id: l5.id, date: now, service_id: 1 },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 67. CUSTOMER AFFILIATE REFERRALS ─────────────────────────────────────────
  try {
    await prisma.customer_affiliate_referrals.createMany({
      data: [
        {
          customer_id: 101,
          affiliate_id: 1,
          referral_code: 'TAXPART001',
          commission_amount: 1499,
          status: 'paid',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 68. SYSTEM HEALTH SNAPSHOTS (autoincrement) ───────────────────────────────
  try {
    await prisma.system_health_snapshots.createMany({
      data: [
        {
          cpu_load_percent: 23.5,
          memory_rss_mb: 512,
          memory_heap_used_mb: 320,
          memory_heap_total_mb: 512,
          db_pool_active: 5,
          db_pool_idle: 15,
          db_latency_ms: 12.3,
          system_status: 'HEALTHY',
        },
        {
          cpu_load_percent: 67.2,
          memory_rss_mb: 756,
          memory_heap_used_mb: 612,
          memory_heap_total_mb: 768,
          db_pool_active: 12,
          db_pool_idle: 8,
          db_latency_ms: 45.6,
          system_status: 'DEGRADED',
        },
        {
          cpu_load_percent: 15.1,
          memory_rss_mb: 480,
          memory_heap_used_mb: 290,
          memory_heap_total_mb: 512,
          db_pool_active: 3,
          db_pool_idle: 17,
          db_latency_ms: 8.9,
          system_status: 'HEALTHY',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 69. INTERNAL CHAT GROUPS ──────────────────────────────────────────────────
  try {
    await prisma.internal_chat_groups.createMany({
      data: [
        {
          name: 'Sales Team',
          description: 'Sales team coordination chat',
          created_by: 4,
          is_active: 1,
        },
        {
          name: 'Operations Desk',
          description: 'Ops task coordination',
          created_by: 3,
          is_active: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 70. CHAT CONVERSATIONS, MEMBERS, MESSAGES ────────────────────────────────
  try {
    const conv1 = await prisma.chat_conversations.create({
      data: { id: 1, type: 'group', name: 'Sales Team', created_by: 4 },
    });
    await prisma.chat_members.createMany({
      data: [
        { conversation_id: conv1.id, user_id: 4, role: 'admin' },
        { conversation_id: conv1.id, user_id: 7, role: 'member' },
        { conversation_id: conv1.id, user_id: 13, role: 'member' },
      ],
      skipDuplicates: true,
    });
    await prisma.chat_messages.createMany({
      data: [
        {
          conversation_id: conv1.id,
          sender_id: 4,
          content: 'Team, we need 5 more closures this week to hit monthly target!',
          message_type: 'text',
        },
        {
          conversation_id: conv1.id,
          sender_id: 7,
          content: 'On it! I have 3 strong prospects today.',
          message_type: 'text',
        },
        {
          conversation_id: conv1.id,
          sender_id: 13,
          content: 'I have Divya Krishnan followup at 10 AM. Should close today.',
          message_type: 'text',
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 71. USER PRESENCE (autoincrement) ─────────────────────────────────────────
  try {
    await prisma.user_presence.createMany({
      data: [
        { user_id: 7, is_online: true, last_seen_at: now },
        { user_id: 8, is_online: true, last_seen_at: now },
        { user_id: 4, is_online: true, last_seen_at: now },
        { user_id: 3, is_online: false, last_seen_at: new Date(now.getTime() - 3600000) },
        { user_id: 11, is_online: false, last_seen_at: new Date(now.getTime() - 7200000) },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  // ── 72. AI AUTOMATION TASKS ───────────────────────────────────────────────────
  try {
    await prisma.ai_automation_tasks.createMany({
      data: [
        {
          task_code: 'AI_LEAD_SCORE_001',
          task_type: 'lead_scoring',
          input_payload: { lead_id: l1.id },
          output_result: { score: 85, reason: 'High income, specific request' },
          tokens_used: 450,
          latency_ms: 1200,
          status: 'COMPLETED',
          created_by: 1,
        },
      ],
      skipDuplicates: true,
    });
  } catch (err: any) {
    console.log('Notice:', err?.message || err);
  }

  console.log('');
  console.log('✅✅✅ FULL DATABASE SEEDING COMPLETED SUCCESSFULLY! ✅✅✅');
  console.log('');
  console.log('  Staff Users: 16  |  Customers: 5   |  Leads: 5 (+2 sub-brand)');
  console.log('  Operation Tasks: 5   |  Task Assigns: 7  |  Task Comments: 6');
  console.log('  Lead Answers: 6  |  Call Logs: 5   |  CRM Orders: 5');
  console.log('  Jobs: 3  |  Applications: 3  |  Webinars: 3  |  WhatsApp Campaigns: 3');
  console.log('  Blogs: 4  |  Coupons: 3  |  States: 10  |  Audits: 4  |  + more!');
}

main()
  .catch((e) => {
    console.error('ERROR during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
