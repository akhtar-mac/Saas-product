import { z } from 'zod';

export const StaffLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(3).max(150),
  password: z.string().min(1, 'Password is required'),
});

export const CustomerLoginSchema = z.object({
  identifier: z.string().min(3, 'Please enter registered email or 10-digit mobile number'),
  password: z.string().optional(),
});

export const CustomerRegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  city: z.string().optional(),
  service: z.string().optional(),
});
