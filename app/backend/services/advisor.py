"""
The advice agent. The model's numbers (score, factors, segment) are the only facts it gets;
Claude turns them into 3 clear tips. If Claude can't be reached (no key, no credit, timeout),
ready-made Python rules give the advice instead, so the app always works.
"""
import json
import os
from functools import lru_cache

MODEL = os.getenv("CLAUDE_MODEL") or "claude-haiku-5-5"  # empty in .env -> default

SYSTEM_PROMPT = """You advise startup founders inside an app called Nawah.
A machine learning model trained on Y Combinator startups (2005-2019) has already scored the startup.
You receive the model's output as JSON. Write exactly 3 short, practical tips based ONLY on that output
and the founder's description.

Rules:
- Use only the facts in the JSON. Never invent numbers, investors, programs, or market data.
- Each tip targets one group: "Team", "Market" or "Ecosystem". Focus on the factors that lowered the score.
- Advise only on things the founder can change. Don't tell them to change the year they started.
- If is_wildcard is true, one tip should say the profile is unusual, so the score is less certain.
- Never promise success. The score is one view from historical data, not a verdict.
- Plain, direct language. title: at most 8 words. detail: at most 35 words.
- Write in {language}.

Reply with ONLY a JSON array, no other text:
[{"tag": "Team|Market|Ecosystem", "title": "...", "detail": "..."}, ...]"""

LANGUAGES = {"en": "English", "ar": "Arabic (simple Modern Standard Arabic)"}


def _rules_advice(result: dict, language: str) -> list[dict]:
    """Fallback advice built from the model's factors, no AI needed."""
    ar = language == "ar"
    tips = []
    founders = result.get("num_founders", 2)

    if founders <= 1:
        tips.append({"tag": "Team",
                     "title": "أضف شريكاً مؤسساً" if ar else "Add a co-founder",
                     "detail": "الشركات بمؤسسَين أو أكثر حققت نتائج أفضل في البيانات." if ar
                     else "Startups with two or more founders did better in the data than solo founders."})
    else:
        tips.append({"tag": "Team",
                     "title": "وضّح أدوار الفريق" if ar else "Make team roles clear",
                     "detail": "فريقك المؤسس نقطة قوة. وضّح من يقود المنتج ومن يقود المبيعات." if ar
                     else "Your founding team is a strength. Make clear who owns product and who owns sales."})

    tips.append({"tag": "Market",
                 "title": "ركّز على مشكلة واضحة" if ar else "Lead with a clear problem",
                 "detail": f"في مجال {result.get('industry', '')}، اعرض المشكلة التي تحلها قبل المزايا." if ar
                 else f"In {result.get('industry', 'your industry')}, show the problem you solve before the features."})

    if result.get("is_wildcard"):
        tips.append({"tag": "Ecosystem",
                     "title": "ملفك غير مألوف" if ar else "Your profile is unusual",
                     "detail": "شركتك لا تشبه أي مجموعة سابقة، لذلك الدرجة أقل دقة. اطلب رأي خبير." if ar
                     else "Your startup doesn't match past groups, so the score is less certain. Get an expert's view."})
    else:
        tips.append({"tag": "Ecosystem",
                     "title": "تعلّم من شركات مشابهة" if ar else "Learn from similar startups",
                     "detail": f"ادرس شركات مثل {', '.join(result.get('similar', [])[:2])} من نفس مجموعتك." if ar
                     else f"Study startups like {', '.join(result.get('similar', [])[:2])} from your same segment."})
    return tips


@lru_cache(maxsize=256)
def _ai_advice(payload: str, language: str) -> tuple:
    """Calls Claude. Cached, so the same startup never costs twice."""
    import anthropic

    client = anthropic.Anthropic(timeout=20.0)
    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,  # room for the model's thinking + the answer
        system=SYSTEM_PROMPT.replace("{language}", LANGUAGES[language]),
        messages=[{"role": "user", "content": payload}],
    )
    # Newer models may send a "thinking" block before the answer: keep only the text blocks.
    text = "".join(block.text for block in response.content if block.type == "text").strip()
    start, end = text.find("["), text.rfind("]")
    tips = json.loads(text[start:end + 1])

    clean = []
    for tip in tips[:3]:
        if tip.get("tag") in ("Team", "Market", "Ecosystem") and tip.get("title") and tip.get("detail"):
            clean.append({"tag": tip["tag"], "title": str(tip["title"]), "detail": str(tip["detail"])})
    if len(clean) < 2:
        raise ValueError("Claude returned too few valid tips")
    return tuple(json.dumps(t, ensure_ascii=False) for t in clean)


def get_advice(result: dict, description: str | None, language: str = "en") -> dict:
    """Returns {"source": "ai" | "rules", "advice": [...]}."""
    if os.getenv("ANTHROPIC_API_KEY"):
        facts = {k: result.get(k) for k in (
            "score", "tier", "factors", "what_if", "cluster", "cluster_success_rate",
            "similar", "is_wildcard", "num_founders", "industry", "region", "year_capped")}
        facts["description"] = description or ""
        try:
            tips = _ai_advice(json.dumps(facts, ensure_ascii=False, sort_keys=True), language)
            return {"source": "ai", "advice": [json.loads(t) for t in tips]}
        except Exception as e:  # no credit, timeout, bad JSON... the app still works
            print(f"[advisor] falling back to rules: {type(e).__name__}: {e}")
    return {"source": "rules", "advice": _rules_advice(result, language)}
