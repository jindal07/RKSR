import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Package, Clock3, Users } from 'lucide-react';
import { api } from '../../services/api.js';
import { inr } from '../../utils/format.js';
import Spinner from '../../components/common/Spinner.jsx';

function SalesChart({ salesByDay }) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, value: salesByDay[key] || 0 });
  }
  const max = Math.max(...days.map((d) => d.value), 1);
  return (
    <div className="flex h-36 items-end gap-1">
      {days.map((d) => (
        <div
          key={d.key}
          title={`${d.key}: ${inr(d.value)}`}
          className="flex-1 rounded-t-sm bg-accent/50 transition-colors hover:bg-accent/80"
          style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => setStats({}));
  }, []);

  if (!stats) return <Spinner full />;

  const cards = [
    [IndianRupee, 'Total revenue', inr(stats.revenue || 0)],
    [Package, 'Total orders', stats.totalOrders ?? 0],
    [Clock3, 'Pending orders', stats.pendingOrders ?? 0],
    [Users, 'Customers', stats.customers ?? 0],
  ];

  return (
    <div className="space-y-6">
      <h1 className="heading text-2xl sm:text-3xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {cards.map(([Icon, label, value]) => (
          <div key={label} className="glass rounded-(--radius-card) p-4 sm:p-5">
            <Icon size={18} strokeWidth={1.5} className="text-muted" />
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="glass rounded-(--radius-card) p-4 sm:p-6">
          <p className="heading text-lg">Sales — last 30 days</p>
          <div className="mt-4">
            <SalesChart salesByDay={stats.salesByDay || {}} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass rounded-(--radius-card) p-4 sm:p-6">
            <p className="heading text-lg">Top products</p>
            <ul className="mt-3 space-y-2">
              {(stats.topProducts || []).map((p) => (
                <li key={p.slug} className="flex justify-between gap-2 text-sm">
                  <span className="truncate text-muted">{p.name}</span>
                  <span className="shrink-0 font-medium">{p.unitsSold} sold</span>
                </li>
              ))}
              {(stats.topProducts || []).length === 0 && <p className="text-sm text-muted">No sales yet</p>}
            </ul>
          </div>

          <div className="glass rounded-(--radius-card) p-4 sm:p-6">
            <p className="heading text-lg">Low stock</p>
            <ul className="mt-3 space-y-2">
              {(stats.lowStock || []).map((v) => (
                <li key={v.id} className="flex justify-between gap-2 text-sm">
                  <span className="truncate text-muted">{v.product.name} ({v.size}, {v.color})</span>
                  <span className={`shrink-0 font-semibold ${v.stock === 0 ? 'text-error' : 'text-warning'}`}>{v.stock}</span>
                </li>
              ))}
              {(stats.lowStock || []).length === 0 && <p className="text-sm text-muted">All stocked up ✓</p>}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted">
        Orders today: <b>{stats.ordersToday ?? 0}</b> · This month: <b>{stats.ordersThisMonth ?? 0}</b> ·{' '}
        <Link to="/admin/orders" className="underline underline-offset-2">Manage orders →</Link>
      </p>
    </div>
  );
}
