import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { inr, formatDate, ORDER_STATUS_LABELS } from '../../utils/format.js';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const STATUSES = ['', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const NEXT = { placed: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: ['delivered'] };
const TINT = {
  placed: 'bg-highlight/30', confirmed: 'bg-highlight/30',
  shipped: 'bg-warning/20 text-warning', delivered: 'bg-success/20 text-success',
  cancelled: 'bg-error/20 text-error',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () =>
    api.get('/admin/orders', { params: status ? { status } : {} })
      .then(({ data }) => setData(data))
      .catch(() => setData({ orders: [] }));

  useEffect(() => { setData(null); load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = async (order, next) => {
    if (next === 'cancelled') {
      const ok = await confirm({
        title: 'Cancel this order?',
        message: `Order ${order.orderNumber} will be cancelled and its stock restored. This cannot be undone.`,
        confirmLabel: 'Cancel order',
        cancelLabel: 'Keep order',
        danger: true,
      });
      if (!ok) return;
    }
    setBusy(true);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: next });
      toast(`Order marked ${next}`);
      await load();
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="heading text-2xl sm:text-3xl">Orders</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`chip ${status === s ? 'chip-active' : ''}`}>
            {s ? ORDER_STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {data === null ? (
        <Spinner full />
      ) : data.orders.length === 0 ? (
        <div className="glass mt-5 rounded-(--radius-card) py-16 text-center text-muted">No orders here yet</div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.orders.map((o) => (
            <div key={o.id} className="glass rounded-(--radius-card)">
              <button
                onClick={() => setOpenId(openId === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <p className="text-sm font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{o.user.name} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${TINT[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="text-xs uppercase text-muted">{o.payment?.method}</span>
                  <span className="font-semibold">{inr(o.total)}</span>
                  {openId === o.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </div>
              </button>

              {openId === o.id && (
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
                      <ul className="mt-2 space-y-2">
                        {o.items.map((it) => (
                          <li key={it.id} className="flex items-center gap-3 text-sm">
                            <img src={it.imageSnapshot} alt="" className="h-12 w-9 rounded-lg object-cover" />
                            <span className="flex-1">{it.nameSnapshot} <span className="text-muted">({it.size}, {it.color}) × {it.qty}</span></span>
                            <span>{inr(it.priceSnapshot * it.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ship to</p>
                      <p className="mt-2 font-medium">{o.shipName} · {o.shipPhone}</p>
                      <p className="text-muted">
                        {o.shipLine1}{o.shipLine2 ? `, ${o.shipLine2}` : ''}, {o.shipCity}, {o.shipState} — {o.shipPincode}
                      </p>
                      <p className="mt-3 text-xs text-muted">Payment: {o.payment?.method?.toUpperCase()} · {o.payment?.status}</p>
                    </div>
                  </div>
                  {NEXT[o.status] && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {NEXT[o.status].map((n) => (
                        <button
                          key={n}
                          disabled={busy}
                          onClick={() => advance(o, n)}
                          className={n === 'cancelled' ? 'btn-secondary text-error' : 'btn-primary'}
                        >
                          Mark {ORDER_STATUS_LABELS[n].toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
