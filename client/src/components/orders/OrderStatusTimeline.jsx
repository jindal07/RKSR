import { Check, X } from 'lucide-react';
import { formatDate } from '../../utils/format.js';

const FLOW = ['placed', 'confirmed', 'shipped', 'delivered'];

export default function OrderStatusTimeline({ order }) {
  if (order.status === 'cancelled') {
    const at = order.statusHistory?.find((h) => h.status === 'cancelled')?.createdAt;
    return (
      <div className="flex items-center gap-3 text-error">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-error/15"><X size={16} /></span>
        <div>
          <p className="text-sm font-semibold">Order cancelled</p>
          {at && <p className="text-xs text-muted">{formatDate(at)}</p>}
        </div>
      </div>
    );
  }

  const reachedIdx = FLOW.indexOf(order.status);
  const historyByStatus = Object.fromEntries((order.statusHistory || []).map((h) => [h.status, h]));

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {FLOW.map((step, i) => {
        const done = i <= reachedIdx;
        const at = historyByStatus[step]?.createdAt;
        return (
          <li key={step} className="flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              <span className={`hidden h-px flex-1 sm:block ${i === 0 ? 'opacity-0' : ''} ${done ? 'bg-highlight' : 'bg-(--glass-border)'}`} />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done ? 'bg-accent text-accent-fg' : 'glass text-muted'
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span className={`hidden h-px flex-1 sm:block ${i === FLOW.length - 1 ? 'opacity-0' : ''} ${i < reachedIdx ? 'bg-highlight' : 'bg-(--glass-border)'}`} />
              <span className={`mx-auto block h-6 w-px sm:hidden ${i === FLOW.length - 1 ? 'opacity-0' : ''} ${i < reachedIdx ? 'bg-highlight' : 'bg-(--glass-border)'}`} />
            </div>
            <div className="pb-4 sm:pb-0">
              <p className={`text-sm capitalize ${done ? 'font-semibold' : 'text-muted'}`}>{step}</p>
              {at && <p className="text-xs text-muted">{formatDate(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
