import React, { useContext, useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { PAGES } from '../utils/constants';
import { FirebaseContext } from '../context/FirebaseContext';

const NAV_LINKS = [
  { key: PAGES.HOME, label: 'Home' },
  { key: PAGES.JOURNAL, label: 'Journal' },
  { key: PAGES.GOALS, label: 'Goals' },
  { key: PAGES.GAMES, label: 'Games' },
  { key: PAGES.COMMUNITY, label: 'Community' },
  { key: PAGES.CHAT, label: 'CalmBot' }
];

export default function TopNavBar({
  currentPage,
  setCurrentPage,
  setAuthPage
}) {
  const { auth, user } = useContext(FirebaseContext);
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setAuthPage?.('login');
      return;
    }
    setCurrentPage?.(PAGES.HOME);
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setCurrentPage?.(PAGES.HOME);
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <header className="top-nav">
      <nav className="top-nav__inner">
        <div className="top-nav__branding">
          <span className="top-nav__logo">CalmSpace</span>
          <ul className="top-nav__links">
            {NAV_LINKS.map(({ key, label }) => {
              const isActive = currentPage === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage?.(key)}
                    className={`top-nav__link${isActive ? ' top-nav__link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="top-nav__actions">
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="top-nav__logout"
            >
              Logout
            </button>
          )}
          <button
            type="button"
            onClick={handleGetStarted}
            className="top-nav__cta"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
}
