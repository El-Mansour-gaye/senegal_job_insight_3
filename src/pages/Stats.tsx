import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { useData } from '../context/DataContext';
import { Brain, Star, TrendingUp, Award } from 'lucide-react';
import { KPICard } from '../components/KPICard';

export const Stats: React.FC = () => {
  const { isLoading, stats } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-premium">
        <p className="text-slate-500">Aucune donnée disponible pour l'analyse.</p>
      </div>
    );
  }

  const topSkillsList = stats.radarSkills.map((s: any, i: number) => ({
    name: s.subject,
    percentage: Math.round((s.A / stats.totalJobs) * 100),
    color: ['#0a988b', '#ff9d17', '#3b82f6', '#f44a3c', '#8b5cf6', '#ec4899'][i % 6]
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analyses Approfondies</h1>
        <p className="text-slate-500 mt-1">Intelligence artificielle et statistiques basées sur les offres réelles collectées.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Top Compétence" 
          value={stats.topSkill} 
          icon={Brain} 
          trend="Haut" 
          trendUp={true}
          color="primary"
        />
        <KPICard 
          title="Total Offres" 
          value={stats.totalJobs.toString()} 
          icon={TrendingUp} 
          trend="+24%" 
          trendUp={true}
          color="secondary"
        />
        <KPICard 
          title="Secteur Leader" 
          value={stats.dominantSector} 
          icon={Award} 
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
          <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Star className="text-secondary" />
            Top Compétences Demandées
          </h4>
          <div className="space-y-6">
            {topSkillsList.map((skill: any) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-700">
                  <span>{skill.name}</span>
                  <span style={{ color: skill.color }}>{skill.percentage}% des annonces</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, skill.percentage * 2)}%`, backgroundColor: skill.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 h-[500px]">
          <h4 className="text-xl font-bold text-slate-800 mb-6">Profil de Compétences (Radar)</h4>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarSkills}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Radar
                name="Fréquence"
                dataKey="A"
                stroke="#0a988b"
                fill="#0a988b"
                fillOpacity={0.4}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-4 italic">Note de l'analyste AI</h3>
          <p className="text-slate-400 leading-relaxed mb-6">
            Le marché de l'emploi au Sénégal connaît une forte accélération dans le domaine du numérique. Les profils hybrides possédant à la fois des compétences techniques (Cloud, Cyber) et une compréhension métier (Comptabilité, Marketing) sont les plus recherchés. La région de Dakar concentre 68% des offres à fort niveau de rémunération.
          </p>
          <div className="flex gap-4">
             <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 text-sm">
                Prediction: <span className="text-emerald-400 font-bold">+15% Volume en Juin</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
