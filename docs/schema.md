# Schema — `data/processed/yc_clean.csv`

One row per startup. Only companies founded in **2019 or earlier** (5+ years old when the data was scraped in Nov 2024).

| Column | Type | Values |
|---|---|---|
| `name` | text | Company name |
| `short_description` | text | One-line description (for the app only, not a model feature) |
| `founded_year` | int | e.g. 2015 (filled from `batch` if missing) |
| `batch` | text | YC batch, e.g. `W15` |
| `batch_year` | int | Year from the batch, e.g. 2015 |
| `industry` | category | At most 10 groups, e.g. B2B, Consumer, Fintech, Healthcare, Education, Industrials, Real Estate, Other |
| `region` | category | e.g. United States, Europe, Asia, Latin America, Africa, Middle East, Other |
| `country` | text | Country name in English |
| `num_founders` | int | From `active_founders` |
| `team_size` | int | Current team size |
| `status` | text | active / acquired / public / inactive (lowercase) |
| `label` | 0/1 | 1 = acquired, public, or active · 0 = inactive |

## Not allowed as model features
`name`, `short_description`, `status`, `label`, `jobs`, `website`, `logo`, `long_description`.
`jobs` (open jobs) is dropped because closed companies always have 0, which leaks the answer.
