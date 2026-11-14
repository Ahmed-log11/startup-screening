import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { INDUSTRIES, REGIONS, YEARS } from "../constants";
import { useLang } from "../i18n";
import { ArrowIcon, Field, H1, Page, Select, inputClass } from "../components/ui";

const FOUNDER_OPTIONS = [1, 2, 3, 4, 5];

export const LAST_STARTUP_KEY = "nawah:lastStartup";

export default function FounderForm() {
  const { t, tv } = useLang();
  const navigate = useNavigate();
  const saved = JSON.parse(sessionStorage.getItem(LAST_STARTUP_KEY) || "null");
  const [form, setForm] = useState(
    saved || { name: "", founded_year: YEARS[0], industry: "B2B", num_founders: 2, region: "Middle East", description: "" }
  );
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    const startup = { ...form, founded_year: Number(form.founded_year), num_founders: Number(form.num_founders) };
    sessionStorage.setItem(LAST_STARTUP_KEY, JSON.stringify(startup));
    navigate("/founder/result");
  };

  return (
    <Page>
      <div className="flex flex-wrap items-start gap-8 pt-4">
        <section aria-label={t.formTitle} className="flex min-w-0 flex-[999_1_560px] flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-muted">{t.step1}</span>
            <H1>{t.formTitle}</H1>
            <p className="text-body">{t.formText}</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-6 rounded-[20px] border border-line bg-white p-6 sm:p-7">
            <Field label={t.fName} htmlFor="sname" hint={t.optional}>
              <input id="sname" className={inputClass} placeholder={t.fNamePh} value={form.name} onChange={(e) => set("name")(e.target.value)} maxLength={100} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label={t.fYear} htmlFor="year">
                <Select id="year" value={form.founded_year} onChange={set("founded_year")} options={YEARS} />
              </Field>
              <Field label={t.fIndustry} htmlFor="industry">
                <Select id="industry" value={form.industry} onChange={set("industry")} options={INDUSTRIES} label={tv.industry} />
              </Field>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">{t.fFounders}</legend>
              <div className="flex flex-wrap gap-2">
                {FOUNDER_OPTIONS.map((n) => {
                  const active = Number(form.num_founders) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set("num_founders")(n)}
                      className={`min-h-12 min-w-16 rounded-xl border font-semibold ${active ? "border-ink bg-ink text-lime" : "border-field bg-white text-ink"}`}
                    >
                      <bdi>{n === 5 ? "5+" : n}</bdi>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field label={t.fRegion} htmlFor="region">
              <Select id="region" value={form.region} onChange={set("region")} options={REGIONS} label={tv.region} />
            </Field>

            <Field label={t.fDesc} htmlFor="desc" hint={t.fDescHint}>
              <textarea
                id="desc" rows={3} maxLength={1000} placeholder={t.fDescPh}
                value={form.description} onChange={(e) => set("description")(e.target.value)}
                className="resize-y rounded-xl border border-field bg-white px-3.5 py-3 text-ink outline-none focus:border-ink"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Link to="/" className="font-medium text-body">{t.back}</Link>
              <button type="submit" className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-ink px-6 font-semibold text-white">
                {t.getScore} <ArrowIcon className="text-lime" />
              </button>
            </div>
          </form>
        </section>

        <aside aria-label={t.asideTitle} className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-[20px] bg-ink p-6 text-white">
            <h2 className="font-display text-[22px] font-semibold">{t.asideTitle}</h2>
            {t.asideGroups.map((g) => (
              <div key={g.t} className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-lime" />
                <div className="flex flex-col">
                  <span className="font-semibold">{g.t}</span>
                  <span className="text-sm text-[#C9CCD3]">{g.d}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-white p-5">
            <span className="font-semibold">{t.whyNotTeam}</span>
            <span className="text-sm text-body">{t.whyNotTeamText}</span>
          </div>
        </aside>
      </div>
    </Page>
  );
}
