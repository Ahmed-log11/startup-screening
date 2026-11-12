# Data

This folder holds the data for the startup screening project: the original Kaggle file and the cleaned file that every model trains on. Both are produced by `notebooks/01_cleaning_eda.ipynb`.

```
data/
├── raw/
│   └── yc_companies.csv      original Kaggle file, never edited
└── processed/
    └── yc_clean.csv          cleaned file, used by all models
```

| File | Rows x columns | What it is |
|---|---|---|
| `raw/yc_companies.csv` | 4,974 x 15 | Every Y Combinator company from 2005 to 2024, as scraped. |
| `processed/yc_clean.csv` | 2,559 x 12 | Companies founded in 2019 or earlier, cleaned, with the target `label`. |

## Source

[Complete YCombinator Dataset 2005-2024 (Kaggle)](https://www.kaggle.com/datasets/supremesun/complete-ycombinator-dataset-from-2005-2024), scraped in November 2024.

## How to rebuild the clean file

```bash
pip install -r requirements.txt
jupyter notebook notebooks/01_cleaning_eda.ipynb   # then Run All
```

- If `raw/yc_companies.csv` is missing, the notebook downloads it from Kaggle with `kagglehub`.
- The last section of the notebook writes `processed/yc_clean.csv`.
- The raw file is only read, never changed.

## How to load it

```python
import pandas as pd

df = pd.read_csv('data/processed/yc_clean.csv')
df['short_description'] = df['short_description'].fillna('')   # 184 empty descriptions are read as NaN

X = df[['num_founders', 'team_size', 'founded_year', 'industry', 'region']]
y = df['label']
```

## Columns of `yc_clean.csv`

| Column | Type | Meaning | Model feature? |
|---|---|---|---|
| `name` | text | Company name | No |
| `short_description` | text | One-line description, for the app | No |
| `founded_year` | int | Year founded, 2005 to 2019 | Yes, with care |
| `batch` | text | YC batch, e.g. `W15` (W = winter, S = summer, F = fall, `IK12` = Imagine K12) | No |
| `batch_year` | int | Year of the batch | No |
| `industry` | category | B2B, Consumer, Healthcare, Fintech, Industrials, Education, Real Estate, Other | Yes |
| `region` | category | United States, Europe, Asia, Latin America, Africa, Middle East, Other | Yes |
| `country` | text | Full English name, e.g. `United States` | No |
| `num_founders` | int | Number of founders | Yes |
| `team_size` | int | Team size in November 2024 | Yes, with care |
| `status` | text | active / acquired / public / inactive | No. It is the answer |
| `label` | 0/1 | The target | Target only |

The full definitions are in [`docs/schema.md`](../docs/schema.md).

## The label

| `status` | `label` | Companies |
|---|---|---|
| active | 1 | 1,326 |
| acquired | 1 | 530 |
| public | 1 | 18 |
| inactive | 0 | 685 |

**1,874 success (73%) and 685 failure (27%).** The classes are imbalanced, so use a stratified split and report F1 and ROC-AUC, not accuracy.

## What was done to the raw file

1. Fixed broken text encoding (`CafÃ©` to `Café`).
2. Lowercased `status`.
3. Removed two duplicates: Lokal (listed twice) and TapToLearn (the same company as Tap to Learn, with the opposite status).
4. Built `batch_year` from `batch`, and `founded_year` from `founded` (filled from `batch_year` when missing).
5. Treated `team_size = 0` and placeholder descriptions (`-`, `TBD`) as missing.
6. Kept companies founded in 2019 or earlier.
7. Created `label` from `status`.
8. Grouped `industry` into 8 groups and mapped `region` to 7 world regions.
9. Extracted `country` from `location`, and counted `num_founders`.
10. Dropped `jobs`, which leaks the answer.
11. Filled missing `num_founders` and `team_size` with the median.

## Things to know before using it

- **No missing values**, except the 184 empty `short_description` cells.
- **No unique key.** Eleven names are shared by different companies, and two companies named Castle are both in batch W16. Use the row index.
- **`team_size` is leaky.** It is the size today, so dead companies show a tiny final team (median 2 vs 18). Train with and without it.
- **Use `founded_year` or `batch_year`, never both**, and never their difference. Rows where `founded` was filled always have equal years, which gives the fill away.
- **`region = Other` is mixed.** It holds Canada (105 companies, 84% success) and companies with no location (94 companies, 21% success).
- **`team_size` is approximate.** Values 11, 51, 201 and 501 are probably the lower end of size ranges such as "11-50 employees".

## More detail

[`docs/data_guide.md`](../docs/data_guide.md) explains each cleaning step, the EDA findings with charts, the leakage checks, training tips for both model roles, and the open decisions for the team.
