import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

export const MAX_EMI_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/pjpeg', 'image/png', 'application/pdf']);

/**
 * Persistent storage outside build/version folders:
 * - On Hostinger: ~/domains/api.dnyanvedh.com/uploads-persistent/emi-proofs
 * - Locally on box: /workspace/uploads-persistent/emi-proofs (or EMI_PROOFS_DIR override)
 */
export function getEmiProofsDir(): string {
  if (process.env.EMI_PROOFS_DIR && process.env.EMI_PROOFS_DIR.trim()) {
    return path.resolve(process.env.EMI_PROOFS_DIR.trim());
  }
  const hostingerDomainDir = path.join(os.homedir(), 'domains', 'api.dnyanvedh.com');
  if (fs.existsSync(hostingerDomainDir)) {
    return path.join(hostingerDomainDir, 'uploads-persistent', 'emi-proofs');
  }
  const workspaceRoot = '/workspace';
  if (fs.existsSync(workspaceRoot)) {
    return path.join(workspaceRoot, 'uploads-persistent', 'emi-proofs');
  }
  return path.resolve(process.cwd(), 'uploads-persistent', 'emi-proofs');
}

/**
 * Read-only fallback directories for historical screenshots created by Laravel
 * before dnyanvedh.com EMI collection was enabled. Never written to.
 */
export function getLegacyPaymentProofsDirs(): string[] {
  const dirs: string[] = [];
  if (process.env.LEGACY_PAYMENT_PROOFS_DIR && process.env.LEGACY_PAYMENT_PROOFS_DIR.trim()) {
    dirs.push(path.resolve(process.env.LEGACY_PAYMENT_PROOFS_DIR.trim()));
  }
  dirs.push(path.join(os.homedir(), 'domains', 'etaxwala.com', 'public_html', 'public', 'payment'));
  dirs.push('/workspace/etax-old/code/public/payment');
  return dirs.filter((d) => fs.existsSync(d));
}

export const emiProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_EMI_PROOF_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
      return cb(
        new Error('Invalid file type. Only JPG, PNG, or PDF files (up to 5 MB) are allowed.')
      );
    }
    cb(null, true);
  },
});

export function validateProofMagicBytes(
  buffer: Buffer,
  ext: string
): { valid: boolean; reason?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false, reason: 'Uploaded proof file is empty or corrupted.' };
  }
  const normalizedExt = ext.toLowerCase();
  if (normalizedExt === '.jpg' || normalizedExt === '.jpeg') {
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    return isJpeg
      ? { valid: true }
      : { valid: false, reason: 'File contents do not match a valid JPEG image.' };
  }
  if (normalizedExt === '.png') {
    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;
    return isPng
      ? { valid: true }
      : { valid: false, reason: 'File contents do not match a valid PNG image.' };
  }
  if (normalizedExt === '.pdf') {
    const header = buffer.subarray(0, 5).toString('ascii');
    return header === '%PDF-'
      ? { valid: true }
      : { valid: false, reason: 'File contents do not match a valid PDF document.' };
  }
  return { valid: false, reason: 'Unsupported file format.' };
}

export function saveEmiProofToDisk(
  file: Express.Multer.File,
  emiId: number
): {
  filename: string;
  fullPath: string;
} {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const err: any = new Error('Invalid file extension.');
    err.statusCode = 400;
    throw err;
  }
  const check = validateProofMagicBytes(file.buffer, ext);
  if (!check.valid) {
    const err: any = new Error(check.reason || 'Invalid proof file contents.');
    err.statusCode = 400;
    throw err;
  }

  const dir = getEmiProofsDir();
  fs.mkdirSync(dir, { recursive: true });

  const safeExt = ext === '.jpeg' ? '.jpg' : ext;
  const filename = `emi-${emiId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, file.buffer, { mode: 0o640 });
  return { filename, fullPath };
}

export function sanitizeProofFilename(raw: string): string | null {
  const trimmed = String(raw || '').trim();
  if (!trimmed || trimmed.length > 250) return null;
  if (
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    trimmed.includes('\0')
  ) {
    return null;
  }
  const base = path.basename(trimmed);
  if (base !== trimmed) return null;
  if (!/^[a-zA-Z0-9._\-\s()]+$/.test(base)) return null;
  return base;
}

export function resolveProofFilePath(rawFilename: string): {
  fullPath: string;
  contentType: string;
  filename: string;
} | null {
  const safeName = sanitizeProofFilename(rawFilename);
  if (!safeName) return null;

  const candidates = [getEmiProofsDir(), ...getLegacyPaymentProofsDirs()];
  for (const dir of candidates) {
    const resolvedDir = path.resolve(dir);
    const fullPath = path.resolve(resolvedDir, safeName);
    if (!fullPath.startsWith(resolvedDir + path.sep)) continue;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(safeName).toLowerCase();
      const contentType =
        ext === '.pdf'
          ? 'application/pdf'
          : ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : 'image/jpeg';
      return { fullPath, contentType, filename: safeName };
    }
  }
  return null;
}
