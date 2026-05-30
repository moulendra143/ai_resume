import { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/shared/GlassCard';
import api from '../../services/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Email passed from Register page via navigation state
  const emailFromState = location.state?.email || '';
  const passwordFromState = location.state?.password || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code });
      setSuccess('Email verified! Logging you in…');
      // Auto-login after successful verification
      if (passwordFromState) {
        await login(email, passwordFromState);
        navigate('/');
      } else {
        setSuccess('Email verified! Please log in.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <GlassCard className="max-w-lg w-full">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6 mx-auto">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-white text-center">Check your email</h1>
        <p className="text-slate-400 mb-8 text-center">
          We sent a 6-digit verification code to <span className="text-violet-300 font-medium">{email || 'your email'}</span>.
          Enter it below to verify your account.
        </p>

        {success && (
          <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-100 text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {/* Show email input only if not passed via state */}
          {!emailFromState && (
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
          )}

          <label className="block text-slate-300">
            Verification code
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="mt-2 w-full px-4 py-3 bg-slate-950/80 text-white text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-violet-500"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="btn-primary w-full py-3 text-white bg-violet-500 hover:bg-violet-400 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400 space-y-2">
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="text-violet-300 hover:text-white underline"
            >
              Resend code
            </button>
          </p>
          <p>
            <Link className="text-violet-300 hover:text-white" to="/login">Back to Sign in</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
