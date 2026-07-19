import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  registerSchema, loginSchema, productSchema,
  createOrderSchema, verifyPaymentSchema, updateStatusSchema, bannerSchema, contactCardsSchema,
} from '../validators/schemas.js';
import * as auth from '../controllers/auth.controller.js';
import * as products from '../controllers/product.controller.js';
import * as orders from '../controllers/order.controller.js';
import * as admin from '../controllers/admin.controller.js';
import * as banner from '../controllers/banner.controller.js';
import * as contact from '../controllers/contact.controller.js';
import { env } from '../config/env.js';

export const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true });

// public config for the client (e.g. whether online payment is available)
router.get('/config', (_req, res) => {
  res.json({ razorpayEnabled: env.razorpay.enabled, freeShippingAbove: 999, shippingFee: 49 });
});

// auth
router.post('/auth/register', authLimiter, validate(registerSchema), auth.register);
router.post('/auth/login', authLimiter, validate(loginSchema), auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.me);

// announcement banner + contact cards
router.get('/banner', banner.getBanner);
router.get('/contact-cards', contact.getContactCards);

// products (public)
router.get('/products', products.listProducts);
router.get('/products/:slug', products.getProductBySlug);

// orders + payment (customer)
router.post('/orders', authenticate, validate(createOrderSchema), orders.createOrder);
router.get('/orders/my', authenticate, orders.myOrders);
router.get('/orders/:id', authenticate, orders.getOrder);
router.post('/payment/verify', authenticate, validate(verifyPaymentSchema), orders.verifyPayment);

// admin
const adminOnly = [authenticate, authorize('admin')];
router.get('/admin/stats', adminOnly, admin.stats);
router.get('/admin/products', adminOnly, admin.adminListProducts);
router.get('/admin/products/:id', adminOnly, admin.getAdminProduct);
router.post('/admin/products', adminOnly, validate(productSchema), products.createProduct);
router.put('/admin/products/:id', adminOnly, validate(productSchema), products.updateProduct);
router.delete('/admin/products/:id', adminOnly, products.deleteProduct);
router.get('/admin/orders', adminOnly, admin.listOrders);
router.patch('/admin/orders/:id/status', adminOnly, validate(updateStatusSchema), admin.updateOrderStatus);
router.get('/admin/customers', adminOnly, admin.listCustomers);
router.put('/admin/banner', adminOnly, validate(bannerSchema), banner.updateBanner);
router.put('/admin/contact-cards', adminOnly, validate(contactCardsSchema), contact.replaceContactCards);
router.post('/admin/upload', adminOnly, upload.single('image'), admin.uploadImage);
