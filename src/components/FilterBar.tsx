import React from 'react';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';

interface FilterState {
  search: string;
  sector: string;
  city: string;
  contract: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  showSearch?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, showSearch = true }) => {
  const { jobs } = useData();

  const sectors = ['Tous les secteurs', ...Array.from(new Set(jobs.map(j => j.sector)))].sort();
  const cities = ['Toutes les villes', ...Array.from(new Set(jobs.map(j => j.location)))].sort();
  const contracts = ['Tous les contrats', ...Array.from(new Set(jobs.map(j => j.contract_type)))].sort();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="pill-nav px-6 py-3 flex flex-wrap gap-4 items-center justify-center">
        {showSearch && (
          <div className="flex-1 min-w-[200px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Titre, entreprise..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 outline-none text-xs text-slate-200"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Filter size={18} /> <span className="hidden sm:inline">Filtres :</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full outline-none text-xs font-bold text-slate-200 appearance-none cursor-pointer hover:bg-slate-700 transition-colors min-w-[120px]"
            value={filters.sector}
            onChange={(e) => setFilters({...filters, sector: e.target.value})}
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full outline-none text-xs font-bold text-slate-200 appearance-none cursor-pointer hover:bg-slate-700 transition-colors min-w-[120px]"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full outline-none text-xs font-bold text-slate-200 appearance-none cursor-pointer hover:bg-slate-700 transition-colors min-w-[120px]"
            value={filters.contract}
            onChange={(e) => setFilters({...filters, contract: e.target.value})}
          >
            {contracts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
