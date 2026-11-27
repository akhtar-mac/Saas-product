import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CUSTOMER_API_URL: process.env.CUSTOMER_API_URL || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'crm-documents',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'support@example.com',
  COMPANY_LEGAL_NAME: process.env.COMPANY_LEGAL_NAME || 'Your Company',
  PRIMARY_UPI_ID: process.env.PRIMARY_UPI_ID || '',
  // Old desktop-client endpoints (/api/log-event, /api/upload-screenshot, ...).
  // Off by default: the installed client keeps posting to etaxwala.com (same DB).
  DESKTRACK_CLIENT_API_ENABLED: process.env.DESKTRACK_CLIENT_API_ENABLED === 'true',
};
// Production must never run on the development JWT secret.
if (env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || env.JWT_SECRET === 'dev-secret')) {
  throw new Error('JWT_SECRET must be set in production.');
}
