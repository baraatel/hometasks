import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    today: "Today", week: "Week", kiosk: "Tablet", manage: "Manage",
    done: "done", of: "of", allDone: "All done for today! 🎉", nothingToday: "Nothing scheduled today",
    completed: "Completed", daily: "Daily", weekly: "Weekly", once: "One-off",
    addTask: "Add task", editTask: "Edit task", save: "Save", cancel: "Cancel", delete: "Delete",
    titleEn: "Name (English)", titleAr: "Name (Arabic)", emoji: "Icon", repeat: "Repeats",
    days: "Days", date: "Date", time: "Time (optional)", preview: "Preview",
    enterPin: "Enter PIN to manage tasks", unlock: "Unlock", wrongPin: "Wrong PIN", lock: "Lock",
    exitKiosk: "Exit", everyDay: "Every day", tasksCount: "tasks",
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  ar: {
    today: "اليوم", week: "الأسبوع", kiosk: "اللوحي", manage: "الإدارة",
    done: "منجزة", of: "من", allDone: "تم إنجاز كل المهام اليوم! 🎉", nothingToday: "لا توجد مهام اليوم",
    completed: "المنجزة", daily: "يومي", weekly: "أسبوعي", once: "مرة واحدة",
    addTask: "إضافة مهمة", editTask: "تعديل المهمة", save: "حفظ", cancel: "إلغاء", delete: "حذف",
    titleEn: "الاسم (إنجليزي)", titleAr: "الاسم (عربي)", emoji: "الرمز", repeat: "التكرار",
    days: "الأيام", date: "التاريخ", time: "الوقت (اختياري)", preview: "معاينة",
    enterPin: "أدخل الرمز لإدارة المهام", unlock: "فتح", wrongPin: "رمز خاطئ", lock: "قفل",
    exitKiosk: "خروج", everyDay: "كل يوم", tasksCount: "مهام",
    dayNames: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  },
};

type Dict = typeof dict.en;
const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en", t: dict.en, setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("ht-lang");
    if (s === "ar" || s === "en") setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => { localStorage.setItem("ht-lang", l); setLangState(l); };
  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
