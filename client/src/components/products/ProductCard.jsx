import { Link } from 'react-router-dom';
import { inr, discountPercent } from '../../utils/format.js';

export default function ProductCard({ product }) {
  const img = product.images?.[0];
  const off = discountPercent(product.price, product.mrp);
  const inStock = product.variants?.some((v) => v.stock > 0);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="glass glass-hover group block overflow-hidden rounded-(--radius-card)"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={img?.url}
          alt={img?.alt || product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="truncate text-[13px] font-semibold sm:text-sm">{product.name}</h3>
        <p className="mt-0.5 truncate text-[11px] capitalize text-muted sm:text-xs">{product.subcategory?.replace(/-/g, ' ')}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:mt-2 sm:gap-2">
          <span className="text-sm font-semibold sm:text-base">{inr(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-muted line-through sm:text-sm">{inr(product.mrp)}</span>
              <span className="rounded-full bg-highlight/30 px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs">-{off}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
