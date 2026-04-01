import React from 'react';
import { useApp } from './context/AppContext.jsx';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainPanel from './components/MainPanel.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import './App.css';

export default function App() {
  const { state } = useApp();

  return (
    <div className={`app-root ${state.isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <MainPanel />
      </div>
      <ToastContainer />
    </div>
  );
}
