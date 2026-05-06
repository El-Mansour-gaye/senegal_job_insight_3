import os
import pandas as pd
from src.scrapers.emploi_senegal import EmploiSenegalScraper
from src.processing.cleaner import DataCleaner
from src.processing.analytics import JobAnalytics

def main():
    # Configuration des dossiers
    os.makedirs('data/raw', exist_ok=True)
    os.makedirs('data/processed', exist_ok=True)
    os.makedirs('reports', exist_ok=True)

    # 1. Scraping
    print("--- Démarrage du Scraping Global ---")
    
    scraper = EmploiSenegalScraper()
    
    # 1. Extraction dynamique des secteurs
    dynamic_sectors = scraper.get_dynamic_sectors()
    
    if not dynamic_sectors:
        print("Erreur critique: Aucun secteur détecté dynamiquement. Vérifiez la structure du site.")
        return

    all_offers = []

    # On peut boucler sur les secteurs trouvés
    for sector_name, sector_url in dynamic_sectors.items():
        # Optionnel: On peut filtrer ici pour ne prendre que certains secteurs
        # if "Informatique" not in sector_name and "Santé" not in sector_name: continue
        
        print(f"\nRecueil du secteur : {sector_name}")
        # On scrape les 2 premières pages par secteur pour l'exemple
        for p in range(2): 
            offers = scraper.scrape_list_page(sector_name, sector_url, page_number=p)
            if not offers:
                break
            all_offers.extend(offers)
            scraper.sleep(1, 3) # Temps d'attente réduit car dynamique

    # Sauvegarde brute
    if all_offers:
        raw_path = 'data/raw/jobs_senegal_raw.csv'
        df_raw = pd.DataFrame(all_offers)
        df_raw.to_csv(raw_path, index=False, encoding='utf-8-sig')
        print(f"\n--- Scraping terminé. Total collecté: {len(all_offers)} offres ---")

        # 2. Nettoyage
        print("\n--- Lancement du pipeline de nettoyage ---")
        final_path = 'data/processed/jobs_senegal_processed.csv'
        cleaner = DataCleaner(raw_path)
        cleaner.clean(final_path)

        # 3. Analyse Exploratoire
        print("\n--- Lancement de l'Analyse ---")
        analytics = JobAnalytics(final_path)
        analytics.generate_report()
    else:
        print("\n--- Scraping terminé. Aucun résultat trouvé. ---")
        print("Veuillez vérifier les sélecteurs CSS dans 'src/scrapers/emploi_senegal.py' ou la structure du site.")

if __name__ == "__main__":
    main()
