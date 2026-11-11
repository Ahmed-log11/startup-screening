# Your role: Unsupervised models

## The project in short
An app that scores startups. A classification model gives a success score out of 100, and you build the other two models:
- **K-Means:** groups startups into similar types, so each startup is compared with the ones like it.
- **DBSCAN:** finds unusual startups that don't look like anyone else ("wild cards"), so an investor reviews them manually.

## The data
- File: `data/processed/yc_clean.csv` from the cleaning member (columns in `docs/schema.md`).
- **Features:** `num_founders, team_size, founded_year, industry, region`
- **Don't use** `label`, `status` or `name` for training. Clustering never sees the answer.
- One-hot encode `industry` and `region`, and scale with `StandardScaler`.

## What to do

### 1. K-Means
- Try k from 3 to 6 and pick the best using the **elbow method** and the **silhouette score**.
- For each cluster: look at the averages and the most common industries, then give it a **clear English name** (e.g. "Early B2B teams").
- **After** clustering: compute each cluster's success rate using `label`.
- For each cluster: pick 3 successful companies as examples.

### 2. DBSCAN
- Choose `eps` from a **k-distance plot**, and try a few values of `min_samples`.
- Companies labeled **-1 (noise)** are the wild cards. Aim for roughly 3–10% of the data.
- Look at some of them: what makes them unusual?
- ⚠️ DBSCAN has **no `predict()`** for new startups. Solution: save the core points. For a new startup, compute the distance to the nearest core point. If it's larger than `eps`, it's a wild card.

## What to deliver
1. **`notebooks/02_clustering.ipynb`**: experiments, charts and cluster names.
2. **In `models/`:**
   - `cluster_preprocessor.pkl` (one-hot + scaler)
   - `kmeans.pkl`
   - `dbscan_core.pkl` (core points + the `eps` value)
   - `clusters.json`: for each cluster, its name, success rate and 3 example companies
3. **`models/clustering.py`** with one function the app uses:
```python
assign_cluster(startup: dict) -> {
    "cluster": "Early B2B teams",
    "cluster_success_rate": 55,
    "similar": ["Company A", "Company B", "Company C"],
    "is_wildcard": False
}
```

## Rules
- Work on a branch called `unsupervised` and merge through a pull request.
- You can start before the cleaning is finished: use a first version of the file and switch to the final one when it arrives.
- If you use AI: send it this whole file + `docs/schema.md` + the first 10 rows of the data.
