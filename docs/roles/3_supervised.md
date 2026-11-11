# Your role: Supervised classification

## The project in short
An app that scores startups. **Your model is the core of the project:** it learns from startups that succeeded and startups that failed, gives any new startup a **success score out of 100**, and shows which factors raised or lowered that score.

## The data
- File: `data/processed/yc_clean.csv` from the cleaning member (columns in `docs/schema.md`).
- **Target (y):** `label` (1 = success, 0 = failure)
- **Features:** `num_founders, team_size, founded_year, industry, region`
- **Never use** `status`, `name` or `jobs`. They give the answer away (leakage).

## What to do
1. **Split** the data: 80% train, 20% test, with `stratify=y`.
2. **Build a Pipeline:** one-hot for text columns + `StandardScaler` for numbers, inside one `Pipeline` so it saves as a single file.
3. **Compare 3 models:** Logistic Regression, KNN and Random Forest, with `class_weight="balanced"` (KNN doesn't support it, so balance the data for KNN instead).
4. **Evaluate with F1, ROC-AUC and a confusion matrix**, not accuracy, because the data is imbalanced. Pick the best model.
5. **The score:**
   - `score = model.predict_proba(X)[0][1] * 100`
   - Calibrate the probabilities with `CalibratedClassifierCV`.
   - Tiers: 70+ = Strong signal · 40–69 = Needs review · below 40 = Weak signal
6. **Explanation (factors):** for each startup, how much each feature moved its score. Use Logistic Regression coefficients, or SHAP if you pick Random Forest. Group the factors: **team** (founders, team size) · **market** (industry) · **ecosystem** (region, year).
7. **What-if:** change one feature (e.g. one more founder, a bigger team) and show the new score.

## What to deliver
1. **`notebooks/03_classification.ipynb`**: the comparison, results and most important factors.
2. **`models/classifier.pkl`**: the whole trained Pipeline.
3. **`models/predict.py`**: it currently holds a fake version. **Replace its body with the real models** (your classifier + `assign_cluster` from the unsupervised member), and **keep the return format exactly the same**, because the app is built on it.

## Rules
- Work on a branch called `supervised` and merge through a pull request.
- You can start before the cleaning is finished: use a first version of the file and switch to the final one when it arrives.
- If you use AI: send it this whole file + `docs/schema.md` + `models/predict.py` + the first 10 rows of the data.
