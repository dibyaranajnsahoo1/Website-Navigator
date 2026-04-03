import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function UploadPanel() {
  const { uploadFile, uploadGoogleSheet, state, fileInputRef } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');

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
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSheets = (e) => {
    e.preventDefault();
    if (!sheetsUrl.trim()) return;
    uploadGoogleSheet(sheetsUrl.trim());
    setSheetsUrl('');
  };

  return (
    <div className="upload-panel">
      <div className="upload-panel-header">
        <h3>Import URLs</h3>
        <p>Upload a spreadsheet or paste a Google Sheets link. Valid URLs are detected automatically.</p>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-zone-icon">📂</div>
        <h4>Drop a spreadsheet here</h4>
        <p>Supports `.xlsx`, `.xls`, and `.csv`</p>
        <button type="button" className="btn btn-primary upload-browse-btn" tabIndex={-1}>
          Choose file
        </button>
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


      <div className="sheets-input-wrap">
        <label className="upload-section-label">
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
        URLs can be in any column and duplicates are removed.<br />
        Use <strong>← →</strong> keyboard arrows to navigate.
      </div>
    </div>
  );
}
