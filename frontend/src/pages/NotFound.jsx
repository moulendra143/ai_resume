import { Link } from 'react-router-dom';
import GlassCard from '../components/shared/GlassCard';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <GlassCard className="max-w-xl w-full text-center">
        <h1 className="text-5xl font-semibold text-white">404</h1>
        <p className="mt-4 text-slate-300 text-lg">Page not found.</p>
        <Link to="/" className="inline-block mt-8 rounded-2xl bg-violet-500 px-6 py-3 text-white hover:bg-violet-400">
          Go back home
        </Link>
      </GlassCard>
    </div>
  );
}
