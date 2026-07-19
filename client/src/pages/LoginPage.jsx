import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { user, status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(user.role === 'admin' && from === '/' ? '/admin' : from, { replace: true });
  }, [user, from, navigate]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-strong rounded-(--radius-card) p-6 sm:p-8">
        <h1 className="heading text-center text-2xl sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted">Log in to RamKishan Siyaram</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            required type="email" autoComplete="email" className="field" placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required type="password" autoComplete="current-password" className="field" placeholder="Password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          New here?{' '}
          <Link to="/register" state={location.state} className="font-medium text-body underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
