import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { dateKey } from "./schedule";

export type Task = Tables<"tasks">;
export type TaskLog = Tables<"task_logs">;

/** Live tasks + today's logs, kept in sync across devices. */
export function useHousehold(date: Date) {
  const key = dateKey(date);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("tasks").select("*").order("sort_order").order("scheduled_time"),
      supabase.from("task_logs").select("*").eq("log_date", key),
    ]);
    setTasks(t ?? []);
    setLogs(Object.fromEntries((l ?? []).map((x) => [x.task_id, x.is_completed])));
    setLoading(false);
  }, [key]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`household-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_logs" }, (p) => {
        const row = (p.new ?? p.old) as TaskLog;
        if (row?.log_date !== key) return;
        if (p.eventType === "DELETE") load();
        else setLogs((s) => ({ ...s, [row.task_id]: row.is_completed }));
      })
      .subscribe();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, key]);

  const toggle = async (taskId: string) => {
    const next = !logs[taskId];
    setLogs((s) => ({ ...s, [taskId]: next }));
    if (navigator.vibrate) navigator.vibrate(next ? 30 : 10);
    await supabase.from("task_logs").upsert(
      { task_id: taskId, log_date: key, is_completed: next, completed_at: next ? new Date().toISOString() : null },
      { onConflict: "task_id,log_date" },
    );
  };

  return { tasks, logs, loading, toggle, reload: load };
}

/** Re-render at local midnight so the daily list resets automatically. */
export function useToday() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function taskTitle(t: Task, lang: string) {
  return lang === "ar" && t.title_ar ? t.title_ar : t.title;
}

export function fmtTime(time: string | null, lang: string) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(lang === "ar" ? "ar" : "en", { hour: "numeric", minute: "2-digit" });
}
