"""
Nawat backend (FastAPI).

Run locally from the REPO ROOT:
    uvicorn app.backend.main:app --reload
Then open http://127.0.0.1:8000/docs
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Repo root (two levels up from app/backend/), so `models/` and `data/` can be imported and read.
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

load_dotenv(Path(__file__).parent / ".env")

from app.backend.routes import companies as companies_routes  # noqa: E402  (needs ROOT on the path first)
from app.backend.routes import insights as insights_routes  # noqa: E402
from app.backend.routes import predict as predict_routes  # noqa: E402
from app.backend.services.companies import load_companies  # noqa: E402

app = FastAPI(title="Nawat API", version="0.1.0")

# Who is allowed to call this API: the local React dev server, plus the Vercel site once it exists.
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_routes.router)
app.include_router(companies_routes.router)
app.include_router(insights_routes.router)


@app.on_event("startup")
def warm_up():
    """Score all companies once when the server starts, so the first page load is fast."""
    load_companies()


@app.get("/health")
def health():
    return {"status": "ok"}
