import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner.jsx';

export function ProtectedRoute() {
  const { user, status } = useSelector((s) => s.auth);
  const location = useLocation();
  if (status === 'booting') return <Spinner full />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, status } = useSelector((s) => s.auth);
  if (status === 'booting') return <Spinner full />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <Outlet />;
}
