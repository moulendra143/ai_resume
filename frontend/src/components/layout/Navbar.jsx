import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="glass-panel flex items-center justify-between px-6 py-4 shadow-glass">
      <Link to="/" className="text-2xl font-semibold tracking-tight text-white">AI Resume Builder</Link>
      <div className="flex items-center gap-4">
        <button
          className="text-slate-100 hover:text-violet-400 transition-colors duration-200"
          type="button"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
        {isAuthenticated ? (
          <>
            <span className="text-slate-300">{user?.fullName ?? user?.email}</span>
            <button className="btn-primary" type="button" onClick={async () => { try { await logout(); } finally { navigate('/login'); } }}>
              <FiLogOut className="inline mr-2" /> Logout
            </button>
          </>
        ) : (
          <Link className="btn-primary" to="/login">Sign in</Link>
        )}
      </div>
    </header>
  );
}
