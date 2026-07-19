import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api } from '../services/api.js';
import { inr, formatDate, ORDER_STATUS_LABELS } from '../utils/format.js';
import Spinner from '../components/common/Spinner.jsx';

const STATUS_TINT = {
  placed: 'bg-highlight/30',
  confirmed: 'bg-highlight/30',
  shipped: 'bg-warning/20 text-warning',
  delivered: 'bg-success/20 text-success',
  cancelled: 'bg-error/20 text-error',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders)).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <Spinner full />;

  if (orders.length === 0) {
    return (
      <div className="glass mx-auto max-w-lg rounded-(--radius-card) py-20 text-center">
        <Package size={40} strokeWidth={1} className="mx-auto text-muted" />
        <p className="heading mt-4 text-2xl">No orders yet</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading text-2xl sm:text-3xl">My orders</h1>
      <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="glass glass-hover block rounded-(--radius-card) p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TINT[o.status]}`}>
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
                <span className="font-semibold">{inr(o.total)}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {o.items.slice(0, 4).map((it) => (
                <img key={it.id} src={it.imageSnapshot} alt={it.nameSnapshot} className="h-14 w-11 rounded-lg object-cover" />
              ))}
              {o.items.length > 4 && (
                <span className="glass flex h-14 w-11 items-center justify-center rounded-lg text-xs text-muted">
                  +{o.items.length - 4}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
