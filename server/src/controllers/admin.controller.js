import { prisma } from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const LOW_STOCK_THRESHOLD = 5;

export const stats = asyncHandler(async (_req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const paidOrders = { NOT: { status: 'cancelled' } };

  const [revenue, ordersToday, ordersThisMonth, pendingOrders, customers, lowStock, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: paidOrders, _sum: { total: true }, _count: true }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { status: { in: ['placed', 'confirmed'] } } }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.productVariant.findMany({
        where: { stock: { lt: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, total: true, status: true },
      }),
    ]);

  // Sales by day for the chart (last 30 days)
  const salesByDay = {};
  for (const o of recentOrders) {
    if (o.status === 'cancelled') continue;
    const day = o.createdAt.toISOString().slice(0, 10);
    salesByDay[day] = (salesByDay[day] || 0) + o.total;
  }

  // Top products by units sold
  const topItems = await prisma.orderItem.groupBy({
    by: ['nameSnapshot', 'productSlug'],
    _sum: { qty: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 5,
  });

  res.json({
    revenue: revenue._sum.total || 0,
    totalOrders: revenue._count,
    ordersToday,
    ordersThisMonth,
    pendingOrders,
    customers,
    lowStock,
    salesByDay,
    topProducts: topItems.map((t) => ({ name: t.nameSnapshot, slug: t.productSlug, unitsSold: t._sum.qty })),
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { status, page = 1 } = req.query;
  const where = status ? { status } : {};
  const take = 20;
  const currentPage = Math.max(Number(page) || 1, 1);
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * take,
      take,
      include: {
        items: true,
        payment: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);
  res.json({ orders, pagination: { page: currentPage, total, totalPages: Math.ceil(total / take) } });
});

const FLOW = ['placed', 'confirmed', 'shipped', 'delivered'];

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status === 'delivered' || order.status === 'cancelled') {
    throw new ApiError(400, `Order is already ${order.status}`);
  }
  if (status !== 'cancelled' && FLOW.indexOf(status) <= FLOW.indexOf(order.status)) {
    throw new ApiError(400, 'Status can only move forward');
  }

  const ops = [
    prisma.order.update({
      where: { id: order.id },
      data: { status, statusHistory: { create: { status, note } } },
      include: { items: true, payment: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    }),
  ];
  // COD orders count as paid on delivery; cancelled orders restock.
  if (status === 'delivered') {
    ops.push(prisma.payment.updateMany({ where: { orderId: order.id, status: 'pending' }, data: { status: 'paid' } }));
  }
  if (status === 'cancelled') {
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      if (item.variantId) {
        ops.push(prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        }));
      }
    }
  }
  const [updated] = await prisma.$transaction(ops);
  res.json({ order: updated });
});

export const listCustomers = asyncHandler(async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'customer' },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true,
      orders: { select: { total: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    customers: customers.map(({ orders, ...c }) => ({
      ...c,
      orderCount: orders.length,
      totalSpent: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    })),
  });
});

// Admin product list includes inactive products and skips pagination caps
export const adminListProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {};
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
  });
  res.json({ products });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image received');
  // Serverless: the file arrived in memory — push it to Vercel Blob
  if (req.file.buffer) {
    const { put } = await import('@vercel/blob');
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]+/g, '-');
    const blob = await put(`rks/${Date.now()}-${safeName}`, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });
    return res.status(201).json({ url: blob.url });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
