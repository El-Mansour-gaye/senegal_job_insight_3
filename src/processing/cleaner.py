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

        # 4. Standardisation des titres
        df['title'] = df['title'].str.title().str.strip()

        # 5. Nettoyage des compétences (Split " - ")
        # On garde une colonne 'key_skills_list' pour analyse et 'key_skills' en texte propre
        df['key_skills'] = df['key_skills'].str.replace(' - ', ', ')

        # Sauvegarde
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"Nettoyage terminé. Données sauvegardées: {output_path}")
        return df
