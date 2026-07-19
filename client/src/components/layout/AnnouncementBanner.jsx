import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function pad(n) {
  return String(n).padStart(2, '0');
}

function Countdown({ endsAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => new Date(endsAt) - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const left = new Date(endsAt) - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, onExpire]);

  if (remaining <= 0) return null;
  const s = Math.floor(remaining / 1000);
  const units = [
    [Math.floor(s / 86400), 'D'],
    [Math.floor((s % 86400) / 3600), 'H'],
    [Math.floor((s % 3600) / 60), 'M'],
    [s % 60, 'S'],
  ];

  return (
    <div className="flex items-center gap-2" aria-label="Offer ends in">
      {units.map(([value, unit]) => (
        <div key={unit} className="flex items-baseline gap-0.5">
          <span className="text-sm font-semibold tabular-nums">{pad(value)}</span>
          <span className="text-[11px] font-light opacity-70">{unit}</span>
        </div>
      ))}
    </div>
  );
}

// Announcement bar pinned above the pill navbar. Content + on/off live in the
// DB and are managed from Admin → Banner. Inverted accent colors keep it
// monochrome: black bar in light mode, white bar in dark mode.
export default function AnnouncementBanner({ banner, onExpire }) {
  const isInternal = banner.linkUrl?.startsWith('/');
  const barRef = useRef(null);

  // Publish the banner's real height (it wraps on small screens) as a CSS
  // variable — the navbar and page offsets are derived from it.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--banner-h', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty('--banner-h', '0px');
    };
  }, []);

  return (
    <div ref={barRef} className="fixed inset-x-0 top-0 z-40 bg-accent px-3 py-2.5 text-accent-fg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-0.5 text-center sm:gap-x-12">
        <p className="text-[13px] font-medium">{banner.text}</p>
        {banner.endsAt && <Countdown endsAt={banner.endsAt} onExpire={onExpire} />}
        {banner.linkText && banner.linkUrl && (
          isInternal ? (
            <Link to={banner.linkUrl} className="text-xs underline underline-offset-2 opacity-90 hover:opacity-100">
              {banner.linkText}
            </Link>
          ) : (
            <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2 opacity-90 hover:opacity-100">
              {banner.linkText}
            </a>
          )
        )}
      </div>
    </div>
  );
}
