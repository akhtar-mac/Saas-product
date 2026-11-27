import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  getAdminSettings,
  getPublicBrand,
  integrationStatus,
  updateSettings,
} from '../services/tenant-settings.service.js';

const publicRouter = Router();
const adminRouter = Router();

publicRouter.get('/branding', async (_req, res) => {
  const brand = await getPublicBrand();
  res.json({ success: true, data: brand });
});

adminRouter.use(verifyJWT);

adminRouter.get('/', async (_req, res) => {
  const data = await getAdminSettings();
  res.json({ success: true, data });
});

adminRouter.put('/', async (req, res) => {
  const data = await updateSettings(req.body || {});
  res.json({ success: true, message: 'Settings saved', data });
});

adminRouter.post('/test', async (req, res) => {
  const channel = String(req.body?.channel || req.query.channel || '');
  const data = await integrationStatus(channel);
  res.json({ success: true, data });
});

const uploadDir = path.join(process.cwd(), 'public', 'branding');
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowed = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico']);
      cb(null, `${file.fieldname}${allowed.has(ext) ? ext : '.png'}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
});

adminRouter.post('/logo', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'Upload a PNG, JPG, SVG, or WEBP logo.' });
    return;
  }
  const field = req.file.fieldname === 'favicon' ? 'faviconUrl' : 'logoUrl';
  const url = `/branding/${req.file.filename}`;
  const data = await updateSettings({ [field]: url });
  res.json({ success: true, data, url });
});

export default { publicRouter, adminRouter };
