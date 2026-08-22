import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-slate-600">Page not found</p>
        <Link to="/" className="btn-primary mt-8">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    </section>
  );
}