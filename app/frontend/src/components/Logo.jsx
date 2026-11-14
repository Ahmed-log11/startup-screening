import { Link } from "react-router";
import { useLang } from "../i18n";

export default function Logo() {
  const { t } = useLang();
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r="13" fill="none" stroke="#0E1116" strokeWidth="2" />
        <circle cx="15" cy="15" r="6" fill="#C6F432" stroke="#0E1116" strokeWidth="1.5" />
      </svg>
      <span className="font-display text-[21px] font-bold tracking-tight text-ink">{t.brand}</span>
    </Link>
  );
}
