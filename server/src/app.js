import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { razorpayWebhook } from './controllers/order.controller.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Behind Vercel/Render proxies — needed for correct client IPs (rate limiting)
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));

// Webhook needs the RAW body for HMAC verification — mount before express.json
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }));
app.use('/api', router);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);
