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
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier où sont stockées les données
DATA_DIR = "public/data"
PROCESSED_FILE = os.path.join(DATA_DIR, "jobs_senegal_processed.csv")

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Backend Senegal Job Insights opérationnel sur Render",
        "endpoints": {
            "scrape": "/scrape (POST) - Lance le pipeline",
            "download": "/download/csv (GET) - Télécharge le fichier pour Power BI",
            "status": "/status (GET) - État du fichier de données",
            "chat": "/api/chat (POST) - Chatbot avec RAG"
        }
    }

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        messages = body.get("messages", [])
        if not messages:
            return JSONResponse(status_code=400, content={"error": "No messages provided"})

        user_query = messages[-1]["content"]

        # Simple RAG: Keyword search in CSV
        context_jobs = "Aucun job trouvé pour cette requête."
        if os.path.exists(PROCESSED_FILE):
            df = pd.read_csv(PROCESSED_FILE)
            # Basic keyword filtering
            keywords = user_query.lower().split()
            mask = df.apply(lambda row: any(k in str(row.values).lower() for k in keywords), axis=1)
            filtered_df = df[mask].head(10)

            if not filtered_df.empty:
                context_jobs = filtered_df[['title', 'company', 'location', 'sector', 'salary_avg', 'key_skills']].to_string(index=False)

        system_prompt = f"""Tu es l'assistant IA de 'Sénégal Job Insights'. Ton rôle est d'aider les utilisateurs à analyser le marché de l'emploi au Sénégal.

Voici un extrait des données pertinentes actuelles issues de notre base de données :
{context_jobs}

Instructions :
1. Réponds de manière professionnelle et concise.
2. Utilise les données fournies pour étayer tes réponses.
3. Si l'utilisateur pose une question sur un métier spécifique, une ville ou un secteur, réfère-toi aux données ci-dessus.
4. Si les données ne contiennent pas la réponse, précise-le tout en restant utile.
5. Ne mentionne pas que tu as reçu un 'extrait de données' ou un 'context', agis comme si tu avais accès à toute la base.
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

if __name__ == "__main__":
    # Utile pour les tests en local
    uvicorn.run(app, host="0.0.0.0", port=8000)
