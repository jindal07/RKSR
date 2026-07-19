import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api.js';
import { CATEGORIES, SIZES } from '../utils/format.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Select from '../components/common/Select.jsx';

const SORTS = [
  ['newest', 'Newest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['popular', 'Popular'],
];

function Filters({ params, setParam, clearAll }) {
  const category = params.get('category') || '';
  const size = params.get('size') || '';
  const maxPrice = params.get('maxPrice') || '';

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setParam('category', category === c.key ? '' : c.key)}
              className={`chip ${category === c.key ? 'chip-active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.filter((s) => s !== 'Free').map((s) => (
            <button
              key={s}
              onClick={() => setParam('size', size === s ? '' : s)}
              className={`chip ${size === s ? 'chip-active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Max price {maxPrice && `— ₹${Number(maxPrice).toLocaleString('en-IN')}`}
        </p>
        <input
          type="range" min="300" max="6000" step="100"
          value={maxPrice || 6000}
          onChange={(e) => setParam('maxPrice', e.target.value === '6000' ? '' : e.target.value)}
          className="w-full accent-(--accent)"
        />
      </div>
      <button onClick={clearAll} className="text-sm text-muted underline-offset-2 hover:underline">
        Clear all filters
      </button>
    </div>
  );
}

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const search = params.get('search') || '';

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  useEffect(() => {
    setData(null);
    api.get('/products', { params: query })
      .then(({ data }) => setData(data))
      .catch(() => setData({ products: [], pagination: { totalPages: 0 } }));
  }, [query]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const clearAll = () => setParams({});
  const page = Number(params.get('page') || 1);
  const totalPages = data?.pagination?.totalPages || 0;

  return (
    <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
      {/* filters — laptop sidebar */}
      <aside className="glass sticky top-28 hidden h-fit rounded-(--radius-card) p-6 lg:block">
        <Filters params={params} setParam={setParam} clearAll={clearAll} />
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="heading text-xl sm:text-3xl">
            {search ? `Results for "${search}"` : 'All products'}
            {data && <span className="ml-2 text-xs text-muted sm:ml-3 sm:text-sm">({data.pagination.total} items)</span>}
          </h1>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button onClick={() => setSheetOpen(true)} className="btn-secondary lg:hidden">
              <SlidersHorizontal size={15} strokeWidth={1.5} /> Filters
            </button>
            <Select
              value={params.get('sort') || 'newest'}
              onChange={(v) => setParam('sort', v)}
              options={SORTS.map(([value, label]) => ({ value, label }))}
              ariaLabel="Sort products"
              className="min-w-0 flex-1 sm:w-48 sm:flex-none"
            />
          </div>
        </div>

        {data === null ? (
          <Spinner full />
        ) : data.products.length === 0 ? (
          <div className="glass mt-6 rounded-(--radius-card) py-20 text-center">
            <p className="heading text-xl">Nothing found</p>
            <p className="mt-2 text-sm text-muted">Try removing some filters.</p>
            <button onClick={clearAll} className="btn-secondary mt-5">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setParam('page', n === 1 ? '' : String(n))}
                    className={`chip ${page === n ? 'chip-active' : ''}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* filters — mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="glass-strong fixed inset-x-0 bottom-0 z-50 rounded-t-(--radius-card) p-6 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="heading text-lg">Filters</p>
                <button onClick={() => setSheetOpen(false)} className="rounded-full p-2 text-muted"><X size={18} /></button>
              </div>
              <Filters params={params} setParam={setParam} clearAll={clearAll} />
              <button onClick={() => setSheetOpen(false)} className="btn-primary mt-6 w-full">Show results</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
