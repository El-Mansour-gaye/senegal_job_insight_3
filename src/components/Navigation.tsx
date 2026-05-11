import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  BarChart3,
  Users,
  FileBarChart,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const { persona, setPersona } = useData();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Offres', path: '/jobs' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  const handlePowerBIDownload = () => {
    const link = document.createElement('a');
    link.href = '/reports/placeholder_powerbi.pdf'; // Assuming a placeholder exists or will be there
    link.download = 'Rapport_PowerBI_SenegalJobs.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Le lien interactif PowerBI sera bientôt disponible. En attendant, voici un aperçu en PDF.");
  };

  const handleExportPDF = () => {
    // We'll use a custom event to trigger export in the Dashboard component
    const event = new CustomEvent('trigger-pdf-export');
    window.dispatchEvent(event);
  };

  return (
    <header className="w-full flex flex-col items-center pt-8 pb-4 px-6 z-50">
      {/* Brand Presentation */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter"
        >
          Senegal <span className="gradient-text">Job Insights</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 mt-2 text-sm md:text-base font-medium max-w-2xl mx-auto"
        >
          Analyse prédictive et tendances en temps réel du marché de l'emploi au Sénégal.
        </motion.p>
      </div>

      {/* Main Pill Navigation */}
      <nav className="pill-nav flex items-center gap-1 mb-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 text-sm font-bold",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:text-primary hover:bg-slate-50"
            )}
          >
            <item.icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Conditional Dashboard Sub-Navigation */}
      {isDashboard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap justify-center items-center gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
          <button
            onClick={() => setPersona('analyst')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold",
              persona === 'analyst' ? "bg-slate-100 text-primary" : "text-slate-500 hover:text-primary hover:bg-slate-50"
            )}
          >
            <BarChart3 size={14} strokeWidth={1.5} /> Décideur
          </button>
          <button
            onClick={() => setPersona('candidate')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold",
              persona === 'candidate' ? "bg-slate-100 text-primary" : "text-slate-500 hover:text-primary hover:bg-slate-50"
            )}
          >
            <Users size={14} strokeWidth={1.5} /> Candidat
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
          <button
            onClick={handlePowerBIDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-50 transition-all text-xs font-bold"
          >
            <FileBarChart size={14} strokeWidth={1.5} /> Rapport PowerBI
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-50 transition-all text-xs font-bold"
          >
            <Download size={14} strokeWidth={1.5} /> Rapport PDF
          </button>
        </motion.div>
      )}
    </header>
  );
};
