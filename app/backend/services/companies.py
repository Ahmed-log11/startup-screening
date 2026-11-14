"""
Loads the YC companies once and scores them once, so the investor list is fast.
"""
from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.backend.schemas import LATEST_TRAINED_YEAR
from models.predict import predict

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "processed" / "yc_clean.csv"
FEATURES = ["num_founders", "founded_year", "industry", "region"]


@lru_cache(maxsize=1)
def load_companies() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH).reset_index(drop=True)
    df["id"] = df.index
    df["short_description"] = df["short_description"].fillna("")

    results = []
    for row in df[FEATURES].to_dict(orient="records"):
        row["founded_year"] = min(int(row["founded_year"]), LATEST_TRAINED_YEAR)
        results.append(predict(row))

    scored = pd.DataFrame(results)
    df["score"] = scored["score"]
    df["tier"] = scored["tier"]
    df["cluster"] = scored["cluster"]
    df["is_wildcard"] = scored["is_wildcard"]
    return df.sort_values("score", ascending=False).reset_index(drop=True)


LIST_COLUMNS = ["id", "name", "short_description", "industry", "region", "country",
                "founded_year", "num_founders", "score", "tier", "cluster", "is_wildcard"]
