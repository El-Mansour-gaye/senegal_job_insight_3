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
        separator = "&" if "?" in sector_url else "?"
        url = f"{sector_url}{separator}page={page_number}" if page_number > 0 else sector_url
        
        print(f"Scraping {sector_name} - Page {page_number}: {url}")
        soup = self.get_soup(url)
        
        if not soup:
            return []

        offers = []
        # Sélecteur identifié dans image_e6b09d.png
        job_cards = soup.select('div.card-job')
        
        if not job_cards:
            print(f"Information: Aucune offre trouvée pour {sector_name} à la page {page_number}")
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
                company_tag = card.select_one('.card-job-company') or card.select_one('a.card-job-company') or card.select_one('.company-name')
                company = company_tag.get_text(strip=True) if company_tag else "N/A"

                # 3. Date de publication
                time_tag = card.select_one('time')
                publish_date = time_tag.get('datetime') or time_tag.get_text(strip=True) if time_tag else datetime.now().strftime('%Y-%m-%d')

                # 4. Extraction basée sur les balises <strong> de image_e6ad55.png
                details = {li.get_text().split(':')[0].strip(): li.find('strong').get_text(strip=True) 
                           for li in card.find_all('li') if li.find('strong')}

                offers.append({
                    'scraped_date': datetime.now().strftime('%Y-%m-%d'),
                    'publish_date': publish_date,
                    'title': title,
                    'company': company,
                    'location': details.get("Région de", "Sénégal"),
                    'contract_type': details.get("Contrat proposé", "N/A"),
                    'education_level': details.get("Niveau d'études requis", "N/A"),
                    'experience_level': details.get("Niveau d'expérience", "N/A"),
                    'key_skills': details.get("Compétences clés", "N/A"),
                    'sector': sector_name,
                    'offer_url': offer_url,
                    'source': "EmploiSénégal"
                })
            except Exception as e:
                print(f"Erreur lors de l'extraction d'une card: {e}")
                continue
                
        return offers
