"""
The shape of the data the API accepts. FastAPI checks every request against these
models and returns a clear error if a field is missing or has a wrong value.
"""
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Industry = Literal["B2B", "Consumer", "Fintech", "Healthcare", "Education", "Industrials", "Real Estate", "Other"]
Region = Literal["United States", "Europe", "Asia", "Latin America", "Africa", "Middle East", "Other"]

# Optional details the founder can add. They go to the AI advisor only, NOT to the model:
# the model was trained on the 4 features above, and these are not in the YC data.
ProductType = Literal["saas", "b2b", "consumer", "marketplace", "e-commerce", "ai", "machine-learning",
                      "developer-tools", "analytics", "fintech", "healthcare", "health-services",
                      "biotech", "education", "hardware"]
Stage = Literal["idea", "mvp", "launched", "revenue"]
Traction = Literal["none", "1-100", "100-1000", "1000+"]
Funding = Literal["none", "friends-family", "angel", "seed-plus"]

# The models were trained on companies founded 2005-2019 (old enough for their outcome to be known).
# Newer startups are scored as the most recent year the models know.
LATEST_TRAINED_YEAR = 2019


class StartupIn(BaseModel):
    num_founders: int = Field(ge=1, le=10, examples=[2])
    founded_year: int = Field(ge=2000, le=2030, examples=[2024])
    industry: Industry = Field(examples=["B2B"])
    region: Region = Field(examples=["Middle East"])
    name: Optional[str] = Field(default=None, max_length=100, examples=["Rawaj"])
    description: Optional[str] = Field(default=None, max_length=1000, examples=["Retail analytics for small shops"])
    # advice only (see above)
    product_types: List[ProductType] = Field(default_factory=list, max_length=3)
    stage: Optional[Stage] = None
    traction: Optional[Traction] = None
    funding: Optional[Funding] = None

    def founder_details(self) -> dict:
        """The optional, self-reported details, for the advisor. Empty ones are left out."""
        details = {"product_types": self.product_types, "stage": self.stage,
                   "users_or_customers": self.traction, "funding_raised": self.funding}
        return {k: v for k, v in details.items() if v}

    @property
    def year_capped(self) -> bool:
        return self.founded_year > LATEST_TRAINED_YEAR

    def features(self) -> dict:
        """Only the 4 columns the models were trained on, with the year capped at 2019."""
        return {
            "num_founders": self.num_founders,
            "founded_year": min(self.founded_year, LATEST_TRAINED_YEAR),
            "industry": self.industry,
            "region": self.region,
        }
