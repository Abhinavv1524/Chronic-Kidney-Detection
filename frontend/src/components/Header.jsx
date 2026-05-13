import '../styles/App.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onLoginClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <div>
            <h1>HFSA-CKD</h1>
            <p className="header-subtitle">Chronic Kidney Disease Prediction</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <div className="user-menu">
                <span className="username">{user.username}</span>
                <button className="logout-btn" onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className="login-btn" onClick={onLoginClick}>Sign In</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
