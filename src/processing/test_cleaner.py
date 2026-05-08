from cleaner import DataCleaner
import pandas as pd

def test_experience():
    cleaner = DataCleaner(None)
    assert cleaner.extract_experience("Débutant < 2 ans") == (0, 2)
    assert cleaner.extract_experience("Etudiant, jeune diplômé") == (0, 1)
    assert cleaner.extract_experience("Expérience > 10 ans") == (10, 15)
    assert cleaner.extract_experience("Expérience entre 5 ans et 10 ans") == (5, 10)
    print("✓ test_experience passed")

def test_education():
    cleaner = DataCleaner(None)
    assert cleaner.extract_min_education("Bac, Bac+1, Bac+2 & Bac+5")[0] == "Bac"
    assert cleaner.extract_min_education("Bac+5 et plus")[0] == "Bac+5"
    assert cleaner.extract_min_education("Qualification avant bac, Bac, Bac+2")[0] == "Avant Bac"
    assert cleaner.extract_min_education("Bac+3, Bac+4 - Bac+5 et plus")[0] == "Bac+3"
    print("✓ test_education passed")

def test_title():
    cleaner = DataCleaner(None)
    assert cleaner.clean_title("Commercial H/F - Dakar") == "Commercial"
    assert cleaner.clean_title("Ingénieur (M/F)") == "Ingénieur"
    assert cleaner.clean_title("Manager - Sénégal") == "Manager"
    print("✓ test_title passed")

def test_location():
    cleaner = DataCleaner(None)
    assert cleaner.clean_location("Dakar & International") == "Dakar"
    assert cleaner.clean_location("Thiès - Sénégal") == "Thiès"
    assert cleaner.clean_location("Région de Diourbel") == "Diourbel"
    print("✓ test_location passed")

if __name__ == "__main__":
    try:
        test_experience()
        test_education()
        test_title()
        test_location()
        print("\nAll tests passed successfully!")
    except AssertionError as e:
        print(f"\nTest failed!")
        raise e
