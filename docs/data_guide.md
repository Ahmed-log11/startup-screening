# Data guide: `yc_clean.csv`

For the supervised and unsupervised members. It explains the data, what was done to it, what the EDA found, and how to train on it. Every step and chart is in `notebooks/01_cleaning_eda.ipynb`.

## 1. Summary

- `data/processed/yc_clean.csv` has **2,559 startups** and 12 columns, exactly as in `docs/schema.md`.
- **Label: 1,874 success (73%) and 685 failure (27%).**
- Train on five columns: `industry`, `region`, `num_founders`, `founded_year`, `team_size`.
- Two warnings before you start:
  - **`team_size` carries most of the signal, and most of it is leakage.** Train with and without it (section 5).
  - **Age still affects the label.** Newer companies look more successful only because they had less time to fail.

## 2. The data

The raw file comes from [Kaggle](https://www.kaggle.com/datasets/supremesun/complete-ycombinator-dataset-from-2005-2024): 4,974 Y Combinator companies from 2005 to 2024, with 15 columns, scraped in November 2024.

### Columns of the clean file

| Column | Type | Meaning | Use as a feature? |
|---|---|---|---|
| `name` | text | Company name | No |
| `short_description` | text | One-line description, for the app | No |
| `founded_year` | int | Year founded, 2005 to 2019 | Yes, with care |
| `batch` | text | YC batch, e.g. `W15`. `IK12` is Imagine K12 | No |
| `batch_year` | int | Year of the batch | No |
| `industry` | category | 8 groups | Yes |
| `region` | category | 7 world regions | Yes |
| `country` | text | Full English name, e.g. `United States` | No |
| `num_founders` | int | Number of founders | Yes |
| `team_size` | int | Team size today (November 2024) | Yes, with care |
| `status` | text | active / acquired / public / inactive | No. It is the answer |
| `label` | 0/1 | The target | Target only |

### The label

| `status` | `label` | Companies |
|---|---|---|
| active | 1 | 1,326 |
| acquired | 1 | 530 |
| public | 1 | 18 |
| inactive | 0 | 685 |

Class 1 is 71% `active`, so the model mostly learns "survived vs shut down", not "big exit vs shut down".

## 3. What was done to the data

In order, as in the notebook:

1. **Fixed broken text.** Text such as `Wheelys CafÃ©` was repaired to `Wheelys Café` with `ftfy`.
2. **Normalized `status`** to lowercase. Only four values exist.
3. **Removed duplicates.**
   - Lokal was listed twice; the more complete copy was kept.
   - Tap to Learn (W12, inactive) and TapToLearn (IK12, active) are the same company with opposite outcomes. The W12 row was kept.
   - Names that differ only in case (FitHub / Fithub, HENRY / Henry, Miru / miru) were checked and are different companies.
4. **Built `batch_year`** from `batch` (`W15` becomes 2015). `IK12` has no year and was set to 2013, the median founding year of that group.
5. **Built `founded_year`.** 1,074 missing values were filled from `batch_year`. This is a fair guess: 81% of companies with a known year were founded 0 or 1 year before their batch.
6. **Treated `team_size = 0` as missing** (111 companies). A running company cannot have 0 people.
7. **Removed placeholder descriptions** (`-` and `TBD`).
8. **Kept companies founded in 2019 or earlier:** 4,972 down to 2,559.
9. **Created `label`** from `status`. No row had an unknown status.
10. **Grouped `industry`** into 8 groups from the first part of the original value.
11. **Extracted `country`** from `location`. US state codes and bare US city names become `United States`. `Remote, OR` is treated as `Remote`.
12. **Mapped `region` to 7 world regions**, as `docs/schema.md` defines it. The original region was a city with 289 values.
13. **Counted `num_founders`** from the founders list.
14. **Dropped `jobs`** (leakage).
15. **Filled the remaining gaps:** `num_founders` with the median 2 (32 rows) and `team_size` with the median 11 (142 rows).

`team_size` is approximate. Values 11, 51, 201 and 501 appear far more often than their neighbours, so they are probably the lower end of size ranges such as "11-50 employees".

## 4. What the EDA found

### The label is imbalanced

![Label balance](figures/label_balance.png)

A model that always answers "success" gets 73% accuracy, so accuracy alone means nothing here.

### Industry is the strongest safe feature

![Success rate by industry](figures/success_by_industry.png)

Consumer is clearly the weakest (57%). Fintech (85%) and Healthcare (81%) are the strongest. B2B has the most acquisitions (26%), and Consumer has the most shutdowns (43%).

### Region

![Success rate by region](figures/success_by_region.png)

The United States holds 74% of the companies and sits near the average (72%). Europe, Asia, Latin America and Africa are higher. The Middle East has only 14 companies, so its number is not reliable.

`Other` mixes two opposite groups: Canada (105 companies, 84% success) and companies with no location at all (94 companies, 21% success). See section 6.

### Number of founders barely matters

1, 2, 3 and 4+ founders all succeed between 71% and 75% of the time.

### Team size separates the classes, for the wrong reason

![Team size by label](figures/team_size_by_label.png)

Half of the failed companies have exactly 2 people, while successful ones spread from 10 to 500. The median is 2 for failed companies and 18 for successful ones. But this is the size today, not the size when the company joined YC: a dead company shows its final tiny team.

### Age still affects the label

![Success rate by founding year](figures/success_by_founding_year.png)

Companies founded in 2006-2009 succeed 33-55% of the time; those founded in 2017-2019 succeed about 82% of the time. Older companies simply had more years to fail.

Also, 464 companies (18%) were founded in 2019 or earlier but joined YC in 2020-2024. They succeed 89% of the time, against 70% for the rest.

## 5. Leakage

When a startup dies, its YC page stops being updated. Empty fields and current numbers then reveal the answer.

| Column or pattern | What we saw | What was done |
|---|---|---|
| `jobs` | 100% of failed companies have 0 open jobs | Dropped |
| `team_size` | Median 2 (failed) vs 18 (successful) | Kept. Train with and without it |
| `team_size = 0` | 25% success | Treated as missing, filled with the median |
| Empty founders field | 6% success | Filled with the median, so it cannot be singled out |
| No location (`country = Unknown`) | 21% success | Lands in `region = Other` |
| `founded` was missing | 51% success vs 87% | Filled from `batch_year` |
| `founded_year == batch_year` | 62% success vs 88% | Use only one of the two columns |

The last row is a hidden leak. Every filled `founded_year` equals `batch_year`, so a model that sees both columns, or their difference, can tell which rows were filled. **Use `founded_year` only, and never build a "years before YC" feature.**

## 6. Training tips

### Both models

- Features: `num_founders`, `team_size`, `founded_year`, `industry`, `region`.
- One-hot encode `industry` and `region` with `handle_unknown='ignore'`, and scale the numbers with `StandardScaler`.
- Use `np.log1p(team_size)`. The raw column runs from 1 to 8,600 with a median of 11.
- Keep everything inside one `Pipeline`, so the app applies the same steps to a new startup.

### Supervised

- Split with `stratify=y` and a fixed `random_state`.
- Use `class_weight='balanced'`. Report F1 for class 0, ROC-AUC and a confusion matrix.
- **Train two versions: with and without `team_size`.** A quick 5-fold check on this file, with no tuning, gave:

  | Features | Logistic Regression | Random Forest |
  |---|---|---|
  | All five | 0.78 | 0.83 |
  | `team_size` alone | - | 0.82 |
  | All except `team_size` | 0.67 | 0.66 |

  (ROC-AUC.) So the model is mostly `team_size`. Expect about 0.67 without it; that number is honest, not a bug.
- Think about the app before choosing. A founder who enters a new 3-person startup will get a weak score, because the dead companies in the data have 2 people. The explanation and the what-if ("a bigger team") will also be driven by this column.
- `founded_year` teaches "newer is better". Check how much of the score it explains.
- If the scores look too good, look at the top features first.

### Unsupervised

- Never give `label` or `status` to the clustering. Use `label` only afterwards, to compute each cluster's success rate.
- One-hot columns can dominate K-Means: if every cluster is just one industry, try the numeric columns alone, or fewer categories.
- DBSCAN will flag the giants (DoorDash 8,600, Stripe 7,000, Airbnb 6,132, Coinbase 6,112) as wild cards. With `log1p` there will be fewer of them.
- 142 companies share the filled value `team_size = 11`, on top of the real ones. Expect a dense spot there.

## 7. Open decisions for the team

1. **`team_size` in the final model?** Decide after comparing the two versions.
2. **Canada and `Other`.** A Canadian startup is scored together with the no-location companies. Options: give Canada its own region, or merge it with the United States as North America. Either needs a change in `docs/schema.md`.
3. **Add `batch_year <= 2019`?** It removes the 464 late YC joiners (89% success). Smaller data, cleaner label.
4. **`region`.** The task file said "keep `region` as it is"; `docs/schema.md` defines world regions. The schema was followed, because both model roles use `region` as a feature.
5. **More than 5 charts.** The notebook has 9; charts 8.6 to 8.9 are extra checks for the model members.

## 8. Limits

- "Active after 5 years" is a weak definition of success: a 2-person company that barely survives counts the same as Stripe.
- `team_size` and `status` are a November 2024 snapshot, not the state when the company joined YC.
- All companies are YC companies. The model may not transfer to startups outside YC.
- Median fills were computed on the whole file, before any train/test split. The effect is very small, but it is not zero.
