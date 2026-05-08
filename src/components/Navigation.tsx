import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BarChart3, Settings, LogOut, Search, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Offres d\'emploi', path: '/jobs' },
    { icon: Settings, label: 'Configuration', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Briefcase size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Senegal<span className="text-primary">Jobs</span></span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all w-full text-left">
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-bottom border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Rechercher un métier, une ville..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin size={16} />
          <span>Dakar, Sénégal</span>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm cursor-pointer">
          MG
        </div>
      </div>
    </header>
  );
};
