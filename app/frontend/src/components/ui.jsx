// Small building blocks shared by every page.
import { TIER_STYLES } from "../constants";
import { useLang } from "../i18n";

export function Page({ children, wide = false }) {
  return <main className={`mx-auto ${wide ? "max-w-[1280px]" : "max-w-[1200px]"} px-5 pb-20 pt-6 sm:px-8`}>{children}</main>;
}

export function Card({ children, className = "", dark = false }) {
  return (
    <section className={`rounded-[22px] p-6 sm:p-7 ${dark ? "bg-ink text-white" : "border border-line bg-white"} ${className}`}>
      {children}
    </section>
  );
}

export function H1({ children }) {
  return <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-[44px]">{children}</h1>;
}

export function H2({ children, className = "" }) {
  return <h2 className={`font-display text-2xl font-semibold tracking-tight ${className}`}>{children}</h2>;
}

export function TierBadge({ tier, large = false }) {
  const { tv } = useLang();
  return (
    <span className={`inline-block whitespace-nowrap rounded-full font-semibold ${large ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"} ${TIER_STYLES[tier] || ""}`}>
      {tv.tier(tier)}
    </span>
  );
}

export function WildBadge() {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-wild-bg px-2.5 py-0.5 text-xs font-semibold text-wild">
      <StarIcon size={12} /> {t.wildCard}
    </span>
  );
}

export function StarIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <path d="M6 1l1.4 3.1L11 4.5 8.3 6.8 9 10.5 6 8.6 3 10.5l.7-3.7L1 4.5l3.6-.4L6 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`rtl:-scale-x-100 ${className}`}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScoreRing({ score, size = 170 }) {
  const { t } = useLang();
  const circumference = 2 * Math.PI * 54;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 132 132" role="img" aria-label={`${score} ${t.outOf100}`}>
        <circle cx="66" cy="66" r="54" fill="none" stroke="#EEEEE8" strokeWidth="11" />
        <circle
          cx="66" cy="66" r="54" fill="none" stroke="#0E1116" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`} transform="rotate(-90 66 66)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold leading-none" style={{ fontSize: size * 0.32 }}>{score}</span>
        <span className="text-[13px] text-muted">{t.outOf100}</span>
      </div>
    </div>
  );
}

export function FactorList({ factors }) {
  const { tv } = useLang();
  const maxAbs = Math.max(1, ...factors.map((f) => Math.abs(f.impact)));
  return (
    <div className="flex flex-col gap-4">
      {factors.map((f, i) => {
        const positive = f.impact >= 0;
        return (
          <div key={i} className="grid grid-cols-[minmax(64px,auto)_minmax(0,1.3fr)_minmax(0,1fr)_40px] items-center gap-3">
            <span className="text-xs font-semibold uppercase text-muted">{tv.group(f.group)}</span>
            <span className="text-[15px]">{tv.factor(f.name)}</span>
            <div className="h-2.5 overflow-hidden rounded-md bg-soft">
              <div
                className={`h-2.5 rounded-md ${positive ? "bg-lime" : "bg-[#F4A3A3]"}`}
                style={{ width: `${(Math.abs(f.impact) / maxAbs) * 100}%` }}
              />
            </div>
            <span className={`text-end font-semibold ${positive ? "text-strong" : "text-weak"}`}>
              <bdi dir="ltr">{positive ? "+" : "−"}{Math.abs(f.impact)}</bdi>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label} {hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass = "min-h-12 rounded-xl border border-field bg-white px-3.5 text-ink outline-none focus:border-ink";

export function Select({ id, value, onChange, options, placeholder, label = (o) => o }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{label(o)}</option>
      ))}
    </select>
  );
}

export function ErrorNote({ children }) {
  return <p role="alert" className="rounded-xl bg-weak-bg px-4 py-3 text-sm text-weak">{children}</p>;
}

export function Loading({ label }) {
  const { t } = useLang();
  return <p className="animate-pulse py-10 text-center text-muted">{label || t.loading}</p>;
}

export function Disclaimer({ className = "text-[13px]" }) {
  const { t } = useLang();
  return <p className={`${className} text-muted`}>{t.disclaimer}</p>;
}
