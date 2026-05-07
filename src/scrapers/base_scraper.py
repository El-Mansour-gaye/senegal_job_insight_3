import time
import random
import requests
from bs4 import BeautifulSoup

class BaseScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def get_soup(self, url):
        """Récupère le contenu HTML d'une URL et retourne un objet BeautifulSoup."""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"Erreur lors de la requête sur {url}: {e}")
            return None

    def sleep(self, min_sec=1, max_sec=3):
        """Pause aléatoire pour la courtoisie."""
        time.sleep(random.uniform(min_sec, max_sec))
