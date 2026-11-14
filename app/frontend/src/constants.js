// Must match the backend (app/backend/schemas.py).
export const INDUSTRIES = ["B2B", "Consumer", "Fintech", "Healthcare", "Education", "Industrials", "Real Estate", "Other"];
export const REGIONS = ["Middle East", "United States", "Europe", "Asia", "Latin America", "Africa", "Other"];

const THIS_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: THIS_YEAR - 2004 }, (_, i) => THIS_YEAR - i); // this year … 2005

export const TIER_STYLES = {
  "Strong signal": "bg-strong-bg text-strong",
  "Needs review": "bg-review-bg text-review",
  "Weak signal": "bg-weak-bg text-weak",
};
