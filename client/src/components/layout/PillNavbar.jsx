import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, ShoppingBag, User, Menu, X, Moon, Sun, LayoutDashboard, LogOut, Package,
} from 'lucide-react';
import { cartCount } from '../../store/cartSlice.js';
import { logout } from '../../store/authSlice.js';
import { CATEGORIES } from '../../utils/format.js';
import { useToast } from '../common/Toast.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  ...CATEGORIES.map((c) => ({ to: `/products?category=${c.key}`, label: c.label })),
];

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  return [dark, toggle];
}

export default function PillNavbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, toggleTheme] = useTheme();
  const count = useSelector(cartCount);
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleLogout = () => {
    dispatch(logout());
    toast('Logged out — see you soon');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setMenuOpen(false); }, [location]);

  const activeKey = `${location.pathname}${location.search}`;
  const isActive = (link) =>
    link.end ? activeKey === link.to : activeKey === link.to || (link.to === '/products' && location.pathname === '/products' && !location.search);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <header
      className="fixed inset-x-0 z-50 flex justify-center px-3 transition-[top] duration-300"
      style={{ top: 'calc(var(--banner-h, 0px) + 1rem)' }}
    >
      <nav
        className={`glass-strong flex w-full max-w-5xl items-center justify-between rounded-full pl-5 pr-2 transition-all duration-300 ${
          scrolled ? 'py-1.5' : 'py-2.5'
        }`}
      >
        <Link to="/" className="heading whitespace-nowrap text-lg tracking-wide">
          RamKishan <span className="text-muted">Siyaram</span>
        </Link>

        {/* center links — laptop */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="relative rounded-full px-3.5 py-1.5 text-sm">
              {isActive(link) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative ${isActive(link) ? 'font-medium text-accent-fg' : 'text-muted hover:text-body'}`}>
                {link.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* right cluster */}
        <div className="flex items-center gap-1">
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={submitSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 160, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search…"
                  className="w-full rounded-full bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted"
                />
              </motion.form>
            )}
          </AnimatePresence>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            className="rounded-full p-2.5 text-muted transition-colors hover:text-body"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="hidden rounded-full p-2.5 text-muted transition-colors hover:text-body sm:block">
            {dark ? <Sun size={19} strokeWidth={1.5} /> : <Moon size={19} strokeWidth={1.5} />}
          </button>
          <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2.5 text-muted transition-colors hover:text-body">
            <ShoppingBag size={19} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-fg">
                {count}
              </span>
            )}
          </Link>

          {/* profile dropdown — laptop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => (user ? setMenuOpen((v) => !v) : navigate('/login'))}
              aria-label="Account"
              className="rounded-full p-2.5 text-muted transition-colors hover:text-body"
            >
              <User size={19} strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {menuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-12 w-52 rounded-(--radius-card) border bg-(--bg) p-2"
                  style={{ borderColor: 'var(--glass-border)', boxShadow: 'var(--shadow-glass-lg)' }}
                >
                  <p className="truncate px-3 py-2 text-sm font-medium">{user.name}</p>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-body">
                      <LayoutDashboard size={15} strokeWidth={1.5} /> Admin panel
                    </Link>
                  )}
                  <Link to="/orders" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-body">
                    <Package size={15} strokeWidth={1.5} /> My orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-body"
                  >
                    <LogOut size={15} strokeWidth={1.5} /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* hamburger — mobile & tablet */}
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="rounded-full p-2.5 text-muted lg:hidden">
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 w-[92vw] max-w-5xl rounded-(--radius-card) border bg-(--bg) p-3 lg:hidden"
            style={{ borderColor: 'var(--glass-border)', boxShadow: 'var(--shadow-glass-lg)' }}
          >
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="block rounded-xl px-4 py-3 text-sm font-medium">
                {l.label}
              </Link>
            ))}
            <div className="mt-1 border-t pt-2" style={{ borderColor: 'var(--glass-border)' }}>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block rounded-xl px-4 py-3 text-sm text-muted">Admin panel</Link>
                  )}
                  <Link to="/orders" className="block rounded-xl px-4 py-3 text-sm text-muted">My orders</Link>
                  <button onClick={handleLogout} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-muted">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block rounded-xl px-4 py-3 text-sm text-muted">Log in / Sign up</Link>
              )}
              <button onClick={toggleTheme} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted">
                {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
