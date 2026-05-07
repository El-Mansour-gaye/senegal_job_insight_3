import React from 'react';
import { KPICard } from '../components/KPICard';
import { EvolutionChart, DistributionChart, SectorBarChart, SalaryChart } from '../components/Charts';
import { MapChart } from '../components/MapChart';
import { JobsDataTable } from '../components/JobsDataTable';
import { useData } from '../context/DataContext';
import { Users, Briefcase, MapPin, Zap, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { jobs, isLoading, stats, error } = useData();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl p-12 text-center shadow-premium">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Briefcase size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Aucune donnée disponible</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Le fichier de données est vide ou n'a pas encore été généré par le scraper sur Render.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Zap size={20} /> Actualiser la page
        </button>
      </div>
    );
  }

  const salaryData = [
    { name: 'Informatique', value: 850000 },
    { name: 'Finance', value: 720000 },
    { name: 'Santé', value: 650000 },
    { name: 'Marketing', value: 580000 },
    { name: 'Vente', value: 450000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Senegal Job Insights</h1>
          <p className="text-slate-500 mt-1">Plateforme d'analyse prédictive et d'exploration du marché de l'emploi.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Analysis</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total des offres" 
          value={stats.totalJobs.toLocaleString()} 
          icon={Briefcase} 
          trend="12.4%" 
          trendUp={true}
          color="primary"
        />
        <KPICard 
          title="Secteur porteur" 
          value={stats.dominantSector} 
          icon={Zap} 
          trend="8.1%" 
          trendUp={true}
          color="secondary"
        />
        <KPICard 
          title="Ville active" 
          value={stats.topCity} 
          icon={MapPin} 
          trend="3.2%" 
          trendUp={false}
          color="accent"
        />
        <KPICard 
          title="Top Compétence" 
          value={stats.topSkill} 
          icon={TrendingUp} 
          color="blue"
        />
      </div>

      {/* Main Charts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MapChart data={stats.geoStats} title="Répartition Géographique des Offres" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EvolutionChart data={stats.monthlyEvolution} title="Évolution des recrutements" />
            <DistributionChart data={stats.contractDistribution} title="Contrats proposés" />
          </div>
        </div>
        <div className="space-y-8">
          <SectorBarChart data={stats.sectorDistribution} title="Volume par secteur" />
          <SalaryChart data={salaryData} title="Salaire Moyen par Secteur (CFA)" />
        </div>
      </div>

      {/* Advanced Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Exploration des données</h3>
          <button className="text-primary font-bold text-sm hover:underline">Exporter (.csv)</button>
        </div>
        <JobsDataTable data={jobs} />
      </div>
    </div>
  );
};
