import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Shirt, Package, Users, Store, Megaphone, Contact } from 'lucide-react';
import AnimatedBackground from '../background/AnimatedBackground.jsx';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Shirt },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/banner', label: 'Banner', icon: Megaphone },
  { to: '/admin/contact-cards', label: 'Contact', icon: Contact },
];

export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${
      isActive ? 'bg-accent font-medium text-accent-fg' : 'text-muted hover:text-body'
    }`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[90rem] gap-6 px-4 py-6 lg:px-8">
      <AnimatedBackground />
      {/* sidebar — laptop */}
      <aside className="glass-strong sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-(--radius-card) p-4 lg:flex">
        <p className="heading px-3 py-2 text-lg">RamKishan Siyaram</p>
        <p className="px-3 pb-4 text-xs uppercase tracking-wider text-muted">Admin panel</p>
        <nav className="space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={17} strokeWidth={1.5} /> {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-auto flex items-center gap-3 rounded-full px-4 py-2.5 text-sm text-muted hover:text-body">
          <Store size={17} strokeWidth={1.5} /> View store
        </Link>
      </aside>

      <main className="min-w-0 flex-1 pb-24 lg:pb-6">
        {/* mobile header — brand + way back to the storefront */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <div>
            <p className="heading text-base">RamKishan Siyaram</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Admin panel</p>
          </div>
          <Link to="/" className="btn-secondary">
            <Store size={14} strokeWidth={1.5} /> View store
          </Link>
        </div>
        <Outlet />
      </main>

      {/* bottom tabs — mobile: equal-width grid so all six fit */}
      <nav className="glass-strong fixed inset-x-2 bottom-2 z-50 grid grid-cols-6 gap-0.5 rounded-2xl p-1 lg:hidden">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] ${
                isActive ? 'bg-accent text-accent-fg' : 'text-muted'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.5} />
            <span className="w-full truncate text-center">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
