import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';

function TabBar() {
  const { state, dispatch } = useApp();
  const { tabs, activeTabId, filteredUrls, currentIndex } = state;
  const currentUrl = filteredUrls[currentIndex] || null;

  const addTab = () => {
    if (currentUrl) dispatch({ type: 'ADD_TAB', payload: currentUrl });
  };

  if (tabs.length === 0 && !currentUrl) return null;

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
        >
          <img
            src={tab.urlObj.favicon || `https://www.google.com/s2/favicons?domain=${tab.urlObj.domain}&sz=32`}
            alt="" onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {tab.urlObj.domain || tab.urlObj.url}
          </span>
          <span
            className="tab-close"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE_TAB', payload: tab.id }); }}
          >✕</span>
        </div>
      ))}
      {currentUrl && (
        <button className="tab-add-btn" onClick={addTab} title="Open in new tab">+</button>
      )}
    </div>
  );
}

function IframeViewer({ urlObj }) {
  const { addToHistory } = useApp();
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    if (!urlObj) return;
    setLoading(true);
    setBlocked(false);

    timerRef.current = setTimeout(() => {
      setLoading(false);
      setBlocked(true);
    }, 8000);

    return () => clearTimeout(timerRef.current);
  }, [urlObj?.url]);

  const handleLoad = () => {
    clearTimeout(timerRef.current);
    setLoading(false);
    setBlocked(false);
    if (urlObj) addToHistory(urlObj);
  };

  const handleError = () => {
    clearTimeout(timerRef.current);
    setLoading(false);
    setBlocked(true);
  };

  if (!urlObj) return null;

  return (
    <div className="iframe-wrap">
      {loading && (
        <div className="iframe-overlay" style={{ background: 'var(--bg-base)' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading {urlObj.domain}…</span>
        </div>
      )}
      {blocked && (
        <div className="iframe-overlay">
          <div className="iframe-blocked">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
              Content Blocked
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.5 }}>
              <strong>{urlObj.domain}</strong> doesn't allow embedding in iframes (X-Frame-Options).
            </p>
            <a href={urlObj.url} target="_blank" rel="noopener noreferrer">
              Open in new tab ↗
            </a>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={urlObj.url}
        src={urlObj.url}
        title={urlObj.domain}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        style={{ visibility: blocked ? 'hidden' : 'visible' }}
      />
    </div>
  );
}

function NavControls() {
  const { state, dispatch, goNext, goPrev, addBookmark, toast } = useApp();
  const { filteredUrls, currentIndex, slideshowActive, slideshowInterval } = state;
  const current = filteredUrls[currentIndex];

  const progress = filteredUrls.length > 1
    ? (currentIndex / (filteredUrls.length - 1)) * 100
    : 0;

  const copyUrl = () => {
    if (!current) return;
    navigator.clipboard.writeText(current.url);
    toast('Copied!', 'success', 1800);
  };

  if (filteredUrls.length === 0) return null;

  return (
    <div className="nav-controls">
      <button className="btn btn-ghost" onClick={goPrev} disabled={currentIndex === 0} style={{ padding: '6px 12px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Prev
      </button>

      <div className="nav-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <span className="nav-counter">{currentIndex + 1} / {filteredUrls.length}</span>

      <button className="btn btn-ghost" onClick={goNext} disabled={currentIndex === filteredUrls.length - 1} style={{ padding: '6px 12px' }}>
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

      {current && (
        <>
          <button className="btn btn-icon" onClick={copyUrl} data-tooltip="Copy URL">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button className="btn btn-icon" onClick={() => addBookmark(current)} data-tooltip="Bookmark">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="btn btn-icon" data-tooltip="Open in new tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </>
      )}

      <div className="slideshow-controls">
        <select
          className="interval-select"
          value={slideshowInterval}
          onChange={(e) => dispatch({ type: 'SET_SLIDESHOW_INTERVAL', payload: Number(e.target.value) })}
        >
          <option value={3}>3s</option>
          <option value={5}>5s</option>
          <option value={10}>10s</option>
          <option value={15}>15s</option>
          <option value={30}>30s</option>
        </select>
        <button
          className={`btn ${slideshowActive ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => dispatch({ type: 'SET_SLIDESHOW', payload: !slideshowActive })}
          style={{ padding: '6px 10px', fontSize: 12 }}
        >
          {slideshowActive ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Auto</>
          )}
        </button>
      </div>
    </div>
  );
}


function UrlBar({ urlObj }) {
  if (!urlObj) return null;
  return (
    <div className="url-bar">
      <img
        src={urlObj.favicon || `https://www.google.com/s2/favicons?domain=${urlObj.domain}&sz=32`}
        alt="" width="14" height="14" style={{ borderRadius: 3, flexShrink: 0 }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="url-bar-text">{urlObj.url}</div>
      <a href={urlObj.url} target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        title="Open in new tab">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  );
}


function WelcomeScreen() {
  // const { dispatch } = useApp();
  const { dispatch, fileInputRef } = useApp();
  return (
    <div className="welcome-screen">
      <div className="welcome-logo">🌐</div>
      <h2>Website Navigator</h2>
      <p>
        Upload an Excel, CSV file, or paste a Google Sheets link to load your URL list.
        Then browse through them with keyboard arrows or the navigation controls.
      </p>
      <button
        className="btn btn-primary"
        style={{ marginTop: 8 }}
        onClick={() => {
  dispatch({ type: 'SET_SIDEBAR_PANEL', payload: 'upload' });

  setTimeout(() => {
    fileInputRef.current?.click();
  }, 100);
}}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Upload File
      </button>
      <div style={{ display: 'flex', gap: 24, marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
        {[
          ['← →', 'Navigate'],
          ['Space', 'Play/Pause'],
          ['Ctrl+B', 'Bookmark'],
        ].map(([key, label]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontFamily: 'monospace', marginBottom: 4, fontSize: 11, color: 'var(--text-secondary)' }}>{key}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function MainPanel() {
  const { state } = useApp();
  const { filteredUrls, currentIndex, tabs, activeTabId } = state;
  const currentUrl = filteredUrls[currentIndex] || null;

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const displayUrl = activeTab ? activeTab.urlObj : currentUrl;

  return (
    <main className="main-panel">
      <TabBar />

      <div className="viewer-area">
        {!displayUrl ? (
          <WelcomeScreen />
        ) : (
          <>
            <UrlBar urlObj={displayUrl} />
            <IframeViewer urlObj={displayUrl} />
          </>
        )}
      </div>

      <NavControls />
    </main>
  );
}
