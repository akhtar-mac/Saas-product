import { describe, expect, it } from 'vitest';
import { hashPassword, isBcryptHash, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('rejects plaintext equality', async () => {
    expect(isBcryptHash('secret')).toBe(false);
    expect(await verifyPassword('secret', 'secret')).toBe(false);
    expect(await verifyPassword(null, 'secret')).toBe(false);
    expect(await verifyPassword('', 'secret')).toBe(false);
  });

  it('round-trips a bcrypt hash', async () => {
    const hash = await hashPassword('Demo@12345');
    expect(isBcryptHash(hash)).toBe(true);
    expect(await verifyPassword(hash, 'Demo@12345')).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });
});
