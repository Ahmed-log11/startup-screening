import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import PlainTextResponse
from pydantic import ValidationError

from app.backend.schemas import LATEST_TRAINED_YEAR, StartupIn
from app.backend.services.upload_parsing import normalize_row, read_upload, rename_columns
from models.predict import predict

router = APIRouter(tags=["predict"])

CSV_COLUMNS = ["name", "num_founders", "founded_year", "industry", "region"]
MAX_ROWS = 500


@router.post("/predict")
def predict_one(startup: StartupIn):
    """Score one startup. Used by the founder screen and the investor's "add one company" form."""
    result = predict(startup.features())
    return {
        "name": startup.name,
        **result,
        # Lets the app show: "Scored as a recent startup: the model was trained on companies up to 2019."
        "year_capped": startup.year_capped,
        "scored_as_year": min(startup.founded_year, LATEST_TRAINED_YEAR),
    }


@router.get("/predict-batch/template", response_class=PlainTextResponse)
def csv_template():
    """A ready CSV the investor can download, fill in and upload."""
    return PlainTextResponse(
        "name,num_founders,founded_year,industry,region\n"
        "Rawaj,2,2024,B2B,Middle East\n"
        "Sahl Pay,3,2023,Fintech,Middle East\n",
        headers={"Content-Disposition": "attachment; filename=nawat_template.csv"},
    )


@router.post("/predict-batch")
async def predict_batch(file: UploadFile = File(...)):
    """Score every row of an uploaded CSV or Excel file. Bad rows are reported, good rows are still scored."""
    try:
        df = read_upload(file.filename, await file.read())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    df = rename_columns(df)
    missing = [c for c in CSV_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing)}. Use the template.")
    df = df.dropna(how="all")
    if len(df) > MAX_ROWS:
        raise HTTPException(status_code=400, detail=f"Too many rows: the limit is {MAX_ROWS}.")

    items, errors = [], []
    for i, row in enumerate(df[CSV_COLUMNS].to_dict(orient="records"), start=2):  # row 1 is the header
        row = normalize_row({k: (None if pd.isna(v) else v) for k, v in row.items()})
        try:
            startup = StartupIn(**row)
        except ValidationError as e:
            first = e.errors()[0]
            field = first["loc"][0] if first["loc"] else "row"
            errors.append({"row": i, "name": row.get("name"), "message": f"{field}: {first['msg']}"})
            continue
        items.append({
            "name": startup.name,
            "num_founders": startup.num_founders,
            "founded_year": startup.founded_year,
            "industry": startup.industry,
            "region": startup.region,
            **predict(startup.features()),
            "year_capped": startup.year_capped,
        })

    items.sort(key=lambda x: x["score"], reverse=True)
    return {"total_rows": len(df), "scored": len(items), "errors": errors, "items": items}
