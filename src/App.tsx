import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Header } from './components/Navigation';
import { ChatAssistant } from './components/ChatAssistant';
import { Dashboard } from './pages/Dashboard';
import { JobExplorer } from './pages/JobExplorer';
import { JobDetail } from './pages/JobDetail';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col relative">
      <div className="bg-blobs">
        <div className="blob-turquoise" />
        <div className="blob-orange" />
      </div>
      <Header />
      <main className="flex-1 px-6 lg:px-12 py-8 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>
      <ChatAssistant />
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
            <Route path="/settings" element={<div className="p-12 text-center glass-card rounded-3xl">Page en cours de développement...</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}
