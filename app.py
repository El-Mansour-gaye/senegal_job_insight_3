from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from src.main import main as run_scraper_pipeline
import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

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

if __name__ == "__main__":
    # Utile pour les tests en local
    uvicorn.run(app, host="0.0.0.0", port=8000)
