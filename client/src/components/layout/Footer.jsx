import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/format.js';
import ContactCards from './ContactCard.jsx';

export default function Footer() {
  return (
    <>
      <ContactCards />
      <footer className="mt-14 border-t bg-(--bg) px-4 py-9 sm:mt-20 sm:py-12" style={{ borderColor: 'var(--glass-border)' }}>
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        <div>
          <p className="heading text-lg">RamKishan Siyaram</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Timeless clothing for the whole family — crafted with care, priced with honesty.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link to={`/products?category=${c.key}`} className="text-muted hover:text-body">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/orders" className="text-muted hover:text-body">My orders</Link></li>
            <li><Link to="/cart" className="text-muted hover:text-body">Cart</Link></li>
            <li><Link to="/login" className="text-muted hover:text-body">Log in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Store</p>
          <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
            Main Road, in front of HP Petrol Pump,
            <br />
            Chopan, Shendhuriya,
            <br />
            Uttar Pradesh — 231205
          </address>
          <a
            href="https://share.google/joUdllttmXlFW4sAQ"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-medium underline-offset-2 hover:underline"
          >
            Get directions →
          </a>
          <p className="mt-3 text-xs text-muted">
            Free shipping above ₹999 · Cash on Delivery · 7-day exchanges
          </p>
        </div>
      </div>
        <p className="mt-10 text-center text-xs text-muted">
          © {new Date().getFullYear()} RamKishan Siyaram. All rights reserved.
        </p>
      </footer>
    </>
  );
}
