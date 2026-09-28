import { z } from 'zod';

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address is required').max(100).optional().or(z.literal('')),
  contact: z.string().min(10, 'Contact number must be at least 10 digits').max(20),
  service: z.string().max(250).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(250).optional(),
  lead_note: z.string().max(500).optional(),
  company_id: z.string().optional().default('etaxwala'),
  source: z.string().optional().default('CRM Web'),
});

export const UpdateTaskStatusSchema = z.object({
  new_status: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  status: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  remarks: z.string().max(1000).optional(),
  updated_by: z.string().max(255).optional(),
}).refine((data) => data.new_status !== undefined || data.status !== undefined, {
  message: 'new_status or status is required',
});

export const ConvertLeadSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  company_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  mobile: z.string().min(10, '10-digit mobile number required'),
  state: z.string().optional(),
  city: z.string().optional(),
  category_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
  service_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
  total_amount: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]),
  coupon_code: z.string().optional(),
  discount_amount: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]).optional(),
  payment_mode: z.string().optional(),
  paid_amount: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]),
  next_due_date: z.string().optional(),
  comment: z.string().optional(),
  payment_screenshot_url: z.string().optional(),
});

export const WonFormSchema = z.object({
  leadId: z.number().int().positive(),
  dealAmount: z.number().positive('Deal amount must be greater than 0'),
  gstin: z.string().max(20).optional(),
  businessName: z.string().min(2, 'Business name is required').max(255),
  panNumber: z.string().max(15).optional(),
  advancePaid: z.number().nonnegative().optional(),
});

