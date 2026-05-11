from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from src.main import main as run_scraper_pipeline
import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
import pandas as pd
import re
from groq import Groq
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

# Load environment variables
load_dotenv()

# Log configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Senegal Job Insights API",
    description="API pour piloter le scraping et l'analyse du marché de l'emploi au Sénégal",
    version="1.0.0"
)

# Configuration du Scheduler
scheduler = BackgroundScheduler()

def scheduled_scraping():
    logger.info("Démarrage du scraping programmé...")
    try:
        run_scraper_pipeline()
        logger.info("Scraping programmé terminé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors du scraping programmé: {e}")

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

# Configuration CORS pour autoriser le Frontend (Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # On pourra restreindre à votre URL Vercel plus tard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier où sont stockées les données
DATA_DIR = "public/data"
PROCESSED_FILE = os.path.join(DATA_DIR, "jobs_senegal_processed.csv")

# Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class ChatRequest(BaseModel):
    message: str

def get_relevant_context(query: str):
    """Filtre les 10 lignes les plus pertinentes du CSV."""
    if not os.path.exists(PROCESSED_FILE):
        logger.warning(f"Fichier {PROCESSED_FILE} introuvable pour le contexte.")
        return "Aucune donnée disponible actuellement."

    try:
        df = pd.read_csv(PROCESSED_FILE)

        # Nettoyage sommaire de la requête pour extraire des mots-clés
        # On garde les mots de plus de 2 lettres
        keywords = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 2]

        if not keywords:
            # Si pas de mots-clés, on prend les 10 plus récents
            relevant_df = df.sort_values(by='publish_date', ascending=False).head(10)
        else:
            # Recherche dans les colonnes cibles
            cols_to_search = ['title', 'sector', 'location', 'key_skills']
            mask = pd.Series([False] * len(df))

            for col in cols_to_search:
                if col in df.columns:
                    for kw in keywords:
                        mask |= df[col].str.contains(kw, case=False, na=False)

            relevant_df = df[mask].sort_values(by='publish_date', ascending=False).head(10)

            # Si aucun résultat avec les mots-clés, on prend les plus récents
            if relevant_df.empty:
                relevant_df = df.sort_values(by='publish_date', ascending=False).head(10)

        # Formatage du contexte pour l'IA
        context_parts = []
        for _, row in relevant_df.iterrows():
            job_desc = (
                f"- Poste: {row.get('title', 'N/A')}\n"
                f"  Entreprise: {row.get('company', 'N/A')}\n"
                f"  Lieu: {row.get('location', 'N/A')}\n"
                f"  Contrat: {row.get('contract_type', 'N/A')}\n"
                f"  Expérience min: {row.get('min_exp', 0)} ans\n"
                f"  Compétences: {row.get('key_skills', 'N/A')}\n"
                f"  URL: {row.get('offer_url', '#')}\n"
            )
            context_parts.append(job_desc)

        return "\n".join(context_parts)
    except Exception as e:
        logger.error(f"Erreur lors de la lecture du CSV pour le contexte : {e}")
        return "Erreur lors de la récupération des données."

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Backend Senegal Job Insights opérationnel sur Render",
        "endpoints": {
            "scrape": "/scrape (POST) - Lance le pipeline",
            "download": "/download/csv (GET) - Télécharge le fichier pour Power BI",
            "status": "/status (GET) - État du fichier de données"
        }
    }

@app.post("/scrape")
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Lance le scraping et le nettoyage en arrière-plan."""
    background_tasks.add_task(run_scraper_pipeline)
    return {"message": "Le processus de scraping et de nettoyage a été lancé en arrière-plan."}

@app.api_route("/status", methods=["GET", "POST"])
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

@app.get("/download/csv")
def download_csv():
    """Permet à Power BI ou au frontend de récupérer le dernier CSV."""
    if os.path.exists(PROCESSED_FILE):
        return FileResponse(
            path=PROCESSED_FILE,
            filename="jobs_senegal_processed.csv",
            media_type="text/csv"
        )
    return JSONResponse(status_code=404, content={"message": "Fichier CSV non trouvé. Lancez un scraping d'abord."})

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Endpoint de chat avec streaming via Groq."""
    if not client:
        return JSONResponse(
            status_code=500,
            content={"message": "Groq API Key non configurée sur le serveur."}
        )

    context = get_relevant_context(request.message)

    system_prompt = (
        "Tu es l'expert de Senegal Job IA. Réponds aux candidats en te basant uniquement sur les données fournies. "
        "Sois concis, professionnel et encourageant. "
        "Utilise la palette de couleurs du site dans tes conseils si pertinent (Teal: #0a988b, Orange: #ff9d17, Coral: #f44a3c). "
        "Si tu donnes des liens d'offres, utilise le format Markdown [Titre du poste](URL).\n\n"
        f"CONTEXTE DES OFFRES ACTUELLES :\n{context}"
    )

    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
            stream=True,
        )

        def stream_response():
            for chunk in completion:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(stream_response(), media_type="text/plain")
    except Exception as e:
        logger.error(f"Erreur lors du chat avec Groq : {e}")
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    # Utile pour les tests en local
    uvicorn.run(app, host="0.0.0.0", port=8000)
