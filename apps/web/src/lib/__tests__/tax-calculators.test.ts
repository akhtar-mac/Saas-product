import { describe, it, expect } from 'vitest';

/**
 * Unit tests for tax and compliance calculators
 */

export function calculateNewRegimeTax(income: number): number {
  if (income <= 300000) return 0;
  if (income <= 700000) {
    // 87A rebate makes taxable income up to 7,00,000 tax-free
    return 0;
  }
  let tax = 0;
  if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
  if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
  if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
  if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
  if (income > 1500000) tax += (income - 1500000) * 0.30;
  return Math.round(tax);
}

export function calculateGstBreakup(baseAmount: number, ratePercent: number = 18) {
  const gstAmount = Math.round((baseAmount * ratePercent) / 100);
  const totalAmount = baseAmount + gstAmount;
  return {
    baseAmount,
    ratePercent,
    cgst: Math.round(gstAmount / 2),
    sgst: Math.round(gstAmount / 2),
    totalGst: gstAmount,
    totalAmount,
  };
}

describe('Tax & Compliance Calculations', () => {
  describe('calculateNewRegimeTax', () => {
    it('should calculate 0 tax for income <= 3,00,000', () => {
      expect(calculateNewRegimeTax(250000)).toBe(0);
      expect(calculateNewRegimeTax(300000)).toBe(0);
    });

    it('should provide Section 87A rebate for income up to 7,00,000', () => {
      expect(calculateNewRegimeTax(650000)).toBe(0);
      expect(calculateNewRegimeTax(700000)).toBe(0);
    });

    it('should accurately compute slab tax above 7,00,000', () => {
      // For 10,00,000:
      // 3L-6L: 3L * 5% = 15,000
      // 6L-9L: 3L * 10% = 30,000
      // 9L-10L: 1L * 15% = 15,000
      // Total = 60,000
      expect(calculateNewRegimeTax(1000000)).toBe(60000);
    });
  });

  describe('calculateGstBreakup', () => {
    it('should correctly break down 18% GST into CGST & SGST', () => {
      const result = calculateGstBreakup(10000, 18);
      expect(result.baseAmount).toBe(10000);
      expect(result.totalGst).toBe(1800);
      expect(result.cgst).toBe(900);
      expect(result.sgst).toBe(900);
      expect(result.totalAmount).toBe(11800);
    });
  });
});
