import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const variantSchema = z.object({
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL', 'Free']),
  color: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1),
  category: z.enum(['men', 'women', 'kids', 'accessories']),
  subcategory: z.string().trim().min(1),
  brand: z.string().trim().optional().nullable(),
  price: z.coerce.number().int().positive('Price must be positive'),
  mrp: z.coerce.number().int().positive(),
  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  images: z.array(z.object({ url: z.string().min(1), alt: z.string().optional() })).min(1, 'Add at least one image'),
  variants: z.array(variantSchema).min(1, 'Add at least one size/color variant'),
}).refine((p) => p.mrp >= p.price, { message: 'MRP cannot be less than price', path: ['mrp'] });

const addressSchema = z.object({
  name: z.string().trim().min(2, 'Receiver name is required'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().trim().min(3, 'Address line is required'),
  line2: z.string().trim().optional().default(''),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    qty: z.number().int().min(1).max(10),
  })).min(1, 'Cart is empty'),
  address: addressSchema,
  paymentMethod: z.enum(['cod', 'razorpay']),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  signature: z.string(),
});

export const bannerSchema = z.object({
  enabled: z.boolean(),
  text: z.string().trim().max(200, 'Keep the banner under 200 characters').default(''),
  linkText: z.string().trim().max(60).optional().nullable(),
  linkUrl: z.string().trim().max(500).optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
}).refine((b) => !b.enabled || b.text.length > 0, {
  message: 'Banner text is required when the banner is enabled',
  path: ['text'],
});

export const contactCardsSchema = z.object({
  cards: z.array(z.object({
    avatarUrl: z.string().trim().max(500).optional().nullable(),
    name: z.string().trim().min(1, 'Name is required').max(60),
    role: z.string().trim().max(60).default(''),
    bio: z.string().trim().max(300).default(''),
    links: z.array(z.object({
      label: z.string().trim().min(1, 'Link label is required').max(80),
      url: z.string().trim().min(1, 'Link URL is required').max(500),
    })).max(5).default([]),
  })).max(6, 'Maximum 6 contact cards'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  note: z.string().trim().optional(),
});
