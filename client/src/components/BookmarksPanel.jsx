import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function BookmarksPanel() {
  const { state, dispatch, removeBookmark, goToIndex, toast } = useApp();
  const { bookmarks, filteredUrls } = state;

  const openUrl = (urlObj) => {
    const idx = filteredUrls.findIndex((u) => u.url === urlObj.url);
    if (idx !== -1) {
      goToIndex(idx);
    } else {
      dispatch({ type: 'SET_URLS', payload: [urlObj, ...filteredUrls] });
    }
  };

  const copyUrl = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast('Copied!', 'success', 1800);
  };

  return (
    <div className="bookmarks-panel">
      <div className="panel-header">
        <h3>Bookmarks</h3>
        <span className="badge">{bookmarks.length}</span>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <p>No bookmarks saved.<br />Click the bookmark icon on any URL.</p>
        </div>
      ) : (
        bookmarks.map((bm) => (
          <div key={bm._id} className="bookmark-item" onClick={() => openUrl(bm)}>
            <img
              src={bm.favicon || `https://www.google.com/s2/favicons?domain=${bm.domain}&sz=32`}
              alt="" width="14" height="14" style={{ borderRadius: 3, flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="bookmark-item-info">
              <div className="bookmark-item-domain">{bm.title || bm.domain}</div>
              <div className="bookmark-item-url">{bm.url}</div>
            </div>
            <div className="bookmark-item-actions">
              <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4 }}
                onClick={(e) => copyUrl(bm.url, e)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4, color: '#ef4444' }}
                onClick={(e) => { e.stopPropagation(); removeBookmark(bm._id); }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
