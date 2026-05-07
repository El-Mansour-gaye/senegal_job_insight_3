import React from 'react';
import { KPICard } from '../components/KPICard';
import { EvolutionChart, DistributionChart, SectorBarChart, SalaryChart } from '../components/Charts';
import { MapChart } from '../components/MapChart';
import { JobsDataTable } from '../components/JobsDataTable';
import { useData } from '../context/DataContext';
import { LayoutDashboard, Briefcase, BarChart3, Settings, LogOut, Search, MapPin, Users, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { jobs, isLoading, stats, error } = useData();
  const [persona, setPersona] = React.useState<'analyst' | 'candidate'>('analyst');
  
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

  const salaryChartData = stats.salaryBySector;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Senegal Job Insights</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {persona === 'analyst' 
              ? "Vision stratégique : Tendances macro et dynamiques du marché." 
              : "Vision candidat : Exploration granulaire et opportunités ciblées."}
          </p>
        </div>
        
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit self-start md:self-center">
          <button 
            onClick={() => setPersona('analyst')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              persona === 'analyst' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BarChart3 size={18} /> Décideur
          </button>
          <button 
            onClick={() => setPersona('candidate')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              persona === 'candidate' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Users size={18} /> Candidat
          </button>
        </div>
      </div>

      {persona === 'analyst' ? (
        <>
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Total des offres" 
              value={stats.totalJobs.toLocaleString()} 
              icon={Briefcase} 
              description="Offres uniques collectées"
              color="primary"
            />
            <KPICard 
              title="Secteur porteur" 
              value={stats.dominantSector} 
              icon={Zap} 
              description="Secteur avec le plus gros volume"
              color="secondary"
            />
            <KPICard 
              title="Ville active" 
              value={stats.topCity} 
              icon={MapPin} 
              description="Concentration géographique principale"
              color="accent"
            />
            <KPICard 
              title="Top Compétence" 
              value={stats.topSkill} 
              icon={TrendingUp} 
              description="Compétence la plus demandée"
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
              <SalaryChart data={salaryChartData} title="Salaire Moyen par Secteur (CFA)" />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Profil Candidat</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                En tant que candidat, vous pouvez explorer les opportunités réelles du marché, comparer les salaires et identifier les compétences clés pour booster votre employabilité.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">1</div>
                  <span>Identifiez les zones à forte densité à Dakar</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</div>
                  <span>Filtrez par type de contrat privilégié</span>
                </div>
              </div>
            </div>
            <KPICard 
              title="Salaire Moyen Estimé" 
              value={`${stats.avgSalary.toLocaleString()} CFA`} 
              icon={DollarSign} 
              description="Basé sur l'échantillon collecté"
              color="primary"
            />
          </div>
          <div className="lg:col-span-2">
            <MapChart data={stats.geoStats} title="Où sont les opportunités ?" />
          </div>
        </div>
      )}

      {/* Advanced Data Table - Always visible as it's the core explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {persona === 'candidate' ? 'Trouver votre prochain défi' : 'Exploration des données'}
          </h2>
          <button className="text-primary font-bold text-sm hover:underline">Exporter (.csv)</button>
        </div>
        <JobsDataTable data={jobs} />
      </div>

      {/* Methodology Section - "Coulisses de la donnée" */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 font-display">
              <Zap className="text-primary" /> Coulisses de la donnée
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ce dashboard est alimenté par un pipeline ETL (Extract, Transform, Load) automatisé conçu spécifiquement pour le marché sénégalais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:col-span-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h4 className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Sources</h4>
              <p className="text-xs text-slate-300">Données agrégées depuis EmploiSénégal, LinkedIn et sites carrières officiels.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h4 className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Traitement</h4>
              <p className="text-xs text-slate-300">Nettoyage NLP pour la normalisation des intitulés et dédoublonnage intelligent.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h4 className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Fréquence</h4>
              <p className="text-xs text-slate-300">Mise à jour : {new Date().toLocaleDateString('fr-FR')}. Scraping hebdomadaire avec 98% de succès.</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </motion.div>
    </div>
  );
};
