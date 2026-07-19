import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { razorpay } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { makeOrderNumber } from '../utils/orderNumber.js';

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 49;

const orderInclude = {
  items: true,
  payment: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
};

// POST /api/orders — validates stock & prices server-side, creates the order
// in one ACID transaction with conditional stock decrements.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, paymentMethod } = req.body;

  if (paymentMethod === 'razorpay' && !env.razorpay.enabled) {
    throw new ApiError(400, 'Online payment is not available right now — please use Cash on Delivery');
  }

  const order = await prisma.$transaction(async (tx) => {
    // Load variants with product info; recompute all prices from the DB.
    const variantIds = items.map((i) => i.variantId);
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
    });
    const byId = new Map(variants.map((v) => [v.id, v]));

    let subtotal = 0;
    const orderItems = items.map(({ variantId, qty }) => {
      const v = byId.get(variantId);
      if (!v || !v.product.isActive) throw new ApiError(400, 'An item in your cart is no longer available');
      subtotal += v.product.price * qty;
      return {
        variantId,
        productSlug: v.product.slug,
        nameSnapshot: v.product.name,
        imageSnapshot: v.product.images[0]?.url || null,
        size: v.size,
        color: v.color,
        priceSnapshot: v.product.price,
        qty,
      };
    });

    // Conditional decrement — 0 rows affected means someone got there first.
    for (const { variantId, qty } of items) {
      const updated = await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (updated.count === 0) {
        const v = byId.get(variantId);
        throw new ApiError(409, `"${v?.product.name}" (${v?.size}) just went out of stock`);
      }
    }

    const shippingFee = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    const seq = (await tx.order.count()) + 1;

    return tx.order.create({
      data: {
        orderNumber: makeOrderNumber(seq),
        userId: req.user.id,
        shipName: address.name,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipLine2: address.line2 || null,
        shipCity: address.city,
        shipState: address.state,
        shipPincode: address.pincode,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        items: { create: orderItems },
        payment: { create: { method: paymentMethod, status: 'pending' } },
        statusHistory: { create: { status: 'placed', note: 'Order placed' } },
      },
      include: orderInclude,
    });
  }, { isolationLevel: 'Serializable' });

  // For online payment, create the Razorpay order (amount in paise).
  let razorpayOrder = null;
  if (paymentMethod === 'razorpay') {
    razorpayOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: 'INR',
      receipt: order.orderNumber,
    });
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });
  }

  res.status(201).json({
    order,
    razorpay: razorpayOrder && {
      keyId: env.razorpay.keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
});

// POST /api/payment/verify — verify Razorpay signature, mark paid.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

  const payment = await prisma.payment.findUnique({ where: { orderId }, include: { order: true } });
  if (!payment || payment.order.userId !== req.user.id) throw new ApiError(404, 'Order not found');
  if (payment.razorpayOrderId !== razorpayOrderId) throw new ApiError(400, 'Payment mismatch');

  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expected !== signature) {
    await prisma.payment.update({ where: { orderId }, data: { status: 'failed' } });
    throw new ApiError(400, 'Payment verification failed');
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: 'paid', razorpayPaymentId, signature },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        statusHistory: { create: { status: 'confirmed', note: 'Payment received' } },
      },
    }),
  ]);
  res.json({ message: 'Payment confirmed' });
});

// POST /api/payment/webhook — Razorpay fallback confirmation (raw body, HMAC verified).
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(req.body) // raw buffer
    .digest('hex');
  if (!signature || expected !== signature) return res.status(400).json({ message: 'Bad signature' });

  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') {
    const rzpOrderId = event.payload.payment.entity.order_id;
    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: rzpOrderId } });
    if (payment && payment.status !== 'paid') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'paid', razorpayPaymentId: event.payload.payment.entity.id },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'confirmed',
            statusHistory: { create: { status: 'confirmed', note: 'Payment received (webhook)' } },
          },
        }),
      ]);
    }
  }
  res.json({ received: true });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: orderInclude,
  });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { ...orderInclude, user: { select: { name: true, email: true } } },
  });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Forbidden');
  res.json({ order });
});
