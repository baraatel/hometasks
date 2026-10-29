import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtTime, taskTitle, type Task } from "@/lib/tasks";
import { useI18n } from "@/lib/i18n";

export function TaskCard({
  task, done, onToggle, size = "md",
}: { task: Task; done: boolean; onToggle: () => void; size?: "md" | "xl" }) {
  const { lang } = useI18n();
  const xl = size === "xl";
  const time = fmtTime(task.scheduled_time, lang);
  return (
    <button
      onClick={onToggle}
      aria-pressed={done}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl text-start transition active:scale-[0.98]",
        xl ? "min-h-28 bg-kiosk-card p-5 text-kiosk-foreground" : "min-h-20 bg-card p-4 shadow-card md:min-h-28 md:p-5",
        done && "opacity-40",
      )}
    >
      <span className={cn("emoji shrink-0", xl ? "text-6xl" : "text-4xl md:text-6xl")}>{task.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-bold leading-tight", xl ? "text-3xl" : "text-xl md:text-2xl", done && "line-through")}>
          {taskTitle(task, lang)}
        </span>
        {time && (
          <span className={cn("mt-1 inline-block rounded-full px-2.5 font-semibold",
            xl ? "bg-kiosk text-lg" : "bg-secondary text-sm text-secondary-foreground")}>
            {time}
          </span>
        )}
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-4 transition",
          xl ? "h-16 w-16" : "h-12 w-12 md:h-16 md:w-16",
          done ? "border-success bg-success text-success-foreground" : "border-border",
        )}
      >
        {done && <Check className={xl ? "h-9 w-9" : "h-7 w-7 md:h-9 md:w-9"} strokeWidth={3.5} />}
      </span>
    </button>
  );
}
