import React from 'react';
import { KPICard } from '../components/KPICard';
import { EvolutionChart, DistributionChart, SectorBarChart, SalaryChart } from '../components/Charts';
import { MapChart } from '../components/MapChart';
import { JobsDataTable } from '../components/JobsDataTable';
import { MOCK_STATS, MOCK_JOBS } from '../data/mockData';
import { Users, Briefcase, MapPin, Zap, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
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
          value={MOCK_STATS.totalJobs.toLocaleString()} 
          icon={Briefcase} 
          trend="12.4%" 
          trendUp={true}
          color="primary"
        />
        <KPICard 
          title="Secteur porteur" 
          value={MOCK_STATS.dominantSector} 
          icon={Zap} 
          trend="8.1%" 
          trendUp={true}
          color="secondary"
        />
        <KPICard 
          title="Ville active" 
          value={MOCK_STATS.topCity} 
          icon={MapPin} 
          trend="3.2%" 
          trendUp={false}
          color="accent"
        />
        <KPICard 
          title="Top Compétence" 
          value={MOCK_STATS.topSkill} 
          icon={TrendingUp} 
          color="blue"
        />
      </div>

      {/* Main Charts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MapChart data={MOCK_STATS.geoStats} title="Répartition Géographique des Offres" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EvolutionChart data={MOCK_STATS.monthlyEvolution} title="Évolution des recrutements" />
            <DistributionChart data={MOCK_STATS.contractDistribution} title="Contrats proposés" />
          </div>
        </div>
        <div className="space-y-8">
          <SectorBarChart data={MOCK_STATS.sectorDistribution} title="Volume par secteur" />
          <SalaryChart data={salaryData} title="Salaire Moyen par Secteur (CFA)" />
        </div>
      </div>

      {/* Advanced Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Exploration des données</h3>
          <button className="text-primary font-bold text-sm hover:underline">Exporter (.csv)</button>
        </div>
        <JobsDataTable data={MOCK_JOBS} />
      </div>
    </div>
  );
};
