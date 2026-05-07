import Papa from 'papaparse';
import { JobOffer } from '../types';

export const fetchJobsFromCSV = async (): Promise<JobOffer[]> => {
  try {
    const response = await fetch('/data/jobs_senegal_processed.csv');
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
