export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  coordinates: [number, number]; // [lat, lng]
  sector: string;
  contract_type: string;
  education_level: string;
  experience_level: string;
  min_exp: number;
  max_exp: number;
  salary_avg?: number;
  key_skills: string[];
  description: string;
  publish_date: string;
  scraped_date: string;
  offer_url: string;
  source: string;
}

export interface DashboardStats {
  totalJobs: number;
  dominantSector: string;
  topCity: string;
  topSkill: string;
  monthlyEvolution: { month: string; count: number }[];
  contractDistribution: { name: string; value: number }[];
  sectorDistribution: { name: string; value: number }[];
  geoStats: { city: string; count: number; coordinates: [number, number] }[];
}
