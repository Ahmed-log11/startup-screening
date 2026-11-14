"""
Reads an uploaded CSV or Excel file and normalizes it, so investors can upload
their own spreadsheets without matching the template exactly.
"""
import io

import pandas as pd

ALLOWED_EXTENSIONS = (".csv", ".xlsx", ".xls")

# Accepted column names (lowercase, spaces/underscores/dashes ignored) -> our column.
COLUMN_ALIASES = {
    "name": ["name", "company", "companyname", "startup", "startupname"],
    "num_founders": ["numfounders", "founders", "numberoffounders", "founderscount", "foundercount", "cofounders"],
    "founded_year": ["foundedyear", "founded", "year", "yearfounded", "foundingyear", "founded_in"],
    "industry": ["industry", "sector", "category", "vertical"],
    "region": ["region", "location", "country", "market"],
}

INDUSTRIES = ["B2B", "Consumer", "Fintech", "Healthcare", "Education", "Industrials", "Real Estate", "Other"]
INDUSTRY_ALIASES = {
    "saas": "B2B", "enterprise": "B2B", "b2b software": "B2B",
    "b2c": "Consumer", "ecommerce": "Consumer", "e-commerce": "Consumer",
    "finance": "Fintech", "financial services": "Fintech", "payments": "Fintech",
    "health": "Healthcare", "healthtech": "Healthcare", "health tech": "Healthcare", "biotech": "Healthcare",
    "edtech": "Education", "ed tech": "Education",
    "proptech": "Real Estate", "real-estate": "Real Estate",
    "industrial": "Industrials", "manufacturing": "Industrials", "logistics": "Industrials",
}

REGIONS = ["United States", "Europe", "Asia", "Latin America", "Africa", "Middle East", "Other"]
REGION_ALIASES = {
    "us": "United States", "usa": "United States", "united states of america": "United States", "america": "United States",
    "saudi arabia": "Middle East", "ksa": "Middle East", "saudi": "Middle East", "uae": "Middle East",
    "united arab emirates": "Middle East", "qatar": "Middle East", "kuwait": "Middle East", "bahrain": "Middle East",
    "oman": "Middle East", "jordan": "Middle East", "egypt": "Middle East", "mena": "Middle East", "gcc": "Middle East",
    "uk": "Europe", "united kingdom": "Europe", "germany": "Europe", "france": "Europe", "spain": "Europe",
    "india": "Asia", "china": "Asia", "japan": "Asia", "singapore": "Asia", "indonesia": "Asia",
    "brazil": "Latin America", "mexico": "Latin America", "latam": "Latin America",
    "nigeria": "Africa", "kenya": "Africa", "south africa": "Africa",
}


def _key(text: str) -> str:
    return "".join(ch for ch in str(text).lower() if ch.isalnum())


def read_upload(filename: str, content: bytes) -> pd.DataFrame:
    """CSV or Excel bytes -> DataFrame. Raises ValueError with a readable message."""
    name = filename.lower()
    if not name.endswith(ALLOWED_EXTENSIONS):
        raise ValueError("Upload a .csv or .xlsx file.")
    try:
        if name.endswith(".csv"):
            return pd.read_csv(io.BytesIO(content))
        return pd.read_excel(io.BytesIO(content))
    except Exception:
        raise ValueError("Couldn't read the file. Check that it's a valid CSV or Excel file.")


def rename_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map the user's column names to ours, e.g. 'Number of founders' -> num_founders."""
    lookup = {_key(alias): target for target, aliases in COLUMN_ALIASES.items() for alias in aliases}
    renamed = {}
    for col in df.columns:
        target = lookup.get(_key(col))
        if target and target not in renamed.values():
            renamed[col] = target
    return df.rename(columns=renamed)


def normalize_choice(value, choices, aliases):
    """'b2b' -> 'B2B', 'Saudi Arabia' -> 'Middle East'. Unknown values are returned unchanged
    so validation can report them clearly."""
    if value is None:
        return None
    text = str(value).strip()
    for choice in choices:
        if text.lower() == choice.lower():
            return choice
    return aliases.get(text.lower(), text)


def normalize_row(row: dict) -> dict:
    row = dict(row)
    row["industry"] = normalize_choice(row.get("industry"), INDUSTRIES, INDUSTRY_ALIASES)
    row["region"] = normalize_choice(row.get("region"), REGIONS, REGION_ALIASES)
    return row
