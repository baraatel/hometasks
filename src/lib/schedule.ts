export type RecurrenceType = "daily" | "weekly" | "once";
export type TimeBucket = "morning" | "afternoon" | "evening" | "anytime";

export interface TaskLike {
  recurrence_type: string;
  recurrence_days: number[];
  once_date: string | null;
}

/** Local date as YYYY-MM-DD (the device's timezone decides when "today" resets). */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isDueOn(task: TaskLike, d: Date): boolean {
  if (task.recurrence_type === "daily") return true;
  if (task.recurrence_type === "weekly") return task.recurrence_days.includes(d.getDay());
  if (task.recurrence_type === "once") return task.once_date === dateKey(d);
  return false;
}

/** Categorize a task's optional HH:MM[:SS] time into morning / afternoon / evening / anytime. */
export function timeBucket(scheduledTime: string | null | undefined): TimeBucket {
  if (!scheduledTime) return "anytime";
  const hour = Number(scheduledTime.split(":")[0]);
  if (Number.isNaN(hour)) return "anytime";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
