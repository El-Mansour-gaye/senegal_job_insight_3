import { GoogleGenAI } from '@google/genai';
import { fetchJobsFromCSV } from './dataFetcher';
import { JobOffer } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function handleLocalChat(messages: { role: string; content: string }[], onChunk: (chunk: string) => void) {
  if (!GEMINI_API_KEY) {
    throw new Error("Clé API Gemini manquante. Veuillez configurer VITE_GEMINI_API_KEY.");
  }

  const userQuery = messages[messages.length - 1].content;

  // 1. Récupération des données locales
  const allJobs = await fetchJobsFromCSV();

  // 2. Filtrage (RAG Local)
  const words = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3 || ["rh", "it", "cap", "btp", "cdi", "cdd"].includes(w));
  const searchKeywords = words.length > 0 ? words : [userQuery.toLowerCase()];

  const filteredJobs = allJobs.filter(job => {
    const searchStr = `${job.title} ${job.sector} ${job.location} ${job.key_skills.join(' ')}`.toLowerCase();
    return searchKeywords.some(word => searchStr.includes(word));
  }).slice(0, 10);

  const contextJobs = filteredJobs.length > 0
    ? JSON.stringify(filteredJobs.map(j => ({
        title: j.title,
        company: j.company,
        location: j.location,
        sector: j.sector,
        skills: j.key_skills,
        contract: j.contract_type
      })))
    : "Aucun job spécifique trouvé.";

  // 3. Initialisation Gemini
  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `Tu es l'assistant IA de 'Sénégal Job Insights'. Ton rôle est d'aider les utilisateurs à analyser le marché de l'emploi au Sénégal.

Voici un extrait des données pertinentes actuelles :
${contextJobs}

Instructions :
1. Réponds de manière professionnelle et concise.
2. Utilise les données fournies pour étayer tes réponses.
3. Si les données ne contiennent pas la réponse, précise-le tout en restant utile.
4. Agis comme si tu avais accès à toute la base.`;

  // Préparation de l'historique pour Gemini
  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  // Envoi du message avec le prompt système injecté
  const result = await chat.sendMessageStream(`${systemPrompt}\n\nUtilisateur: ${userQuery}`);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    onChunk(chunkText);
  }
}
