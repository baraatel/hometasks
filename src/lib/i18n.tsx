import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { flatDict, isLang, langMeta, type Lang } from "./locales";

export type { Lang };

type Dict = ReturnType<typeof flatDict>;
const Ctx = createContext<{ lang: Lang; locale: string; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en", locale: "en-IN", t: flatDict("en"), setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("ht-lang");
    if (isLang(s)) setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = langMeta(lang).dir;
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("ht-lang", l);
    document.cookie = `ht-lang=${l};path=/;max-age=31536000;samesite=lax`;
    setLangState(l);
  };
  const value = useMemo(() => ({ lang, locale: langMeta(lang).intl, t: flatDict(lang), setLang }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
