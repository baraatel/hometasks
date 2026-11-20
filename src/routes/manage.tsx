import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Lock, Pencil, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskForm } from "@/components/TaskForm";
import { useHousehold, useToday, taskTitle, fmtTime, type Task } from "@/lib/tasks";
import { adminAction } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manage chores — HomeTasker" },
      { name: "description", content: "Add, edit, reorder and schedule household chores." },
      { property: "og:title", content: "Manage chores — HomeTasker" },
      { property: "og:description", content: "Add, edit, reorder and schedule household chores." },
    ],
  }),
  component: Manage,
});

function Manage() {
  const { t } = useI18n();
  const [unlocked, setUnlocked] = useState(false);

  // Re-verify any stored session PIN against the server instead of trusting sessionStorage blindly.
  useEffect(() => {
    const saved = sessionStorage.getItem("ht-pin");
    if (!saved) return;
    let active = true;
    adminAction({ data: { action: "verify", pin: saved } })
      .then((r) => {
        if (!active) return;
        if (r.ok) setUnlocked(true);
        else sessionStorage.removeItem("ht-pin");
      })
      .catch(() => {
        if (active) sessionStorage.removeItem("ht-pin");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      {unlocked ? (
        <Admin
          onLock={() => {
            sessionStorage.removeItem("ht-pin");
            setUnlocked(false);
          }}
        />
      ) : (
        <PinPad
          onOk={(p) => {
            sessionStorage.setItem("ht-pin", p);
            setUnlocked(true);
          }}
          label={t.enterPin}
        />
      )}
    </AppShell>
  );
}

function PinPad({ onOk, label }: { onOk: (pin: string) => void; label: string }) {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const press = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setErrMsg(null);
    if (next.length === 4) {
      adminAction({ data: { action: "verify", pin: next } })
        .then((r) => {
          if (r.ok) {
            onOk(next);
          } else {
            setErrMsg(r.error === "rate_limited" ? t.tooManyAttempts : t.wrongPin);
            setTimeout(() => setPin(""), 400);
          }
        })
        .catch(() => {
          setErrMsg(t.wrongPin);
          setTimeout(() => setPin(""), 400);
        });
    }
  };

  return (
    <div className="mx-auto max-w-xs pt-8 text-center">
      <Lock className="mx-auto h-10 w-10 text-primary" />
      <p className="mt-3 text-lg font-bold">{label}</p>
      <div className="my-5 flex justify-center gap-3" dir="ltr">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full ${i < pin.length ? (errMsg ? "bg-destructive" : "bg-primary") : "bg-border"}`}
          />
        ))}
      </div>
      {errMsg && (
        <p role="alert" className="mb-3 font-semibold text-destructive">
          {errMsg}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3" dir="ltr">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : press(k))}
              className="h-16 rounded-2xl bg-card text-2xl font-bold shadow-card active:scale-95 cursor-pointer"
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function Admin({ onLock }: { onLock: () => void }) {
  const { t, lang } = useI18n();
  const now = useToday();
  const { tasks, reload } = useHousehold(now);
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tasks.length) return;
    const list = [...tasks];
    [list[i], list[j]] = [list[j]!, list[i]!];
    await adminAction({
      data: { action: "reorder", pin: sessionStorage.getItem("ht-pin") ?? "", ids: list.map((x) => x.id) },
    });
    reload();
  };

  const recurrenceLabel = (x: Task) =>
    x.recurrence_type === "daily"
      ? t.everyDay
      : x.recurrence_type === "weekly"
        ? x.recurrence_days.map((d) => t.dayNames[d]).join(" · ")
        : x.once_date;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{t.manage}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onLock}
            className="rounded-full border bg-card p-2.5 cursor-pointer"
            aria-label={t.lock}
          >
            <Lock className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex items-center gap-1 rounded-full bg-accent px-4 py-2 font-bold text-accent-foreground cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            {t.addTask}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map((x, i) => (
          <div key={x.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <span className="emoji text-3xl">{x.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-lg">{taskTitle(x, lang)}</p>
              <p className="text-xs text-muted-foreground">
                {recurrenceLabel(x)}
                {x.scheduled_time ? ` · ${fmtTime(x.scheduled_time, lang)}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="rounded-lg p-2 disabled:opacity-30 cursor-pointer"
              aria-label="Up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === tasks.length - 1}
              className="rounded-lg p-2 disabled:opacity-30 cursor-pointer"
              aria-label="Down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(x)}
              className="rounded-xl bg-secondary p-2.5 cursor-pointer"
              aria-label={t.edit}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {editing && (
        <TaskForm
          task={editing === "new" ? null : editing}
          nextOrder={tasks.length + 1}
          onClose={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}
