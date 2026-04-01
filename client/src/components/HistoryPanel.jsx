import React from 'react';
import { useApp } from '../context/AppContext.jsx';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPanel() {
  const { state, dispatch, clearHistory, goToIndex, addBookmark, toast } = useApp();
  const { history, filteredUrls } = state;

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
    <div className="history-panel">
      <div className="panel-header">
        <h3>Recent History</h3>
        {history.length > 0 && (
          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 11 }} onClick={clearHistory}>
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/>
          </svg>
          <p>No history yet.<br />Start browsing to see it here.</p>
        </div>
      ) : (
        history.map((item) => (
          <div key={item._id} className="history-item" onClick={() => openUrl(item)}>
            <img
              src={item.favicon || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`}
              alt="" width="14" height="14" style={{ borderRadius: 3, flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="history-item-info">
              <div className="history-item-domain">{item.domain || item.url}</div>
              <div className="history-item-time">{timeAgo(item.visitedAt)}</div>
            </div>
            <div className="history-item-actions">
              <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4 }}
                onClick={(e) => copyUrl(item.url, e)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4 }}
                onClick={(e) => { e.stopPropagation(); addBookmark(item); }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
