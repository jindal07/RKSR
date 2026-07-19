import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Banknote, CreditCard } from 'lucide-react';
import { api, errMsg } from '../services/api.js';
import { cartSubtotal, clearCart } from '../store/cartSlice.js';
import { useToast } from '../components/common/Toast.jsx';
import { inr, INDIAN_STATES } from '../utils/format.js';
import Select from '../components/common/Select.jsx';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const EMPTY_ADDRESS = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function CheckoutPage() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(cartSubtotal);
  const user = useSelector((s) => s.auth.user);
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, name: user?.name || '' });
  const [method, setMethod] = useState('cod');
  const [config, setConfig] = useState({ razorpayEnabled: false, freeShippingAbove: 999, shippingFee: 49 });
  const [placing, setPlacing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/config').then(({ data }) => setConfig(data)).catch(() => {});
  }, []);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = subtotal >= config.freeShippingAbove ? 0 : config.shippingFee;
  const total = subtotal + shipping;
  const set = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    // the custom State dropdown sits outside native form validation
    if (!address.state) return toast('Please select your state', 'error');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(({ variantId, qty }) => ({ variantId, qty })),
        address,
        paymentMethod: method,
      });

      if (method === 'cod') {
        dispatch(clearCart());
        return navigate(`/order-success/${data.order.id}`, { replace: true });
      }

      // Razorpay flow
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Could not load payment window');
      const rzp = new window.Razorpay({
        key: data.razorpay.keyId,
        order_id: data.razorpay.orderId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: 'RamKishan Siyaram',
        prefill: { name: address.name, contact: address.phone, email: user.email },
        theme: { color: '#111111' },
        handler: async (resp) => {
          try {
            await api.post('/payment/verify', {
              orderId: data.order.id,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            });
            dispatch(clearCart());
            navigate(`/order-success/${data.order.id}`, { replace: true });
          } catch (err) {
            toast(errMsg(err, 'Payment verification failed'), 'error');
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.open();
    } catch (err) {
      toast(errMsg(err, 'Could not place order'), 'error');
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={placeOrder} className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
      <div className="space-y-6 sm:space-y-8">
        <h1 className="heading text-2xl sm:text-3xl">Checkout</h1>

        <section className="glass rounded-(--radius-card) p-4 sm:p-6">
          <p className="heading text-lg sm:text-xl">Delivery address</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <input required className="field" placeholder="Full name" value={address.name} onChange={set('name')} />
            <input required className="field" placeholder="Mobile number" inputMode="numeric" pattern="[6-9][0-9]{9}" title="10-digit mobile number" value={address.phone} onChange={set('phone')} />
            <input required className="field sm:col-span-2" placeholder="House no., street, area" value={address.line1} onChange={set('line1')} />
            <input className="field sm:col-span-2" placeholder="Landmark (optional)" value={address.line2} onChange={set('line2')} />
            <input required className="field" placeholder="City" value={address.city} onChange={set('city')} />
            <Select
              value={address.state}
              onChange={(state) => setAddress((a) => ({ ...a, state }))}
              options={INDIAN_STATES}
              placeholder="State / Union Territory"
              ariaLabel="State"
            />
            <input required className="field" placeholder="Pincode" inputMode="numeric" pattern="[0-9]{6}" title="6-digit pincode" value={address.pincode} onChange={set('pincode')} />
          </div>
        </section>

        <section className="glass rounded-(--radius-card) p-4 sm:p-6">
          <p className="heading text-lg sm:text-xl">Payment method</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMethod('cod')}
              className={`glass flex items-center gap-3 rounded-(--radius-field) p-4 text-left transition-colors ${method === 'cod' ? 'ring-2 ring-(--accent)' : ''}`}
            >
              <Banknote size={20} strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-semibold">Cash on Delivery</span>
                <span className="text-xs text-muted">Pay when your order arrives</span>
              </span>
            </button>
            <button
              type="button"
              disabled={!config.razorpayEnabled}
              onClick={() => setMethod('razorpay')}
              className={`glass flex items-center gap-3 rounded-(--radius-field) p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${method === 'razorpay' ? 'ring-2 ring-(--accent)' : ''}`}
            >
              <CreditCard size={20} strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-semibold">Pay online</span>
                <span className="text-xs text-muted">
                  {config.razorpayEnabled ? 'UPI, cards, netbanking' : 'Currently unavailable'}
                </span>
              </span>
            </button>
          </div>
        </section>
      </div>

      <aside className="glass-strong sticky top-28 mt-6 rounded-(--radius-card) p-5 sm:mt-8 sm:p-6 lg:mt-16">
        <p className="heading text-xl">Order summary</p>
        <ul className="mt-4 max-h-56 space-y-3 overflow-auto pr-1">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-3 text-sm">
              <span className="text-muted">{i.name} ({i.size}) × {i.qty}</span>
              <span className="shrink-0">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t pt-4 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{shipping === 0 ? <span className="text-success">Free</span> : inr(shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{inr(total)}</dd></div>
        </dl>
        <button type="submit" disabled={placing} className="btn-primary mt-6 w-full">
          {placing ? 'Placing order…' : method === 'cod' ? `Place order — ${inr(total)}` : `Pay ${inr(total)}`}
        </button>
      </aside>
    </form>
  );
}
