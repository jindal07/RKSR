import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { LinkIcon } from '../../utils/contactIcons.jsx';

const initialsOf = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Person contact card with a cursor-following monochrome glow (adapted from
// PrebuiltUI): a soft spotlight in light mode, a glow in dark mode.
function PersonCard({ card }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const bounds = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="relative w-full max-w-sm overflow-hidden rounded-(--radius-card) border"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div
        className={`pointer-events-none absolute z-0 size-60 rounded-full blur-3xl transition-opacity duration-500 ${
          visible ? 'opacity-25' : 'opacity-0'
        }`}
        style={{ top: position.y - 120, left: position.x - 120, background: 'var(--accent)' }}
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center bg-(--bg)/85 p-5 pb-6 text-center backdrop-blur-md sm:p-6 sm:pb-7">
        {card.avatarUrl ? (
          <img
            src={card.avatarUrl}
            alt={card.name}
            className="my-3 h-20 w-20 rounded-full object-cover shadow-md grayscale transition-all duration-500 hover:grayscale-0 sm:my-4 sm:h-24 sm:w-24"
          />
        ) : (
          <span className="glass-strong heading my-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl sm:my-4 sm:h-24 sm:w-24 sm:text-3xl">
            {initialsOf(card.name)}
          </span>
        )}
        <h3 className="heading mb-1 text-xl sm:text-2xl">{card.name}</h3>
        {card.role && <p className="mb-4 text-sm font-medium text-muted">{card.role}</p>}
        {card.bio && (
          <p className="mb-4 px-2 text-[13px] leading-relaxed text-muted sm:text-sm">{card.bio}</p>
        )}
        {(card.links || []).length > 0 && (
          <div className="mt-auto flex gap-3 text-muted sm:gap-4">
            {card.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                aria-label={link.label}
                title={link.label}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="glass flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5 hover:text-body sm:h-11 sm:w-11"
              >
                <LinkIcon url={link.url} size={18} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Cards are managed from Admin → Contact (people, order, and count).
export default function ContactCards() {
  const [cards, setCards] = useState(null);

  useEffect(() => {
    api.get('/contact-cards').then(({ data }) => setCards(data.cards)).catch(() => setCards([]));
  }, []);

  if (!cards || cards.length === 0) return null;

  return (
    <section className="mt-16 px-4 sm:mt-24">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-muted">
        The people behind the store
      </p>
      <div
        className={`mx-auto mt-6 grid w-full justify-items-center gap-3 sm:mt-8 sm:gap-6 ${
          cards.length === 1
            ? 'max-w-sm'
            : cards.length === 2
              ? 'max-w-3xl sm:grid-cols-2'
              : 'max-w-5xl sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {cards.map((card) => (
          <PersonCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
