"""
Loads the YC companies once and scores them once, so the investor list is fast.
"""
from functools import lru_cache
from pathlib import Path

import pandas as pd

from models.predict import predict_many

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "processed" / "yc_clean.csv"


@lru_cache(maxsize=1)
def load_companies() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH).reset_index(drop=True)
    df["id"] = df.index
    df["short_description"] = df["short_description"].fillna("")

    # All companies in one batch: a few seconds instead of a minute on the free server.
    scored = predict_many(df)
    for col in ["score", "tier", "cluster", "is_wildcard"]:
        df[col] = scored[col].values
    return df.sort_values("score", ascending=False).reset_index(drop=True)


LIST_COLUMNS = ["id", "name", "short_description", "industry", "region", "country",
                "founded_year", "num_founders", "score", "tier", "cluster", "is_wildcard"]
