import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
});

const initialState = {
  urls: [],
  filteredUrls: [],
  searchQuery: '',

  currentIndex: 0,
  tabs: [],            
  activeTabId: null,

  theme: 'light',
  sidebarPanel: 'upload', 
  isSidebarOpen: true,
  isLoading: false,
  iframeLoading: false,

  slideshowActive: false,
  slideshowInterval: 5, 

  history: [],
  bookmarks: [],

  sessionId: (() => {
    let id = sessionStorage.getItem('wnp_session');
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('wnp_session', id); }
    return id;
  })(),

 
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_URLS': {
      const urls = action.payload;
      return {
        ...state,
        urls,
        filteredUrls: filterUrls(urls, state.searchQuery),
        currentIndex: 0,
        tabs: urls.length > 0 ? [{ id: crypto.randomUUID(), urlObj: urls[0], active: true }] : [],
        activeTabId: null,
      };
    }
    case 'SET_SEARCH': {
      const q = action.payload;
      return { ...state, searchQuery: q, filteredUrls: filterUrls(state.urls, q), currentIndex: 0 };
    }
    case 'SET_INDEX':
      return { ...state, currentIndex: Math.max(0, Math.min(action.payload, state.filteredUrls.length - 1)) };
    case 'SET_THEME': {
      document.documentElement.setAttribute('data-theme', action.payload);
      localStorage.setItem('wnp_theme', action.payload);
      return { ...state, theme: action.payload };
    }
    case 'SET_SIDEBAR_PANEL':
      return { ...state, sidebarPanel: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, isSidebarOpen: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_IFRAME_LOADING':
      return { ...state, iframeLoading: action.payload };
    case 'SET_SLIDESHOW':
      return { ...state, slideshowActive: action.payload };
    case 'SET_SLIDESHOW_INTERVAL':
      return { ...state, slideshowInterval: action.payload };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'ADD_HISTORY':
      return { ...state, history: [action.payload, ...state.history].slice(0, 100) };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.payload };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [action.payload, ...state.bookmarks] };
    case 'REMOVE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter((b) => b._id !== action.payload) };

    case 'ADD_TAB': {
      const tab = { id: crypto.randomUUID(), urlObj: action.payload, active: true };
      return { ...state, tabs: [...state.tabs, tab], activeTabId: tab.id };
    }
    case 'CLOSE_TAB': {
      const tabs = state.tabs.filter((t) => t.id !== action.payload);
      const activeTabId = tabs.length ? tabs[tabs.length - 1].id : null;
      return { ...state, tabs, activeTabId };
    }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload };
    
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

function filterUrls(urls, query) {
  if (!query) return urls;
  const q = query.toLowerCase();
  return urls.filter((u) =>
    u.url.toLowerCase().includes(q) || (u.domain || '').toLowerCase().includes(q)
  );
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimers = useRef({});
  const fileInputRef = useRef();


  useEffect(() => {
    const saved = localStorage.getItem('wnp_theme') || 'light';
    dispatch({ type: 'SET_THEME', payload: saved });
  }, []);


  useEffect(() => {
    fetchHistory();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (!state.slideshowActive || state.filteredUrls.length <= 1) return;
    const timer = setInterval(() => {
      dispatch({ type: 'SET_INDEX', payload: (state.currentIndex + 1) % state.filteredUrls.length });
    }, state.slideshowInterval * 1000);
    return () => clearInterval(timer);
  }, [state.slideshowActive, state.slideshowInterval, state.currentIndex, state.filteredUrls.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.filteredUrls.length, state.currentIndex]);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    toastTimers.current[id] = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
      delete toastTimers.current[id];
    }, duration);
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: 'SET_INDEX', payload: (state.currentIndex + 1) % Math.max(state.filteredUrls.length, 1) });
  }, [state.currentIndex, state.filteredUrls.length]);

  const goPrev = useCallback(() => {
    dispatch({ type: 'SET_INDEX', payload: (state.currentIndex - 1 + state.filteredUrls.length) % Math.max(state.filteredUrls.length, 1) });
  }, [state.currentIndex, state.filteredUrls.length]);

  const goToIndex = useCallback((i) => {
    dispatch({ type: 'SET_INDEX', payload: i });
  }, []);

  const uploadFile = useCallback(async (file) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/upload/file', form);
      dispatch({ type: 'SET_URLS', payload: data.urls });
      toast(`✓ Loaded ${data.count} URLs`, 'success');
    } catch (err) {
      toast(
      typeof err.response?.data?.error === 'string'
        ? err.response.data.error
        : 'Upload failed',
      'error'
    );
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  const uploadGoogleSheet = useCallback(async (link) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/upload/sheets', { link });
      dispatch({ type: 'SET_URLS', payload: data.urls });
      toast(`✓ Loaded ${data.count} URLs from Sheet`, 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to fetch sheet', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/history', { params: { sessionId: state.sessionId, limit: 100 } });
      dispatch({ type: 'SET_HISTORY', payload: data.items });
    } catch {  }
  }, [state.sessionId]);

  const addToHistory = useCallback(async (urlObj) => {
    try {
      const { data } = await api.post('/history', {
        url: urlObj.url,
        title: urlObj.title || urlObj.domain,
        sessionId: state.sessionId,
      });
      dispatch({ type: 'ADD_HISTORY', payload: data });
    } catch {  }
  }, [state.sessionId]);

  const clearHistory = useCallback(async () => {
    try {
      await api.delete('/history', { params: { sessionId: state.sessionId } });
      dispatch({ type: 'CLEAR_HISTORY' });
      toast('History cleared', 'info');
    } catch {  }
  }, [state.sessionId, toast]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data } = await api.get('/bookmarks', { params: { sessionId: state.sessionId } });
      dispatch({ type: 'SET_BOOKMARKS', payload: data });
    } catch {  }
  }, [state.sessionId]);

  const addBookmark = useCallback(async (urlObj) => {
    try {
      const { data } = await api.post('/bookmarks', {
        url: urlObj.url,
        title: urlObj.title || urlObj.domain,
        sessionId: state.sessionId,
      });
      dispatch({ type: 'ADD_BOOKMARK', payload: data });
      toast('Bookmarked!', 'success');
    } catch (err) {
      if (err.response?.status === 409) toast('Already bookmarked', 'info');
      else toast('Failed to bookmark', 'error');
    }
  }, [state.sessionId, toast]);

  const removeBookmark = useCallback(async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      dispatch({ type: 'REMOVE_BOOKMARK', payload: id });
      toast('Bookmark removed', 'info');
    } catch { toast('Failed to remove', 'error'); }
  }, [toast]);

  const exportUrls = useCallback(() => {
    const content = state.urls.map((u) => u.url).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls-export.txt';
    link.click();
    toast('URLs exported', 'success');
  }, [state.urls, toast]);

  const value = {
    state,
    dispatch,
    toast,
    goNext,
    goPrev,
    goToIndex,
    uploadFile,
    uploadGoogleSheet,
    fetchHistory,
    addToHistory,
    clearHistory,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    exportUrls,
    currentUrl: state.filteredUrls[state.currentIndex] || null,
     fileInputRef,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
