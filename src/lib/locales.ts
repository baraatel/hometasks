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
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr", intl: "hi" },
  { code: "fil", name: "Filipino", english: "Filipino", dir: "ltr", intl: "fil" },
  { code: "ne", name: "नेपाली", english: "Nepali", dir: "ltr", intl: "ne" },
  { code: "si", name: "සිංහල", english: "Sinhala", dir: "ltr", intl: "si" },
  { code: "ta", name: "தமிழ்", english: "Tamil", dir: "ltr", intl: "ta" },
  { code: "ur", name: "اردو", english: "Urdu", dir: "rtl", intl: "ur" },
  { code: "bn", name: "বাংলা", english: "Bengali", dir: "ltr", intl: "bn" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export const LANG_CODES = LANGS.map((l) => l.code) as Lang[];
export const isLang = (x: unknown): x is Lang => LANG_CODES.includes(x as Lang);
export const langMeta = (l: Lang) => LANGS.find((x) => x.code === l)!;

type Bundle = typeof en;
const bundles: Record<Lang, Bundle> = { en, ar, hi, fil, ne, si, ta, ur, bn };

/** Flatten sections (nav, actions, …) into one lookup, falling back to English per key. */
export function flatDict(l: Lang) {
  const out = {} as Bundle["nav"] & Bundle["actions"] & Bundle["status"] & Bundle["schedule"] & Bundle["form"] & Bundle["errors"];
  for (const sec of Object.keys(en) as (keyof Bundle)[]) {
    Object.assign(out, en[sec], (bundles[l] as Bundle)[sec] ?? {});
  }
  return out;
}

/** Pick a user-generated text for the viewer's language, falling back to the original. */
export function pickText(map: unknown, lang: Lang, base: string, fallback = "") {
  const m = (map && typeof map === "object" ? map : {}) as Record<string, string>;
  return m[lang]?.trim() || m[base]?.trim() || m["en"]?.trim() || Object.values(m).find((v) => v?.trim()) || fallback;
}
