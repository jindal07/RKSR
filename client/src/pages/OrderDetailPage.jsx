import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { inr, formatDate } from '../utils/format.js';
import OrderStatusTimeline from '../components/orders/OrderStatusTimeline.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="glass rounded-(--radius-card) py-24 text-center">
        <p className="heading text-2xl">Order not found</p>
        <Link to="/orders" className="btn-secondary mt-6 inline-flex">My orders</Link>
      </div>
    );
  }
  if (!order) return <Spinner full />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="heading text-2xl sm:text-3xl">{order.orderNumber}</h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <section className="glass rounded-(--radius-card) p-4 sm:p-6">
        <OrderStatusTimeline order={order} />
      </section>

      <section className="glass rounded-(--radius-card) p-4 sm:p-6">
        <p className="heading text-lg sm:text-xl">Items</p>
        <ul className="mt-4 space-y-4">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-4">
              <img src={it.imageSnapshot} alt={it.nameSnapshot} className="h-20 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to={`/products/${it.productSlug}`} className="text-sm font-semibold hover:underline">{it.nameSnapshot}</Link>
                <p className="text-xs text-muted">{it.color} · Size {it.size} · Qty {it.qty}</p>
              </div>
              <span className="font-semibold">{inr(it.priceSnapshot * it.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t pt-4 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shippingFee === 0 ? 'Free' : inr(order.shippingFee)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{inr(order.total)}</dd></div>
          <p className="text-xs text-muted">
            {order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Paid online'} · payment {order.payment?.status}
          </p>
        </dl>
      </section>

      <section className="glass rounded-(--radius-card) p-4 text-sm sm:p-6">
        <p className="heading text-lg sm:text-xl">Delivery address</p>
        <p className="mt-3 font-medium">{order.shipName} · {order.shipPhone}</p>
        <p className="mt-1 text-muted">
          {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ''}, {order.shipCity}, {order.shipState} — {order.shipPincode}
        </p>
      </section>
    </div>
  );
}
