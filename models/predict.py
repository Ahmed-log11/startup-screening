"""
The one function the app calls.

TEMPORARY VERSION: returns fake results so the app can be built now.
Owner: the supervised member replaces the body with the real models
(classifier.pkl + clustering.py). The RETURN SHAPE must stay exactly the same.
"""


def predict(startup: dict) -> dict:
    """
    startup: one company with the schema features, e.g.
        {"industry": "B2B", "region": "United States", "country": "United States",
         "founded_year": 2018, "batch_year": 2019, "num_founders": 1, "team_size": 4}
    """
    return {
        "score": 34,                        # 0 to 100 (probability of success x 100)
        "tier": "Weak signal",              # Strong signal (>=70) / Needs review (40-69) / Weak signal (<40)
        "cluster": "Early B2B teams",       # K-Means cluster name
        "cluster_success_rate": 55,         # % of successful startups in that cluster
        "is_wildcard": False,               # True if DBSCAN marks it as noise
        "factors": [                        # impact of each feature on this score
            {"group": "team", "name": "Single founder", "impact": -15},
            {"group": "team", "name": "Small team (4)", "impact": -6},
            {"group": "market", "name": "B2B industry", "impact": 5},
        ],
        "what_if": [                        # score after changing one feature
            {"change": "Add a co-founder", "new_score": 49},
        ],
        "similar": ["Company A", "Company B", "Company C"],  # successful startups in the same cluster
    }


if __name__ == "__main__":
    print(predict({"industry": "B2B", "num_founders": 1, "team_size": 4}))
