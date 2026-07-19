import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="glass mx-auto max-w-lg rounded-(--radius-card) py-24 text-center">
      <p className="heading text-6xl">404</p>
      <p className="mt-3 text-muted">This page seems to have wandered off.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">Back to home</Link>
    </div>
  );
}
