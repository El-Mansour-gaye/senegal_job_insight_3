from .base_scraper import BaseScraper
from datetime import datetime

class EmploiSenegalScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://www.emploisenegal.com/recherche-jobs-senegal")

    def get_dynamic_sectors(self):
        """Extrait dynamiquement les noms des secteurs et leurs URLs de filtres."""
        print(f"Extraction dynamique des secteurs depuis {self.base_url}...")
        soup = self.get_soup(self.base_url)
        sectors = {}
        
        if not soup:
            return sectors

        # Sélecteur identifié dans image_e7307b.png
        facet_ul = soup.find('ul', id="facetapi-facet-apachesolrsolr-block-im-field-offre-secteur")
        
        if not facet_ul:
            print("Avertissement: Bloc de secteurs (facettes) pré-défini non trouvé. Utilisation de l'id alternatif.")
            facet_ul = soup.find('ul', id=lambda x: x and 'im-field-offre-secteur' in x.lower())

        if facet_ul:
            links = facet_ul.find_all('a')
            for link in links:
                name = link.get_text(strip=True).split('(')[0].strip()
                href = link.get('href')
                if href:
                    if not href.startswith('http'):
                        href = "https://www.emploisenegal.com" + href
                    sectors[name] = href
        
        print(f"Secteurs détectés : {len(sectors)}")
        return sectors

    def scrape_list_page(self, sector_name, sector_url, page_number=0):
        """Scrape une page de liste d'offres pour un secteur donné."""
        # Gestion correcte du paramètre de page avec les facettes existantes
        separator = "&" if "?" in sector_url else "?"
        url = f"{sector_url}{separator}page={page_number}" if page_number > 0 else sector_url
        
        print(f"Scraping {sector_name} - Page {page_number}: {url}")
        soup = self.get_soup(url)
        
        if not soup:
            return []

        offers = []
        # Nouveaux sélecteurs précis
        job_cards = soup.select('div.card-job')
        
        if not job_cards:
            print(f"Information: Aucune offre trouvée (sélecteur div.card-job) pour {sector_name} à la page {page_number}")
            return []

        for card in job_cards:
            try:
                # 1. Titre et URL
                title_tag = card.select_one('h3 a')
                title = title_tag.get_text(strip=True) if title_tag else "N/A"
                offer_url = title_tag['href'] if title_tag and title_tag.has_attr('href') else ""
                if offer_url and not offer_url.startswith('http'):
                    offer_url = "https://www.emploisenegal.com" + offer_url
                
                # 2. Entreprise
                company_tag = card.select_one('a.card-job-company') or card.select_one('.company-name')
                company = company_tag.get_text(strip=True) if company_tag else "N/A"

                # 3. Date de publication
                time_tag = card.select_one('time')
                publish_date = time_tag.get('datetime') or time_tag.get_text(strip=True) if time_tag else datetime.now().strftime('%Y-%m-%d')

                # 4. Extraction des détails dans la liste <ul> / <strong>
                # On initialise les variables
                location = "Sénégal"
                contract_type = "N/A"
                edu_level = "N/A"
                exp_level = "N/A"
                key_skills = "N/A"

                # On cherche tous les <li> ou simplement les zones de texte pour identifier les labels
                details_list = card.find_all('li')
                for li in details_list:
                    text = li.get_text(separator=" ", strip=True)
                    strong_val = li.find('strong')
                    val = strong_val.get_text(strip=True) if strong_val else ""
                    
                    if not val: continue

                    if "Région de :" in text:
                        location = val
                    elif "Contrat proposé :" in text:
                        contract_type = val
                    elif "Niveau d'études requis :" in text:
                        edu_level = val
                    elif "Niveau d'expérience :" in text:
                        exp_level = val
                    elif "Compétences clés :" in text:
                        key_skills = val

                offers.append({
                    'scraped_date': datetime.now().strftime('%Y-%m-%d'),
                    'publish_date': publish_date,
                    'title': title,
                    'company': company,
                    'location': location,
                    'contract_type': contract_type,
                    'education_level': edu_level,
                    'experience_level': exp_level,
                    'key_skills': key_skills,
                    'sector': sector_name,
                    'offer_url': offer_url,
                    'source': "EmploiSénégal"
                })
            except Exception as e:
                print(f"Erreur lors de l'extraction d'une card: {e}")
                continue
                
        return offers
                
        return offers
