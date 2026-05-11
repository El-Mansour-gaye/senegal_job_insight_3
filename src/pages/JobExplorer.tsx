import React, { useState, useMemo } from 'react';
import { JobCard } from '../components/JobCard';
import { FilterBar } from '../components/FilterBar';
import { useData } from '../context/DataContext';
import { Briefcase } from 'lucide-react';

export const JobExplorer: React.FC = () => {
  const { jobs, isLoading } = useData();
  const [filters, setFilters] = useState({
    search: '',
    sector: 'Tous les secteurs',
    city: 'Toutes les villes',
    contract: 'Tous les contrats'
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          job.company.toLowerCase().includes(filters.search.toLowerCase());
      const matchSector = filters.sector === 'Tous les secteurs' || job.sector.includes(filters.sector);
      const matchCity = filters.city === 'Toutes les villes' || job.location === filters.city;
      const matchContract = filters.contract === 'Tous les contrats' || job.contract_type === filters.contract;
      
      return matchSearch && matchSector && matchCity && matchContract;
    });
  }, [filters, jobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explorez les opportunités</h1>
        <p className="text-slate-500 mt-1 font-bold">Trouvez le job qui vous correspond parmi des milliers d'offres.</p>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <div className="flex items-center justify-between text-sm text-slate-500 mb-4 px-2">
        <p><span className="font-black text-slate-900">{filteredJobs.length}</span> offres correspondantes</p>
        <div className="flex gap-4">
          <button className="hover:text-primary font-bold transition-colors">Plus récents</button>
          <button className="hover:text-primary font-bold transition-colors">Salaire (estim.)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Briefcase size={32} strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">Aucun résultat trouvé</h3>
             <p className="text-slate-500 font-medium">Essayez de modifier vos filtres ou votre recherche.</p>
             <button 
               onClick={() => setFilters({search: '', sector: 'Tous les secteurs', city: 'Toutes les villes', contract: 'Tous les contrats'})}
               className="text-primary font-black hover:underline"
             >
               Réinitialiser les filtres
             </button>
          </div>
        )
        }
      </div>
    </div>
  );
};
