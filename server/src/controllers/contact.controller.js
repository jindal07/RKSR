import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/contact-cards — public
export const getContactCards = asyncHandler(async (_req, res) => {
  const cards = await prisma.contactCard.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ cards });
});

// PUT /api/admin/contact-cards — replaces the whole set (order = array order).
// Lets the admin add, remove, edit, and reorder cards in one save.
export const replaceContactCards = asyncHandler(async (req, res) => {
  const { cards } = req.body;
  const saved = await prisma.$transaction(async (tx) => {
    await tx.contactCard.deleteMany({});
    for (let i = 0; i < cards.length; i++) {
      await tx.contactCard.create({ data: { ...cards[i], sortOrder: i } });
    }
    return tx.contactCard.findMany({ orderBy: { sortOrder: 'asc' } });
  });
  res.json({ cards: saved });
});
