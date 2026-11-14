from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.backend.services.companies import LIST_COLUMNS, load_companies
from models.predict import predict

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/filters")
def filter_options():
    """Values for the investor screen's dropdowns."""
    df = load_companies()
    return {
        "industries": sorted(df["industry"].unique().tolist()),
        "regions": sorted(df["region"].unique().tolist()),
        "tiers": ["Strong signal", "Needs review", "Weak signal"],
        "clusters": sorted(df["cluster"].unique().tolist()),
    }


@router.get("")
def list_companies(
    search: Optional[str] = None,
    industry: Optional[str] = None,
    region: Optional[str] = None,
    tier: Optional[str] = None,
    cluster: Optional[str] = None,
    wildcards_only: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Ranked list of companies, highest score first, with filters and pages."""
    df = load_companies()
    if search:
        df = df[df["name"].str.contains(search, case=False, na=False)]
    if industry:
        df = df[df["industry"] == industry]
    if region:
        df = df[df["region"] == region]
    if tier:
        df = df[df["tier"] == tier]
    if cluster:
        df = df[df["cluster"] == cluster]
    if wildcards_only:
        df = df[df["is_wildcard"]]

    start = (page - 1) * page_size
    items = df.iloc[start:start + page_size][LIST_COLUMNS].to_dict(orient="records")
    return {"total": len(df), "page": page, "page_size": page_size, "items": items}


@router.get("/{company_id}")
def company_detail(company_id: int):
    """One company: its info plus the full result (score, factors, cluster, similar companies)."""
    df = load_companies()
    match = df[df["id"] == company_id]
    if match.empty:
        raise HTTPException(status_code=404, detail="Company not found")
    company = match.iloc[0]

    features = {
        "num_founders": int(company["num_founders"]),
        "founded_year": int(company["founded_year"]),
        "industry": company["industry"],
        "region": company["region"],
    }
    return {
        "id": int(company["id"]),
        "name": company["name"],
        "short_description": company["short_description"],
        "country": company["country"],
        "batch": company["batch"],
        "status": company["status"],   # the real outcome, so investors can compare it with the score
        **features,
        **predict(features),
    }
