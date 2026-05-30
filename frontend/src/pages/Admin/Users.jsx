import { useEffect, useState } from 'react';
import GlassCard from '../../components/shared/GlassCard';
import api from '../../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then((response) => setUsers(response.data))
      .catch(() => setError('Unable to load users.'));
  }, []);

  return (
    <div className="space-y-8">
      <GlassCard title="User management" subtitle="View all registered accounts">
        {error && <p className="text-red-300">{error}</p>}
        <div className="mt-4 space-y-4">
          {users.length === 0 ? (
            <p className="text-slate-400">No users available.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="rounded-3xl bg-white/5 p-5 flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{user.fullName || user.username}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
                <span className="text-slate-300 text-sm">{user.roles?.join(', ') || 'User'}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
