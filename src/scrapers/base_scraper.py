import time
import random
import requests
from bs4 import BeautifulSoup

class BaseScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/119.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ]

    def get_headers(self):
        return {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }

    def get_soup(self, url):
        """Récupère le contenu HTML d'une URL et retourne un objet BeautifulSoup."""
        try:
            # On attend un peu pour simuler un humain
            self.sleep(2, 5)
            
            response = self.session.get(url, headers=self.get_headers(), timeout=20)
            
            if response.status_code == 403:
                print(f"ALERTE 403 Forbidden sur {url}. Tentative avec session neuve...")
                self.session = requests.Session() # Reset session
                response = self.session.get(url, headers=self.get_headers(), timeout=20)

            response.raise_for_status()
            # Utiliser html.parser au lieu de lxml pour éviter les soucis de build
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"Erreur lors de la requête sur {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status: {e.response.status_code}")
            return None

    def sleep(self, min_sec=1, max_sec=3):
        """Pause aléatoire pour la courtoisie."""
        time.sleep(random.uniform(min_sec, max_sec))
