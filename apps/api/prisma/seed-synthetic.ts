/**
 * Synthetic demo dataset for a single-tenant CRM.
 * Every name, phone, email, and bank value is fictional. Nothing here is PII.
 *
 * Password for every seeded staff and client account: Demo@12345
 *
 * From the repo root, with DATABASE_URL pointing at the tenant MySQL database:
 *   pnpm --filter @etaxwala/api db:seed:synthetic
 *
 * Re-running deletes only rows this script owns (emails @demo.crm.local,
 * source = 'SYNTHETIC', and ids in the 880000 range) and inserts them again.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'Demo@12345';

const STAFF = [
  {
    id: 8801,
    name: 'Asha Kulkarni',
    email: 'admin@demo.crm.local',
    role: 1,
    userType: 1,
    title: 'Workspace admin',
  },
  {
    id: 8802,
    name: 'Nitin Rao',
    email: 'ops.manager@demo.crm.local',
    role: 3,
    userType: 3,
    title: 'Operations manager',
  },
  {
    id: 8803,
    name: 'Meera Iyer',
    email: 'sales.agent@demo.crm.local',
    role: 7,
    userType: 6,
    title: 'Sales executive',
  },
  {
    id: 8804,
    name: 'Farhan Qureshi',
    email: 'hr.lead@demo.crm.local',
    role: 14,
    userType: 14,
    title: 'People lead',
  },
  {
    id: 8805,
    name: 'Leela Menon',
    email: 'marketing.lead@demo.crm.local',
    role: 5,
    userType: 5,
    title: 'Marketing lead',
  },
];

const LEADS = [
  [
    'Kabir Seth',
    'kabir.seth@client.demo.crm.local',
    '9000001001',
    'Private limited registration',
    'Maharashtra',
    'Pune',
    0,
  ],
  [
    'Ananya Deshmukh',
    'ananya.deshmukh@client.demo.crm.local',
    '9000001002',
    'GST registration',
    'Maharashtra',
    'Nashik',
    1,
  ],
  [
    'Rohan Pillai',
    'rohan.pillai@client.demo.crm.local',
    '9000001003',
    'Trademark search',
    'Karnataka',
    'Bengaluru',
    2,
  ],
  [
    'Sana Kapoor',
    'sana.kapoor@client.demo.crm.local',
    '9000001004',
    'LLP incorporation',
    'Delhi',
    'New Delhi',
    0,
  ],
  [
    'Vikram Bedi',
    'vikram.bedi@client.demo.crm.local',
    '9000001005',
    'FSSAI license',
    'Gujarat',
    'Ahmedabad',
    3,
  ],
  [
    'Ishita Rao',
    'ishita.rao@client.demo.crm.local',
    '9000001006',
    'Annual ROC filing',
    'Tamil Nadu',
    'Chennai',
    1,
  ],
  [
    'Dev Sharma',
    'dev.sharma@client.demo.crm.local',
    '9000001007',
    'ITR for a proprietorship',
    'Rajasthan',
    'Jaipur',
    0,
  ],
  [
    'Tara Banerjee',
    'tara.banerjee@client.demo.crm.local',
    '9000001008',
    'GST return retainer',
    'West Bengal',
    'Kolkata',
    4,
  ],
];

async function step(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`ok  ${label}`);
  } catch (err) {
    console.log(`skip ${label}: ${(err as Error).message.split('\n')[0]}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL to the new tenant database before seeding.');
  }
  const hash = await bcrypt.hash(PASSWORD, 10);

  await step('staff_users', async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM staff_users WHERE email LIKE '%@demo.crm.local'`);
    for (const person of STAFF) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO staff_users
          (id, name, email, password_hash, phone, role_id, position, department, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Demo', 1, NOW(3), NOW(3))`,
        person.id,
        person.name,
        person.email,
        hash,
        '9000000000',
        person.role,
        person.title
      );
    }
  });

  await step('users', async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM users WHERE email LIKE '%@demo.crm.local'`);
    for (const person of STAFF) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO users
          (id, username, email, contact, user_type, password, status, added_by, user_token, company_id, is_online, user_date, updated_at, created_at)
         VALUES (?, ?, ?, '9000000000', ?, ?, 1, 8801, '', 'TENANT', 0, NOW(), NOW(), NOW())`,
        person.id,
        person.name,
        person.email,
        person.userType,
        hash
      );
    }
  });

  await step('categories and services', async () => {
    await prisma
      .$executeRawUnsafe(
        `INSERT INTO categories (category_id, category_name)
       SELECT 8801, 'Synthetic registrations' FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_id = 8801)`
      )
      .catch(async () => {
        await prisma.$executeRawUnsafe(
          `INSERT INTO categories (category_id, company_id, category_name, added_by, date)
         VALUES (8801, 'TENANT', 'Synthetic registrations', 8801, NOW())`
        );
      });
    await prisma.$executeRawUnsafe(`DELETE FROM services WHERE service_id BETWEEN 8801 AND 8803`);
    const services = [
      [8801, 'Private limited registration', 14999],
      [8802, 'GST registration', 4999],
      [8803, 'Annual compliance retainer', 24000],
    ];
    for (const [id, name, price] of services) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO services
          (service_id, company_id, category_id, service_name, service_price, partner_percentage, description, added_by, date)
         VALUES (?, 'TENANT', 8801, ?, ?, 0, 'Synthetic catalogue item', 8801, NOW())`,
        id,
        name,
        price
      );
    }
  });

  await step('leads', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM leads WHERE source = 'SYNTHETIC' OR id BETWEEN 880011 AND 880018`
    );
    let id = 880011;
    for (const [name, email, phone, service, state, city, type] of LEADS) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO leads
          (id, name, email, contact, service, state, city, lead_note, added_by, is_assign, lead_type, is_customer, is_payment, company_id, source, date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '[synthetic] demo lead', 8803, ?, ?, 0, 0, 'TENANT', 'SYNTHETIC', CURDATE(), NOW(), NOW())`,
        id,
        name,
        email,
        phone,
        service,
        state,
        city,
        id <= 880014 ? 1 : 0,
        type
      );
      id += 1;
    }
  });

  await step('lead assignment and calls', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM lead_assign WHERE lead_id BETWEEN 880011 AND 880014`
    );
    for (const leadId of [880011, 880012, 880013, 880014]) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO lead_assign (id, lead_id, assign_to, lead_status, lead_type, assign_date, lead_source)
         VALUES (?, ?, 8803, 1, 0, NOW(), 'SYNTHETIC')`,
        leadId,
        leadId
      );
    }
    await prisma.$executeRawUnsafe(
      `DELETE FROM call_history WHERE lead_id BETWEEN 880011 AND 880014`
    );
    const calls = [
      [880011, 'outgoing', 186],
      [880011, 'incoming', 94],
      [880012, 'outgoing_missed', 0],
      [880013, 'incoming', 240],
    ];
    for (const [leadId, type, duration] of calls) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO call_history
          (lead_id, user_id, contact, lead_source, name, call_type, duration, call_timestamp, call_date, created_at, updated_at)
         VALUES (?, 8803, '9000001001', 'SYNTHETIC', 'Synthetic caller', ?, ?, NOW(), CURDATE(), NOW(), NOW())`,
        leadId,
        type,
        duration
      );
    }
  });

  await step('customers, orders, emi', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM customer_emi WHERE customer_id BETWEEN 880021 AND 880023`
    );
    await prisma.$executeRawUnsafe(`DELETE FROM orders WHERE id BETWEEN 880031 AND 880033`);
    await prisma.$executeRawUnsafe(`DELETE FROM customers WHERE id BETWEEN 880021 AND 880023`);
    const clients = [
      [
        880021,
        880015,
        'Ishita Rao',
        'River & Co',
        'ishita.rao@client.demo.crm.local',
        '9000001006',
        24000,
      ],
      [
        880022,
        880016,
        'Dev Sharma',
        'Dev Traders',
        'dev.sharma@client.demo.crm.local',
        '9000001007',
        4999,
      ],
      [
        880023,
        880018,
        'Tara Banerjee',
        'Tara Studio',
        'tara.banerjee@client.demo.crm.local',
        '9000001008',
        14999,
      ],
    ];
    for (const [id, leadId, name, business, email, phone, price] of clients) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO customers
          (id, lead_id, name, business, email, contact, password, service, service_price, state, city, added_by, company_id, is_payment, is_active, is_approve, is_partner, customer_token, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Synthetic service', ?, 'Maharashtra', 'Pune', 8802, 'TENANT', 1, 1, 1, 0, ?, NOW())`,
        id,
        leadId,
        name,
        business,
        email,
        phone,
        hash,
        price,
        `synthetic-${id}`
      );
    }
    let orderId = 880031;
    for (const [custId, , , business, , , price] of clients) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO orders (id, customer_id, package_id, company_name, total_amount, payment_status, order_date)
         VALUES (?, ?, '8801', ?, ?, 1, NOW())`,
        orderId,
        String(custId),
        business,
        price
      );
      await prisma.$executeRawUnsafe(
        `INSERT INTO customer_emi
          (emi_id, customer_id, order_id, emi_type, emi_total_amount, emi_paid_amount, emi_unpaid_amount, emi_due_date, emi_comment, date)
         VALUES (?, ?, ?, 1, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 15 DAY), '[synthetic] installment', NOW())`,
        orderId,
        custId,
        orderId,
        price,
        Math.round(Number(price) / 2),
        Math.round(Number(price) / 2)
      );
      orderId += 1;
    }
  });

  await step('quotations', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM sales WHERE quotation_id BETWEEN 880041 AND 880042`
    );
    await prisma.$executeRawUnsafe(`DELETE FROM quotations WHERE id BETWEEN 880041 AND 880042`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO quotations (id, lead_id, created_by, note, created_at, updated_at)
       VALUES (880041, 880011, 'Meera Iyer', '[synthetic] private limited quote', NOW(), NOW()),
              (880042, 880012, 'Meera Iyer', '[synthetic] GST quote', NOW(), NOW())`
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO sales (quotation_id, service_id, qty, price, dis, amount, service_name, created_at, updated_at)
       VALUES (880041, 8801, 1, 14999, 0, 14999, 'Private limited registration', NOW(6), NOW(6)),
              (880042, 8802, 1, 4999, 0, 4999, 'GST registration', NOW(6), NOW(6))`
    );
  });

  await step('operation tasks', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM operation_tasks WHERE task_id BETWEEN 880051 AND 880053`
    );
    const tasks = [
      [880051, 880021, 'Collect director KYC'],
      [880052, 880022, 'File GST registration'],
      [880053, 880023, 'Share the engagement letter'],
    ];
    for (const [id, cust, name] of tasks) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO operation_tasks
          (task_id, cust_id, service_id, task_name, original_task_status, is_assign, is_return, added_by, is_payment, assign_date, updated_at, created_at)
         VALUES (?, ?, 8801, ?, 1, 1, 0, 8802, 1, NOW(), NOW(), NOW())`,
        id,
        cust,
        name
      );
    }
  });

  await step('HRMS attendance, leave, holiday', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM hr_attendance_records WHERE user_source = 'staff_users' AND user_id BETWEEN 8801 AND 8805`
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM hr_leave_requests WHERE user_source = 'staff_users' AND user_id = 8803`
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM hr_holidays WHERE title = 'Synthetic foundation day'`
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM staff_profiles WHERE user_source = 'staff_users' AND user_id BETWEEN 8801 AND 8805`
    );
    for (const person of STAFF) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO staff_profiles
          (user_source, user_id, employee_code, designation, department, employment_type, shift_start, shift_end, joining_date)
         VALUES ('staff_users', ?, ?, ?, 'Demo', 'full_time', '09:30:00', '18:30:00', '2024-04-01')`,
        person.id,
        `NS-${person.id}`,
        person.title
      );
      await prisma.$executeRawUnsafe(
        `INSERT INTO hr_attendance_records
          (user_source, user_id, attendance_date, status, check_in_time, check_out_time, source, marked_by_name)
         VALUES ('staff_users', ?, CURDATE(), 'present', '09:36:00', '18:05:00', 'hr_manual', 'Farhan Qureshi')`,
        person.id
      );
    }
    await prisma.$executeRawUnsafe(
      `INSERT INTO hr_leave_requests
        (user_source, user_id, user_name, leave_type, from_date, to_date, total_days, reason, status)
       VALUES ('staff_users', 8803, 'Meera Iyer', 'CL', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1.0, '[synthetic] family function', 'pending')`
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO hr_holidays (holiday_date, title, holiday_type, description, is_active)
       VALUES ('2026-12-25', 'Synthetic foundation day', 'company', 'Demo holiday. Not a real observance.', 1)`
    );
  });

  await step('careers', async () => {
    await prisma.$executeRawUnsafe(
      `DELETE FROM job_applications WHERE email LIKE '%@candidate.demo.crm.local'`
    );
    await prisma.$executeRawUnsafe(`DELETE FROM jobs WHERE title LIKE 'Synthetic %'`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO jobs (title, location, type, description, responsibilities, qualifications, department, experience, posted_date)
       VALUES ('Synthetic advisor', 'Pune / hybrid', 'Full-Time', 'Demo opening for the careers page.', 'Talk to synthetic clients.', 'Two years of advisory work.', 'Client delivery', '2-4 years', '2026-11-01')`
    );
    const job = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM jobs WHERE title = 'Synthetic advisor' ORDER BY id DESC LIMIT 1`
    );
    const jobId = Number(job[0]?.id || 0) || null;
    await prisma.$executeRawUnsafe(
      `INSERT INTO job_applications
        (job_id, first_name, last_name, email, phone, role_applied, department, experience_years, status, source)
       VALUES (?, 'Neel', 'Joshi', 'neel.joshi@candidate.demo.crm.local', '9000002001', 'Synthetic advisor', 'Client delivery', '3', 'APPLIED', 'SYNTHETIC')`,
      jobId
    );
  });

  await step('activity log and recycle bin', async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM audit_logs WHERE summary LIKE '[synthetic]%'`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO audit_logs
        (actor_id, actor_email, actor_role, actor_name, action, resource, module, summary, status_code, method, path, created_at)
       VALUES (8801, 'admin@demo.crm.local', 'super_admin', 'Asha Kulkarni', 'login', 'auth', 'Auth', '[synthetic] signed in', 200, 'POST', '/v1/auth/staff/login', NOW(6))`
    );
    await prisma.$executeRawUnsafe(`DELETE FROM recycle_bin_items WHERE entity_id = '880099'`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO recycle_bin_items
        (entity_type, entity_id, title, subtitle, mode, payload_snapshot, deleted_by, deleted_by_name, deleted_by_source, delete_reason, status)
       VALUES ('lead', '880099', 'Synthetic discarded lead', '9000001999', 'archive', '{"name":"Discarded Demo"}', 8801, 'Asha Kulkarni', 'staff_users', '[synthetic] duplicate', 'in_bin')`
    );
  });

  await step('desktrack sample', async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM system_logs WHERE id = 880061`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO system_logs (id, user_id, event_type, event_time, created_at, updated_at)
       VALUES (880061, 8802, 'login', NOW(), NOW(), NOW())`
    );
  });

  await step('tenant brand', async () => {
    await prisma.$executeRawUnsafe(
      `INSERT INTO tenant_settings
        (id, company_name, legal_name, tagline, primary_color, accent_color, support_email, support_phone,
         address, city, state_name, gstin, app_url, quote_prefix, working_hours, upi_primary)
       VALUES (1, 'Northstar Advisory', 'Northstar Advisory Demo Pvt Ltd', 'Calm client delivery',
               '#1E3A8A', '#06B6D4', 'support@northstar-demo.local', '1800-000-0000',
               '12 Demo Lane', 'Pune', 'Maharashtra', '27AAAAA0000A1Z5', 'http://localhost:5173', 'NS',
               '9:30 AM – 6:30 PM IST, Monday to Saturday', 'northstar.demo@upi')
       ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), legal_name = VALUES(legal_name),
         support_email = VALUES(support_email), quote_prefix = VALUES(quote_prefix)`
    );
  });

  console.log('');
  console.log('Synthetic seed finished.');
  console.log('Staff and client password: Demo@12345');
  console.log('Admin: admin@demo.crm.local');
  console.log('Operations: ops.manager@demo.crm.local');
  console.log('Sales queue: sales.agent@demo.crm.local');
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
