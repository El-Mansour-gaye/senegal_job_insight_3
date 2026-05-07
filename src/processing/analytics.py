import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
import os

# Configuration Headless pour les serveurs (Render, etc.)
matplotlib.use('Agg')

class JobAnalytics:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        os.makedirs('reports', exist_ok=True)

    def generate_report(self):
        print("\n--- Génération du Rapport d'Analyse ---")
        
        # 1. Nombre d'offres par secteur
        sector_counts = self.df['sector'].value_counts()
        print("\nOffres par Secteur :")
        print(sector_counts)

        # 2. Top 10 Compétences demandées
        # On explose la colonne des compétences (qui sont séparées par des virgules maintenant)
        all_skills = self.df['key_skills'].str.split(', ').explode()
        top_skills = all_skills.value_counts().head(10)
        print("\nTop 10 Compétences :")
        print(top_skills)

        # 3. Répartition géographique
        geo_dist = self.df['location'].value_counts()
        print("\nRépartition Géographique :")
        print(geo_dist)

        # 4. Expérience moyenne demandée
        avg_min_exp = self.df['min_exp'].mean()
        print(f"\nExpérience Minimum Moyenne : {avg_min_exp:.1f} ans")

        # Sauvegarde des stats dans un fichier texte pour consultation rapide
        with open('reports/summary_stats.txt', 'w', encoding='utf-8') as f:
            f.write("RÉSUMÉ DE L'ANALYSE DU MARCHÉ DE L'EMPLOI AU SÉNÉGAL\n")
            f.write("="*50 + "\n\n")
            f.write(f"Total d'offres analysées : {len(self.df)}\n\n")
            f.write("OFFRES PAR SECTEUR :\n")
            f.write(sector_counts.to_string() + "\n\n")
            f.write("TOP 10 COMPÉTENCES :\n")
            f.write(top_skills.to_string() + "\n\n")
            f.write("RÉPARTITION GÉOGRAPHIQUE :\n")
            f.write(geo_dist.to_string() + "\n")

        # 5. Génération de graphiques visuels
        plt.figure(figsize=(10, 6))
        sector_counts.plot(kind='bar', color='#0a988b')
        plt.title('Répartition des offres par Secteur')
        plt.tight_layout()
        plt.savefig('reports/secteurs.png')
        
        plt.figure(figsize=(10, 6))
        top_skills.plot(kind='barh', color='#ff9d17').invert_yaxis()
        plt.title('Top 10 Compétences demandées')
        plt.tight_layout()
        plt.savefig('reports/competences.png')

        print("\nStats et graphiques sauvegardés dans le dossier 'reports/'")
