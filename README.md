# Startup Screening Platform — ML Final Project

A two-screen app that scores startups with ML and explains the factors behind each score.

- **Investor screen:** ranked startups, CSV upload, tiers, and "wild card" flags.
- **Founder screen:** enter a startup, get a score out of 100, the factors behind it, and advice.

## Models
| Model | Type | Answers |
|---|---|---|
| Classifier (LogReg / KNN / RF) | Supervised | How likely is this startup to succeed? (score = probability × 100) |
| K-Means | Unsupervised | What kind of startup is this, and who is it like? |
| DBSCAN | Unsupervised | Is this startup unusual enough to need a human review? |

## Data
[Complete YCombinator Dataset 2005–2024 (Kaggle)](https://www.kaggle.com/datasets/supremesun/complete-ycombinator-dataset-from-2005-2024).
Put the downloaded CSV in `data/raw/yc_companies.csv`. Saudi data may be added later.

## Repo structure
```
data/raw/          original Kaggle file (never edited)
data/processed/    yc_clean.csv (from the data cleaning member)
notebooks/         01_cleaning_eda / 02_clustering / 03_classification
models/            trained .pkl files + clustering.py + predict.py
app/backend/       FastAPI
app/frontend/      React
docs/              schema + role files
```

## Team rules
- Work only in your own files and on your own branch (`data-cleaning`, `unsupervised`, `supervised`, `app`).
- Merge into `main` through a pull request.
- The columns in `docs/schema.md` change only if the whole team agrees.

## Setup
```bash
pip install -r requirements.txt
```
