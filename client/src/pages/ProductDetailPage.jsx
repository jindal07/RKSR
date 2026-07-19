import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { api } from '../services/api.js';
import { addItem } from '../store/cartSlice.js';
import { useToast } from '../components/common/Toast.jsx';
import { inr, discountPercent } from '../utils/format.js';
import Spinner from '../components/common/Spinner.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [missing, setMissing] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    setProduct(null); setMissing(false); setSize(''); setQty(1); setImgIdx(0);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        setColor(data.product.variants[0]?.color || '');
      })
      .catch(() => setMissing(true));
  }, [slug]);

  const colors = useMemo(
    () => [...new Set((product?.variants || []).map((v) => v.color))],
    [product]
  );
  const sizesForColor = useMemo(
    () => (product?.variants || []).filter((v) => v.color === color),
    [product, color]
  );
  const selectedVariant = sizesForColor.find((v) => v.size === size);

  if (missing) {
    return (
      <div className="glass rounded-(--radius-card) py-24 text-center">
        <p className="heading text-2xl">Product not found</p>
        <Link to="/products" className="btn-secondary mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }
  if (!product) return <Spinner full />;

  const off = discountPercent(product.price, product.mrp);

  const handleAdd = () => {
    if (!selectedVariant) return toast('Please select a size', 'error');
    if (selectedVariant.stock < 1) return toast('This size is out of stock', 'error');
    dispatch(addItem({
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url,
      size: selectedVariant.size,
      color,
      price: product.price,
      qty,
    }));
    toast('Added to cart');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[55%_1fr] lg:gap-12">
      {/* gallery */}
      <div>
        <div className="glass overflow-hidden rounded-(--radius-card)">
          <img
            src={product.images[imgIdx]?.url}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setImgIdx(i)}
                className={`glass w-14 overflow-hidden rounded-xl sm:w-20 ${i === imgIdx ? 'ring-2 ring-(--accent)' : ''}`}
              >
                <img src={img.url} alt="" className="aspect-[3/4] w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* info — solid panel so the animated grid doesn't show through the text */}
      <div
        className="h-fit rounded-(--radius-card) border bg-(--bg) p-5 sm:p-8"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
          {product.category} · {product.subcategory?.replace(/-/g, ' ')}
        </p>
        <h1 className="heading mt-2 text-2xl sm:text-4xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
          <span className="text-xl font-semibold sm:text-2xl">{inr(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-base text-muted line-through sm:text-lg">{inr(product.mrp)}</span>
              <span className="rounded-full bg-highlight/30 px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm">{off}% off</span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

        {colors.length > 1 && (
          <div className="mt-6 sm:mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Colour — {color}</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button key={c} onClick={() => { setColor(c); setSize(''); }}
                  className={`chip ${c === color ? 'chip-active' : ''}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((v) => (
              <button
                key={v.id}
                disabled={v.stock < 1}
                onClick={() => setSize(v.size)}
                className={`chip min-w-12 ${v.size === size ? 'chip-active' : ''} ${v.stock < 1 ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
              >
                {v.size}
              </button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stock <= 5 && (
            <p className="mt-2 text-xs text-warning">Only {selectedVariant.stock} left in stock</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
          <div className="glass flex items-center rounded-full">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 sm:p-3" aria-label="Decrease quantity">
              <Minus size={15} />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="p-2.5 sm:p-3" aria-label="Increase quantity">
              <Plus size={15} />
            </button>
          </div>
          <button onClick={handleAdd} className="btn-primary flex-1 sm:flex-none sm:px-10">
            <ShoppingBag size={16} strokeWidth={1.5} /> Add to cart
          </button>
        </div>

        <div className="glass mt-6 flex items-center gap-2.5 rounded-(--radius-field) px-3.5 py-2.5 text-xs text-muted sm:mt-8 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
          <Truck size={16} strokeWidth={1.5} className="shrink-0" />
          Free shipping above ₹999 · Cash on Delivery available
        </div>

        <div className="mt-6 sm:mt-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted sm:text-xs">About this product</p>
          <p className="text-sm leading-relaxed text-muted sm:text-base">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
