# Your role: Data Cleaning + EDA

## The project in short
An app that scores startups. A classification model gives each startup a success score out of 100, and two clustering models (K-Means and DBSCAN) group startups into types and flag unusual ones.
**Your work is the foundation:** the whole team trains on the file you deliver.

## The data
- Link: https://www.kaggle.com/datasets/supremesun/complete-ycombinator-dataset-from-2005-2024
- Save it as `data/raw/yc_companies.csv` and never edit that file.
- The data is messy on purpose. Cleaning it is part of the grade.

## What to do

### 1. Explore
`shape`, `info()`, missing values per column, and `df["status"].value_counts()`.

### 2. Clean
- Normalize `status`: lowercase, no extra spaces.
- Remove duplicate rows.
- If `founded` is missing, take the year from `batch` (e.g. `W15` → 2015, `S09` → 2009).

### 3. Keep only companies founded in 2019 or earlier
The data was scraped in Nov 2024, so this keeps companies that are 5+ years old.
**Why:** a 2-year-old company is "active" only because it hasn't had time to fail. Keeping young companies would teach the model that "young = failed," which is wrong.

### 4. Create the target column `label` (the most important step)
The model learns from this column, so it must be exactly right.

| `status` value | `label` | Meaning |
|---|---|---|
| `acquired` | **1** | Success: another company bought it |
| `public` | **1** | Success: it went public (IPO) |
| `active` | **1** | Success: still running after 5+ years (guaranteed by step 3) |
| `inactive` | **0** | Failure: the company shut down |
| anything else / empty | **drop the row** | Unknown outcome |

```python
df["status"] = df["status"].str.strip().str.lower()
df = df[df["founded_year"] <= 2019]

label_map = {"acquired": 1, "public": 1, "active": 1, "inactive": 0}
df["label"] = df["status"].map(label_map)
df = df.dropna(subset=["label"])
df["label"] = df["label"].astype(int)

print(df["label"].value_counts())   # report this number to the team
```

Before you map, check the real values with `value_counts()`. If you see variants like `Inactive ` or `closed`, fix them so they match the table.

### 5. Group industries
Map `industry` into at most 10 groups (e.g. B2B, Consumer, Fintech, Healthcare, Education, Industrials, Real Estate). Put the rest under `Other`.

### 6. Location
Extract `country` from `location`. Keep `region` as it is.

### 7. ⚠️ Check for leakage
Some columns may reveal the answer. Compare `team_size`, `active_founders` and `jobs` between label 1 and label 0.
- If closed companies almost always have 0 or empty in a column, that column gives the answer away.
- **Drop `jobs`** (closed companies always have 0 open jobs).
- Tell the team what you found for `team_size` and `active_founders`.

### 8. EDA
At most 5 charts: label balance, success rate by industry, by region, by number of founders, and the team-size distribution. Under each chart, one line on what it shows.

## What to deliver
1. **`data/processed/yc_clean.csv`** with exactly these columns:
   `name, short_description, founded_year, batch, batch_year, industry, region, country, num_founders, team_size, status, label`
   (details in `docs/schema.md`)
2. **`notebooks/01_cleaning_eda.ipynb`**: the cleaning steps, charts and findings.

**Important:** send a first version as early as possible, even if it isn't perfect. Two members are waiting for this file to start.

## Rules
- Work on a branch called `data-cleaning` and merge through a pull request.
- Don't rename columns without telling the team.
- If you use AI: send it this whole file + the first 10 rows of the data.
