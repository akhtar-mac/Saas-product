import bcrypt from 'bcrypt';

/** bcrypt hashes are 60 characters and start with $2a$, $2b$, or $2y$. */
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isBcryptHash(value: unknown): value is string {
  return typeof value === 'string' && BCRYPT_RE.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/**
 * Verify a password. Only bcrypt hashes are accepted.
 * Legacy plaintext columns never match, even when the characters are identical.
 */
export async function verifyPassword(stored: unknown, plain: string): Promise<boolean> {
  if (!plain || !isBcryptHash(stored)) return false;
  return bcrypt.compare(plain, stored).catch(() => false);
}
