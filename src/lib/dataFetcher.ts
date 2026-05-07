import Papa from 'papaparse';
import { JobOffer } from '../types';

// En production, cette URL sera celle de votre service Render (ex: https://senegal-job-insights.onrender.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchJobsFromCSV = async (): Promise<JobOffer[]> => {
  try {
    // Sur Vercel, on préfère charger le fichier localement s'il existe dans public/data
    // On essaie d'abord le chemin relatif local
    const localUrl = '/data/jobs_senegal_processed.csv';
    const remoteUrl = API_BASE_URL ? `${API_BASE_URL}/download/csv` : null;
    
    let response;
    try {
      console.log(`Tentative de chargement local : ${localUrl}`);
      response = await fetch(localUrl);
      if (!response.ok && remoteUrl) {
        console.log(`Local inaccessible, tentative remote : ${remoteUrl}`);
        response = await fetch(remoteUrl);
      }
    } catch (e) {
      if (remoteUrl) {
        console.log(`Erreur local, tentative remote : ${remoteUrl}`);
        response = await fetch(remoteUrl);
      } else {
        throw e;
      }
    }

    if (!response || !response.ok) {
      throw new Error('CSV non trouvé (local et remote)');
    }
    
    const csvString = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row: any, index: number) => ({
            id: index.toString(),
            title: row.title || 'N/A',
            company: row.company || 'N/A',
            location: row.location || 'Sénégal',
            coordinates: (() => {
              if (!row.coordinates) return [14.4974, -14.4524];
              try {
                // Nettoyage des formats type "[14.7, -17.4]" ou "14.7, -17.4"
                const cleanCoords = row.coordinates.replace(/[\[\]]/g, '').replace(/'/g, '"');
                const parts = cleanCoords.split(',').map((p: string) => parseFloat(p.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                  return [parts[0], parts[1]] as [number, number];
                }
                return [14.4974, -14.4524] as [number, number];
              } catch (e) {
                console.warn('Erreur lors du parsing des coordonnées:', row.coordinates);
                return [14.4974, -14.4524] as [number, number];
              }
            })(),
            sector: row.sector || 'N/A',
            contract_type: row.contract_type || 'N/A',
            education_level: row.education_level || 'N/A',
            experience_level: row.experience_level || 'N/A',
            min_exp: parseInt(row.min_exp) || 0,
            max_exp: parseInt(row.max_exp) || 0,
            salary_avg: row.salary_avg ? parseFloat(row.salary_avg) : undefined,
            key_skills: row.key_skills ? row.key_skills.split(' - ') : [],
            description: row.description || '',
            publish_date: row.publish_date || new Date().toISOString(),
            offer_url: row.offer_url || '#',
            source: row.source || 'Scraper'
          }));
          resolve(parsedData as JobOffer[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
  }
};
