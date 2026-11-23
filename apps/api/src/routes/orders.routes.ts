import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  verifyJWT,
  requireRole,
  ADMIN_ROLES,
  SALES_MANAGERS,
  SALES_TEAM,
  OPS_MANAGERS,
} from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { ConvertLeadSchema } from '../schemas/crm.schema.js';

const router = Router();

// ─── POST /v1/crm/leads/:id/convert  (Won Conversion Form) ───────────────────
// Only Sales Employees (role 7) and above sales roles can submit
router.post(
  '/leads/:id/convert',
  verifyJWT,
  requireRole([1, 2, 4, 7, 13]),
  validateBody(ConvertLeadSchema),
  async (req: Request, res: Response) => {
    try {
      const lead_id = Number(req.params.id);
      const {
        name,
        company_name,
        email,
        mobile,
        state,
        city,
        category_id,
        service_id,
        total_amount,
        coupon_code,
        discount_amount,
        payment_mode,
        paid_amount,
        next_due_date,
        comment,
        payment_screenshot_url,
      } = req.body;

      // Validate required
      if (!name || !mobile || !category_id || !service_id || !total_amount || !paid_amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
      }

      // Server-side recalculate unpaid amount (never trust client)
      const unpaid_amount =
        Number(total_amount) - Number(discount_amount || 0) - Number(paid_amount);
      if (unpaid_amount < 0) {
        return res
          .status(400)
          .json({ success: false, error: 'Paid amount exceeds total after discount.' });
      }

      // Fetch the lead from leads, leads_udyamikisan, or leads_sahakarsamridhi
      let lead: any = await prisma.leads.findFirst({ where: { id: lead_id } });

      if (lead) {
        await prisma.leads.update({
          where: { id: lead_id },
          data: {
            lead_type: 5, // Customer status ID
            is_customer: 1,
            is_payment: 1,
            updated_at: new Date(),
          },
        });
      } else {
        const uLead: any[] = await prisma.$queryRawUnsafe(
          `SELECT * FROM leads_udyamikisan WHERE id = ${lead_id}`
        );
        if (uLead.length > 0) {
          lead = uLead[0];
          await prisma.$executeRawUnsafe(
            `UPDATE leads_udyamikisan SET lead_type = 5, is_customer = 1, is_payment = 1, updated_at = NOW() WHERE id = ${lead_id}`
          );
        } else {
          const sLead: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM leads_sahakarsamridhi WHERE id = ${lead_id}`
          );
          if (sLead.length > 0) {
            lead = sLead[0];
            await prisma.$executeRawUnsafe(
              `UPDATE leads_sahakarsamridhi SET lead_type = 5, is_customer = 1, is_payment = 1, updated_at = NOW() WHERE id = ${lead_id}`
            );
          }
        }
      }

      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found.' });
      }

      // Update lead_assign status as well
      await prisma
        .$executeRawUnsafe(`UPDATE lead_assign SET lead_status = 5 WHERE lead_id = ${lead_id}`)
        .catch(() => {});

      // 2. Create / update customer record
      const maxCust = await prisma.customers.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const custId = (maxCust?.id || 1373) + 1;

      const service = await (prisma as any).services
        .findFirst({
          where: { service_id: Number(service_id) },
          select: { service_name: true, price: true },
        })
        .catch(() => null);

      await prisma.customers.create({
        data: {
          id: custId,
          lead_id,
          name: name.trim(),
          business: company_name || '',
          email: email || `${mobile}@customer.etaxwala.in`,
          contact: mobile,
          password: Math.random().toString(36).slice(2, 10), // temp password
          service: service?.service_name || `Service #${service_id}`,
          service_price: Number(total_amount),
          state: state || '',
          city: city || '',
          added_by: req.user!.user_id,
          company_id: 'etaxwala',
          is_payment: paid_amount > 0 ? 1 : 0,
          is_active: 1,
          is_approve: 0,
          is_partner: 0,
          customer_token: `cust_${Date.now()}_${custId}`,
          date: new Date(),
        },
      });

      // 3. Create order record
      const maxOrder = await (prisma as any).crm_orders
        .findFirst({ orderBy: { id: 'desc' }, select: { id: true } })
        .catch(() => null);
      const orderId = (maxOrder?.id || 0) + 1;

      await (prisma as any).crm_orders
        .create({
          data: {
            id: orderId,
            customer_id: custId,
            lead_id,
            category_id: Number(category_id),
            service_id: Number(service_id),
            total_amount: Number(total_amount),
            coupon_code: coupon_code || null,
            discount_amount: Number(discount_amount || 0),
            paid_amount: Number(paid_amount),
            unpaid_amount,
            payment_mode: payment_mode || 'Cash',
            next_due_date: next_due_date ? new Date(next_due_date) : null,
            comment: comment || null,
            payment_screenshot_url: payment_screenshot_url || null,
            sales_employee_id: req.user!.user_id,
            payment_status: unpaid_amount === 0 ? 'fully_paid' : 'advance_paid',
            created_at: new Date(),
          },
        })
        .catch(async () => {
          // Fallback: orders table may not exist in legacy schema — store in customer_emi
          const maxEmi = await prisma.customer_emi.findFirst({
            orderBy: { emi_id: 'desc' },
            select: { emi_id: true },
          });
          const emiId = (maxEmi?.emi_id || 1000) + 1;
          await prisma.customer_emi.create({
            data: {
              emi_id: emiId,
              customer_id: custId,
              order_id: orderId,
              emi_type: 1,
              emi_total_amount: Number(total_amount),
              emi_paid_amount: Number(paid_amount),
              emi_unpaid_amount: unpaid_amount,
              emi_due_date: next_due_date ? new Date(next_due_date) : null,
              emi_comment: comment || 'Advance payment recorded on conversion',
              payment_screenshot: payment_screenshot_url || '',
              date: new Date(),
            },
          });
        });

      // 4. Spawn Operations Task
      const maxTask = await prisma.operation_tasks.findFirst({
        orderBy: { task_id: 'desc' },
        select: { task_id: true },
      });
      const taskId = (maxTask?.task_id || 4911) + 1;

      await prisma.operation_tasks.create({
        data: {
          task_id: taskId,
          cust_id: custId,
          service_id: Number(service_id),
          task_name: `Service ${service_id} - ${name}`,
          original_task_status: 1, // Pending (stage 1)
          added_by: req.user!.user_id,
          assign_date: new Date(),
          updated_at: new Date(),
        },
      });
      // 5. Decrement coupon remaining count if coupon was applied
      if (coupon_code) {
        const cName = String(coupon_code).trim().toUpperCase();
        const coupon = await prisma.coupons.findFirst({ where: { coupon_name: cName } });
        if (coupon) {
          const remaining = Math.max(0, coupon.coupon_remaining - 1);
          await prisma.coupons.update({
            where: { coupon_id: coupon.coupon_id },
            data: {
              coupon_remaining: remaining,
              is_active: remaining === 0 ? 1 : coupon.is_active,
            },
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Lead converted to Won. Customer created and Operations task spawned.',
        data: {
          customer_id: custId,
          order_id: orderId,
          task_id: taskId,
          unpaid_amount,
          payment_status: unpaid_amount === 0 ? 'fully_paid' : 'advance_paid',
        },
      });
    } catch (err) {
      console.error('Won conversion error:', err);
      res.status(500).json({ success: false, error: 'Failed to process conversion.' });
    }
  }
);

// ─── PATCH /v1/crm/leads/:id/assign ─────────────────────────────────────────
router.patch(
  '/leads/:id/assign',
  verifyJWT,
  requireRole(SALES_MANAGERS),
  async (req: Request, res: Response) => {
    try {
      const lead_id = Number(req.params.id);
      const { assign_to } = req.body;
      if (!assign_to)
        return res.status(400).json({ success: false, error: 'assign_to user_id is required.' });

      // Create lead_assign record
      const maxAssign = await prisma.lead_assign.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const assignId = (maxAssign?.id || 1000) + 1;

      await prisma.lead_assign.create({
        data: {
          id: assignId,
          lead_id,
          assign_to: Number(assign_to),
          lead_status: 1, // Assigned
          lead_type: 0,
          assign_date: new Date(),
          lead_source: 'etaxwala',
        },
      });

      await prisma.leads.update({
        where: { id: lead_id },
        data: { is_assign: 1, lead_type: 1, updated_at: new Date() }, // 1 = Assigned
      });

      res.json({ success: true, message: 'Lead assigned successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to assign lead.' });
    }
  }
);

// ─── PATCH /v1/crm/leads/:id/status ─────────────────────────────────────────
router.patch(
  '/leads/:id/status',
  verifyJWT,
  requireRole(SALES_TEAM),
  async (req: Request, res: Response) => {
    try {
      const lead_id = Number(req.params.id);
      const { lead_type, remark } = req.body; // lead_type: 0=New,1=Assigned,2=Contacted,3=Follow-up,4=Won,5=Lost

      await prisma.leads.update({
        where: { id: lead_id },
        data: { lead_type: Number(lead_type), updated_at: new Date() },
      });

      if (remark) {
        const maxRemark = await prisma.lead_remarks.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true },
        });
        await prisma.lead_remarks.create({
          data: {
            id: (maxRemark?.id || 1000) + 1,
            user_id: req.user!.user_id,
            lead_id,
            lead_status: Number(lead_type),
            lead_remark: remark,
            date: new Date(),
            lead_source: 'etaxwala',
          },
        });
      }

      res.json({ success: true, message: 'Lead status updated.' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to update lead status.' });
    }
  }
);

// ─── GET /v1/crm/categories ──────────────────────────────────────────────────
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const cats = await prisma.categories.findMany({ orderBy: { category_id: 'asc' } });
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories.' });
  }
});

// ─── GET /v1/crm/categories/:id/services ────────────────────────────────────
router.get('/categories/:id/services', async (req: Request, res: Response) => {
  try {
    const category_id = Number(req.params.id);
    const services = await prisma.services.findMany({
      where: { category_id },
      orderBy: { service_id: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
});

// ─── POST /v1/crm/coupons/validate ──────────────────────────────────────────
router.post('/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, total_amount } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Coupon code required.' });

    const cleanCode = String(code).trim().replace(/'/g, "''").toUpperCase();
    const coupons: any[] = (await prisma
      .$queryRawUnsafe(
        `SELECT coupon_id, coupon_type, coupon_name, coupon_discount, coupon_validity, coupon_uses, coupon_remaining, is_active 
       FROM coupons WHERE UPPER(coupon_name) = '${cleanCode}' LIMIT 1`
      )
      .catch(() => [])) as any[];

    const coupon = coupons[0];
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code.' });
    }

    // In legacy DB, is_active: 0 means Open/Active, 1 means Expired/Closed
    if (Number(coupon.is_active) !== 0) {
      return res.status(400).json({ success: false, error: 'This coupon is expired or inactive.' });
    }

    if (Number(coupon.coupon_remaining) <= 0) {
      return res.status(400).json({ success: false, error: 'This coupon has been fully used.' });
    }

    // Check validity expiration date if set
    if (coupon.coupon_validity) {
      const validDate = new Date(coupon.coupon_validity);
      validDate.setHours(23, 59, 59, 999);
      if (!isNaN(validDate.getTime()) && new Date() > validDate) {
        return res.status(400).json({ success: false, error: 'Coupon validity has expired.' });
      }
    }

    // Calculate discount
    // Database & Old CRM:
    // coupon_type: 0 = Amount Wise (Flat ₹ discount)
    // coupon_type: 1 = % Wise (Percentage % discount)
    let discount = 0;
    const amt = Number(total_amount) || 0;
    const couponType = Number(coupon.coupon_type);
    const couponDiscount = Number(coupon.coupon_discount) || 0;

    if (couponType === 0) {
      // Amount Wise (Flat ₹ discount)
      discount = couponDiscount;
    } else {
      // Percentage Wise (% discount)
      discount = Math.round((amt * couponDiscount) / 100);
    }

    // Ensure discount cannot exceed the service price
    if (discount > amt) {
      discount = amt;
    }

    res.json({
      success: true,
      data: {
        coupon_id: Number(coupon.coupon_id),
        coupon_name: coupon.coupon_name,
        coupon_type: couponType,
        discount_type: couponType === 0 ? 'flat' : 'percentage',
        discount_value: couponDiscount,
        discount_amount: discount,
        final_amount: Math.max(0, amt - discount),
        message: `Coupon "${coupon.coupon_name}" applied! Saved ₹${discount.toLocaleString('en-IN')}.`,
      },
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ success: false, error: 'Coupon validation failed.' });
  }
});

// ─── PATCH /v1/crm/tasks/:id/release ─────────────────────────────────────────
// Ops Manager releases final docs — blocked unless payment = fully_paid
router.patch(
  '/tasks/:id/release',
  verifyJWT,
  requireRole(OPS_MANAGERS),
  async (req: Request, res: Response) => {
    try {
      const task_id = Number(req.params.id);

      // Fetch task → find associated customer → check payment status
      const task = await prisma.operation_tasks.findFirst({ where: { task_id } });
      if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });

      // Check balance via customer_emi
      const emi = await prisma.customer_emi.findFirst({
        where: { customer_id: task.cust_id },
        orderBy: { emi_id: 'desc' },
      });

      const unpaid = emi?.emi_unpaid_amount ?? 1; // default to 1 (not paid) if no record
      if (unpaid > 0) {
        return res.status(403).json({
          success: false,
          error: `Documents cannot be released until balance payment is received. Pending: ₹${unpaid.toLocaleString('en-IN')}.`,
          code: 'PAYMENT_PENDING',
        });
      }

      // Update task to Closed (status 10)
      await prisma.operation_tasks.update({
        where: { task_id },
        data: { original_task_status: 10, updated_at: new Date() },
      });

      res.json({
        success: true,
        message: 'Documents released. Task closed successfully.',
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to release documents.' });
    }
  }
);

// ─── POST /v1/crm/tasks/:id/payment ─────────────────────────────────────────
// Capture balance payment
router.post(
  '/tasks/:id/payment',
  verifyJWT,
  requireRole([1, 2, 3, 8]),
  async (req: Request, res: Response) => {
    try {
      const task_id = Number(req.params.id);
      const { paid_amount, payment_mode, payment_screenshot_url, reference } = req.body;

      if (!paid_amount)
        return res.status(400).json({ success: false, error: 'paid_amount required.' });

      const task = await prisma.operation_tasks.findFirst({ where: { task_id } });
      if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });

      const emi = await prisma.customer_emi.findFirst({
        where: { customer_id: task.cust_id },
        orderBy: { emi_id: 'desc' },
      });

      if (emi) {
        const newUnpaid = Math.max(0, emi.emi_unpaid_amount - Number(paid_amount));
        await prisma.customer_emi.update({
          where: { emi_id: emi.emi_id },
          data: {
            emi_paid_amount: emi.emi_paid_amount + Number(paid_amount),
            emi_unpaid_amount: newUnpaid,
            payment_screenshot: payment_screenshot_url || '',
          },
        });

        // Record in customer_dues (old flow: every payment is a due row awaiting approval).
        // The Prisma model is @@ignore'd (no unique id in the schema file), so write it with
        // bound raw SQL; cd_id is AUTO_INCREMENT in the database.
        await prisma.$executeRaw`
          INSERT INTO customer_dues
            (emi_id, customer_id, paid_amount, unpaid_amount, payment_screenshot, added_by, is_approve, date)
          VALUES
            (${emi.emi_id}, ${task.cust_id}, ${Number(paid_amount)}, ${newUnpaid},
             ${payment_screenshot_url || ''}, ${req.user!.user_id}, 0, NOW())`;

        res.json({
          success: true,
          message: 'Balance payment recorded.',
          data: {
            paid_amount: Number(paid_amount),
            remaining_balance: newUnpaid,
            is_fully_paid: newUnpaid === 0,
          },
        });
      } else {
        res.status(404).json({ success: false, error: 'No payment record found for this task.' });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to record payment.' });
    }
  }
);

export default router;
