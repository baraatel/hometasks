import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import hi from "@/locales/hi.json";
import fil from "@/locales/fil.json";
import ne from "@/locales/ne.json";
import si from "@/locales/si.json";
import ta from "@/locales/ta.json";
import ur from "@/locales/ur.json";
import bn from "@/locales/bn.json";

export const LANGS = [
  { code: "en", name: "English", english: "English", dir: "ltr", intl: "en-IN" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl", intl: "ar" },
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr", intl: "hi-IN" },
  { code: "fil", name: "Filipino", english: "Filipino", dir: "ltr", intl: "fil-PH" },
  { code: "ne", name: "नेपाली", english: "Nepali", dir: "ltr", intl: "ne-NP" },
  { code: "si", name: "සිංහල", english: "Sinhala", dir: "ltr", intl: "si-LK" },
  { code: "ta", name: "தமிழ்", english: "Tamil", dir: "ltr", intl: "ta-IN" },
  { code: "ur", name: "اردو", english: "Urdu", dir: "rtl", intl: "ur-PK" },
  { code: "bn", name: "বাংলা", english: "Bengali", dir: "ltr", intl: "bn-BD" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export const LANG_CODES = LANGS.map((l) => l.code) as Lang[];
export const isLang = (x: unknown): x is Lang => LANG_CODES.includes(x as Lang);
export const langMeta = (l: Lang) => LANGS.find((x) => x.code === l)!;

/** On-demand Google Font stylesheets for complex scripts (base Latin + Arabic load upfront). */
export const SCRIPT_FONT_URLS: Partial<Record<Lang, string>> = {
  hi: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap",
  ne: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap",
  bn: "https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&display=swap",
  ta: "https://fonts.googleapis.com/css2?family=Baloo+Thambi+2:wght@400;500;600;700;800&display=swap",
  si: "https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap",
  ur: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap",
};

type Bundle = typeof en;
export const BUNDLES: Record<Lang, Bundle> = { en, ar, hi, fil, ne, si, ta, ur, bn };

/** Flatten sections (nav, actions, …) into one lookup, falling back to English per key. */
export function flatDict(l: Lang) {
  const out = {} as Bundle["nav"] &
    Bundle["actions"] &
    Bundle["status"] &
    Bundle["schedule"] &
    Bundle["form"] &
    Bundle["categories"] &
    Bundle["errors"];
  for (const sec of Object.keys(en) as (keyof Bundle)[]) {
    Object.assign(out, en[sec], BUNDLES[l][sec] ?? {});
  }
  return out;
}

/** Pick a user-generated text for the viewer's language, falling back to the original. */
export function pickText(map: unknown, lang: Lang, base: string, fallback = "") {
  const m = (map && typeof map === "object" ? map : {}) as Record<string, string>;
  return m[lang]?.trim() || m[base]?.trim() || m["en"]?.trim() || Object.values(m).find((v) => v?.trim()) || fallback;
}
