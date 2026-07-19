import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

// Serverless (Vercel Blob): keep the file in memory and let the controller
// push it to Blob storage. Local dev: write to ./uploads and serve statically.
let storage;
if (env.blobEnabled) {
  storage = multer.memoryStorage();
} else {
  const UPLOAD_DIR = path.resolve('uploads');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new Error('Only JPG, PNG, WEBP or SVG images are allowed'));
    cb(null, true);
  },
});
