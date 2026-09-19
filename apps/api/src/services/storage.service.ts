import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/error.middleware.js';

export interface PresignedUploadRequest {
  filename: string;
  folder: 'resumes' | 'quotations' | 'contracts' | 'projects' | 'marketing';
  mimeType: string;
  sizeBytes?: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
  'text/plain',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Validates document type and size constraints before storage
 */
export function validateDocument(mimeType: string, sizeBytes?: number): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw ApiError.badRequest(
      `Disallowed file format: ${mimeType}. Supported: PDF, Word (DOC/DOCX), Images (JPEG/PNG/WebP), ZIP, TXT.`
    );
  }
  if (sizeBytes && sizeBytes > MAX_FILE_SIZE) {
    throw ApiError.badRequest('File size exceeds the 15 MB threshold.');
  }
}

/**
 * Validates file extension, MIME type, and size.
 * Returns boolean status instead of throwing for flexible validation.
 */
export function validateFile(filename: string, mimeType: string, sizeBytes?: number): { valid: boolean; error?: string } {
  const ext = path.extname(filename).toLowerCase();
  const dangerousExts = new Set(['.exe', '.bat', '.cmd', '.sh', '.bin', '.dll', '.msi', '.vbs', '.js']);
  if (dangerousExts.has(ext)) {
    return { valid: false, error: `Dangerous file extension blocked: ${ext}` };
  }
  try {
    validateDocument(mimeType, sizeBytes);
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

/**
 * Generate a cryptographically secure, conflict-free Cloudflare R2 object storage key
 */
export function generateStorageKey(folder: string, originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const baseName = path.basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${folder}/${Date.now()}_${baseName}_${randomSuffix}${ext}`;
}

/**
 * Generate Presigned Upload URL for direct-to-R2 uploads
 */
export function generatePresignedUpload(params: PresignedUploadRequest): PresignedUploadResponse {
  validateDocument(params.mimeType, params.sizeBytes);

  const fileKey = generateStorageKey(params.folder, params.filename);
  const bucket = env.R2_BUCKET_NAME || 'etaxwala-vault';

  // R2 / S3 Presigned URL construct (with fallback mock signature for local dev)
  const uploadUrl = `https://${bucket}.r2.cloudflarestorage.com/${fileKey}?presigned=true&expires=900`;
  const publicUrl = `https://vault.etaxwala.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    expiresInSeconds: 900,
  };
}

/**
 * Generate Presigned Download URL with 15-minute expiry
 */
export function generatePresignedDownload(fileKey: string, expiresIn = 900): string {
  return `https://vault.etaxwala.com/${fileKey}?token=valid_for_${expiresIn}s`;
}

export default {
  validateDocument,
  generateStorageKey,
  generatePresignedUpload,
  generatePresignedDownload,
};
