import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from master secret
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || env.JWT_SECRET || 'etaxwala-fallback-master-key-32b';
  return crypto.scryptSync(secret, 'etaxwala-salt-v2', 32);
}

export interface EncryptedPayload {
  encryptedData: string; // hex
  iv: string;            // hex
  authTag: string;       // hex
}

/**
 * Encrypt a sensitive secret (e.g. OAuth refresh token, integration webhook secret)
 */
export function encryptSecret(plainText: string): EncryptedPayload {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt a sensitive secret
 */
export function decryptSecret(encryptedData: string, ivHex: string, authTagHex: string): string {
  try {
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    throw new Error(`Decryption failed: cryptographic authentication tag mismatch or corrupted ciphertext.`);
  }
}

export default {
  encryptSecret,
  decryptSecret,
};
