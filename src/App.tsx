import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Sidebar, Header } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { JobExplorer } from './pages/JobExplorer';
import { JobDetail } from './pages/JobDetail';
import ChatAssistant from './components/ChatAssistant';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 px-6 lg:px-12 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobExplorer />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/settings" element={<div className="p-12 text-center bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl shadow-premium">Page en cours de développement...</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}
