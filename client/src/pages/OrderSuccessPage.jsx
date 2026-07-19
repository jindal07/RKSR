import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { inr } from '../utils/format.js';
import Spinner from '../components/common/Spinner.jsx';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  if (!order) return <Spinner full />;

  return (
    <div className="glass mx-auto max-w-xl rounded-(--radius-card) p-8 text-center sm:p-12">
      <CheckCircle2 size={52} strokeWidth={1.2} className="mx-auto text-success" />
      <h1 className="heading mt-4 text-3xl">Order placed!</h1>
      <p className="mt-2 text-muted">Thank you for shopping with RamKishan Siyaram.</p>
      <div className="glass mt-6 rounded-(--radius-field) p-4 text-sm">
        <p><span className="text-muted">Order number:</span> <span className="font-semibold">{order.orderNumber}</span></p>
        <p className="mt-1"><span className="text-muted">Total:</span> <span className="font-semibold">{inr(order.total)}</span>
          {order.payment?.method === 'cod' && <span className="text-muted"> · pay on delivery</span>}
        </p>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={`/orders/${order.id}`} className="btn-primary">Track order</Link>
        <Link to="/products" className="btn-secondary">Continue shopping</Link>
      </div>
    </div>
  );
}
