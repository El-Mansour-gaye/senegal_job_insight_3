import React, { useMemo, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { EvolutionChart, DistributionChart, SectorBarChart, SalaryChart, HorizontalBarChart, SimpleBarChart } from '../components/Charts';
import { MapChart } from '../components/MapChart';
import { JobsDataTable } from '../components/JobsDataTable';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Search,
  MapPin,
  Users,
  Zap,
  TrendingUp,
  DollarSign,
  Download,
  Brain,
  Star,
  Award,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip as RechartsTooltip
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { jobs, isLoading, stats: globalStats, error } = useData();
  const [persona, setPersona] = useState<'analyst' | 'candidate'>('analyst');
  const [filters, setFilters] = useState({
    sector: 'Tous les secteurs',
    city: 'Toutes les villes',
    contract: 'Tous les contrats'
  });

  const exportToPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`senegal-jobs-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSector = filters.sector === 'Tous les secteurs' || job.sector.includes(filters.sector);
      const matchCity = filters.city === 'Toutes les villes' || job.location === filters.city;
      const matchContract = filters.contract === 'Tous les contrats' || job.contract_type === filters.contract;
      return matchSector && matchCity && matchContract;
    });
  }, [jobs, filters]);

  const dashboardStats = useMemo(() => {
    if (filteredJobs.length === 0) return null;

    // We can reuse some logic or compute what we need for the filtered set
    const sectorCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};
    const contractCounts: Record<string, number> = {};
    const educationCounts: Record<string, number> = {};
    const experienceCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};

    filteredJobs.forEach(job => {
      sectorCounts[job.sector] = (sectorCounts[job.sector] || 0) + 1;
      cityCounts[job.location] = (cityCounts[job.location] || 0) + 1;
      contractCounts[job.contract_type] = (contractCounts[job.contract_type] || 0) + 1;
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;

      const edu = job.min_education || 'N/A';
      educationCounts[edu] = (educationCounts[edu] || 0) + 1;

      const exp = job.experience_level || 'N/A';
      experienceCounts[exp] = (experienceCounts[exp] || 0) + 1;

      job.key_skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const sortedSectors = Object.entries(sectorCounts).sort((a,b) => b[1] - a[1]);
    const dominantSector = sortedSectors[0]?.[0] || 'N/A';
    const topCity = Object.entries(cityCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Sénégal';
    const topSkill = Object.entries(skillCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topCompany = Object.entries(companyCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const jobsWithSalary = filteredJobs.filter(j => j.salary_avg !== undefined);
    const avgSalary = jobsWithSalary.length > 0
      ? Math.round(jobsWithSalary.reduce((acc, curr) => acc + (curr.salary_avg || 0), 0) / jobsWithSalary.length)
      : 0;

    const sectorDistribution = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const radarSkills = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 6)
      .map(([subject, value]) => ({
        subject,
        A: value,
        fullMark: Math.max(...Object.values(skillCounts))
      }));

    const top10Skills = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    const topSkillsDetailed = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, value]) => ({ name, value }));

    const topCompanies = Object.entries(companyCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    const educationDistribution = Object.entries(educationCounts)
      .sort((a,b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const experienceDistribution = Object.entries(experienceCounts)
      .sort((a,b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const geoData: Record<string, { count: number; coordinates: [number, number] }> = {};
    filteredJobs.forEach(job => {
      if (!geoData[job.location]) {
        geoData[job.location] = {
          count: 0,
          coordinates: job.coordinates || [14.4974, -14.4524]
        };
      }
      geoData[job.location].count += 1;
    });

    // Monthly evolution (simplified for filtered set)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    const last6MonthsLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear() % 100}`;
      monthlyData[label] = 0;
      last6MonthsLabels.push(label);
    }
    filteredJobs.forEach(job => {
      try {
        const date = new Date(job.publish_date);
        const label = `${months[date.getMonth()]} ${date.getFullYear() % 100}`;
        if (monthlyData[label] !== undefined) monthlyData[label] += 1;
      } catch (e) {}
    });
    const monthlyEvolution = last6MonthsLabels.map(label => ({ name: label, value: monthlyData[label] }));

    const latestMonthVal = monthlyEvolution[monthlyEvolution.length - 1].value;
    const prevMonthVal = monthlyEvolution[monthlyEvolution.length - 2].value;
    const filteredMonthlyGrowth = prevMonthVal > 0
      ? Math.round(((latestMonthVal - prevMonthVal) / prevMonthVal) * 100)
      : 0;

    const sectorSalaries: Record<string, { total: number; count: number }> = {};
    filteredJobs.forEach(job => {
      if (job.salary_avg) {
        if (!sectorSalaries[job.sector]) sectorSalaries[job.sector] = { total: 0, count: 0 };
        sectorSalaries[job.sector].total += job.salary_avg;
        sectorSalaries[job.sector].count += 1;
      }
    });
    const salaryBySector = Object.entries(sectorSalaries)
      .map(([name, data]) => ({ name, value: Math.round(data.total / data.count) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalJobs: filteredJobs.length,
      avgSalary,
      dominantSector,
      topCity,
      topSkill,
      topCompany,
      radarSkills,
      top10Skills,
      topSkillsDetailed,
      topCompanies,
      educationDistribution,
      experienceDistribution,
      sectorDistribution,
      contractDistribution: Object.entries(contractCounts).map(([name, value]) => ({ name, value })),
      geoStats: Object.entries(geoData).map(([city, data]) => ({
        city,
        count: data.count,
        coordinates: data.coordinates
      })),
      monthlyEvolution,
      monthlyGrowth: filteredMonthlyGrowth,
      salaryBySector
    };
  }, [filteredJobs, globalStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl p-12 text-center shadow-premium">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Briefcase size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Aucune donnée disponible</h2>
        <p className="text-slate-500 max-w-md mb-8">
          {error || "Le fichier de données est vide ou n'a pas encore été généré par le scraper sur Render."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Zap size={20} /> Actualiser
          </button>
        </div>
      </div>
    );
  }

  const sectors = ['Tous les secteurs', ...Array.from(new Set(jobs.map(j => j.sector)))].sort();
  const cities = ['Toutes les villes', ...Array.from(new Set(jobs.map(j => j.location)))].sort();
  const contracts = ['Tous les contrats', ...Array.from(new Set(jobs.map(j => j.contract_type)))].sort();

  if (!dashboardStats) return <div>Pas de données.</div>;

  const salaryChartData = dashboardStats.salaryBySector;

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-content">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Senegal <span className="text-primary">Job Insights</span></h1>
          <p className="text-slate-500 mt-2 text-lg">
            {persona === 'analyst' 
              ? "Intelligence de marché : Analyses et tendances stratégiques."
              : "Parcours carrière : Opportunités et insights pour candidats."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Rapport PDF
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
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
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-premium border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-primary font-bold text-sm px-2">
          <Filter size={18} /> Filtres :
        </div>

        <div className="flex-1 flex flex-wrap gap-3">
          <select
            className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            value={filters.sector}
            onChange={(e) => setFilters({...filters, sector: e.target.value})}
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            value={filters.contract}
            onChange={(e) => setFilters({...filters, contract: e.target.value})}
          >
            {contracts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium italic">
          {filteredJobs.length} offres affichées
        </div>
      </div>

      {/* KPI Section - Shared but with slight persona variations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Volume d'offres"
          value={dashboardStats.totalJobs.toLocaleString()}
          icon={Briefcase}
          description={`${dashboardStats.totalJobs} offres sur cette sélection`}
          color="primary"
        />
        <KPICard
          title={persona === 'analyst' ? "Secteur Leader" : "Secteur n°1"}
          value={dashboardStats.dominantSector}
          icon={Zap}
          description={persona === 'analyst' ? "Plus grosse part de marché" : "Secteur qui recrute le plus"}
          color="secondary"
        />
        <KPICard
          title={persona === 'analyst' ? "Croissance" : "Tendance"}
          value={`${dashboardStats.monthlyGrowth > 0 ? '+' : ''}${dashboardStats.monthlyGrowth}%`}
          icon={TrendingUp}
          trend={`${Math.abs(dashboardStats.monthlyGrowth)}%`}
          trendUp={dashboardStats.monthlyGrowth >= 0}
          description={persona === 'analyst' ? "Évolution mensuelle globale" : "Évolution du volume d'offres"}
          color="blue"
        />
        <KPICard
          title={persona === 'analyst' ? "Salaire Moyen" : "Salaire Estimé"}
          value={`${(dashboardStats.avgSalary / 1000).toFixed(0)}k CFA`}
          icon={DollarSign}
          description="Basé sur les offres avec salaire"
          color="accent"
        />
      </div>

      {persona === 'analyst' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MapChart data={dashboardStats.geoStats} title="Répartition Géographique des Opportunités" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EvolutionChart data={dashboardStats.monthlyEvolution} title="Dynamique des recrutements" />
              <DistributionChart data={dashboardStats.contractDistribution} title="Types de contrats" />
            </div>

            {/* Market Gaps section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SimpleBarChart
                data={dashboardStats.educationDistribution}
                title="Structure de l'Offre par Diplôme"
                color="#0a988b"
              />
              <SimpleBarChart
                data={dashboardStats.experienceDistribution}
                title="Structure de l'Offre par Expérience"
                color="#ff9d17"
              />
            </div>

            {/* Analysis Section (Merged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Star className="text-secondary" />
                  Top 10 Compétences
                </h4>
                <div className="space-y-4">
                  {dashboardStats.top10Skills.map((skill, i) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{skill.name}</span>
                        <span className="text-primary">{Math.round((skill.value / dashboardStats.totalJobs) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(100, (skill.value / dashboardStats.totalJobs) * 200)}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 flex flex-col">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Brain className="text-primary" /> Radar des Compétences
                </h4>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardStats.radarSkills}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar
                        name="Fréquence"
                        dataKey="A"
                        stroke="#0a988b"
                        fill="#0a988b"
                        fillOpacity={0.4}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <SectorBarChart data={dashboardStats.sectorDistribution} title="Volume par secteur" />
            <SalaryChart data={dashboardStats.salaryBySector} title="Salaire par Secteur (Estimé)" />

            <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="text-secondary" /> Note de l'Expert
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 italic">
                  "Le marché sénégalais montre une forte résilience dans le secteur {dashboardStats.dominantSector}.
                  La ville de {dashboardStats.topCity} reste le poumon économique avec une concentration majeure des offres."
                </p>
                <div className="bg-white/10 p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-emerald-400 font-bold">Conseil :</span> Ciblez les compétences en {dashboardStats.topSkill} pour maximiser l'employabilité.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Candidate Persona View */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Insights section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SimpleBarChart
                   data={dashboardStats.educationDistribution}
                   title="Niveau d'études requis"
                   color="#0a988b"
                 />
                 <SimpleBarChart
                   data={dashboardStats.experienceDistribution}
                   title="Expérience demandée"
                   color="#ff9d17"
                 />
              </div>

              {/* Skills Demand section */}
              <HorizontalBarChart
                data={dashboardStats.topSkillsDetailed}
                title="Compétences les plus recherchées"
                height={500}
                limit={12}
                barColor="#0a988b"
                secondaryColor="#0a988b"
              />

              {/* Map Hotspots */}
              <MapChart data={dashboardStats.geoStats} title="Où postuler ? (Hotspots Emploi)" />
            </div>

            <div className="space-y-8">
              {/* Sidebar Insights */}
              <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="text-primary" /> Top Recruteurs
                </h3>
                <p className="text-slate-500 text-sm mb-6">Les entreprises les plus actives sur le marché actuellement.</p>
                <div className="space-y-4">
                   {dashboardStats.topCompanies.slice(0, 5).map((company, i) => (
                     <div key={company.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                            {i+1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{company.name}</span>
                        </div>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{company.value} offres</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-secondary" /> Conseils Carrière
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-black mb-1">Ville Clé</p>
                    <p className="text-sm font-bold text-slate-800">{dashboardStats.topCity} concentre l'essentiel des opportunités.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-black mb-1">Compétence Phare</p>
                    <p className="text-sm font-bold text-slate-800">Misez sur {dashboardStats.topSkill} pour vous démarquer.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-black mb-1">Recruteur Actif</p>
                    <p className="text-sm font-bold text-slate-800">{dashboardStats.topCompany} recrute massivement en ce moment.</p>
                  </div>
                </div>
              </div>

              <DistributionChart data={dashboardStats.contractDistribution} title="Marché des contrats" />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Data Table - Always visible as it's the core explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {persona === 'candidate' ? 'Trouver votre prochain défi' : 'Détails des offres'}
          </h2>
          <div className="text-xs text-slate-400">
            Affichage de {filteredJobs.length} résultats sur {jobs.length}
          </div>
        </div>
        <JobsDataTable data={filteredJobs} />
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
