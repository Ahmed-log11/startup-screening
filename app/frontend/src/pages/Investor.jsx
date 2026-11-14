import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "../api/client";
import { INDUSTRIES, REGIONS, YEARS } from "../constants";
import { useLang } from "../i18n";
import { ErrorNote, H1, Loading, Page, Select, TierBadge, WildBadge, inputClass } from "../components/ui";

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { search: "", industry: "", region: "", tier: "", cluster: "", wildcards_only: false };
const td = "border-b border-[#EFEFEA] px-2 py-3.5";
const th = "border-b border-line px-2 py-2.5 text-start font-semibold";

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-[70px] overflow-hidden rounded-md bg-soft">
        <div className="h-2 rounded-md bg-ink" style={{ width: `${score}%` }} />
      </div>
      <span className="font-display font-semibold">{score}</span>
    </div>
  );
}

function FilterSelect({ id, label, value, onChange, options, all, optionLabel = (o) => o }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11 rounded-[10px] border border-field bg-white px-2.5 text-ink">
        <option value="">{all}</option>
        {options.map((o) => <option key={o} value={o}>{optionLabel(o)}</option>)}
      </select>
    </div>
  );
}

function TypeCell({ row }) {
  const { tv } = useLang();
  return row.is_wildcard ? <WildBadge /> : <span className="text-[13px] text-body">{tv.cluster(row.cluster)}</span>;
}

function UploadPanel({ onResults }) {
  const { t } = useLang();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      onResults(await api.predictBatch(file), file.name);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-[22px] bg-ink p-5 text-white">
      <h2 className="font-display text-[22px] font-semibold">{t.addCompanies}</h2>
      <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-muted p-5 text-center">
        <span className="font-semibold">{t.uploadTitle}</span>
        <span className="text-[13px] text-[#C9CCD3]">{t.uploadText}</span>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="sr-only" id="upload" onChange={(e) => upload(e.target.files[0])} />
        <label htmlFor="upload" className="mt-1 inline-flex min-h-10 cursor-pointer items-center rounded-[10px] bg-lime px-4 font-semibold text-ink">
          {loading ? t.uploading : t.chooseFile}
        </label>
        <a href={api.templateUrl} className="text-[13px] text-[#C9CCD3]">{t.template}</a>
      </div>
      {error && <p role="alert" className="rounded-xl bg-weak-bg px-3 py-2 text-sm text-weak">{error}</p>}
    </div>
  );
}

function AddOneForm() {
  const { t, tv } = useLang();
  const [form, setForm] = useState({ name: "", industry: "B2B", region: "Middle East", founded_year: YEARS[0], num_founders: 2 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setResult(await api.predict({ ...form, founded_year: Number(form.founded_year), num_founders: Number(form.num_founders) }));
    } catch (err) {
      setError(err.message);
    }
  };

  const fields = [
    ["as", t.sector, "industry", INDUSTRIES, tv.industry],
    ["ar", t.region, "region", REGIONS, tv.region],
    ["ay", t.founded, "founded_year", YEARS, undefined],
    ["af", t.foundersLabel, "num_founders", [1, 2, 3, 4, 5], undefined],
  ];

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5">
      <h2 className="font-display text-lg font-semibold">{t.scoreOne}</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="an" className="text-xs font-semibold text-muted">{t.name}</label>
        <input id="an" className={`${inputClass} min-h-11`} placeholder={t.fNamePh} value={form.name} onChange={(e) => set("name")(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {fields.map(([id, label, key, options, optionLabel]) => (
          <div key={id} className="flex min-w-0 flex-col gap-1">
            <label htmlFor={id} className="text-xs font-semibold text-muted">{label}</label>
            <Select id={id} value={form[key]} onChange={set(key)} options={options} label={optionLabel} />
          </div>
        ))}
      </div>
      <button type="submit" className="min-h-[46px] rounded-xl bg-ink font-semibold text-white">{t.scoreCompany}</button>
      {error && <p role="alert" className="text-sm text-weak">{error}</p>}
      {result && (
        <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{result.name || t.thisCompany}</span>
            <span className="font-display text-2xl font-semibold">{result.score}</span>
          </div>
          <div className="flex flex-wrap gap-2"><TierBadge tier={result.tier} />{result.is_wildcard && <WildBadge />}</div>
          <span className="text-[13px] text-body">{tv.cluster(result.cluster)} · {t.inGroup(result.cluster_success_rate)}</span>
        </div>
      )}
    </form>
  );
}

function BatchResults({ batch, fileName, onClear }) {
  const { t, tv } = useLang();
  return (
    <section className="flex flex-col gap-4 rounded-[22px] border-2 border-ink bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold">{t.uploadedTitle}</h2>
          <span className="text-sm text-muted">{t.uploadedInfo(fileName, batch.scored, batch.total_rows)}</span>
        </div>
        <button type="button" onClick={onClear} className="min-h-10 rounded-[10px] border border-field px-3.5 font-medium">{t.clear}</button>
      </div>
      {batch.errors.length > 0 && (
        <ErrorNote>
          {t.rowsSkipped(batch.errors.length)}{" "}
          {batch.errors.slice(0, 3).map((e) => `${t.row(e.row)}${e.name ? ` (${e.name})` : ""}: ${e.message}`).join(" · ")}
        </ErrorNote>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-xs text-muted">
              {[t.colCompany, t.sector, t.region, t.type, t.colScore, t.tier].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {batch.items.map((r, i) => (
              <tr key={i}>
                <td className={`${td} font-semibold`}>{r.name || t.row(i + 1)}</td>
                <td className={`${td} whitespace-nowrap`}>{tv.industry(r.industry)}</td>
                <td className={`${td} whitespace-nowrap`}>{tv.region(r.region)}</td>
                <td className={td}><TypeCell row={r} /></td>
                <td className={td}><ScoreBar score={r.score} /></td>
                <td className={td}><TierBadge tier={r.tier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Investor() {
  const { t, tv } = useLang();
  const [options, setOptions] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    api.filters().then(setOptions).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.companies({ ...filters, page, page_size: PAGE_SIZE }).then(setData).catch((e) => setError(e.message));
    }, 250); // small delay so typing in search doesn't send a request per letter
    return () => clearTimeout(timer);
  }, [filters, page]);

  const setFilter = (k) => (v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filtered = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <Page wide>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-1.5">
          <H1>{t.invTitle}</H1>
          <p className="text-body">{t.invText}</p>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}
        {batch && <BatchResults batch={batch.data} fileName={batch.fileName} onClear={() => setBatch(null)} />}

        <div className="flex flex-wrap items-start gap-6">
          <section aria-label={t.invTitle} className="flex min-w-0 flex-[999_1_640px] flex-col gap-4 rounded-[22px] border border-line bg-white p-5">
            <div role="search" className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
              <div className="col-span-2 flex flex-col gap-1">
                <label htmlFor="q" className="text-xs font-semibold text-muted">{t.search}</label>
                <input id="q" type="search" placeholder={t.searchPh} value={filters.search} onChange={(e) => setFilter("search")(e.target.value)}
                  className="min-h-11 rounded-[10px] border border-field bg-paper px-3 text-ink" />
              </div>
              <FilterSelect id="fs" label={t.sector} value={filters.industry} onChange={setFilter("industry")} options={options?.industries || []} all={t.allSectors} optionLabel={tv.industry} />
              <FilterSelect id="fr" label={t.region} value={filters.region} onChange={setFilter("region")} options={options?.regions || []} all={t.allRegions} optionLabel={tv.region} />
              <FilterSelect id="ft" label={t.tier} value={filters.tier} onChange={setFilter("tier")} options={options?.tiers || []} all={t.allTiers} optionLabel={tv.tier} />
              <FilterSelect id="fk" label={t.type} value={filters.cluster} onChange={setFilter("cluster")} options={options?.clusters || []} all={t.allTypes} optionLabel={tv.cluster} />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 self-start text-sm font-medium">
              <input type="checkbox" checked={filters.wildcards_only} onChange={(e) => setFilter("wildcards_only")(e.target.checked)} className="h-4 w-4 accent-[#5B21B6]" />
              {t.wildOnly}
            </label>

            {!data ? (
              <Loading label={t.loadingCompanies} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="text-xs text-muted">
                        {[t.colCompany, t.sector, t.region, t.colFounded, t.type, t.colScore, t.tier].map((h) => (
                          <th key={h} scope="col" className={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((c) => (
                        <tr key={c.id} className="hover:bg-paper">
                          <td className={td}>
                            <Link to={`/investor/${c.id}`} className="font-semibold text-ink no-underline hover:underline"><bdi>{c.name}</bdi></Link>
                            <div dir="ltr" className="line-clamp-1 max-w-[280px] text-start text-xs text-muted">{c.short_description}</div>
                          </td>
                          <td className={`${td} whitespace-nowrap`}>{tv.industry(c.industry)}</td>
                          <td className={`${td} whitespace-nowrap`}>{tv.region(c.region)}</td>
                          <td className={td}>{c.founded_year}</td>
                          <td className={td}><TypeCell row={c} /></td>
                          <td className={td}><ScoreBar score={c.score} /></td>
                          <td className={td}><TierBadge tier={c.tier} /></td>
                        </tr>
                      ))}
                      {data.items.length === 0 && (
                        <tr><td colSpan={7} className="px-2 py-10 text-center text-muted">{t.noMatch}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2.5 text-[13px] text-muted">
                  <span>{t.pageInfo(data.total, page, pages)}</span>
                  <span className="flex gap-2">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="min-h-9 rounded-lg border border-field bg-white px-3 text-ink disabled:opacity-40">{t.prev}</button>
                    <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="min-h-9 rounded-lg border border-field bg-white px-3 text-ink disabled:opacity-40">{t.next}</button>
                    {filtered && (
                      <button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }} className="min-h-9 rounded-lg px-3 text-ink underline">{t.clearFilters}</button>
                    )}
                  </span>
                </div>
              </>
            )}
          </section>

          <aside aria-label={t.addCompanies} className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
            <UploadPanel onResults={(result, fileName) => { setBatch({ data: result, fileName }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <AddOneForm />
          </aside>
        </div>
      </div>
    </Page>
  );
}
