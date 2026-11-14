"""
The one function the app calls.

TEMPORARY VERSION: the score, factors and what-if are still FAKE.
The cluster fields are already REAL (from clustering.py).
Owner: the supervised member replaces the fake part with the real classifier.
The RETURN SHAPE must stay exactly the same.
"""
from models.clustering import assign_cluster


def tier_from_score(score: int) -> str:
    if score >= 70:
        return "Strong signal"
    if score >= 40:
        return "Needs review"
    return "Weak signal"


def predict(startup: dict) -> dict:
    """
    startup: one company with the 4 model features, e.g.
        {"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}
    """
    cluster_info = assign_cluster(startup)   # real: cluster, cluster_success_rate, similar, is_wildcard

    # FAKE score so the app has varied numbers to show: the segment's success rate,
    # nudged by the number of founders. Replace with the classifier's predict_proba * 100.
    score = int(max(0, min(100, cluster_info["cluster_success_rate"] + (startup["num_founders"] - 2) * 4)))

    return {
        "score": score,                        # FAKE for now
        "tier": tier_from_score(score),
        "factors": [                           # FAKE: impact of each feature on this score
            {"group": "team", "name": f"{startup['num_founders']} founder(s)", "impact": (startup["num_founders"] - 2) * 4},
            {"group": "market", "name": f"{startup['industry']} industry", "impact": 5},
            {"group": "ecosystem", "name": f"Region: {startup['region']}", "impact": -3},
        ],
        "what_if": [                           # FAKE: score after changing one feature
            {"change": "Add a co-founder", "new_score": min(100, score + 4)},
        ],
        **cluster_info,
    }


if __name__ == "__main__":
    print(predict({"num_founders": 2, "founded_year": 2018, "industry": "B2B", "region": "United States"}))
