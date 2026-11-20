import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CalendarDays, ListChecks, Settings2, Globe, Check, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { LANGS, type Lang } from "@/lib/locales";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { resolvedTheme, toggleTheme } = useTheme();
  const items = [
    { to: "/", label: t.today, icon: ListChecks },
    { to: "/week", label: t.week, icon: CalendarDays },
    { to: "/manage", label: t.manage, icon: Settings2 },
  ] as const;
  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-5">
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
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t.lightMode : t.darkMode}
            title={isDark ? t.lightMode : t.darkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-foreground shadow-xs hover:bg-secondary transition cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-bold shadow-xs hover:bg-secondary transition cursor-pointer"
                aria-label={t.language}
              >
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{currentLang.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-y-auto p-1.5 z-50">
              {LANGS.map((l) => {
                const active = l.code === lang;
                return (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code as Lang)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition",
                      active ? "bg-primary/10 font-bold text-primary" : "hover:bg-secondary font-medium",
                    )}
                    dir={l.dir}
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">({l.english})</span>
                    </div>
                    {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
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
