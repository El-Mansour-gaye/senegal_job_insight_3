from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from src.main import main as run_scraper_pipeline
import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
from groq import Groq
import json
from dotenv import load_dotenv
from rapidfuzz import process, fuzz

load_dotenv()

# Log configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Senegal Job Insights API",
    description="API pour piloter le scraping et l'analyse du marché de l'emploi au Sénégal",
    version="1.0.0"
)

# Configuration Groq
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# Configuration du Scheduler
scheduler = BackgroundScheduler()

def scheduled_scraping():
    logger.info("Démarrage du scraping programmé...")
    try:
        run_scraper_pipeline()
        logger.info("Scraping programmé terminé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors du scraping programmé: {e}")

# Le scheduler ne fonctionne pas sur Vercel (Serverless), on l'active uniquement en local ou sur Render
if not os.environ.get("VERCEL"):
    @app.on_event("startup")
    def start_scheduler():
        # Ajoute la tâche toutes les 24 heures
        scheduler.add_job(
            scheduled_scraping,
            trigger=IntervalTrigger(hours=24),
            id="job_scraping",
            name="Scraping quotidien",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler démarré.")

    @app.on_event("shutdown")
    def stop_scheduler():
        scheduler.shutdown()
        logger.info("Scheduler arrêté.")
else:
    logger.info("Environnement Vercel détecté : Scheduler désactivé.")

# Configuration CORS pour autoriser le Frontend (Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier où sont stockées les données
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
PROCESSED_FILE = os.path.join(DATA_DIR, "jobs_senegal_processed.csv")

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Backend Senegal Job Insights opérationnel sur Render",
        "endpoints": {
            "scrape": "/api/scrape (POST) - Lance le pipeline",
            "download": "/api/download/csv (GET) - Télécharge le fichier pour Power BI",
            "status": "/api/status (GET) - État du fichier de données",
            "chat": "/api/chat (POST) - Chatbot avec RAG"
        }
    }

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    if not client:
        return JSONResponse(status_code=500, content={"error": "GROQ_API_KEY non configurée sur le serveur."})

    try:
        body = await request.json()
        messages = body.get("messages", [])
        if not messages:
            return JSONResponse(status_code=400, content={"error": "No messages provided"})

        user_query = messages[-1]["content"]

        # Stratégie de Fallback & RAG V2 (Fuzzy Search)
        context_jobs = "Aucun job spécifique trouvé pour cette recherche dans la base de données actuelle."

        # Tentative de lecture du fichier
        df = None
        paths_to_try = [
            PROCESSED_FILE,
            "data/raw/jobs_senegal_raw.csv"
        ]

        for path in paths_to_try:
            if os.path.exists(path):
                try:
                    df = pd.read_csv(path)
                    break
                except Exception as e:
                    logger.error(f"Erreur lors de la lecture de {path}: {e}")

        if df is not None:
            # Stats globales pour donner du contexte à l'IA même sans recherche
            total_jobs = len(df)
            last_scraped = df['scraped_date'].max() if 'scraped_date' in df.columns else "N/A"
            top_sectors = df['sector'].value_counts().head(5).to_dict() if 'sector' in df.columns else {}

            market_summary = {
                "total_offers": total_jobs,
                "data_freshness": f"Dernière mise à jour le {last_scraped}",
                "dominant_sectors": top_sectors
            }

            # 1. Normalisation et Synonymes
            query = user_query.lower().strip()
            synonyms = {
                "bac+3": "licence l3",
                "bac+5": "master ingénieur dea m2",
                "bac+2": "dut bts deug",
                "it": "informatique développeur digital tech",
                "rh": "ressources humaines recrutement personnel",
                "tendance": "récent dynamique actualité",
                "offre": "poste job recrutement"
            }

            expanded_query = query
            for key, value in synonyms.items():
                if key in query:
                    expanded_query += f" {value}"

            # 2. Préparation du corpus (Titre > Secteur > Compétences > Ville)
            df_search = df.fillna("")
            search_corpus = (
                df_search['title'] + " " +
                df_search['sector'] + " " +
                df_search['key_skills'] + " " +
                df_search['location']
            ).tolist()

            # 3. Recherche Floue (Fuzzy Matching)
            # On passe à top 20 pour plus de contexte
            fuzzy_results = process.extract(
                expanded_query,
                search_corpus,
                scorer=fuzz.token_set_ratio,
                limit=20
            )

            # 4. Filtrage par score de confiance (> 40%)
            relevant_indices = [res[2] for res in fuzzy_results if res[1] > 40]

            # Fallback : si aucun résultat flou, prendre les 10 plus récents
            if not relevant_indices:
                logger.info("Aucun résultat flou pertinent. Fallback sur les jobs récents.")
                if 'publish_date' in df.columns:
                    df['publish_date'] = pd.to_datetime(df['publish_date'], errors='coerce')
                    recent_df = df.sort_values(by='publish_date', ascending=False).head(10)
                    relevant_indices = recent_df.index.tolist()

            if relevant_indices:
                filtered_df = df.loc[relevant_indices].copy()

                # Tri par date de publication
                if 'publish_date' in filtered_df.columns:
                    filtered_df['publish_date'] = pd.to_datetime(filtered_df['publish_date'], errors='coerce')
                    filtered_df = filtered_df.sort_values(by='publish_date', ascending=False)

                cols_context = ['title', 'company', 'location', 'sector', 'key_skills', 'contract_type', 'education_level', 'min_exp', 'salary_avg', 'offer_url']
                available_cols = [c for c in cols_context if c in filtered_df.columns]

                # On combine les jobs et les stats globales
                context_data = {
                    "market_metadata": market_summary,
                    "specific_jobs": filtered_df[available_cols].to_dict(orient='records')
                }
                context_jobs = json.dumps(context_data, ensure_ascii=False)

        system_prompt = f"""Tu es l'Expert Analyste de 'Sénégal Job IA'. Ta mission est d'aider les candidats à décrypter le marché de l'emploi au Sénégal avec précision et professionnalisme.

### CONTEXTE DES OFFRES (Données extraites)
{context_jobs}

### TES RÈGLES DE RÉPONSE
1. ANALYSE ET SYNTHÈSE : Ne liste pas les jobs sans réfléchir. Commence par une phrase d'analyse, ex: "Le secteur [Secteur] est particulièrement dynamique à Dakar avec plusieurs opportunités en [Type de contrat]."
2. STRUCTURE : Utilise des listes à puces. Pour chaque job mentionné, mets en gras le **Titre du poste** et l'**Entreprise**.
3. CONSEIL STRATÉGIQUE : Si l'utilisateur pose une question sur ses chances, compare ses compétences (si fournies) avec les "key_skills" des données.
4. GESTION DU VIDE : Si aucune donnée ne correspond, dis-le honnêtement et propose une recherche alternative (ex: "Je n'ai pas de poste de Data Scientist à Saint-Louis, mais j'en ai 3 à Dakar, voulez-vous les voir ?").
5. STYLE : Sois encourageant, utilise un ton pro mais accessible.

### EXEMPLE DE RÉPONSE ATTENDUE
Utilisateur : "Je cherche un poste en informatique à Dakar, j'ai un Bac+3."
Assistant : "Je vois plusieurs opportunités pour votre profil Licence (Bac+3) en informatique à Dakar.
- **Développeur Fullstack** chez **TechSenegal** : Maîtrise de React et Node.js requise.
- **Analyste Support** chez **DakarBoost** : Profil débutant accepté.
Mon conseil : 70% des offres actuelles en informatique demandent une connaissance du Cloud. Pensez à valoriser vos projets personnels si vous débutez."
"""

        full_messages = [{"role": "system", "content": system_prompt}] + messages

        def generate_stream():
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=full_messages,
                stream=True,
            )
            for chunk in completion:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(generate_stream(), media_type="text/plain")

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/scrape")
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Lance le scraping et le nettoyage en arrière-plan."""
    background_tasks.add_task(run_scraper_pipeline)
    return {"message": "Le processus de scraping et de nettoyage a été lancé en arrière-plan."}

@app.api_route("/api/status", methods=["GET", "POST"])
def get_status():
    """Vérifie si les données sont prêtes."""
    if os.path.exists(PROCESSED_FILE):
        stats = os.stat(PROCESSED_FILE)
        return {
            "ready": True,
            "last_update": stats.st_mtime,
            "size_kb": stats.st_size / 1024
        }
    return {"ready": False, "message": "Aucune donnée traitée disponible."}

@app.get("/api/download/csv")
def download_csv():
    """Permet à Power BI ou au frontend de récupérer le dernier CSV."""
    if os.path.exists(PROCESSED_FILE):
        return FileResponse(
            path=PROCESSED_FILE,
            filename="jobs_senegal_processed.csv",
            media_type="text/csv"
        )
    return JSONResponse(status_code=404, content={"message": "Fichier CSV non trouvé. Lancez un scraping d'abord."})

if __name__ == "__main__":
    # Utile pour les tests en local
    uvicorn.run(app, host="0.0.0.0", port=8000)
