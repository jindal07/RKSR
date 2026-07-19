import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowDown, Truck, BadgeCheck, RefreshCcw } from 'lucide-react';
import { api } from '../services/api.js';
import { CATEGORIES } from '../utils/format.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import storefrontImg from '../assets/storefront.webp';

const CATEGORY_ART = {
  men: 'seed-classic-cotton-kurta.svg',
  women: 'seed-banarasi-silk-saree.svg',
  kids: 'seed-kids-festive-kurta-set.svg',
  accessories: 'seed-jute-tote-bag.svg',
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function Marquee({ children, reverse = false, className = '', duration = 28 }) {
  const reduced = useReducedMotion();
  // Reduced motion: no scroll means clipped content — wrap statically instead.
  if (reduced) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-y-2 ${className}`}>
        {children}
      </div>
    );
  }
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {[0, 1].map((i) => (
          <span key={i} className="inline-flex shrink-0 items-center" aria-hidden={i === 1}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroTitle() {
  const lines = [['Wear', 'the'], ['classics.']];
  return (
    <h1 className="heading text-[14vw] leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
      {lines.map((words, li) => (
        <span key={li} className="block overflow-hidden pb-1">
          {words.flatMap((word, wi) => [
            wi > 0 ? ' ' : null,
            <motion.span
              key={word}
              className="inline-block"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + (li * 2 + wi) * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ])}
        </span>
      ))}
    </h1>
  );
}

const MARQUEE_ITEMS = ['Free shipping above ₹999', 'Cash on Delivery', 'New arrivals weekly', '7-day easy exchange'];

const COMPANY_LOGOS = ['slack', 'framer', 'netflix', 'google', 'linkedin', 'instagram', 'facebook'];

export default function HomePage() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api.get('/products', { params: { featured: true, limit: 8 } })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="space-y-14 sm:space-y-20 lg:space-y-28">
      {/* hero — open composition over the animated grid */}
      <section className="flex flex-col justify-center py-4 text-center sm:py-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted sm:text-xs"
        >
          RamKishan Siyaram · est. for generations
        </motion.p>
        <div className="mt-6">
          <HeroTitle />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mx-auto mt-5 max-w-xl px-2 text-sm text-muted sm:mt-6 sm:text-base"
        >
          Kurtas, sarees, everyday wear and festive best — thoughtfully made
          for men, women and kids.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:mt-9 sm:flex-row sm:gap-3"
        >
          <Link to="/products" className="btn-primary w-full sm:w-auto sm:px-9">
            Shop all products <ArrowRight size={16} />
          </Link>
          <Link to="/products?category=women" className="btn-secondary w-full sm:w-auto">
            Explore women's
          </Link>
        </motion.div>
        {/* the real storefront — full colour, anchored to the top so the signboard stays visible */}
        <motion.figure
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative mt-8 overflow-hidden rounded-(--radius-card) p-1.5 sm:mt-12 sm:p-2"
        >
          <img
            src={storefrontImg}
            alt="The RamKishan Siyaram showroom, decorated with marigold garlands"
            className="h-auto w-full rounded-[calc(var(--radius-card)-0.5rem)]"
          />
          <figcaption className="glass-strong absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-medium sm:bottom-5 sm:left-5 sm:px-4 sm:py-1.5 sm:text-sm">
            Our showroom — a complete family store
          </figcaption>
        </motion.figure>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-10 flex justify-center"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-muted"
          >
            <ArrowDown size={16} strokeWidth={1.5} />
          </motion.span>
        </motion.div>
      </section>

      {/* brand logos */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-muted">
          Trusted by leading brands
        </p>
        <div className="relative mx-auto mt-6 max-w-5xl select-none sm:mt-8">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-(--bg) to-transparent sm:w-20" />
          <Marquee duration={18}>
            {COMPANY_LOGOS.map((company) => (
              <img
                key={company}
                src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                alt={company}
                draggable={false}
                loading="lazy"
                className="mx-6 h-5 w-auto shrink-0 brightness-0 opacity-40 sm:mx-8 sm:h-7 dark:invert"
              />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-(--bg) to-transparent md:w-40" />
        </div>
      </motion.section>

      {/* marquee strip */}
      <section className="glass-strong -mx-4 rounded-none border-x-0 py-3 sm:-mx-6 lg:-mx-8">
        <Marquee>
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} className="mx-6 inline-flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.25em]">
              {item} <span className="text-muted">✦</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* categories */}
      <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <motion.div variants={rise} className="flex items-end justify-between">
          <h2 className="heading text-2xl sm:text-3xl lg:text-4xl">Shop by category</h2>
          <Link to="/products" className="text-xs text-muted hover:text-body sm:text-sm">View all →</Link>
        </motion.div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <motion.div key={c.key} variants={rise}>
              <Link
                to={`/products?category=${c.key}`}
                className="glass glass-hover group relative block overflow-hidden rounded-(--radius-card)"
              >
                <img
                  src={`/uploads/${CATEGORY_ART[c.key]}`}
                  alt={c.label}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="glass-strong heading absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-lg">
                  0{i + 1}
                </span>
                <span className="glass-strong absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-medium sm:bottom-3 sm:px-5 sm:py-1.5 sm:text-sm">
                  {c.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* featured */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between"
        >
          <h2 className="heading text-2xl sm:text-3xl lg:text-4xl">Featured picks</h2>
          <Link to="/products" className="text-xs text-muted hover:text-body sm:text-sm">View all →</Link>
        </motion.div>
        {featured === null ? (
          <Spinner full />
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {featured.map((p) => (
              <motion.div key={p.id} variants={rise}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* outlined type marquee — pure motion-graphics moment */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8">
        <Marquee reverse>
          <span className="heading mx-6 text-5xl uppercase text-outline sm:mx-8 sm:text-8xl">
            RamKishan Siyaram — clothing for everyone —&nbsp;
          </span>
        </Marquee>
      </section>

      {/* promo strip */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="glass grid gap-4 rounded-(--radius-card) p-5 sm:grid-cols-3 sm:gap-6 sm:px-8 sm:py-8"
      >
        {[
          [Truck, 'Free shipping', 'On all orders above ₹999'],
          [BadgeCheck, 'Quality first', 'Hand-checked before dispatch'],
          [RefreshCcw, 'Easy exchange', '7-day no-questions exchange'],
        ].map(([Icon, title, sub]) => (
          <motion.div key={title} variants={rise} className="flex items-center gap-3 sm:gap-4">
            <span className="glass rounded-full p-2.5 sm:p-3"><Icon size={18} strokeWidth={1.5} /></span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted">{sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
