# RamKishan Siyaram — E-Commerce Website

Full-stack clothing store: React + Vite storefront with a glassmorphism design, Node.js/Express API, PostgreSQL via Prisma.

- **Plan / system design:** [PLAN.md](PLAN.md)
- **Design system:** [DESIGN.md](DESIGN.md)

## Run it (3 terminals)

```bash
# 1 — database (self-contained dev Postgres on port 5433, no install needed)
cd server && npm run db

# 2 — API server  → http://localhost:5000
cd server && npm run dev

# 3 — storefront  → http://localhost:5173
cd client && npm run dev
```

First-time setup only:

```bash
cd server && npm install
cp .env.example .env        # then adjust values if needed (defaults work for dev)
npx prisma migrate dev && npm run seed
cd ../client && npm install
```

All environment variables are documented in [server/.env.example](server/.env.example).

## Logins

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ramkishansiyaram.in` | `Admin@123` |
| Customer | register from the site | — |

Admin panel lives at `/admin` (only visible to the admin account).

## What's inside

| Area | Details |
|---|---|
| Storefront | Home (hero, categories, featured), product list (filters/search/sort/pagination), product detail (variants, size chips), cart, checkout, order tracking |
| Payments | Cash on Delivery works out of the box. For Razorpay, set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in `server/.env` — the "Pay online" option enables automatically |
| Admin | Dashboard (revenue, sales chart, low stock, top products), product CRUD with image upload + variant editor, order status management, customers, announcement banner, contact cards |
| Design | Monochrome black/white theme, glass surfaces, animated ShapeGrid background, pill navbar, light + dark mode, responsive (mobile bottom-sheets / laptop sidebars) |
| DB | PostgreSQL (embedded for dev; point `DATABASE_URL` at any Postgres for production), ACID checkout with conditional stock decrement |

## Deploy to Vercel (frontend + backend on one project)

The repo is pre-wired for an all-Vercel deployment: the Vite app builds as the
static site, and the whole Express API runs as a serverless function
([api/index.js](api/index.js), routed via [vercel.json](vercel.json)).
Uploads automatically switch from local disk to **Vercel Blob** when
`BLOB_READ_WRITE_TOKEN` is present.

**One-time setup**

1. Push this folder to a GitHub repo, then *Import Project* on [vercel.com](https://vercel.com)
   (keep the repo root as the project root — `vercel.json` handles the rest).
2. In the Vercel dashboard add the **Neon Postgres** integration (Storage → Create → Neon)
   — it injects `DATABASE_URL`. Use the **pooled** connection string.
3. Add a **Blob store** (Storage → Create → Blob) — it injects `BLOB_READ_WRITE_TOKEN`.
4. Add the remaining environment variables:
   `JWT_SECRET`, `JWT_REFRESH_SECRET` (fresh random values),
   `CLIENT_URL` (your production URL, e.g. `https://yourstore.vercel.app`),
   and optionally `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`.
5. From your machine, run the schema + seed against production
   (use Neon's **direct** connection string here):

   ```bash
   cd server
   set DATABASE_URL=postgresql://...neon-direct...
   npx prisma migrate deploy
   set BLOB_READ_WRITE_TOKEN=vercel_blob_...   # so seed images upload to Blob
   node prisma/seed.js
   ```

6. Deploy. For Razorpay, point the webhook at `https://yourstore.vercel.app/api/payment/webhook`.

**Notes**

- The API is same-origin (`/api/*`), so cookies and CORS need no extra config.
- The root `package.json` exists for Vercel: it installs the server deps for the
  function and runs `prisma generate` (with the `rhel-openssl-3.0.x` engine) at build.
- Alternative split (frontend Vercel + server on Render/Railway) also works —
  keep the server as-is, run `npx prisma migrate deploy`, and set `CLIENT_URL` + CORS accordingly.
