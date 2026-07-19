import { prisma } from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const PAGE_SIZE = 12;

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' } },
  variants: true,
};

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const listProducts = asyncHandler(async (req, res) => {
  const {
    category, subcategory, size, search,
    minPrice, maxPrice, sort = 'newest',
    page = 1, limit = PAGE_SIZE, featured,
  } = req.query;

  const where = { isActive: true };
  if (category) where.category = category;
  if (subcategory) where.subcategory = { equals: subcategory, mode: 'insensitive' };
  if (featured === 'true') where.isFeatured = true;
  if (size) where.variants = { some: { size, stock: { gt: 0 } } };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { subcategory: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy = {
    newest: { createdAt: 'desc' },
    'price-asc': { price: 'asc' },
    'price-desc': { price: 'desc' },
    popular: { ratingsCount: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const take = Math.min(Number(limit) || PAGE_SIZE, 48);
  const currentPage = Math.max(Number(page) || 1, 1);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, orderBy, take,
      skip: (currentPage - 1) * take,
      include: productInclude,
    }),
  ]);

  res.json({
    products,
    pagination: { page: currentPage, pageSize: take, total, totalPages: Math.ceil(total / take) },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: productInclude,
  });
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

// ---------- admin ----------

async function uniqueSlug(name, excludeId) {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

export const createProduct = asyncHandler(async (req, res) => {
  const { images, variants, ...data } = req.body;
  const slug = await uniqueSlug(data.name);
  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
      variants: {
        create: variants.map((v) => ({ ...v, sku: `${slug}-${v.size}-${slugify(v.color)}`.toUpperCase() })),
      },
    },
    include: productInclude,
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!existing) throw new ApiError(404, 'Product not found');

  const { images, variants, ...data } = req.body;
  const slug = data.name !== existing.name ? await uniqueSlug(data.name, id) : existing.slug;

  // Replace images wholesale; upsert variants by (size,color) to preserve
  // stock rows referenced by past order items.
  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    const keep = new Set(variants.map((v) => `${v.size}|${v.color.toLowerCase()}`));
    await tx.productVariant.deleteMany({
      where: {
        productId: id,
        NOT: variants.map((v) => ({ size: v.size, color: { equals: v.color, mode: 'insensitive' } })),
      },
    });
    for (const v of variants) {
      await tx.productVariant.upsert({
        where: { productId_size_color: { productId: id, size: v.size, color: v.color } },
        update: { stock: v.stock },
        create: { productId: id, ...v, sku: `${slug}-${v.size}-${slugify(v.color)}-${Date.now() % 10000}`.toUpperCase() },
      });
    }
    return tx.product.update({
      where: { id },
      data: {
        ...data,
        slug,
        images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
      },
      include: productInclude,
    });
  });
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  // Soft delete — keeps order history rendering
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Product removed from store' });
});
