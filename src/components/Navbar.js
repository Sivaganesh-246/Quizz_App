import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ isTeacher, onSignOut }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState('');

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">🎯</span>
          <span className="brand-name">Quiz<span className="accent-text">Master</span></span>
          <span className="brand-badge">SPA</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={isActive('/')}>
            🏠 Home
          </Link>
          <Link to="/categories" className={isActive('/categories')}>
            📚 Categories
          </Link>
          <Link to="/leaderboard" className={isActive('/leaderboard')}>
            🏆 Leaderboard
          </Link>
          {isTeacher ? (
            <>
              <Link to="/teacher/quizzes" className={isActive('/teacher/quizzes')}>
                ✎ Manage Quizzes
              </Link>
              <button
                type="button"
                className="nav-link nav-button"
                onClick={async () => {
                  setSignOutError('');
                  try {
                    await onSignOut();
                    navigate('/login');
                  } catch (error) {
                    setSignOutError(error.message);
                  }
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={isActive('/login')}>
              👤 Student / Teacher Login
            </Link>
          )}
        </nav>
      </div>
      {signOutError && <p className="form-error nav-error" role="alert">{signOutError}</p>}
    </header>
  );
};

export default Navbar;
