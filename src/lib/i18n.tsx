import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { flatDict, isLang, langMeta, SCRIPT_FONT_URLS, type Lang } from "./locales";

export type { Lang };

type Dict = ReturnType<typeof flatDict>;
const Ctx = createContext<{ lang: Lang; dir: "ltr" | "rtl"; locale: string; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en",
  dir: "ltr",
  locale: "en-IN",
  t: flatDict("en"),
  setLang: () => {},
});

function readSavedLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const ls = localStorage.getItem("ht-lang");
    if (isLang(ls)) return ls;
  } catch {
    /* private mode */
  }
  const match = document.cookie.match(/(?:^|;\s*)ht-lang=([a-z]{2,3})(?:;|$)/);
  if (match?.[1] && isLang(match[1])) return match[1];
  return null;
}

function ensureScriptFont(lang: Lang) {
  const href = SCRIPT_FONT_URLS[lang];
  if (!href || typeof document === "undefined") return;
  const id = `ht-script-font-${href.slice(href.indexOf("family="), href.indexOf(":")).replace(/[^a-zA-Z0-9-]/g, "")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = readSavedLang();
    if (saved) setLangState(saved);
  }, []);

  useEffect(() => {
    const meta = langMeta(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    ensureScriptFont(lang);
  }, [lang]);

  const setLang = (l: Lang) => {
    try {
      localStorage.setItem("ht-lang", l);
    } catch {
      /* ignore */
    }
    document.cookie = `ht-lang=${l};path=/;max-age=31536000;samesite=lax`;
    setLangState(l);
  };

  const value = useMemo(() => {
    const meta = langMeta(lang);
    return { lang, dir: meta.dir, locale: meta.intl, t: flatDict(lang), setLang };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
