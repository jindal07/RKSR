import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TriangleAlert, HelpCircle } from 'lucide-react';

// Promise-based confirm dialog matching the glass/mono design system.
// Usage: const confirm = useConfirm();
//        if (await confirm({ title, message, confirmLabel, danger })) { ... }
const ConfirmCtx = createContext(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [dialog]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep Tab inside the two dialog buttons
  const trapTab = (e) => {
    if (e.key !== 'Tab') return;
    const buttons = e.currentTarget.querySelectorAll('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {dialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(false)}
              className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-sm"
            />
            <div className="pointer-events-none fixed inset-0 z-[140] flex items-center justify-center p-4">
              <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onKeyDown={trapTab}
                className="glass-strong pointer-events-auto w-full max-w-sm rounded-(--radius-card) p-6"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    dialog.danger ? 'bg-error/15 text-error' : 'glass'
                  }`}
                >
                  {dialog.danger
                    ? <TriangleAlert size={20} strokeWidth={1.5} />
                    : <HelpCircle size={20} strokeWidth={1.5} />}
                </span>
                <h2 id="confirm-title" className="heading mt-4 text-xl">
                  {dialog.title}
                </h2>
                {dialog.message && (
                  <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-muted">
                    {dialog.message}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <button autoFocus onClick={() => close(false)} className="btn-secondary">
                    {dialog.cancelLabel || 'Cancel'}
                  </button>
                  <button
                    onClick={() => close(true)}
                    className="btn-primary"
                    style={dialog.danger ? { background: 'var(--error)', color: '#fff' } : undefined}
                  >
                    {dialog.confirmLabel || 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmCtx.Provider>
  );
}
