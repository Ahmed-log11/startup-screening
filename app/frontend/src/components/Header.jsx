import { NavLink } from "react-router";
import Logo from "./Logo";
import { useLang } from "../i18n";

// The page you're on is underlined and dark; the others are grey (feedback from the mockup review).
const tab = ({ isActive }) =>
  [
    "mx-2.5 border-b-2 py-2.5 px-0.5 font-medium no-underline transition-colors",
    isActive ? "border-ink text-ink font-semibold" : "border-transparent text-muted hover:text-ink",
  ].join(" ");

export default function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Logo />
      <nav aria-label="Main" className="flex flex-wrap items-center gap-1.5">
        <NavLink to="/founder" className={tab}>{t.navFounders}</NavLink>
        <NavLink to="/investor" className={tab}>{t.navInvestors}</NavLink>
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          lang={lang === "ar" ? "en" : "ar"}
          className={`ms-2 min-h-10 rounded-[10px] border border-field bg-white px-3.5 text-ink ${lang === "ar" ? "font-sans" : "font-arabic"}`}
        >
          {t.switchLang}
        </button>
      </nav>
    </header>
  );
}
