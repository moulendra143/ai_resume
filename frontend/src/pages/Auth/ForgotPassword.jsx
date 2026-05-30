import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/shared/GlassCard';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset code sent. Please check your email.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <GlassCard className="max-w-lg w-full">
        <h1 className="text-3xl font-semibold mb-2 text-white">Forgot password?</h1>
        <p className="text-slate-400 mb-8">Enter your email address and we’ll send you a reset code.</p>
        {message && <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-100">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-slate-300">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>
          <button type="submit" className="btn-primary w-full py-3 text-white bg-violet-500 hover:bg-violet-400 rounded-2xl">
            Send reset code
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Remembered your password? <Link className="text-violet-300 hover:text-white" to="/login">Sign in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
