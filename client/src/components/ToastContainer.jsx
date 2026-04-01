import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  return (
    <div className="toast-container">
      {state.toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })}
        >
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error'   && <span>✕</span>}
          {t.type === 'info'    && <span>ℹ</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
