"""
The one function the app calls: score, tier, factors, what-if and the startup's segment.

Files:
    classifier.pkl  - the final supervised model, made by notebooks/03_classification.ipynb (section 12)
    clustering.py   - K-Means segment + DBSCAN wild card, made by notebooks/02_clustering.ipynb
"""
from pathlib import Path

import joblib
import pandas as pd

from models.clustering import assign_cluster, assign_clusters

MODELS_DIR = Path(__file__).parent
_bundle = joblib.load(MODELS_DIR / "classifier.pkl")

_model = _bundle["model"]              # calibrated Logistic Regression, without team_size
FEATURES = _bundle["features"]         # industry, region, num_founders, founded_year
TYPICAL = _bundle["typical"]           # the most common startup in the training data
GROUPS = _bundle["groups"]             # feature -> team / market / ecosystem
STRONG_FROM = _bundle["tiers"]["strong_from"]   # top 30% of training scores
WEAK_BELOW = _bundle["tiers"]["weak_below"]     # bottom 20% of training scores

# The model learned from companies founded up to 2019; newer ones are scored as 2019.
LATEST_YEAR = 2019
MAX_FOUNDERS_IN_DATA = 5               # beyond this the data has almost no companies
INDUSTRIES = ["B2B", "Consumer", "Fintech", "Healthcare", "Education", "Industrials", "Real Estate"]


def tier_from_score(score: float) -> str:
    if score >= STRONG_FROM:
        return "Strong signal"
    if score >= WEAK_BELOW:
        return "Needs review"
    return "Weak signal"


def _clean(startup: dict) -> dict:
    """Keep the 4 model features, with the year capped."""
    row = {f: startup[f] for f in FEATURES}
    row["founded_year"] = min(int(row["founded_year"]), LATEST_YEAR)
    row["num_founders"] = int(row["num_founders"])
    return row


def _scores(rows: list[dict]) -> list[float]:
    """Score many startups in one call (much faster than one by one)."""
    return (_model.predict_proba(pd.DataFrame(rows)[FEATURES])[:, 1] * 100).tolist()


def _factor_name(feature: str, value) -> str:
    # The frontend translates these exact formats to Arabic (app/frontend/src/i18n.jsx).
    if feature == "num_founders":
        return f"{value} founder(s)"
    if feature == "industry":
        return f"{value} industry"
    if feature == "region":
        return f"Region: {value}"
    return f"Founded {value}"


def _factors(row: dict, score: float) -> list[dict]:
    """Same method as the notebook: put back the typical startup's value, measure the change."""
    changed = [{**row, f: TYPICAL[f]} for f in FEATURES]
    changed_scores = _scores(changed)
    factors = [
        {"group": GROUPS[f], "name": _factor_name(f, row[f]), "impact": round(score - s)}
        for f, s in zip(FEATURES, changed_scores)
    ]
    return sorted(factors, key=lambda x: abs(x["impact"]), reverse=True)


def _what_if(row: dict, score: float) -> list[dict]:
    """Re-score with one change the founder controls. Keep only changes that raise the score."""
    options = []
    if row["num_founders"] < MAX_FOUNDERS_IN_DATA:
        options.append(("Add a co-founder", {**row, "num_founders": row["num_founders"] + 1}))
    for industry in INDUSTRIES:
        if industry != row["industry"]:
            options.append((f"Shift focus to {industry}", {**row, "industry": industry}))

    new_scores = _scores([changed for _, changed in options])
    results = [
        {"change": label, "new_score": round(new)}
        for (label, _), new in zip(options, new_scores)
        if round(new) > round(score)
    ]
    results.sort(key=lambda x: x["new_score"], reverse=True)

    # Show at most 3, and at most 2 industry shifts, so the co-founder idea is not pushed out.
    picked, industries = [], 0
    for r in results:
        if r["change"].startswith("Shift focus"):
            if industries == 2:
                continue
            industries += 1
        picked.append(r)
        if len(picked) == 3:
            break
    return picked


def predict(startup: dict) -> dict:
    """
    startup: one company with the 4 model features, e.g.
        {"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}
    """
    row = _clean(startup)
    score = _scores([row])[0]
    return {
        "score": round(score),
        "tier": tier_from_score(round(score)),  # same number the user sees
        "factors": _factors(row, score),
        "what_if": _what_if(row, score),
        **assign_cluster(row),
    }


def predict_many(df: pd.DataFrame) -> pd.DataFrame:
    """Score, tier and segment for many companies at once. Used for the investor list."""
    rows = [_clean(r) for r in df[FEATURES].to_dict(orient="records")]
    scores = _scores(rows)
    out = assign_clusters(pd.DataFrame(rows))
    out["score"] = [round(s) for s in scores]
    out["tier"] = [tier_from_score(round(s)) for s in scores]
    return out


if __name__ == "__main__":
    print(predict({"num_founders": 1, "founded_year": 2026, "industry": "Consumer", "region": "Middle East"}))
    print(predict({"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}))
