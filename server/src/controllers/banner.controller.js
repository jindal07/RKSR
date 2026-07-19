import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const DEFAULTS = { enabled: false, text: '', linkText: null, linkUrl: null, endsAt: null };

// GET /api/banner — public; storefront reads this on load
export const getBanner = asyncHandler(async (_req, res) => {
  const banner = (await prisma.banner.findUnique({ where: { id: 1 } })) || DEFAULTS;
  res.json({ banner });
});

// PUT /api/admin/banner — admin edits content + toggles on/off
export const updateBanner = asyncHandler(async (req, res) => {
  const { enabled, text, linkText, linkUrl, endsAt } = req.body;
  const data = {
    enabled,
    text,
    linkText: linkText || null,
    linkUrl: linkUrl || null,
    endsAt: endsAt || null,
  };
  const banner = await prisma.banner.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  res.json({ banner });
});
