import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAccessToken } from '../services/api.js';

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const { data } = await api.post('/auth/refresh');
  setAccessToken(data.accessToken);
  return data.user;
});

export const login = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', body);
    setAccessToken(data.accessToken);
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', body);
    setAccessToken(data.accessToken);
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
  setAccessToken(null);
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'booting', error: null },
  reducers: {
    sessionExpired: (state) => { state.user = null; state.status = 'idle'; },
    sessionRefreshed: (state, { payload }) => { state.user = payload; state.status = 'idle'; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(bootstrapAuth.fulfilled, (s, { payload }) => { s.user = payload; s.status = 'idle'; });
    b.addCase(bootstrapAuth.rejected, (s) => { s.status = 'idle'; });
    for (const thunk of [login, register]) {
      b.addCase(thunk.pending, (s) => { s.status = 'loading'; s.error = null; });
      b.addCase(thunk.fulfilled, (s, { payload }) => { s.user = payload; s.status = 'idle'; });
      b.addCase(thunk.rejected, (s, { payload }) => { s.status = 'idle'; s.error = payload; });
    }
    b.addCase(logout.fulfilled, (s) => { s.user = null; });
  },
});

export const { sessionExpired, sessionRefreshed, clearError } = slice.actions;
export default slice.reducer;
