import { describe, expect, it } from 'vitest';
import { isMaskedInput, maskSecret, neutralBrand } from './tenant-settings.service.js';

describe('tenant settings masking', () => {
  it('never echoes a full secret', () => {
    const masked = maskSecret('rzp_live_example_key_91ab');
    expect(masked.configured).toBe(true);
    expect(masked.masked).toBe('••••91ab');
    expect(masked.masked).not.toContain('rzp_live');
  });

  it('treats a masked round-trip as not a new secret', () => {
    expect(isMaskedInput('••••91ab')).toBe(true);
    expect(isMaskedInput('')).toBe(false);
    expect(isMaskedInput('new-secret-value')).toBe(false);
  });

  it('uses neutral defaults instead of a baked-in brand', () => {
    const brand = neutralBrand();
    expect(brand.companyName.toLowerCase()).not.toContain('etax');
    expect(brand.supportEmail).not.toContain('etax');
    expect(brand.bankAccounts).toEqual([]);
    expect(brand.primaryColor).toBe('#1E3A8A');
  });
});
