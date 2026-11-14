import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../api/client";
import { useLang } from "../i18n";
import { Card, Disclaimer, ErrorNote, FactorList, H1, H2, Loading, Page, ScoreRing, StarIcon, TierBadge } from "../components/ui";

const OUTCOME_STYLES = {
  acquired: "bg-strong-bg text-strong",
  public: "bg-strong-bg text-strong",
  active: "bg-strong-bg text-strong",
  inactive: "bg-weak-bg text-weak",
};

export default function CompanyDetail() {
  const { t, tv } = useLang();
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setC(null);
    api.company(id).then(setC).catch((e) => setError(e.message));
  }, [id]);

  return (
    <Page>
      <div className="flex flex-col gap-5 pt-2">
        <Link to="/investor" className="inline-flex items-center gap-2 self-start font-medium text-body no-underline">
          <span className="inline-block rtl:-scale-x-100">←</span> {t.allCompanies}
        </Link>

        {error && <ErrorNote>{error}</ErrorNote>}
        {!c && !error && <Loading />}

        {c && (
          <>
            <div className="flex flex-col gap-2.5">
              <H1><bdi>{c.name}</bdi></H1>
              {/* Company descriptions are only in English, so they stay left-to-right. */}
              {c.short_description && <p dir="ltr" className="text-start text-body">{c.short_description}</p>}
              <div className="flex flex-wrap gap-2">
                {[
                  tv.industry(c.industry),
                  c.country && c.country !== "Unknown" ? c.country : tv.region(c.region),
                  t.foundedIn(c.founded_year),
                  t.founders(c.num_founders),
                  c.batch && t.yc(c.batch),
                ].filter(Boolean).map((chip) => (
                  <span key={chip} className="rounded-full border border-line bg-white px-3 py-1 text-[13px]">{chip}</span>
                ))}
              </div>
            </div>

            {c.is_wildcard && (
              <div role="note" className="flex items-start gap-3.5 rounded-2xl bg-wild-bg px-5 py-4 text-[#3B1A7A]">
                <StarIcon size={22} className="mt-0.5 shrink-0 text-wild" />
                <div>
                  <strong>{t.wildTitle}</strong>
                  <p className="text-sm">{t.wildText}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="flex flex-wrap items-center gap-7">
                <ScoreRing score={c.score} size={160} />
                <div className="flex min-w-[180px] flex-1 flex-col items-start gap-2.5">
                  <TierBadge tier={c.tier} large />
                  <p className="text-body">{t.groupLine(tv.cluster(c.cluster), c.cluster_success_rate)}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">{t.outcome}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${OUTCOME_STYLES[c.status] || "bg-soft text-body"}`}>{tv.status(c.status)}</span>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col gap-4">
                <H2>{t.movedIt}</H2>
                <FactorList factors={c.factors} />
              </Card>
            </div>

            {c.similar?.length > 0 && (
              <Card className="flex flex-col gap-3.5">
                <H2>{t.similarDetail}</H2>
                <div className="flex flex-wrap gap-2.5">
                  {c.similar.map((name) => (
                    <span key={name} className="rounded-xl bg-paper px-3.5 py-2 font-semibold"><bdi>{name}</bdi></span>
                  ))}
                </div>
              </Card>
            )}

            <Disclaimer />
          </>
        )}
      </div>
    </Page>
  );
}
