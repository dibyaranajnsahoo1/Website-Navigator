import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import UploadPanel from './UploadPanel.jsx';
import HistoryPanel from './HistoryPanel.jsx';
import BookmarksPanel from './BookmarksPanel.jsx';
import UrlList from './UrlList.jsx';

const PANELS = [
  {
    id: 'upload', label: 'Upload',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    id: 'urls', label: 'URLs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    id: 'history', label: 'History',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/>
      </svg>
    ),
  },
  {
    id: 'bookmarks', label: 'Saved',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {PANELS.map((p) => (
          <button
            key={p.id}
            className={`sidebar-nav-btn ${state.sidebarPanel === p.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_SIDEBAR_PANEL', payload: p.id })}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-content">
        {state.sidebarPanel === 'upload'    && <UploadPanel />}
        {state.sidebarPanel === 'urls'      && <UrlList />}
        {state.sidebarPanel === 'history'   && <HistoryPanel />}
        {state.sidebarPanel === 'bookmarks' && <BookmarksPanel />}
      </div>
    </aside>
  );
}
