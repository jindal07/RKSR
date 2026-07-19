import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve('uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// When seeding a production DB (Vercel), upload generated SVGs to Blob storage;
// locally they are written to ./uploads and served by the dev server.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
async function storeImage(fileName, svg) {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`rks/${fileName}`, svg, {
      access: 'public',
      contentType: 'image/svg+xml',
    });
    return blob.url;
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), svg);
  return `/uploads/${fileName}`;
}

// Monochrome SVG placeholder (until real product photos are uploaded)
const TONES = [
  ['#E3E3E3', '#111111'], ['#C9C9C9', '#111111'], ['#303030', '#FAFAFA'],
  ['#F2F2F2', '#1A1A1A'], ['#8A8A8A', '#FAFAFA'], ['#1A1A1A', '#E3E3E3'],
];

async function makeImage(slug, name, i) {
  const [bg, fg] = TONES[i % TONES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${bg}" stop-opacity="0.75"/>
  </linearGradient></defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <g fill="none" stroke="${fg}" stroke-width="6" opacity="0.85">
    <path d="M220 200 L180 240 L140 380 L200 400 L210 340 L210 560 L390 560 L390 340 L400 400 L460 380 L420 240 L380 200 Q300 260 220 200 Z"/>
  </g>
  <text x="300" y="660" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${fg}">${name}</text>
  <text x="300" y="705" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${fg}" opacity="0.7">RamKishan Siyaram</text>
</svg>`;
  return storeImage(`seed-${slug}.svg`, svg);
}

const SIZES = ['S', 'M', 'L', 'XL'];
const P = (name, category, subcategory, price, mrp, colors, opts = {}) => ({
  name, category, subcategory, price, mrp, colors,
  featured: opts.featured || false,
  description: opts.description ||
    `${name} from RamKishan Siyaram — crafted from breathable, skin-friendly fabric with a comfortable everyday fit. Easy to wash, slow to fade, made to last.`,
});

const PRODUCTS = [
  P('Classic Cotton Kurta', 'men', 'kurtas', 899, 1299, ['Beige', 'White'], { featured: true }),
  P('Linen Casual Shirt', 'men', 'shirts', 1199, 1799, ['Sage', 'Sky Blue'], { featured: true }),
  P('Slim Fit Chinos', 'men', 'trousers', 1399, 2099, ['Khaki', 'Charcoal']),
  P('Nehru Jacket', 'men', 'jackets', 1899, 2799, ['Cream', 'Maroon'], { featured: true }),
  P('Everyday Polo T-Shirt', 'men', 't-shirts', 649, 999, ['Olive', 'Navy']),
  P('Banarasi Silk Saree', 'women', 'sarees', 3499, 5499, ['Gold', 'Rose'], { featured: true }),
  P('Chikankari Kurti', 'women', 'kurtis', 1099, 1699, ['Mint', 'White'], { featured: true }),
  P('Anarkali Suit Set', 'women', 'suits', 2699, 3999, ['Sage Green', 'Dusty Pink']),
  P('Cotton Palazzo Pants', 'women', 'palazzos', 799, 1199, ['Beige', 'Black']),
  P('Embroidered Dupatta', 'women', 'dupattas', 599, 899, ['Cream', 'Mustard']),
  P('Kids Festive Kurta Set', 'kids', 'ethnic-wear', 999, 1499, ['Yellow', 'Sage'], { featured: true }),
  P('Kids Cotton Frock', 'kids', 'frocks', 749, 1099, ['Peach', 'Mint']),
  P('Kids Denim Dungaree', 'kids', 'dungarees', 899, 1349, ['Indigo']),
  P('Handwoven Stole', 'accessories', 'stoles', 499, 799, ['Sage', 'Terracotta']),
  P('Leather Tan Belt', 'accessories', 'belts', 699, 1049, ['Tan', 'Brown']),
  P('Jute Tote Bag', 'accessories', 'bags', 449, 699, ['Natural'], { featured: true }),
];

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  // Admin — no public admin signup; this is the only way an admin exists.
  await prisma.user.upsert({
    where: { email: 'admin@ramkishansiyaram.in' },
    update: {},
    create: {
      name: 'Store Admin',
      email: 'admin@ramkishansiyaram.in',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      role: 'admin',
    },
  });
  console.log('Admin ready: admin@ramkishansiyaram.in / Admin@123');

  // Default people contact cards (only when none exist — admin manages them after that)
  if ((await prisma.contactCard.count()) === 0) {
    const AVATAR_TONES = [['#303030', '#FAFAFA'], ['#8A8A8A', '#FAFAFA'], ['#E3E3E3', '#1A1A1A']];
    const makeAvatar = (slug, initials, i) => {
      const [bg, fg] = AVATAR_TONES[i % AVATAR_TONES.length];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <circle cx="120" cy="120" r="120" fill="${bg}"/>
  <text x="120" y="146" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="${fg}">${initials}</text>
</svg>`;
      return storeImage(`avatar-${slug}.svg`, svg);
    };

    const people = [
      {
        name: 'Ramkishan Agarwal', role: 'Founder',
        bio: 'Four decades in textiles. Personally checks every new fabric that enters the store.',
        initials: 'RA',
        links: [
          { label: 'Email', url: 'mailto:ramkishan@ramkishansiyaram.in' },
          { label: 'Call', url: 'tel:+919876543210' },
        ],
      },
      {
        name: 'Siyaram Agarwal', role: 'Co-founder · Buying',
        bio: 'Travels across India to source kurtas, sarees and festive wear directly from weavers.',
        initials: 'SA',
        links: [
          { label: 'Email', url: 'mailto:siyaram@ramkishansiyaram.in' },
          { label: 'Instagram', url: 'https://instagram.com' },
        ],
      },
      {
        name: 'Priya Sharma', role: 'Customer Care Lead',
        bio: 'Your first call for orders, exchanges and sizing help. Replies within 24 hours.',
        initials: 'PS',
        links: [
          { label: 'Email', url: 'mailto:care@ramkishansiyaram.in' },
          { label: 'Call', url: 'tel:+919876543211' },
          { label: 'Twitter', url: 'https://twitter.com' },
        ],
      },
    ];
    for (let c = 0; c < people.length; c++) {
      const { initials, ...person } = people[c];
      await prisma.contactCard.create({
        data: {
          ...person,
          avatarUrl: await makeAvatar(person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), initials, c),
          sortOrder: c,
        },
      });
    }
    console.log('Seeded 3 people contact cards');
  }

  let i = 0;
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const url = await makeImage(slug, p.name, i++);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        brand: 'RamKishan Siyaram',
        price: p.price,
        mrp: p.mrp,
        isFeatured: p.featured,
        images: { create: [{ url, alt: p.name, sortOrder: 0 }] },
        variants: {
          create: p.colors.flatMap((color) =>
            SIZES.map((size, si) => ({
              size, color,
              sku: `${slug}-${size}-${slugify(color)}`.toUpperCase(),
              stock: 6 + ((i * 7 + si * 3) % 14),
            }))
          ),
        },
      },
    });
    console.log(`Seeded: ${p.name}`);
  }
  console.log(`Done — ${PRODUCTS.length} products.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
