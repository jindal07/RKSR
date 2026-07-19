// Human-readable order number, e.g. RKS-2026-00042.
// Sequence comes from the order count inside the checkout transaction;
// the UNIQUE constraint on orderNumber catches the rare race (caller retries).
export function makeOrderNumber(seq, date = new Date()) {
  return `RKS-${date.getFullYear()}-${String(seq).padStart(5, '0')}`;
}
