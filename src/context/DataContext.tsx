import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobOffer } from '../types';
import { fetchJobsFromCSV } from '../lib/dataFetcher';

export type Persona = 'analyst' | 'candidate';

interface DataContextType {
  jobs: JobOffer[];
  isLoading: boolean;
  error: string | null;
  stats: any;
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>('analyst');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchJobsFromCSV();
        setJobs(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des données");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = React.useMemo(() => {
    if (jobs.length === 0) return null;

    const sectorCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};
    const contractCounts: Record<string, number> = {};
    
    jobs.forEach(job => {
      sectorCounts[job.sector] = (sectorCounts[job.sector] || 0) + 1;
      cityCounts[job.location] = (cityCounts[job.location] || 0) + 1;
      contractCounts[job.contract_type] = (contractCounts[job.contract_type] || 0) + 1;
      job.key_skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const sortedSectors = Object.entries(sectorCounts).sort((a,b) => b[1] - a[1]);
    const dominantSector = sortedSectors[0]?.[0] || 'N/A';
    const topCity = Object.entries(cityCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Sénégal';
    const topSkill = Object.entries(skillCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Calculate average salary
    const jobsWithSalary = jobs.filter(j => j.salary_avg !== undefined);
    const avgSalary = jobsWithSalary.length > 0 
      ? Math.round(jobsWithSalary.reduce((acc, curr) => acc + (curr.salary_avg || 0), 0) / jobsWithSalary.length)
      : 0;

    // Sort sector distribution for charts
    const sortedSectorDistribution = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Top 10 skills for analysis
    const top10Skills = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Préparation des données pour le RadarChart (Analyse) - Top 6 pour lisibilité radar
    const radarSkills = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 6)
      .map(([subject, value]) => ({
        subject,
        A: value,
        fullMark: Math.max(...Object.values(skillCounts))
      }));

    // Préparation des données pour la carte (GeoStats)
    const geoData: Record<string, { count: number; coordinates: [number, number] }> = {};
    
    jobs.forEach(job => {
      if (!geoData[job.location]) {
        geoData[job.location] = {
          count: 0,
          coordinates: job.coordinates || [14.4974, -14.4524]
        };
      }
      geoData[job.location].count += 1;
    });

    // Compute monthly evolution and growth
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const monthlyData: Record<string, number> = {};
    const now = new Date();

    // Use last 6 months
    const last6MonthsLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear() % 100}`;
      monthlyData[label] = 0;
      last6MonthsLabels.push(label);
    }

    jobs.forEach(job => {
      try {
        const date = new Date(job.publish_date);
        if (isNaN(date.getTime())) return;

        const label = `${months[date.getMonth()]} ${date.getFullYear() % 100}`;
        if (monthlyData[label] !== undefined) {
          monthlyData[label] += 1;
        }
      } catch (e) {}
    });

    const monthlyEvolution = last6MonthsLabels.map(label => ({ name: label, value: monthlyData[label] }));

    // Calculate growth (latest vs previous month)
    const latestMonthVal = monthlyEvolution[monthlyEvolution.length - 1].value;
    const prevMonthVal = monthlyEvolution[monthlyEvolution.length - 2].value;
    const monthlyGrowth = prevMonthVal > 0
      ? Math.round(((latestMonthVal - prevMonthVal) / prevMonthVal) * 100)
      : 0;

    // Average salary per sector
    const sectorSalaries: Record<string, { total: number; count: number }> = {};
    jobs.forEach(job => {
      if (job.salary_avg) {
        if (!sectorSalaries[job.sector]) {
          sectorSalaries[job.sector] = { total: 0, count: 0 };
        }
        sectorSalaries[job.sector].total += job.salary_avg;
        sectorSalaries[job.sector].count += 1;
      }
    });

    const salaryBySector = Object.entries(sectorSalaries)
      .map(([name, data]) => ({ name, value: Math.round(data.total / data.count) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalJobs: jobs.length,
      avgSalary,
      salaryBySector,
      dominantSector,
      topCity,
      topSkill,
      top10Skills,
      radarSkills,
      sectorDistribution: sortedSectorDistribution,
      contractDistribution: Object.entries(contractCounts).map(([name, value]) => ({ name, value })),
      geoStats: Object.entries(geoData).map(([city, data]) => ({ 
        city, 
        count: data.count, 
        coordinates: data.coordinates 
      })),
      monthlyEvolution,
      monthlyGrowth
    };
  }, [jobs]);

  return (
    <DataContext.Provider value={{ jobs, isLoading, error, stats, persona, setPersona }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
