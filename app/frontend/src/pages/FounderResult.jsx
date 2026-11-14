import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { api } from "../api/client";
import { useLang } from "../i18n";
import { LAST_STARTUP_KEY } from "./FounderForm";
import {
  ArrowIcon, Card, Disclaimer, ErrorNote, FactorList, H1, H2, Loading, Page, ScoreRing, StarIcon, TierBadge,
} from "../components/ui";

export default function FounderResult() {
  const { lang, t, tv } = useLang();
  const startup = JSON.parse(sessionStorage.getItem(LAST_STARTUP_KEY) || "null");
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState("");
  const [adviceError, setAdviceError] = useState(false);

  useEffect(() => {
    if (!startup) return;
    api.predict(startup).then(setResult).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The advice is written in the page's language, so it reloads when the language changes.
  // It's slower than the score (a few seconds), so it loads on its own.
  useEffect(() => {
    if (!startup) return;
    setAdvice(null);
    setAdviceError(false);
    api.insights(startup, lang).then(setAdvice).catch(() => setAdviceError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  if (!startup) return <Navigate to="/founder" replace />;

  return (
    <Page>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">
              {t.step2} · {tv.industry(startup.industry)} · {tv.region(startup.region)} · {t.founders(startup.num_founders)} · {startup.founded_year}
            </span>
            <H1>{t.resultTitle(startup.name)}</H1>
          </div>
          <Link to="/founder" className="inline-flex min-h-[46px] items-center rounded-xl border border-field bg-white px-4 font-medium no-underline">
            {t.editDetails}
          </Link>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}
        {!result && !error && <Loading label={t.scoring} />}

        {result && (
          <>
            {result.is_wildcard && (
              <div role="note" className="flex items-start gap-3.5 rounded-2xl bg-wild-bg px-5 py-4 text-[#3B1A7A]">
                <StarIcon size={22} className="mt-0.5 shrink-0 text-wild" />
                <div>
                  <strong>{t.unusualTitle}</strong>
                  <p className="text-sm">{t.unusualText}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="flex flex-wrap items-center gap-7">
                <ScoreRing score={result.score} />
                <div className="flex min-w-[180px] flex-1 flex-col items-start gap-2.5">
                  <TierBadge tier={result.tier} large />
                  <p className="text-body">{t.scoreExplain}</p>
                  <span className="text-[13px] text-muted">{t.tierScale}</span>
                  {result.year_capped && <span className="text-[13px] text-muted">{t.yearCapped(result.scored_as_year)}</span>}
                </div>
              </Card>

              <Card dark className="flex flex-col gap-3.5">
                <span className="text-sm text-[#C9CCD3]">{t.yourType}</span>
                <span className="font-display text-[28px] font-semibold tracking-tight">{tv.cluster(result.cluster)}</span>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="font-display text-[40px] font-semibold text-lime"><bdi>{result.cluster_success_rate}%</bdi></span>
                  <span className="text-[#C9CCD3]">{t.groupSucceeded}</span>
                </div>
                {result.year_capped && <span className="text-[13px] text-[#9DA1AB]">{t.typeNote(result.scored_as_year)}</span>}
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="flex flex-col gap-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <H2>{t.movedYours}</H2>
                  <span className="text-[13px] text-muted">{t.pointsNote}</span>
                </div>
                <FactorList factors={result.factors} />
              </Card>

              <Card className="flex flex-col gap-4">
                <div>
                  <H2>{t.whatIfTitle}</H2>
                  <span className="text-sm text-muted">{t.whatIfNote}</span>
                </div>
                {result.what_if.map((w) => (
                  <div key={w.change} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3.5">
                    <span className="font-medium">{tv.change(w.change)}</span>
                    <span className="flex items-center gap-2.5 font-display font-semibold">
                      <span className="text-muted">{result.score}</span>
                      <ArrowIcon />
                      <span className="rounded-lg bg-lime px-2.5 py-0.5">{w.new_score}</span>
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-lime">
                <StarIcon size={18} />
              </span>
              <H2>{t.adviceTitle(startup.name)}</H2>
            </div>
            {advice && <span className="text-[13px] text-muted">{advice.source === "ai" ? t.adviceAi : t.adviceRules}</span>}
          </div>
          {!advice && !adviceError && <Loading label={t.writingAdvice} />}
          {adviceError && <ErrorNote>{t.adviceError}</ErrorNote>}
          {advice && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
              {advice.advice.map((a, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-2xl border border-line p-4">
                  <span className="self-start rounded-md bg-paper px-2 py-0.5 text-xs font-semibold text-body">{tv.group(a.tag)}</span>
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-sm text-body">{a.detail}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {result?.similar?.length > 0 && (
          <section className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <H2>{t.similarTitle}</H2>
              <span className="text-[13px] text-muted">{t.similarNote}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
              {result.similar.map((name) => (
                <div key={name} className="rounded-2xl border border-line bg-white p-4 font-semibold"><bdi>{name}</bdi></div>
              ))}
            </div>
          </section>
        )}

        <Disclaimer />
      </div>
    </Page>
  );
}
