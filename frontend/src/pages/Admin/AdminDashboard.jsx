import { useEffect, useState } from 'react';
import GlassCard from '../../components/shared/GlassCard';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then((response) => setStats(response.data))
      .catch(() => setError('Unable to load admin stats.'));

    api.get('/admin/users')
      .then((response) => setUsers(response.data))
      .catch(() => setError('Unable to load user list.'));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid xl:grid-cols-3 gap-6">
        <GlassCard title="Active users" subtitle="Total registered users">
          <div className="text-5xl font-semibold text-white">{stats?.activeUsers ?? '—'}</div>
        </GlassCard>
        <GlassCard title="Open resumes" subtitle="Resumes created in the system">
          <div className="text-5xl font-semibold text-white">{stats?.resumesCreated ?? '—'}</div>
        </GlassCard>
        <GlassCard title="ATS runs" subtitle="ATS checks processed">
          <div className="text-5xl font-semibold text-white">{stats?.atsRuns ?? '—'}</div>
        </GlassCard>
      </div>
      <GlassCard title="Users" subtitle="Recent user accounts">
        {error && <p className="text-red-300">{error}</p>}
        <div className="mt-4 grid gap-3">
          {users.length > 0 ? users.map((user) => (
            <div key={user.id} className="rounded-3xl bg-white/5 p-5 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{user.fullName || user.username}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
              <span className="text-slate-300 text-sm">{user.roles?.join(', ') || 'User'}</span>
            </div>
          )) : <p className="text-slate-400">No users found.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
