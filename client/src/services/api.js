import axios from 'axios';

export const api = axios.create({ baseURL: '/api', withCredentials: true });

let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On 401, try one silent refresh, then retry the original request.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing ||= axios.post('/api/auth/refresh', null, { withCredentials: true });
        const { data } = await refreshing;
        refreshing = null;
        setAccessToken(data.accessToken);
        window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: data }));
        return api(original);
      } catch {
        refreshing = null;
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.message || fallback;
