import time
import random
import requests
from bs4 import BeautifulSoup

class BaseScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.user_agents = [
            # Windows Chrome
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            # MacOS Chrome
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            # Mobile (iPhone)
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
            # Firefox
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
        ]

    def get_headers(self):
        ua = random.choice(self.user_agents)
        headers = {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
        # Add Sec-CH-UA for modern browsers
        if "Chrome" in ua:
             headers.update({
                 "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                 "sec-ch-ua-mobile": "?0" if "Windows" in ua or "Macintosh" in ua else "?1",
                 "sec-ch-ua-platform": '"Windows"' if "Windows" in ua else '"macOS"' if "Macintosh" in ua else '"iOS"'
             })
        return headers

    def get_soup(self, url):
        """Récupère le contenu HTML d'une URL et retourne un objet BeautifulSoup."""
        try:
            # On attend un peu plus pour simuler un humain (plus long au début)
            delay = random.uniform(3, 7)
            time.sleep(delay)
            
            headers = self.get_headers()
            response = self.session.get(url, headers=headers, timeout=25)
            
            if response.status_code == 403:
                print(f"ALERTE 403 Forbidden sur {url}. Tentative avec session neuve et mobile UA...")
                self.session = requests.Session() 
                mobile_ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1"
                headers["User-Agent"] = mobile_ua
                headers["Referer"] = "https://m.facebook.com/" # Referer mobile
                time.sleep(random.uniform(5, 10))
                response = self.session.get(url, headers=headers, timeout=25)

            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"Erreur requête sur {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status: {e.response.status_code}")
            return None

    def sleep(self, min_sec=1, max_sec=3):
        """Pause aléatoire pour la courtoisie."""
        time.sleep(random.uniform(min_sec, max_sec))
