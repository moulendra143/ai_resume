import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiSearch, FiUser, FiShield } from 'react-icons/fi';

const menu = [
  { label: 'Dashboard', path: '/', icon: FiHome },
  { label: 'Resume Builder', path: '/resume-builder', icon: FiFileText },
  { label: 'ATS Analyzer', path: '/ats-analyzer', icon: FiSearch },
  { label: 'Profile', path: '/profile', icon: FiUser },
  { label: 'Admin', path: '/admin', icon: FiShield },
];

export default function Sidebar() {
  return (
    <aside className="glass-panel p-6 min-h-[calc(100vh-96px)]">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Workspace</h2>
        <p className="mt-2 text-slate-400">Control your career toolkit.</p>
      </div>
      <nav className="space-y-3">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
