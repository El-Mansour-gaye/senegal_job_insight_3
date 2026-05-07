import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobOffer } from '../types';
import { fetchJobsFromCSV } from '../lib/dataFetcher';

interface DataContextType {
  jobs: JobOffer[];
  isLoading: boolean;
  error: string | null;
  stats: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchJobsFromCSV();
        setJobs(data);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
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

    const dominantSector = Object.entries(sectorCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topCity = Object.entries(cityCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Sénégal';
    const topSkill = Object.entries(skillCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Préparation des données pour le RadarChart (Analyse)
    const radarSkills = Object.entries(skillCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 6)
      .map(([subject, value]) => ({
        subject,
        A: value,
        fullMark: Math.max(...Object.values(skillCounts))
      }));

    return {
      totalJobs: jobs.length,
      dominantSector,
      topCity,
      topSkill,
      radarSkills,
      sectorDistribution: Object.entries(sectorCounts).map(([name, value]) => ({ name, value })),
      contractDistribution: Object.entries(contractCounts).map(([name, value]) => ({ name, value })),
      geoStats: Object.entries(cityCounts).map(([name, value]) => ({ name, value })),
      // Simplified evolution for demo if no dates
      monthlyEvolution: [
        { name: 'Jan', value: 45 },
        { name: 'Fév', value: 52 },
        { name: 'Mar', value: jobs.length }
      ]
    };
  }, [jobs]);

  return (
    <DataContext.Provider value={{ jobs, isLoading, error, stats }}>
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
