import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Maximize, X } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useHousehold, useToday } from "@/lib/tasks";
import { isDueOn } from "@/lib/schedule";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/kiosk")({
  head: () => ({
    meta: [
      { title: "Tablet mode — HomeTasker" },
      { name: "description", content: "Big, high-contrast chore board for a wall-mounted tablet." },
      { property: "og:title", content: "Tablet mode — HomeTasker" },
      { property: "og:description", content: "Big, high-contrast chore board for a wall-mounted tablet." },
    ],
  }),
  component: Kiosk,
});

function Kiosk() {
  const now = useToday();
  const { t, lang, setLang } = useI18n();
  const { tasks, logs, toggle } = useHousehold(now);
  const due = tasks.filter((x) => isDueOn(x, now));
  const sorted = [...due].sort((a, b) => Number(!!logs[a.id]) - Number(!!logs[b.id]));
  const doneCount = due.filter((x) => logs[x.id]).length;

  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try {
        lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } })
          .wakeLock?.request("screen") ?? null;
      } catch { /* not supported */ }
    };
    req();
    const onVis = () => document.visibilityState === "visible" && req();
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); lock?.release(); };
  }, []);

  const loc = lang === "ar" ? "ar" : "en";
  return (
    <div className="min-h-screen bg-kiosk p-5 text-kiosk-foreground md:p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-6xl font-extrabold tabular-nums md:text-7xl">
            {now.toLocaleTimeString(loc, { hour: "numeric", minute: "2-digit" })}
          </div>
          <div className="text-xl font-semibold opacity-80">
            {now.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <div className="text-end">
          <div className="text-5xl font-extrabold">{doneCount}/{due.length}</div>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-full bg-kiosk-card px-4 py-2 font-bold">
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <button onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-full bg-kiosk-card p-2.5" aria-label="Fullscreen">
              <Maximize className="h-6 w-6" />
            </button>
            <Link to="/" className="rounded-full bg-kiosk-card p-2.5" aria-label={t.exitKiosk}><X className="h-6 w-6" /></Link>
          </div>
        </div>
      </header>
      {due.length > 0 && doneCount === due.length && (
        <p className="mb-6 text-center text-3xl font-bold">{t.allDone}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((x) => <TaskCard key={x.id} task={x} done={!!logs[x.id]} onToggle={() => toggle(x.id)} size="xl" />)}
      </div>
    </div>
  );
}
