import React from 'react';
import { Search, Filter, ChevronDown, Calendar, MapPin, Briefcase } from 'lucide-react';

interface FilterState {
  search: string;
  sector: string;
  city: string;
  contract: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const sectors = ['Tous les secteurs', 'Informatique', 'Finance', 'Santé', 'BTP', 'Commerce', 'Éducation'];
  const cities = ['Toutes les villes', 'Dakar', 'Thiès', 'Saint-Louis', 'Mbour', 'Ziguinchor'];
  const contracts = ['Tous les contrats', 'CDI', 'CDD', 'Stage', 'Freelance', 'Intérim'];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-premium border border-slate-100 mb-8 sticky top-24 z-10 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Titre, mots-clés..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select 
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
          value={filters.sector}
          onChange={(e) => setFilters({...filters, sector: e.target.value})}
        >
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
          value={filters.city}
          onChange={(e) => setFilters({...filters, city: e.target.value})}
        >
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
          value={filters.contract}
          onChange={(e) => setFilters({...filters, contract: e.target.value})}
        >
          {contracts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all opacity-90 hover:opacity-100">
          <Filter size={16} />
          Filtrer
        </button>
      </div>
    </div>
  );
};
