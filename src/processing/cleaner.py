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
            'Tout le Sénégal': 'Sénégal (Multi-régions)'
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
            'International': [0, 0],
            'Sénégal (Multi-régions)': [14.4974, -14.4524]
        }

    def extract_experience(self, exp_text):
        """Extrait min_exp et max_exp depuis un texte (ex: '2 à 5 ans')."""
        if pd.isna(exp_text) or exp_text == "N/A":
            return 0, 0
        
        # Trouve tous les nombres dans le texte
        numbers = re.findall(r'\d+', str(exp_text))
        if len(numbers) >= 2:
            return int(numbers[0]), int(numbers[1])
        elif len(numbers) == 1:
            # Cas "Plus de 5 ans" ou "Débutant (0-1)"
            return int(numbers[0]), int(numbers[0])
        return 0, 0

    def clean(self, output_path):
        """Pipeline de nettoyage avancé."""
        print(f"Chargement des données depuis {self.raw_data_path}...")
        try:
            df = pd.read_csv(self.raw_data_path)
            if df.empty:
                print("Le fichier de données est vide.")
                return None
        except pd.errors.EmptyDataError:
            print("Erreur : Le fichier CSV est vide.")
            return None
        except Exception as e:
            print(f"Erreur lors de la lecture du fichier : {e}")
            return None
        
        # 1. Doublons et manquants
        df = df.drop_duplicates(subset=['offer_url'], keep='first')
        df = df.fillna("N/A")

        # 2. Normalisation des Régions
        df['location'] = df['location'].apply(lambda x: self.region_map.get(x, x.split('-')[0].strip() if '-' in str(x) else x))

        # 3. Extraction Expérience (Min / Max)
        df[['min_exp', 'max_exp']] = df['experience_level'].apply(
            lambda x: pd.Series(self.extract_experience(x))
        )

        # 4. Ajout des Coordonnées GPS (colonnes séparées pour Power BI)
        df['latitude'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524])[0])
        df['longitude'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524])[1])
        
        # On garde 'coordinates' pour la compatibilité avec le frontend actuel
        df['coordinates'] = df['location'].apply(lambda x: self.geo_map.get(x, [14.4974, -14.4524]))

        # 5. Standardisation des titres
        df['title'] = df['title'].str.title().str.strip()

        # 6. Nettoyage des compétences (Séparateur virgule pour Power BI et Frontend)
        # On s'assure que le séparateur est uniforme ',' 
        df['key_skills'] = df['key_skills'].str.replace(' - ', ', ').str.replace(';', ', ')

        # Sauvegarde
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"Nettoyage terminé. Données sauvegardées: {output_path}")
        return df
