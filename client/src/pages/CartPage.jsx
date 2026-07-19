import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { setQty, removeItem, cartSubtotal } from '../store/cartSlice.js';
import { inr } from '../utils/format.js';
import { useToast } from '../components/common/Toast.jsx';

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 49;

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(cartSubtotal);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRemove = (item) => {
    dispatch(removeItem(item.variantId));
    toast(`Removed "${item.name}" from cart`);
  };

  if (items.length === 0) {
    return (
      <div className="glass mx-auto max-w-lg rounded-(--radius-card) py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-muted" />
        <p className="heading mt-4 text-2xl">Your cart is empty</p>
        <p className="mt-2 text-sm text-muted">Beautiful things are waiting for you.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Start shopping</Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
      <div>
        <h1 className="heading text-2xl sm:text-3xl">Cart <span className="text-base text-muted sm:text-lg">({items.length} items)</span></h1>
        <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="glass flex gap-3 rounded-(--radius-card) p-3 sm:gap-4 sm:p-4">
              <Link to={`/products/${item.slug}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="h-24 w-[4.25rem] rounded-xl object-cover sm:h-28 sm:w-[5.25rem]" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/products/${item.slug}`} className="line-clamp-1 text-[13px] font-semibold hover:underline sm:text-sm">{item.name}</Link>
                    <p className="mt-0.5 text-[11px] text-muted sm:text-xs">{item.color} · Size {item.size}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="rounded-full p-2 text-muted transition-colors hover:text-error"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="glass flex items-center rounded-full">
                    <button onClick={() => dispatch(setQty({ variantId: item.variantId, qty: item.qty - 1 }))} className="p-2" aria-label="Decrease"><Minus size={13} /></button>
                    <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => dispatch(setQty({ variantId: item.variantId, qty: item.qty + 1 }))} className="p-2" aria-label="Increase"><Plus size={13} /></button>
                  </div>
                  <span className="font-semibold">{inr(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* summary */}
      <aside className="glass-strong sticky top-28 mt-6 rounded-(--radius-card) p-5 sm:mt-8 sm:p-6 lg:mt-16">
        <p className="heading text-xl">Order summary</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping === 0 ? <span className="text-success">Free</span> : inr(shipping)}</dd>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-muted">Add {inr(FREE_SHIPPING_ABOVE - subtotal)} more for free shipping</p>
          )}
          <div className="flex justify-between border-t pt-3 text-base font-semibold" style={{ borderColor: 'var(--glass-border)' }}>
            <dt>Total</dt><dd>{inr(subtotal + shipping)}</dd>
          </div>
        </dl>
        <button
          onClick={() => navigate(user ? '/checkout' : '/login', { state: { from: { pathname: '/checkout' } } })}
          className="btn-primary mt-6 w-full"
        >
          Proceed to checkout <ArrowRight size={16} />
        </button>
        {!user && <p className="mt-2 text-center text-xs text-muted">You'll be asked to log in first</p>}
      </aside>
    </div>
  );
}
