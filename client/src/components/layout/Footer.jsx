import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { CATEGORIES } from '../../utils/format.js';
import ContactCards from './ContactCard.jsx';

const SHOP_LINKS = CATEGORIES.map((c) => ({ to: `/products?category=${c.key}`, label: c.label }));
const ACCOUNT_LINKS = [
  { to: '/orders', label: 'My orders' },
  { to: '/cart', label: 'Cart' },
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Create account' },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-xs text-muted transition-colors hover:text-body sm:text-sm">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <>
      <ContactCards />
      <footer
        className="mt-14 border-t bg-(--bg) px-4 pb-5 pt-8 sm:mt-20 sm:px-6 sm:pb-7 sm:pt-12 lg:px-8"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="mx-auto max-w-7xl">
          {/* mobile: 2-col grid (brand + address span both); laptop: 4 columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-y-8 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] lg:gap-x-8">
            <div className="col-span-2 lg:col-span-1">
              <p className="heading text-xl sm:text-2xl">
                RamKishan <span className="text-muted">Siyaram</span>
              </p>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted sm:text-sm">
                Timeless clothing for the whole family — crafted with care, priced with honesty.
              </p>
            </div>

            <LinkColumn title="Shop" links={SHOP_LINKS} />
            <LinkColumn title="Account" links={ACCOUNT_LINKS} />

            <div className="col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Visit us</p>
              <address className="mt-2.5 text-xs not-italic leading-relaxed text-muted sm:mt-3 sm:text-sm">
                Main Road, in front of HP Petrol Pump, Chopan, Shendhuriya, Uttar Pradesh — 231205
              </address>
              <a
                href="https://share.google/joUdllttmXlFW4sAQ"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium underline-offset-2 hover:underline sm:text-sm"
              >
                <MapPin size={13} strokeWidth={1.5} /> Get directions
              </a>
            </div>
          </div>

          {/* bottom bar */}
          <div
            className="mt-7 flex flex-col items-center gap-1.5 border-t pt-4 text-center text-[11px] text-muted sm:mt-10 sm:flex-row sm:justify-between sm:pt-5 sm:text-xs"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <p>© {new Date().getFullYear()} RamKishan Siyaram. All rights reserved.</p>
            <p>Free shipping above ₹999 · Cash on Delivery · 7-day exchange</p>
          </div>
        </div>
      </footer>
    </>
  );
}
