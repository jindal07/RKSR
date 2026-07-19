import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { inr, formatDate } from '../../utils/format.js';
import Spinner from '../../components/common/Spinner.jsx';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    api.get('/admin/customers').then(({ data }) => setCustomers(data.customers)).catch(() => setCustomers([]));
  }, []);

  if (customers === null) return <Spinner full />;

  return (
    <div>
      <h1 className="heading text-2xl sm:text-3xl">Customers <span className="text-lg text-muted">({customers.length})</span></h1>
      <div className="glass mt-5 overflow-x-auto rounded-(--radius-card)">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Joined</th>
              <th className="px-5 py-4">Orders</th>
              <th className="px-5 py-4">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t transition-colors hover:bg-highlight/10" style={{ borderColor: 'var(--glass-border)' }}>
                <td className="px-5 py-3">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(c.createdAt)}</td>
                <td className="px-5 py-3">{c.orderCount}</td>
                <td className="px-5 py-3 font-medium">{inr(c.totalSpent)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
