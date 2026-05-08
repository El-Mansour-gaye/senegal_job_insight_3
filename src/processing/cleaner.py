import pandas as pd
import re

class DataCleaner:
    def __init__(self, raw_data_path):
        self.raw_data_path = raw_data_path
        # Mapping de normalisation des régions
        self.region_map = {
            'Dakar - Sénégal': 'Dakar',
            'Région de Dakar': 'Dakar',
            'Thiès - Sénégal': 'Thiès',
            'Région de Thiès': 'Thiès',
            'Saint-Louis - Sénégal': 'Saint-Louis',
            'Etranger - Sénégal': 'Étranger',
            'Tout le Sénégal': 'Sénégal (Multi-régions)',
            'International': 'Étranger'
        }
        # Coordonnées GPS pour les principales villes du Sénégal
        self.geo_map = {
            'Dakar': [14.7167, -17.4677],
            'Thiès': [14.7833, -16.9167],
            'Saint-Louis': [16.0167, -16.5000],
            'Ziguinchor': [12.5833, -16.2719],
            'Diourbel': [14.6500, -16.2333],
            'Louga': [15.6167, -16.2167],
            'Kolda': [12.8833, -14.9500],
            'Matam': [15.6500, -13.2500],
            'Fatick': [14.3333, -16.4000],
            'Kaolack': [14.1333, -16.0833],
            'Kaffrine': [14.1000, -15.5333],
            'Kédougou': [12.5500, -12.1833],
            'Sédhiou': [12.7000, -15.5500],
            'Tamba': [13.7667, -13.6667],
            'Tambacounda': [13.7667, -13.6667],
            'Étranger': [0, 0],
            'Sénégal (Multi-régions)': [14.4974, -14.4524]
        }

    def extract_experience(self, exp_text):
        """Extrait min_exp et max_exp depuis un texte."""
        if pd.isna(exp_text) or exp_text == "N/A":
            return 0, 0
        
        text = str(exp_text).lower()
        numbers = [int(n) for n in re.findall(r'\d+', text)]

        if any(kw in text for kw in ['débutant', 'jeune diplômé', 'etudiant']):
            if len(numbers) >= 1:
                return 0, numbers[0]
            return 0, 1

        if len(numbers) >= 2:
            return numbers[0], numbers[1]
        elif len(numbers) == 1:
            if "plus de" in text or ">" in text or "supérieur" in text:
                return numbers[0], numbers[0] + 5
            return numbers[0], numbers[0]

        return 0, 0

    def extract_min_education(self, edu_text):
        """Extrait le niveau d'éducation minimum et son rang."""
        if pd.isna(edu_text) or edu_text == "N/A":
            return "N/A", -1

        text = str(edu_text).lower()

        patterns = [
            (r'qualification avant bac', 'Avant Bac', 0),
            (r'bac\+8', 'Bac+8', 7),
            (r'doctorat', 'Bac+8', 7),
            (r'bac\+5', 'Bac+5', 6),
            (r'master', 'Bac+5', 6),
            (r'bac\+4', 'Bac+4', 5),
            (r'bac\+3', 'Bac+3', 4),
            (r'bac\+2', 'Bac+2', 3),
            (r'bac\+1', 'Bac+1', 2),
            (r'bac(?!\+)', 'Bac', 1)
        ]

        found_matches = []
        for pattern, label, rank in patterns:
            if re.search(pattern, text):
                found_matches.append((label, rank))

        if not found_matches:
            if 'bac' in text:
                return 'Bac', 1
            return "N/A", -1

        min_edu = min(found_matches, key=lambda x: x[1])
        return min_edu[0], min_edu[1]

    def clean_title(self, title):
        """Nettoie le titre du poste."""
        if pd.isna(title):
            return "N/A"

        # Supprime H/F, (M/F), etc.
        title = re.sub(r'\s*[\(\[]?h/f[\)\]]?.*', '', title, flags=re.IGNORECASE)
        title = re.sub(r'\s*[\(\[]?m/f[\)\]]?.*', '', title, flags=re.IGNORECASE)

        # Supprime les suffixes de ville courants
        title = re.sub(r'\s*-\s*dakar.*', '', title, flags=re.IGNORECASE)
        title = re.sub(r'\s*-\s*sénégal.*', '', title, flags=re.IGNORECASE)

        return title.strip().title()

    def clean_location(self, loc_text):
        """Normalise la localisation."""
        if pd.isna(loc_text) or loc_text == "N/A":
            return "Sénégal (Multi-régions)"

        text = str(loc_text)

        # Nettoyage "Région de "
        text = re.sub(r'région de\s*', '', text, flags=re.IGNORECASE).strip()

        # Si multi-régions avec &, on prend la première
        if "&" in text:
            text = text.split("&")[0].strip()

        # Application du map
        normalized = self.region_map.get(text, text.split('-')[0].strip() if '-' in text else text)

        return normalized

    def clean_contract(self, contract_text):
        """Standardise le type de contrat."""
        if pd.isna(contract_text) or contract_text == "N/A":
            return "N/A"

        # On prend le premier type mentionné
        parts = re.split(r'[&,\-]', str(contract_text))
        return parts[0].strip()

    def clean(self, output_path):
        """Pipeline de nettoyage avancé."""
        print(f"Chargement des données depuis {self.raw_data_path}...")
        try:
            df = pd.read_csv(self.raw_data_path)
            if df.empty:
                print("Le fichier de données est vide.")
                return None
        except Exception as e:
            print(f"Erreur : {e}")
            return None
        
        # 1. Doublons
        df = df.drop_duplicates(subset=['offer_url'], keep='first')

        # 2. Nettoyage Titre
        df['title'] = df['title'].apply(self.clean_title)

        # 3. Normalisation des Régions
        df['location'] = df['location'].apply(self.clean_location)

        # 4. Extraction Expérience
        df[['min_exp', 'max_exp']] = df['experience_level'].apply(
            lambda x: pd.Series(self.extract_experience(x))
        )

        # 5. Extraction Education
        df[['min_education', 'education_rank']] = df['education_level'].apply(
            lambda x: pd.Series(self.extract_min_education(x))
        )

        # 6. Normalisation Contrat
        df['contract_type'] = df['contract_type'].apply(self.clean_contract)

        # 7. GPS
        df['latitude'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524])[0])
        df['longitude'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524])[1])
        df['coordinates'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524]))

        # 8. Compétences
        df['key_skills'] = df['key_skills'].fillna("N/A").str.replace(' - ', ', ').str.replace(';', ', ')

        # Sauvegarde
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"Nettoyage terminé. Données sauvegardées: {output_path}")
        return df
