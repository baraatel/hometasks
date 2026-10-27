import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useHousehold, useToday, taskTitle } from "@/lib/tasks";
import { isDueOn, dateKey } from "@/lib/schedule";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/week")({
  head: () => ({
    meta: [
      { title: "Weekly schedule — HomeTasker" },
      { name: "description", content: "See which chores fall on each day of the week." },
      { property: "og:title", content: "Weekly schedule — HomeTasker" },
      { property: "og:description", content: "See which chores fall on each day of the week." },
    ],
  }),
  component: Week,
});

function Week() {
  const now = useToday();
  const { t, lang } = useI18n();
  const { tasks } = useHousehold(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() + i); return d;
  });
  return (
    <AppShell>
      <h1 className="mb-4 text-3xl font-extrabold">{t.week}</h1>
      <div className="space-y-3">
        {days.map((d) => {
          const due = tasks.filter((x) => isDueOn(x, d));
          const isToday = dateKey(d) === dateKey(now);
          return (
            <div key={dateKey(d)} className={cn("rounded-2xl bg-card p-4 shadow-card", isToday && "ring-2 ring-primary")}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">
                  {t.dayNames[d.getDay()]} <span className="text-muted-foreground">{d.toLocaleDateString(lang === "ar" ? "ar" : "en", { day: "numeric", month: "short" })}</span>
                </h2>
                <span className="text-sm text-muted-foreground">{due.length} {t.tasksCount}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {due.map((x) => (
                  <span key={x.id} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold">
                    <span className="emoji text-xl">{x.emoji}</span>{taskTitle(x, lang)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
