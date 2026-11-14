import { Link } from "react-router";
import { useLang } from "../i18n";
import { ArrowIcon, Disclaimer, FactorList, Page, ScoreRing, TierBadge } from "../components/ui";

// Same shape the backend returns, so the sample is translated like real results.
const SAMPLE_FACTORS = [
  { group: "team", name: "2 founder(s)", impact: 9 },
  { group: "market", name: "B2B industry", impact: 6 },
  { group: "ecosystem", name: "Region: Other", impact: -4 },
];

export default function Landing() {
  const { t, tv } = useLang();
  return (
    <Page>
      <div className="flex flex-col gap-20 pt-6">
        <section className="flex flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
            <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight sm:text-[64px]">{t.heroTitle}</h1>
            <p className="max-w-[520px] text-lg text-body sm:text-[19px]">{t.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/founder" className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-ink px-6 font-semibold text-white no-underline">
                {t.ctaFounder} <ArrowIcon className="text-lime" />
              </Link>
              <Link to="/investor" className="inline-flex min-h-[52px] items-center rounded-xl border border-ink px-6 font-semibold text-ink no-underline">
                {t.ctaInvestor}
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5 rounded-3xl border border-line bg-white p-7">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted">{t.sampleResult}</span>
              <TierBadge tier="Strong signal" large />
            </div>
            <div className="flex items-center gap-6">
              <ScoreRing score={74} size={132} />
              <div className="min-w-0 flex-1 text-sm">
                <FactorList factors={SAMPLE_FACTORS} />
              </div>
            </div>
            <p className="rounded-xl bg-paper px-3.5 py-3 text-sm text-body">
              {t.sampleType} <strong className="text-ink">{tv.cluster("Two founders, founded 2013–2019")}</strong> · {t.sampleSuccess(78)}
            </p>
          </div>
        </section>

        <section aria-label={t.ctaFounder} className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          <Link to="/founder" className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-7 no-underline">
            <span className="text-[13px] font-semibold text-muted">{t.navFounders}</span>
            <span className="font-display text-[28px] font-semibold tracking-tight text-ink">{t.pathFounderTitle}</span>
            <span className="text-body">{t.pathFounderText}</span>
            <span className="mt-1 inline-flex items-center gap-2 font-semibold text-ink">{t.ctaFounder} <ArrowIcon /></span>
          </Link>
          <Link to="/investor" className="flex flex-col gap-3 rounded-[20px] bg-ink p-7 text-white no-underline">
            <span className="text-[13px] font-semibold text-lime">{t.navInvestors}</span>
            <span className="font-display text-[28px] font-semibold tracking-tight">{t.pathInvestorTitle}</span>
            <span className="text-[#C9CCD3]">{t.pathInvestorText}</span>
            <span className="mt-1 inline-flex items-center gap-2 font-semibold">{t.pathInvestorCta} <ArrowIcon className="text-lime" /></span>
          </Link>
        </section>

        <section aria-label={t.modelsTitle} className="flex flex-col gap-6">
          <h2 className="font-display text-4xl font-semibold tracking-tight">{t.modelsTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {t.models.map((m) => (
              <div key={m.n} className="flex flex-col gap-2 border-t-2 border-ink pt-4">
                <span className="font-display text-sm text-muted">{m.n}</span>
                <span className="font-display text-[22px] font-semibold">{m.t}</span>
                <span className="text-body">{m.d}</span>
              </div>
            ))}
          </div>
          <Disclaimer className="text-sm" />
        </section>
      </div>
    </Page>
  );
}
