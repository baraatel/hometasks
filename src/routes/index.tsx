import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Minimize2, Monitor, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskCard } from "@/components/TaskCard";
import { useHousehold, useToday, type Task } from "@/lib/tasks";
import { isDueOn, timeBucket, type TimeBucket } from "@/lib/schedule";
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

const BUCKET_ORDER: TimeBucket[] = ["morning", "afternoon", "evening", "anytime"];

function groupByTime(items: Task[]) {
  const map = new Map<TimeBucket, Task[]>();
  for (const b of BUCKET_ORDER) map.set(b, []);
  for (const item of items) {
    map.get(timeBucket(item.scheduled_time))!.push(item);
  }
  return BUCKET_ORDER.map((bucket) => ({ bucket, items: map.get(bucket)! })).filter((g) => g.items.length > 0);
}

function Today() {
  const now = useToday();
  const { t, locale } = useI18n();
  const { tasks, logs, toggle, toggleError, clearToggleError, loading } = useHousehold(now);
  const [showDone, setShowDone] = useState(false);
  const [kiosk, setKiosk] = useState(false);

  useEffect(() => {
    // Keep wall-mounted tablets awake while the checklist is open.
    let lock: { release: () => Promise<void> } | null = null;
    const wl = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock;
    const req = async () => {
      try {
        lock = (await wl?.request("screen")) ?? null;
      } catch {
        /* unsupported */
      }
    };
    req();
    const onVis = () => document.visibilityState === "visible" && req();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release();
    };
  }, []);

  const due = tasks.filter((x) => isDueOn(x, now));
  const active = due.filter((x) => !logs[x.id]);
  const done = due.filter((x) => logs[x.id]);
  const pct = due.length ? Math.round((done.length / due.length) * 100) : 0;
  const groups = groupByTime(active);
  const showBuckets = groups.length > 1;

  if (kiosk) {
    return (
      <div className="min-h-screen bg-kiosk p-6 text-kiosk-foreground">
        <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold opacity-75">
              {now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="text-xl font-bold text-accent">
              {done.length} {t.of} {due.length} {t.done} ({pct}%)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-extrabold tabular-nums">
              {now.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
            </span>
            <button
              type="button"
              onClick={() => setKiosk(false)}
              className="flex items-center gap-2 rounded-full bg-kiosk-card px-4 py-2.5 text-sm font-bold hover:opacity-80 cursor-pointer"
            >
              <Minimize2 className="h-5 w-5" />
              <span>{t.exitKiosk}</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-3 overflow-hidden rounded-full bg-kiosk-card">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          {!loading && due.length === 0 && <p className="py-16 text-center text-2xl opacity-75">{t.nothingToday}</p>}
          {!loading && due.length > 0 && active.length === 0 && (
            <p className="py-16 text-center text-4xl font-extrabold text-success">{t.allDone}</p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((x) => (
              <TaskCard key={x.id} task={x} done={false} onToggle={() => toggle(x.id)} size="xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold opacity-80">
            {now.toLocaleDateString(locale, { weekday: "long" })}
          </p>
          <button
            type="button"
            onClick={() => setKiosk(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold hover:bg-primary-foreground/25 transition cursor-pointer"
            title={t.kioskMode}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>{t.kioskMode}</span>
          </button>
        </div>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            {now.toLocaleDateString(locale, { day: "numeric", month: "long" })}
          </h1>
          <span className="hidden text-5xl font-extrabold tabular-nums md:block">
            {now.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-semibold">
          {done.length} {t.of} {due.length} {t.done}
        </p>
      </section>

      {toggleError && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
        >
          <span>{t.toggleFailed}</span>
          <button type="button" onClick={clearToggleError} aria-label={t.cancel} className="cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-5 space-y-5">
        {!loading && due.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">{t.nothingToday}</p>
        )}
        {!loading && due.length > 0 && active.length === 0 && (
          <p className="py-6 text-center text-xl font-bold text-primary">{t.allDone}</p>
        )}
        {showBuckets ? (
          groups.map((g) => (
            <div key={g.bucket} className="space-y-2.5">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                {t[g.bucket]}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {g.items.map((x) => (
                  <TaskCard key={x.id} task={x} done={false} onToggle={() => toggle(x.id)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((x) => (
              <TaskCard key={x.id} task={x} done={false} onToggle={() => toggle(x.id)} />
            ))}
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-1 font-bold text-muted-foreground cursor-pointer"
          >
            <ChevronDown className={`h-5 w-5 transition ${showDone ? "" : "-rotate-90 rtl:rotate-90"}`} />
            {t.completed} ({done.length})
          </button>
          {showDone && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {done.map((x) => (
                <TaskCard key={x.id} task={x} done onToggle={() => toggle(x.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
