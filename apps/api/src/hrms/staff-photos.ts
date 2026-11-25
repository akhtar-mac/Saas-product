/**
 * Staff profile photos.
 *  - New uploads: <persistent>/staff-photos (outside build folders), JPG/PNG/WEBP,
 *    max 2 MB, file contents checked (magic bytes), random file names.
 *  - Old photos (Laravel `profile` table) are read-only from the old public/profiles.
 *  - Files are only streamed to signed-in staff (no public URL).
 */
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MIME = new Set(['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp']);

export function getStaffPhotosDir(): string {
  if (process.env.STAFF_PHOTOS_DIR?.trim())
    return path.resolve(process.env.STAFF_PHOTOS_DIR.trim());
  const hostinger = path.join(os.homedir(), 'domains', 'api.dnyanvedh.com');
  if (fs.existsSync(hostinger)) return path.join(hostinger, 'uploads-persistent', 'staff-photos');
  if (fs.existsSync('/workspace'))
    return path.join('/workspace', 'uploads-persistent', 'staff-photos');
  return path.resolve(process.cwd(), 'uploads-persistent', 'staff-photos');
}

/** Read-only folders holding photos uploaded through the old app. Never written. */
export function getLegacyPhotoDirs(): string[] {
  const dirs: string[] = [];
  if (process.env.LEGACY_PROFILE_PHOTOS_DIR?.trim())
    dirs.push(path.resolve(process.env.LEGACY_PROFILE_PHOTOS_DIR.trim()));
  dirs.push(
    path.join(os.homedir(), 'domains', 'etaxwala.com', 'public_html', 'public', 'profiles')
  );
  dirs.push('/workspace/etax-old/code/public/profiles');
  return dirs.filter((d) => fs.existsSync(d));
}

export const staffPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (!EXT.has(ext) || !MIME.has(mime)) {
      return cb(new Error('Photo must be a JPG, PNG or WEBP image (up to 2 MB).'));
    }
    cb(null, true);
  },
});

/** Which image type the bytes really are (null = not an allowed image). */
export function sniffImage(buf: Buffer | undefined | null): '.jpg' | '.png' | '.webp' | null {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  )
    return '.png';
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return '.webp';
  return null;
}

export function saveStaffPhoto(
  file: Express.Multer.File | undefined,
  owner: { source: string; id: number }
): string {
  const fail = (m: string) => Object.assign(new Error(m), { statusCode: 400 });
  if (!file) throw fail('Please choose a photo to upload.');
  const ext = path.extname(file.originalname || '').toLowerCase();
  const real = sniffImage(file.buffer);
  if (!real) throw fail('This file is not a valid JPG, PNG or WEBP image.');
  const claimed = ext === '.jpeg' ? '.jpg' : ext;
  if (claimed !== real) throw fail('The file contents do not match its extension.');
  const dir = getStaffPhotosDir();
  fs.mkdirSync(dir, { recursive: true });
  const tag = owner.source === 'users' ? 'u' : 's';
  const filename = `sp-${tag}${owner.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${real}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer, { mode: 0o640 });
  return filename;
}

export function safePhotoName(raw: string): string | null {
  const t = String(raw || '').trim();
  if (!t || t.length > 200 || t !== path.basename(t) || t.includes('..')) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(t)) return null;
  const ext = path.extname(t).toLowerCase();
  return EXT.has(ext) ? t : null;
}

export function resolveStaffPhoto(raw: string): { fullPath: string; contentType: string } | null {
  const name = safePhotoName(raw);
  if (!name) return null;
  // New uploads only from the new folder; old names only from the old folders.
  const dirs = name.startsWith('sp-') ? [getStaffPhotosDir()] : getLegacyPhotoDirs();
  for (const d of dirs) {
    const root = path.resolve(d);
    const full = path.resolve(root, name);
    if (!full.startsWith(root + path.sep)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      const ext = path.extname(name).toLowerCase();
      const contentType =
        ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { fullPath: full, contentType };
    }
  }
  return null;
}
