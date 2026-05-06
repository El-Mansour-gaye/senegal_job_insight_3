import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Header } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { JobExplorer } from './pages/JobExplorer';
import { JobDetail } from './pages/JobDetail';
import { Stats } from './pages/Stats';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobExplorer />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<div className="p-8 text-center bg-white rounded-2xl shadow-premium">Page en cours de développement...</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
