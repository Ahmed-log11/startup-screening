// English / Arabic. Every word on screen comes from here, so each page is fully one language.
// The backend always sends English values ("Strong signal", "B2B", ...); tv.* turns them into labels.
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "nawah:lang";

const arFounders = (n) => (n === 1 ? "مؤسس واحد" : n === 2 ? "مؤسسان" : `${n} مؤسسين`);
const enFounders = (n) => `${n} founder${n === 1 ? "" : "s"}`;

const DICT = {
  en: {
    brand: "Nawah",
    title: "Nawah — Startup screening, explained",
    navFounders: "For founders",
    navInvestors: "For investors",
    switchLang: "عربي",
    disclaimer: "One point of view from historical Y Combinator data, not investment advice.",
    loading: "Loading…",
    outOf100: "out of 100",
    wildCard: "Wild card",
    founders: enFounders,

    // Landing
    heroTitle: "See what really drives a startup.",
    heroText: "Nawah scores startups with machine learning and shows the factors behind every score. Founders check themselves. Investors screen many at once.",
    ctaFounder: "Check my startup",
    ctaInvestor: "Screen startups",
    sampleResult: "Sample result",
    sampleType: "Type:",
    sampleSuccess: (p) => `${p}% success in this group`,
    pathFounderTitle: "Check your startup before you pitch",
    pathFounderText: "A score out of 100, the factors behind it, what to change, and similar startups that made it.",
    pathInvestorTitle: "Screen many startups in minutes",
    pathInvestorText: "Filter by sector and type, see who stands out, and add your own list by CSV or Excel.",
    pathInvestorCta: "Open screening",
    modelsTitle: "Three models, one clear answer",
    models: [
      { n: "01 · Classifier", t: "Score", d: "Learns from startups that succeeded and failed, then gives a success score out of 100." },
      { n: "02 · K-Means", t: "Type", d: "Groups similar startups, so each one is compared with companies like it." },
      { n: "03 · DBSCAN", t: "Wild cards", d: "Flags unusual startups that fit no group, so a person reviews them." },
    ],

    // Founder form
    step1: "Step 1 of 2",
    formTitle: "Tell us about your startup",
    formText: "A few quick questions. Takes under a minute.",
    fName: "Startup name",
    optional: "(optional)",
    fYear: "Founded year",
    fIndustry: "Industry",
    fFounders: "Number of founders",
    fRegion: "Region",
    fDesc: "What does your startup do?",
    fDescHint: "(optional, helps the advice)",
    fNamePh: "Rawaj",
    fDescPh: "Retail analytics for small shops in Riyadh",
    back: "Back",
    getScore: "Get my score",
    asideTitle: "What the score looks at",
    asideGroups: [
      { t: "Team", d: "How many founders you have." },
      { t: "Market", d: "Your industry and how startups like you have done in it." },
      { t: "Ecosystem", d: "Your region and when you started." },
    ],
    whyNotTeam: "Why not team size?",
    whyNotTeamText: "Team size reflects how a company ended up, not its potential, so the model leaves it out.",
    moreTitle: "More about your startup",
    moreNote: "Optional · used for the advice only, not for the score",
    fProduct: "What best describes your product?",
    fProductHint: "(pick up to 3)",
    fStage: "Stage",
    fTraction: "Users or customers",
    fFunding: "Funding raised so far",
    productTypes: {
      saas: "Software subscription (SaaS)", b2b: "Sells to businesses", consumer: "Sells to consumers",
      marketplace: "Marketplace", "e-commerce": "Online store", ai: "AI", "machine-learning": "Machine learning",
      "developer-tools": "Tools for developers", analytics: "Data & analytics", fintech: "Payments & finance",
      healthcare: "Healthcare", "health-services": "Health services for people", biotech: "Biotech",
      education: "Education", hardware: "Hardware / physical product",
    },
    stages: { idea: "Idea", mvp: "First version (MVP)", launched: "Launched", revenue: "Making revenue" },
    tractions: { none: "None yet", "1-100": "1–100", "100-1000": "100–1,000", "1000+": "1,000+" },
    fundings: { none: "None", "friends-family": "Family & friends", angel: "Angel investor", "seed-plus": "Seed or more" },

    // Founder result
    step2: "Step 2 of 2",
    resultTitle: (name) => (name ? `${name}, here's your result` : "Here's your result"),
    editDetails: "Edit details",
    scoring: "Scoring your startup…",
    unusualTitle: "Your profile is unusual",
    unusualText: "It doesn't match any group of past startups, so the score is less certain. Unusual can mean risky, or it can mean a standout.",
    scoreExplain: "How startups with a profile like yours have done historically, out of 100.",
    tierScale: "81+ strong · 65–80 needs review · under 65 weak (top 30% / bottom 20% of past startups)",
    yearCapped: (y) => `Scored as a recent startup: the model learned from companies founded up to ${y}.`,
    yourType: "Your startup type",
    groupSucceeded: "of startups in this group succeeded",
    typeNote: (y) => `Newer startups are compared with the most recent companies in the data (founded up to ${y}).`,
    movedYours: "What moved your score",
    pointsNote: "Points added or removed",
    whatIfTitle: "What if you changed one thing?",
    whatIfNote: "Only things you can control",
    whatIfNone: "No single change raises your score: your profile is already close to its best for this model.",
    adviceTitle: (name) => (name ? `Advice for ${name}` : "Advice"),
    adviceAi: "Written by an AI advisor from your factors",
    adviceRules: "Based on your factors",
    writingAdvice: "Writing your advice…",
    adviceError: "Couldn't load advice right now. Try again in a moment.",
    similarTitle: "Startups like you that made it",
    similarNote: "Same type, from Y Combinator",

    // Investor
    invTitle: "Screen startups",
    invText: "Y Combinator companies, ranked by score. Filter, open any company, or add your own list.",
    search: "Search",
    searchPh: "Company name",
    sector: "Sector",
    region: "Region",
    tier: "Tier",
    type: "Type",
    allSectors: "All sectors",
    allRegions: "All regions",
    allTiers: "All tiers",
    allTypes: "All types",
    wildOnly: "Wild cards only",
    loadingCompanies: "Loading companies…",
    colCompany: "Company",
    colFounded: "Founded",
    colScore: "Score",
    noMatch: "No companies match these filters.",
    pageInfo: (total, page, pages) => `${total.toLocaleString()} companies · page ${page} of ${pages}`,
    prev: "Previous",
    next: "Next",
    clearFilters: "Clear filters",
    addCompanies: "Add companies",
    uploadTitle: "Upload a CSV or Excel file",
    uploadText: "Scores every row at once",
    chooseFile: "Choose file",
    uploading: "Scoring…",
    template: "Download the template",
    scoreOne: "Or score one company",
    name: "Name",
    founded: "Founded",
    foundersLabel: "Founders",
    scoreCompany: "Score company",
    thisCompany: "This company",
    inGroup: (p) => `${p}% success in this group`,
    uploadedTitle: "Your uploaded companies",
    uploadedInfo: (file, scored, total) => `${file} · ${scored} of ${total} rows scored`,
    clear: "Clear",
    rowsSkipped: (n) => `${n} row${n > 1 ? "s" : ""} skipped:`,
    row: (n) => `Row ${n}`,
    unnamedRow: (n) => `Unnamed (row ${n})`,
    uploadError: (e) => {
      const f = { num_founders: "founders", founded_year: "year", industry: "sector", region: "region" }[e.field] || e.field;
      if (e.kind === "missing") return `${f} is missing`;
      if (e.kind === "range") return `${f} must be between ${e.min} and ${e.max}`;
      if (e.kind === "number") return `${f} must be a number`;
      if (e.kind === "choice") return `unknown ${f} "${e.value}"`;
      return e.message;
    },

    // Company detail
    allCompanies: "All companies",
    foundedIn: (y) => `Founded ${y}`,
    yc: (b) => `YC ${b}`,
    wildTitle: "Wild card: review this one yourself",
    wildText: "Its profile doesn't match any group of past startups, so the score is less reliable. Unusual can mean risky, or it can mean a standout.",
    groupLine: (cluster, p) => `${cluster} · ${p}% of startups in this group succeeded.`,
    outcome: "Actual outcome:",
    movedIt: "What moved the score",
    similarDetail: "Similar companies that made it",
  },

  ar: {
    brand: "نواة",
    title: "نواة — فرز الشركات الناشئة بوضوح",
    navFounders: "للمؤسسين",
    navInvestors: "للمستثمرين",
    switchLang: "English",
    disclaimer: "وجهة نظر واحدة مبنية على بيانات تاريخية من Y Combinator، وليست نصيحة استثمارية.",
    loading: "جارٍ التحميل…",
    outOf100: "من 100",
    wildCard: "حالة استثنائية",
    founders: arFounders,

    heroTitle: "اكتشف ما يصنع نجاح الشركة الناشئة.",
    heroText: "نواة تقيّم الشركات الناشئة بتقنيات تعلّم الآلة وتوضّح العوامل وراء كل درجة. المؤسس يقيّم شركته، والمستثمر يفرز عدة شركات دفعة واحدة.",
    ctaFounder: "قيّم شركتي",
    ctaInvestor: "افرز الشركات",
    sampleResult: "نتيجة تجريبية",
    sampleType: "النوع:",
    sampleSuccess: (p) => `نسبة النجاح في هذه المجموعة ${p}%`,
    pathFounderTitle: "قيّم شركتك قبل أن تعرضها",
    pathFounderText: "درجة من 100، والعوامل وراءها، وما يمكنك تغييره، وشركات مشابهة نجحت.",
    pathInvestorTitle: "افرز عشرات الشركات في دقائق",
    pathInvestorText: "فلتر حسب القطاع والنوع، واعرف من يتميّز، وأضف قائمتك بملف CSV أو Excel.",
    pathInvestorCta: "افتح الفرز",
    modelsTitle: "ثلاثة نماذج، وإجابة واحدة واضحة",
    models: [
      { n: "01 · المصنّف", t: "الدرجة", d: "يتعلّم من شركات نجحت وأخرى فشلت، ثم يعطي درجة نجاح من 100." },
      { n: "02 · K-Means", t: "النوع", d: "يجمع الشركات المتشابهة، لتُقارن كل شركة بشركات تشبهها." },
      { n: "03 · DBSCAN", t: "الحالات الاستثنائية", d: "يكشف الشركات غير المألوفة التي لا تنتمي لأي مجموعة، ليراجعها شخص بنفسه." },
    ],

    step1: "الخطوة 1 من 2",
    formTitle: "أخبرنا عن شركتك",
    formText: "أسئلة قليلة وسريعة، أقل من دقيقة.",
    fName: "اسم الشركة",
    optional: "(اختياري)",
    fYear: "سنة التأسيس",
    fIndustry: "القطاع",
    fFounders: "عدد المؤسسين",
    fRegion: "المنطقة",
    fDesc: "ماذا تقدّم شركتك؟",
    fDescHint: "(اختياري، يحسّن النصائح)",
    fNamePh: "رواج",
    fDescPh: "تحليلات مبيعات للمحلات الصغيرة في الرياض",
    back: "رجوع",
    getScore: "اعرض درجتي",
    asideTitle: "على ماذا تعتمد الدرجة",
    asideGroups: [
      { t: "الفريق", d: "عدد المؤسسين." },
      { t: "السوق", d: "قطاعك وأداء الشركات المشابهة فيه." },
      { t: "البيئة", d: "منطقتك وسنة انطلاقك." },
    ],
    whyNotTeam: "لماذا لا نستخدم حجم الفريق؟",
    whyNotTeamText: "حجم الفريق يعكس ما وصلت إليه الشركة لاحقاً لا إمكاناتها، لذلك لا يستخدمه النموذج.",
    moreTitle: "تفاصيل أكثر عن شركتك",
    moreNote: "اختياري · تُستخدم للنصائح فقط، ولا تدخل في الدرجة",
    fProduct: "ما أقرب وصف لمنتجك؟",
    fProductHint: "(اختر حتى 3)",
    fStage: "المرحلة",
    fTraction: "المستخدمون أو العملاء",
    fFunding: "التمويل حتى الآن",
    productTypes: {
      saas: "برنامج باشتراك (SaaS)", b2b: "يبيع للشركات", consumer: "يبيع للأفراد",
      marketplace: "منصة تجمع البائع والمشتري", "e-commerce": "متجر إلكتروني", ai: "ذكاء اصطناعي",
      "machine-learning": "تعلّم الآلة", "developer-tools": "أدوات للمطورين", analytics: "بيانات وتحليلات",
      fintech: "مدفوعات ومالية", healthcare: "رعاية صحية", "health-services": "خدمات صحية للأفراد",
      biotech: "تقنية حيوية", education: "تعليم", hardware: "جهاز أو منتج مادي",
    },
    stages: { idea: "فكرة", mvp: "نسخة أولى (MVP)", launched: "أطلقنا", revenue: "عندنا إيرادات" },
    tractions: { none: "لا يوجد بعد", "1-100": "1–100", "100-1000": "100–1,000", "1000+": "1,000+" },
    fundings: { none: "لا يوجد", "friends-family": "العائلة والأصدقاء", angel: "مستثمر ملائكي", "seed-plus": "جولة Seed أو أكثر" },

    step2: "الخطوة 2 من 2",
    resultTitle: (name) => (name ? `${name}، هذه نتيجتك` : "هذه نتيجتك"),
    editDetails: "عدّل البيانات",
    scoring: "نقيّم شركتك…",
    unusualTitle: "ملف شركتك غير مألوف",
    unusualText: "لا يشبه أي مجموعة من الشركات السابقة، لذلك الدرجة أقل يقيناً. غير المألوف قد يعني مخاطرة، وقد يعني تميّزاً.",
    scoreExplain: "كيف كان أداء الشركات المشابهة لشركتك تاريخياً، من 100.",
    tierScale: "81+ قوي · 65–80 يحتاج مراجعة · أقل من 65 ضعيف (أعلى 30% وأقل 20% من الشركات السابقة)",
    yearCapped: (y) => `قُيّمت كشركة حديثة: تعلّم النموذج من شركات تأسست حتى ${y}.`,
    yourType: "نوع شركتك",
    groupSucceeded: "من شركات هذه المجموعة نجحت",
    typeNote: (y) => `الشركات الأحدث تُقارن بأحدث الشركات في البيانات (المؤسسة حتى ${y}).`,
    movedYours: "ما الذي أثّر في درجتك",
    pointsNote: "نقاط مضافة أو مخصومة",
    whatIfTitle: "ماذا لو غيّرت شيئاً واحداً؟",
    whatIfNote: "أشياء بيدك فقط",
    whatIfNone: "لا يوجد تغيير واحد يرفع درجتك: ملفك قريب من أفضل حالاته في هذا النموذج.",
    adviceTitle: (name) => (name ? `نصائح لـ ${name}` : "نصائح"),
    adviceAi: "كتبها مستشار ذكاء اصطناعي بناءً على عواملك",
    adviceRules: "مبنية على عواملك",
    writingAdvice: "نكتب نصائحك…",
    adviceError: "تعذّر تحميل النصائح الآن. حاول بعد لحظات.",
    similarTitle: "شركات تشبهك ونجحت",
    similarNote: "من نفس النوع، من Y Combinator",

    invTitle: "افرز الشركات",
    invText: "شركات Y Combinator مرتبة حسب الدرجة. استخدم الفلاتر، افتح أي شركة، أو أضف قائمتك.",
    search: "بحث",
    searchPh: "اسم الشركة",
    sector: "القطاع",
    region: "المنطقة",
    tier: "التصنيف",
    type: "النوع",
    allSectors: "كل القطاعات",
    allRegions: "كل المناطق",
    allTiers: "كل التصنيفات",
    allTypes: "كل الأنواع",
    wildOnly: "الحالات الاستثنائية فقط",
    loadingCompanies: "نحمّل الشركات…",
    colCompany: "الشركة",
    colFounded: "التأسيس",
    colScore: "الدرجة",
    noMatch: "لا توجد شركات تطابق هذه الفلاتر.",
    pageInfo: (total, page, pages) => `${total.toLocaleString()} شركة · صفحة ${page} من ${pages}`,
    prev: "السابق",
    next: "التالي",
    clearFilters: "امسح الفلاتر",
    addCompanies: "أضف شركات",
    uploadTitle: "ارفع ملف CSV أو Excel",
    uploadText: "يقيّم كل الصفوف دفعة واحدة",
    chooseFile: "اختر ملفاً",
    uploading: "نقيّم…",
    template: "حمّل النموذج",
    scoreOne: "أو قيّم شركة واحدة",
    name: "الاسم",
    founded: "التأسيس",
    foundersLabel: "المؤسسون",
    scoreCompany: "قيّم الشركة",
    thisCompany: "هذه الشركة",
    inGroup: (p) => `نسبة النجاح في هذه المجموعة ${p}%`,
    uploadedTitle: "الشركات التي رفعتها",
    uploadedInfo: (file, scored, total) => `${file} · قُيّم ${scored} من ${total} صفاً`,
    clear: "امسح",
    rowsSkipped: (n) => `تم تخطي ${n} ${n > 1 ? "صفوف" : "صف"}:`,
    row: (n) => `الصف ${n}`,
    unnamedRow: (n) => `بدون اسم (الصف ${n})`,
    uploadError: (e) => {
      const f = { num_founders: "عدد المؤسسين", founded_year: "سنة التأسيس", industry: "القطاع", region: "المنطقة" }[e.field] || e.field;
      if (e.kind === "missing") return `${f} فارغ`;
      if (e.kind === "range") return `${f} يجب أن يكون بين ${e.min} و${e.max}`;
      if (e.kind === "number") return `${f} يجب أن يكون رقماً`;
      if (e.kind === "choice") return `${f} غير معروف "${e.value}"`;
      return e.message;
    },

    allCompanies: "كل الشركات",
    foundedIn: (y) => `تأسست ${y}`,
    yc: (b) => `YC ${b}`,
    wildTitle: "حالة استثنائية: راجعها بنفسك",
    wildText: "ملفها لا يشبه أي مجموعة من الشركات السابقة، لذلك الدرجة أقل موثوقية. غير المألوف قد يعني مخاطرة، وقد يعني تميّزاً.",
    groupLine: (cluster, p) => `${cluster} · ${p}% من شركات هذه المجموعة نجحت.`,
    outcome: "النتيجة الفعلية:",
    movedIt: "ما الذي أثّر في الدرجة",
    similarDetail: "شركات مشابهة نجحت",
  },
};

// Labels for values that come from the backend. Unknown values are shown as they are.
const VALUES = {
  ar: {
    tier: { "Strong signal": "مؤشر قوي", "Needs review": "يحتاج مراجعة", "Weak signal": "مؤشر ضعيف" },
    industry: {
      B2B: "B2B", Consumer: "استهلاكي", Fintech: "التقنية المالية", Healthcare: "الرعاية الصحية",
      Education: "التعليم", Industrials: "الصناعة", "Real Estate": "العقار", Other: "أخرى",
    },
    region: {
      "Middle East": "الشرق الأوسط", "United States": "الولايات المتحدة", Europe: "أوروبا", Asia: "آسيا",
      "Latin America": "أمريكا اللاتينية", Africa: "أفريقيا", Other: "أخرى",
    },
    group: { team: "الفريق", market: "السوق", ecosystem: "البيئة", Team: "الفريق", Market: "السوق", Ecosystem: "البيئة" },
    status: { acquired: "استُحوذ عليها", public: "طُرحت في السوق", active: "نشطة", inactive: "متوقفة" },
    change: { "Add a co-founder": "أضف شريكاً مؤسساً", "Remove a co-founder": "قلّل عدد المؤسسين" },
  },
  en: {
    group: { team: "Team", market: "Market", ecosystem: "Ecosystem" },
  },
};

function clusterLabel(name, lang) {
  // Backend names look like "1–2 founders, founded 2013–2019" (from models/clusters.json).
  const m = /^(1–2|3\+) founders, founded (\d{4})–(\d{4})$/.exec(name || "");
  if (!m) return name;
  const [, who, from, to] = m;
  const recent = to === "2019"; // the newest era: today's startups are compared with it
  const whoEn = `${who} founders`;
  const whoAr = who === "3+" ? "ثلاثة مؤسسين فأكثر" : "مؤسس أو مؤسسان";
  if (lang === "en") return `${whoEn}, founded ${recent ? `${from} or later` : `${from}–${to}`}`;
  return `${whoAr}، ${recent ? `تأسست ${from} أو بعدها` : `تأسست ${from}–${to}`}`;
}

function factorLabel(factorName, lang, tv) {
  // Placeholder names from models/predict.py; the real model may use others, which pass through.
  let m;
  if ((m = /^(\d+) founder\(s\)$/.exec(factorName))) return lang === "ar" ? arFounders(+m[1]) : enFounders(+m[1]);
  if ((m = /^(.+) industry$/.exec(factorName))) return lang === "ar" ? `قطاع ${tv.industry(m[1])}` : `${m[1]} industry`;
  if ((m = /^Region: (.+)$/.exec(factorName))) return lang === "ar" ? `المنطقة: ${tv.region(m[1])}` : factorName;
  if ((m = /^Founded (\d{4})$/.exec(factorName))) return lang === "ar" ? `تأسست ${m[1]}` : factorName;
  return factorName;
}

function makeTv(lang) {
  const pick = (kind) => (v) => VALUES[lang]?.[kind]?.[v] ?? v;
  const tv = {
    tier: pick("tier"),
    industry: pick("industry"),
    region: pick("region"),
    group: pick("group"),
    status: pick("status"),
    change: (v) => {
      // "Shift focus to Fintech" comes from models/predict.py
      const m = /^Shift focus to (.+)$/.exec(v || "");
      if (m && lang === "ar") return `التركيز على قطاع ${VALUES.ar.industry[m[1]] || m[1]}`;
      return VALUES[lang]?.change?.[v] ?? v;
    },
    cluster: (v) => clusterLabel(v, lang),
  };
  tv.factor = (v) => factorLabel(v, lang, tv);
  return tv;
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = DICT[lang].title;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }, [lang]);

  const value = { lang, setLang, t: DICT[lang], tv: makeTv(lang) };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
