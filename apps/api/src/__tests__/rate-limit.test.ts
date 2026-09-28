import { describe, it, expect } from 'vitest';
import { RateLimiterMemory } from 'rate-limiter-flexible';

describe('API Security & Rate Limiting Engine', () => {
  it('should allow requests within threshold', async () => {
    const limiter = new RateLimiterMemory({ points: 3, duration: 1 });
    const res1 = await limiter.consume('test-ip-1');
    expect(res1.remainingPoints).toBe(2);

    const res2 = await limiter.consume('test-ip-1');
    expect(res2.remainingPoints).toBe(1);
  });

  it('should block requests exceeding points', async () => {
    const limiter = new RateLimiterMemory({ points: 2, duration: 1, blockDuration: 10 });
    await limiter.consume('test-ip-2');
    await limiter.consume('test-ip-2');

    let blocked = false;
    try {
      await limiter.consume('test-ip-2');
    } catch {
      blocked = true;
    }
    expect(blocked).toBe(true);
  });
});
