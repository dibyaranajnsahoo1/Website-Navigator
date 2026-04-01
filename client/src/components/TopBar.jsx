import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function TopBar() {
  const { state, dispatch, exportUrls } = useApp();

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <header className="topbar">
      <button
        className="btn btn-icon"
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        data-tooltip="Toggle Sidebar"
        style={{ border: 'none' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="topbar-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        Website<span>Navigator</span>
      </div>

      <div className="topbar-search-wrap">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="input"
          placeholder="Search URLs or domains…"
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
        />
      </div>

      <div className="topbar-right">
        {state.urls.length > 0 && (
          <button className="btn btn-ghost" onClick={exportUrls} style={{ fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        )}

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          data-tooltip={state.theme === 'light' ? 'Dark mode' : 'Light mode'}
          aria-label="Toggle theme"
        >
          <div className="theme-toggle-thumb">
            {state.theme === 'light' ? '☀️' : '🌙'}
          </div>
        </button>
      </div>
    </header>
  );
}
