import Papa from 'papaparse';
import { JobOffer } from '../types';

// En production, cette URL sera celle de votre service Render (ex: https://senegal-job-insights.onrender.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchJobsFromCSV = async (): Promise<JobOffer[]> => {
  try {
    // Sur Vercel, on préfère charger le fichier localement s'il existe dans public/data
    // On ajoute un timestamp pour éviter le cache navigateur
    const localUrl = `/data/jobs_senegal_processed.csv?t=${Date.now()}`;
    const remoteUrl = API_BASE_URL ? `${API_BASE_URL}/download/csv?t=${Date.now()}` : null;
    
    let response;
    try {
      console.log(`[DataFetcher] Tentative de chargement : ${localUrl}`);
      response = await fetch(localUrl);
      
      if (!response.ok) {
        console.warn(`[DataFetcher] Local inaccessible (Status: ${response.status}).`);
        if (remoteUrl) {
          console.log(`[DataFetcher] Tentative remote : ${remoteUrl}`);
          response = await fetch(remoteUrl);
        }
      }
    } catch (e) {
      console.error(`[DataFetcher] Erreur lors du fetch local:`, e);
      if (remoteUrl) {
        response = await fetch(remoteUrl);
      } else {
        throw e;
      }
    }

    if (!response || !response.ok) {
      const errorMsg = `CSV non trouvé. Status: ${response?.status || 'N/A'}`;
      console.error(`[DataFetcher] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const csvString = await response.text();
    console.log(`[DataFetcher] CSV chargé avec succès (${csvString.length} octets).`);
    
    // Debug: log first 100 characters to check if it's HTML or CSV
    console.log(`[DataFetcher] Début du contenu: ${csvString.substring(0, 100)}`);

    if (csvString.trim().startsWith('<!doctype html>') || csvString.trim().startsWith('<html')) {
      console.error('[DataFetcher] Erreur : Le serveur a renvoyé du HTML au lieu d\'un CSV. Le fichier est probablement manquant (404 fallback).');
      throw new Error('Le fichier de données est introuvable sur le serveur (404).');
    }
    
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
              if (row.latitude && row.longitude) {
                return [parseFloat(row.latitude), parseFloat(row.longitude)] as [number, number];
              }
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
            key_skills: row.key_skills ? row.key_skills.split(',').map((s: string) => s.trim()) : [],
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
