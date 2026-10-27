import React from 'react';
import { PAGES } from '../utils/constants';

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
  const handleGetStarted = () => {
    setAuthPage?.('login');
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
        <button
          type="button"
          onClick={handleGetStarted}
          className="top-nav__cta"
        >
          Get Started
        </button>
      </nav>
    </header>
  );
}
