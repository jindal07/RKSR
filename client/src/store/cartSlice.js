import { createSlice } from '@reduxjs/toolkit';

// Cart lives on the client (localStorage); the server re-validates
// every price and stock level at checkout.
const load = () => {
  try {
    return JSON.parse(localStorage.getItem('rks-cart')) || [];
  } catch {
    return [];
  }
};

const slice = createSlice({
  name: 'cart',
  initialState: { items: load() }, // item: {variantId, slug, name, image, size, color, price, qty}
  reducers: {
    addItem: (state, { payload }) => {
      const existing = state.items.find((i) => i.variantId === payload.variantId);
      if (existing) existing.qty = Math.min(existing.qty + payload.qty, 10);
      else state.items.push(payload);
    },
    setQty: (state, { payload: { variantId, qty } }) => {
      const item = state.items.find((i) => i.variantId === variantId);
      if (item) item.qty = Math.max(1, Math.min(qty, 10));
    },
    removeItem: (state, { payload }) => {
      state.items = state.items.filter((i) => i.variantId !== payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, setQty, removeItem, clearCart } = slice.actions;
export const cartCount = (state) => state.cart.items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (state) => state.cart.items.reduce((n, i) => n + i.price * i.qty, 0);
export default slice.reducer;
