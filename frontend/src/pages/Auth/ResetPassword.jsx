import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/shared/GlassCard';
import api from '../../services/api';

export default function ResetPassword() {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/reset-password', form);
      setMessage('Your password has been reset. You can now sign in.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <GlassCard className="max-w-lg w-full">
        <h1 className="text-3xl font-semibold mb-2 text-white">Reset password</h1>
        <p className="text-slate-400 mb-8">Enter the OTP sent to your email and choose a new password.</p>
        {message && <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-100">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-slate-300">
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>
          <label className="block text-slate-300">
            OTP code
            <input
              type="text"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>
          <label className="block text-slate-300">
            New password
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>
          <label className="block text-slate-300">
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>
          <button type="submit" className="btn-primary w-full py-3 text-white bg-violet-500 hover:bg-violet-400 rounded-2xl">
            Reset password
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          <Link className="text-violet-300 hover:text-white" to="/login">Back to login</Link>
        </p>
      </GlassCard>
    </div>
  );
}
