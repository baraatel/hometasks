import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskCard } from "@/components/TaskCard";
import { useHousehold, useToday } from "@/lib/tasks";
import { isDueOn } from "@/lib/schedule";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's chores — HomeTasker" },
      { name: "description", content: "Today's household checklist, synced live across every device." },
      { property: "og:title", content: "Today's chores — HomeTasker" },
      { property: "og:description", content: "Today's household checklist, synced live across every device." },
    ],
  }),
  component: Today,
});

function Today() {
  const now = useToday();
  const { t, lang } = useI18n();
  const { tasks, logs, toggle, loading } = useHousehold(now);
  const [showDone, setShowDone] = useState(false);
  useEffect(() => {
    // Keep wall-mounted tablets awake while the checklist is open.
    let lock: { release: () => Promise<void> } | null = null;
    const wl = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock;
    const req = async () => { try { lock = (await wl?.request("screen")) ?? null; } catch { /* unsupported */ } };
    req();
    const onVis = () => document.visibilityState === "visible" && req();
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); lock?.release(); };
  }, []);
  const due = tasks.filter((x) => isDueOn(x, now));
  const active = due.filter((x) => !logs[x.id]);
  const done = due.filter((x) => logs[x.id]);
  const pct = due.length ? Math.round((done.length / due.length) * 100) : 0;

  return (
    <AppShell>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="text-sm font-semibold opacity-80">
          {now.toLocaleDateString(lang === "ar" ? "ar" : "en", { weekday: "long" })}
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            {now.toLocaleDateString(lang === "ar" ? "ar" : "en", { day: "numeric", month: "long" })}
          </h1>
          <span className="hidden text-5xl font-extrabold tabular-nums md:block">
            {now.toLocaleTimeString(lang === "ar" ? "ar" : "en", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-semibold">
          {done.length} {t.of} {due.length} {t.done}
        </p>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {!loading && due.length === 0 && <p className="py-10 text-center md:col-span-2 text-muted-foreground">{t.nothingToday}</p>}
        {!loading && due.length > 0 && active.length === 0 && (
          <p className="py-6 text-center md:col-span-2 text-xl font-bold text-primary">{t.allDone}</p>
        )}
        {active.map((x) => <TaskCard key={x.id} task={x} done={false} onToggle={() => toggle(x.id)} />)}
      </div>

      {done.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowDone(!showDone)} className="flex items-center gap-1 font-bold text-muted-foreground">
            <ChevronDown className={`h-5 w-5 transition ${showDone ? "" : "-rotate-90 rtl:rotate-90"}`} />
            {t.completed} ({done.length})
          </button>
          {showDone && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {done.map((x) => <TaskCard key={x.id} task={x} done onToggle={() => toggle(x.id)} />)}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
