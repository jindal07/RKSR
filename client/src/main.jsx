import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { bootstrapAuth, sessionExpired, sessionRefreshed } from './store/authSlice.js';
import { ToastProvider } from './components/common/Toast.jsx';
import { ConfirmProvider } from './components/common/ConfirmDialog.jsx';
import App from './App.jsx';
import './styles/theme.css';

store.dispatch(bootstrapAuth());
window.addEventListener('auth:expired', () => store.dispatch(sessionExpired()));
window.addEventListener('auth:refreshed', (e) => store.dispatch(sessionRefreshed(e.detail.user)));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* reducedMotion="user" strips transform animations (keeps fades)
            for users with "reduce motion" enabled, app-wide */}
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ToastProvider>
        </MotionConfig>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
