import multer from 'multer';
import path from 'path';
import { ApiError } from './error.middleware.js';

// ─── Allowed file types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
];

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `File type "${file.mimetype}" is not allowed. Allowed: PDF, JPG, PNG, DOCX, XLSX, CSV`,
        'INVALID_FILE_TYPE'
      )
    );
  }
};

// ─── Memory storage (files stored in RAM, upload to R2/S3 afterwards) ─────────
const memoryStorage = multer.memoryStorage();

// ─── Upload configurations ────────────────────────────────────────────────────
/** General-purpose document upload (max 10 MB, single file) */
export const uploadSingle = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB
}).single('file');

/** Multi-file document upload (max 5 files × 10 MB each) */
export const uploadMultiple = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
}).array('files', 5);

/** Profile/avatar image upload (max 2 MB) */
export const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: (_req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Avatar must be JPEG, PNG, or WebP', 'INVALID_FILE_TYPE'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB
}).single('avatar');

/** Blog/ad image upload (max 5 MB) */
export const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: (_req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Image must be JPEG, PNG, WebP, or GIF', 'INVALID_FILE_TYPE'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('image');

// ─── Utility: sanitize filename ───────────────────────────────────────────────
export function sanitizeFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const name = path.basename(originalname, ext)
    .replace(/[^a-z0-9-_]/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return `${name}-${Date.now()}${ext}`;
}

export default uploadSingle;
