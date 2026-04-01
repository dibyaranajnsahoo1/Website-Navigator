import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function UploadPanel() {
  const { uploadFile, uploadGoogleSheet, state } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  // const fileRef = useRef();
  const { fileInputRef } = useApp();

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Only .xlsx, .xls, or .csv files are supported.');
      return;
    }
    uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSheets = (e) => {
    e.preventDefault();
    if (sheetsUrl.trim()) {
      uploadGoogleSheet(sheetsUrl.trim());
      setSheetsUrl('');
    }
  };

  return (
    <div className="upload-panel">
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        // onClick={() => fileRef.current.click()}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="upload-zone-icon">📂</div>
        <h4>Drop file here</h4>
        <p>.xlsx, .xls, .csv supported</p>
        <p style={{ marginTop: 6, fontSize: 11, color: 'var(--accent)' }}>Click to browse</p>
        <input
  ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {state.isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <div className="spinner" />
        </div>
      )}

      <div className="divider">or</div>

      <div className="sheets-input-wrap">
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          🔗 Google Sheets Link
        </label>
        <input
          className="input"
          placeholder="https://docs.google.com/spreadsheets/d/…"
          value={sheetsUrl}
          onChange={(e) => setSheetsUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSheets(e)}
        />
        <button className="btn btn-primary w-full" onClick={handleSheets} disabled={!sheetsUrl.trim()}>
          Fetch Sheet
        </button>
      </div>

      {state.urls.length > 0 && (
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 4 }}>Loaded</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{state.urls.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>URLs ready to navigate</div>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>Tips:</strong>
        URLs can be in any column we'll find them automatically.<br />
        Invalid URLs and duplicates are removed.<br />
        Use <strong>← →</strong> keyboard arrows to navigate.
      </div>
    </div>
  );
}
