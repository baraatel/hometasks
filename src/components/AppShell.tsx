import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CalendarDays, ListChecks, Settings2, Tablet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const items = [
    { to: "/", label: t.today, icon: ListChecks },
    { to: "/week", label: t.week, icon: CalendarDays },
    { to: "/kiosk", label: t.kiosk, icon: Tablet },
    { to: "/manage", label: t.manage, icon: Settings2 },
  ] as const;
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-5">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-extrabold text-primary">HomeTasker</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden gap-1 md:flex">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                activeOptions={{ exact: true }}
                className="rounded-full px-4 py-2 font-semibold text-muted-foreground transition hover:bg-secondary"
                activeProps={{ className: "bg-primary !text-primary-foreground" }}
              >
                {i.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="rounded-full border bg-card px-3 py-1.5 text-sm font-bold"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold text-muted-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <i.icon className="h-6 w-6" />
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
