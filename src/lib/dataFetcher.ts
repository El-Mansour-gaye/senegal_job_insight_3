import Papa from 'papaparse';
import { JobOffer } from '../types';

// En production, cette URL sera celle de votre service Render (ex: https://senegal-job-insights.onrender.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchJobsFromCSV = async (): Promise<JobOffer[]> => {
  try {
    const csvUrl = API_BASE_URL 
      ? `${API_BASE_URL}/download/csv` 
      : '/data/jobs_senegal_processed.csv';
      
    console.log(`Fetching data from: ${csvUrl}`);
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('CSV not found');
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
            coordinates: row.coordinates ? JSON.parse(row.coordinates.replace(/'/g, '"')) : [14.4974, -14.4524],
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
