import time
import random
import requests
from bs4 import BeautifulSoup

class BaseScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }

    def get_soup(self, url):
        """Récupère le contenu HTML d'une URL et retourne un objet BeautifulSoup."""
        try:
            # On attend un peu pour simuler un humain
            self.sleep(1, 3)
            
            # Rotation simple d'User-Agent possible ici si besoin
            response = self.session.get(url, headers=self.headers, timeout=20)
            
            if response.status_code == 403:
                print(f"ALERTE 403 Forbidden sur {url}. Tentative avec une session propre...")
                self.session = requests.Session() # Reset session
                response = self.session.get(url, headers=self.headers, timeout=20)

            response.raise_for_status()
            return BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"Erreur lors de la requête sur {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status: {e.response.status_code}")
            return None

    def sleep(self, min_sec=1, max_sec=3):
        """Pause aléatoire pour la courtoisie."""
        time.sleep(random.uniform(min_sec, max_sec))
