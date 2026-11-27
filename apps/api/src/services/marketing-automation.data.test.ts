import { describe, expect, it } from 'vitest';
import { regenerateCopy, spendBlocked } from './marketing-automation.data.js';

describe('marketing automation guardrails', () => {
  it('blocks a draft that exceeds the hard daily cap', () => {
    expect(spendBlocked(2500, 2000)).toMatch(/hard cap/);
    expect(spendBlocked(800, 2000)).toBeNull();
  });

  it('rewrites copy locally without claiming a live model call', () => {
    const next = regenerateCopy('Original line.', 0);
    expect(next.startsWith('Original line.')).toBe(true);
    expect(next).not.toBe('Original line.');
  });
});
