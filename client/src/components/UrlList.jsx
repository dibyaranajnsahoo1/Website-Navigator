import React from 'react';
import { useApp } from '../context/AppContext.jsx';

function Favicon({ url, domain }) {
  const [errored, setErrored] = React.useState(false);
  if (!url || errored) {
    return (
      <div className="url-item-favicon-fallback">
        {(domain || 'U')[0].toUpperCase()}
      </div>
    );
  }
  return (
    <img
      className="url-item-favicon"
      src={url}
      alt=""
      onError={() => setErrored(true)}
    />
  );
}

export default function UrlList() {
  const { state, dispatch, goToIndex, addBookmark, toast } = useApp();
  const { filteredUrls, currentIndex } = state;

  const copyUrl = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast('Copied!', 'success', 1800);
  };

  const bookmark = (urlObj, e) => {
    e.stopPropagation();
    addBookmark(urlObj);
  };

  if (filteredUrls.length === 0) {
    return (
      <div className="empty-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <p>No URLs loaded yet.<br />Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="url-list">
      <div className="url-list-header">
        <h4>URLs</h4>
        <span className="badge">{filteredUrls.length}</span>
      </div>
      {filteredUrls.map((urlObj, i) => (
        <div
          key={urlObj.url + i}
          className={`url-item ${i === currentIndex ? 'active' : ''}`}
          onClick={() => { goToIndex(i); dispatch({ type: 'SET_SIDEBAR_PANEL', payload: 'urls' }); }}
        >
          <Favicon url={urlObj.favicon} domain={urlObj.domain} />
          <div className="url-item-info">
            <div className="url-item-domain">{urlObj.domain || urlObj.url}</div>
            <div className="url-item-url">{urlObj.url}</div>
          </div>
          <div className="url-item-actions">
            <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4 }} onClick={(e) => copyUrl(urlObj.url, e)} data-tooltip="Copy">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button className="btn-icon" style={{ padding: 3, border: 'none', borderRadius: 4 }} onClick={(e) => bookmark(urlObj, e)} data-tooltip="Bookmark">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
