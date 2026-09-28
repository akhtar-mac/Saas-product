import { describe, it, expect } from 'vitest';
import { CreateLeadSchema, WonFormSchema } from '../schemas/crm.schema.js';

describe('CRM Schema Validation', () => {
  it('should validate valid lead creation payload', () => {
    const valid = {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      contact: '9876543210',
      service: 'Private Limited Company Registration',
      state: 'Maharashtra',
      city: 'Mumbai',
    };
    const parsed = CreateLeadSchema.parse(valid);
    expect(parsed.name).toBe('Rohan Sharma');
    expect(parsed.company_id).toBe('etaxwala');
  });

  it('should throw validation error on invalid email or short phone', () => {
    const invalid = {
      name: 'R',
      email: 'not-an-email',
      contact: '123',
      service: 'GST',
      state: 'MH',
      city: 'Pune',
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow();
  });

  it('should validate won deal form payload', () => {
    const won = {
      leadId: 1045,
      dealAmount: 18500,
      businessName: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAAAA0000A1Z5',
    };
    const parsed = WonFormSchema.parse(won);
    expect(parsed.dealAmount).toBe(18500);
  });
});
