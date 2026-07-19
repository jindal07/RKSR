import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

const PANEL_MAX_H = 256; // matches max-h-64
const OPTION_H = 38;

// Custom dropdown matching the glass/mono design system.
// The panel renders in a portal to <body>: glass sections create their own
// stacking contexts (backdrop-filter), so an in-place panel gets painted over
// by any later glass card regardless of z-index.
// options: array of strings or { value, label }. Keyboard: arrows, Enter/Space,
// Escape, Home/End, and type-ahead (useful for long lists like Indian states).
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  panelClassName = '',
  ariaLabel,
}) {
  const items = useMemo(
    () => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)),
    [options]
  );
  const selectedIdx = items.findIndex((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(selectedIdx, 0));
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ buffer: '', at: 0 });

  // Anchor the fixed-position panel to the trigger; flip upward when the
  // viewport space below is too small. Re-anchors on scroll/resize.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const panelH = Math.min(PANEL_MAX_H, items.length * OPTION_H + 12);
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < panelH + 12 && r.top > spaceBelow;
      setPos({
        left: r.left,
        width: r.width,
        top: openUp ? undefined : r.bottom + 6,
        bottom: openUp ? window.innerHeight - r.top + 6 : undefined,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActive(Math.max(selectedIdx, 0));
      // keep the active option visible when the panel opens
      requestAnimationFrame(() => {
        listRef.current
          ?.querySelector('[data-active="true"]')
          ?.scrollIntoView({ block: 'nearest' });
      });
    }
  }, [open, selectedIdx]);

  const move = (idx) => {
    const next = Math.min(Math.max(idx, 0), items.length - 1);
    setActive(next);
    requestAnimationFrame(() => {
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
    });
  };

  const pick = (idx) => {
    onChange(items[idx].value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(active + 1); break;
      case 'ArrowUp': e.preventDefault(); move(active - 1); break;
      case 'Home': e.preventDefault(); move(0); break;
      case 'End': e.preventDefault(); move(items.length - 1); break;
      case 'Enter':
      case ' ': e.preventDefault(); pick(active); break;
      case 'Escape': e.preventDefault(); setOpen(false); break;
      case 'Tab': setOpen(false); break;
      default: {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const now = Date.now();
          const t = typeahead.current;
          t.buffer = now - t.at > 500 ? e.key : t.buffer + e.key;
          t.at = now;
          const q = t.buffer.toLowerCase();
          const hit = items.findIndex((o) => o.label.toLowerCase().startsWith(q));
          if (hit >= 0) move(hit);
        }
      }
    }
  };

  const selected = items[selectedIdx];

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className="field flex w-full items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${selected ? '' : 'text-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.ul
              ref={listRef}
              role="listbox"
              initial={{ opacity: 0, y: pos.bottom ? -4 : 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.bottom ? -4 : 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
              className={`glass-strong z-[120] max-h-64 min-w-40 overflow-auto rounded-(--radius-field) p-1.5 ${panelClassName}`}
            >
              {items.map((o, i) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(i)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    i === active ? 'bg-accent text-accent-fg' : ''
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value && <Check size={14} className="shrink-0" />}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
