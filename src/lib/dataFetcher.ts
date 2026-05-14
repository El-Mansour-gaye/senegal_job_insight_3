import Papa from 'papaparse';
import { JobOffer } from '../types';

// En production, cette URL sera celle de votre service Render (ex: https://senegal-job-insights.onrender.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
if (!API_BASE_URL) {
  console.warn("[DataFetcher] VITE_API_BASE_URL est manquante. Les requêtes utiliseront des chemins relatifs (proxy possible en dev).");
}

export const fetchJobsFromCSV = async (): Promise<JobOffer[]> => {
  try {
    // Sur Vercel, on préfère charger le fichier localement s'il existe dans public/data
    // On ajoute un timestamp pour éviter le cache navigateur
    const localUrl = `/data/jobs_senegal_processed.csv?t=${Date.now()}`;
    const remoteUrl = API_BASE_URL ? `${API_BASE_URL}/download/csv?t=${Date.now()}` : null;
    
    let response;

    // On tente d'abord de récupérer les données fraîches depuis Render (remote)
    if (remoteUrl) {
      try {
        console.log(`[DataFetcher] Tentative remote : ${remoteUrl}`);
        response = await fetch(remoteUrl);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          // On vérifie que c'est bien du CSV et pas une erreur HTML
          if (contentType && contentType.includes('text/csv')) {
            console.log(`[DataFetcher] Données récupérées avec succès depuis Render.`);
          } else {
            console.warn(`[DataFetcher] Render a renvoyé un type de contenu inattendu : ${contentType}. Tentative local...`);
            response = null;
          }
        } else {
          console.warn(`[DataFetcher] Render inaccessible (Status: ${response.status}). Tentative local...`);
          response = null;
        }
      } catch (e) {
        console.error(`[DataFetcher] Erreur lors du fetch remote :`, e);
        response = null;
      }
    }

    // Si le remote a échoué ou n'est pas configuré, on tente le local (Vercel)
    if (!response || !response.ok) {
      try {
        console.log(`[DataFetcher] Tentative de chargement local : ${localUrl}`);
        response = await fetch(localUrl);

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('text/html')) {
          console.error(`[DataFetcher] Le fichier local est introuvable (404 fallback HTML).`);
          response = null;
        }
      } catch (e) {
        console.error(`[DataFetcher] Erreur lors du fetch local :`, e);
        response = null;
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
            min_education: row.min_education || 'N/A',
            experience_level: row.experience_level || 'N/A',
            min_exp: parseInt(row.min_exp) || 0,
            max_exp: parseInt(row.max_exp) || 0,
            salary_avg: row.salary_avg ? parseFloat(row.salary_avg) : undefined,
            key_skills: row.key_skills ? row.key_skills.split(',').map((s: string) => s.trim()) : [],
            description: row.description || '',
            publish_date: row.publish_date || new Date().toISOString(),
            scraped_date: row.scraped_date || new Date().toISOString(),
            offer_url: row.offer_url || '#',
            source: row.source || 'Scraper',
            education_rank: row.education_rank ? parseInt(row.education_rank) : 0
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
