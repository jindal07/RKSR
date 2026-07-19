import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { user, status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-strong rounded-(--radius-card) p-6 sm:p-8">
        <h1 className="heading text-center text-2xl sm:text-3xl">Create account</h1>
        <p className="mt-2 text-center text-sm text-muted">Join RamKishan Siyaram</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            required minLength={2} autoComplete="name" className="field" placeholder="Full name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required type="email" autoComplete="email" className="field" placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required type="password" minLength={6} autoComplete="new-password" className="field"
            placeholder="Password (min 6 characters)"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-body underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
