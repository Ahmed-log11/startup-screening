"""
Unsupervised part used by the app: K-Means segment + DBSCAN wild card check.

Files (created by notebooks/02_clustering.ipynb):
    cluster_preprocessor.pkl, kmeans.pkl, dbscan_core.pkl, clusters.json
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import pairwise_distances_argmin_min

MODELS_DIR = Path(__file__).parent

_preprocessor = joblib.load(MODELS_DIR / "cluster_preprocessor.pkl")
_kmeans = joblib.load(MODELS_DIR / "kmeans.pkl")
_dbscan_core = joblib.load(MODELS_DIR / "dbscan_core.pkl")
with open(MODELS_DIR / "clusters.json") as f:
    _clusters = json.load(f)

FEATURE_COLUMNS = _dbscan_core["feature_columns"]


def assign_cluster(startup: dict) -> dict:
    """
    startup: {"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}
    """
    x = _preprocessor.transform(pd.DataFrame([startup])[FEATURE_COLUMNS])

    cluster_id = str(int(_kmeans.predict(x)[0]))
    info = _clusters[cluster_id]

    # DBSCAN has no predict(): a new startup is a wild card if it is
    # farther than eps from every core point found during training.
    nearest_core = np.linalg.norm(_dbscan_core["core_points"] - x, axis=1).min()

    return {
        "cluster": info["name"],
        "cluster_success_rate": round(info["success_rate"]),
        "similar": info["examples"],
        "is_wildcard": bool(nearest_core > _dbscan_core["eps"]),
    }


def assign_clusters(df: pd.DataFrame) -> pd.DataFrame:
    """Same as assign_cluster, for many startups at once (used to score the whole investor list fast)."""
    x = _preprocessor.transform(df[FEATURE_COLUMNS])
    x = x.toarray() if hasattr(x, "toarray") else x
    ids = _kmeans.predict(x)
    _, nearest_core = pairwise_distances_argmin_min(x, _dbscan_core["core_points"])
    return pd.DataFrame({
        "cluster": [_clusters[str(int(i))]["name"] for i in ids],
        "is_wildcard": nearest_core > _dbscan_core["eps"],
    })


if __name__ == "__main__":
    print(assign_cluster({"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}))
    print(assign_cluster({"num_founders": 6, "founded_year": 2005, "industry": "Real Estate", "region": "Middle East"}))
