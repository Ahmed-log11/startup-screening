from typing import Literal

from fastapi import APIRouter

from app.backend.schemas import StartupIn
from app.backend.services.advisor import get_advice
from models.predict import predict

router = APIRouter(tags=["insights"])


class InsightsIn(StartupIn):
    language: Literal["en", "ar"] = "en"


@router.post("/insights")
def insights(body: InsightsIn):
    """Advice for the founder screen. Scores the startup, then turns the result into 3 tips."""
    result = {
        **predict(body.features()),
        "num_founders": body.num_founders,
        "industry": body.industry,
        "region": body.region,
        "year_capped": body.year_capped,
    }
    return get_advice(result, body.description, body.language)
