import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice.js';
import cart from './cartSlice.js';

export const store = configureStore({ reducer: { auth, cart } });

store.subscribe(() => {
  localStorage.setItem('rks-cart', JSON.stringify(store.getState().cart.items));
});
