import { Check, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtTime, taskDescription, taskTitle, type Task } from "@/lib/tasks";
import { useI18n } from "@/lib/i18n";
import { langMeta } from "@/lib/locales";

export function TaskCard({
  task,
  done,
  onToggle,
  size = "md",
}: {
  task: Task;
  done: boolean;
  onToggle: () => void;
  size?: "md" | "xl";
}) {
  const { lang, t } = useI18n();
  const xl = size === "xl";
  const time = fmtTime(task.scheduled_time, lang);
  const title = taskTitle(task, lang);
  const description = taskDescription(task, lang);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(description ? `${title}. ${description}` : title);
    utterance.lang = langMeta(lang).intl;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl transition",
        xl ? "min-h-28 bg-kiosk-card p-5 text-kiosk-foreground" : "min-h-20 bg-card p-4 shadow-card md:min-h-28 md:p-5",
        done && "opacity-45",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className="flex min-w-0 flex-1 items-center gap-4 text-start active:scale-[0.99] transition cursor-pointer"
      >
        <span className={cn("emoji shrink-0", xl ? "text-6xl" : "text-4xl md:text-6xl")}>{task.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-bold leading-snug", xl ? "text-3xl" : "text-xl md:text-2xl", done && "line-through")}>
            {title}
          </span>
          {description && (
            <span
              className={cn(
                "mt-0.5 block leading-snug",
                xl ? "text-lg opacity-80" : "text-sm text-muted-foreground md:text-base",
              )}
            >
              {description}
            </span>
          )}
          {time && (
            <span
              className={cn(
                "mt-1.5 inline-block rounded-full px-2.5 font-semibold",
                xl ? "bg-kiosk text-lg" : "bg-secondary text-sm text-secondary-foreground",
              )}
            >
              {time}
            </span>
          )}
        </span>
      </button>

      {canSpeak && (
        <button
          type="button"
          onClick={speak}
          aria-label={`${t.speak}: ${title}`}
          title={t.speak}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full transition cursor-pointer",
            xl
              ? "h-12 w-12 bg-kiosk/60 text-kiosk-foreground hover:bg-kiosk"
              : "h-10 w-10 text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Volume2 className={xl ? "h-6 w-6" : "h-5 w-5"} />
        </button>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-label={title}
        aria-pressed={done}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-4 transition cursor-pointer active:scale-95",
          xl ? "h-16 w-16" : "h-12 w-12 md:h-16 md:w-16",
          done ? "border-success bg-success text-success-foreground" : "border-border",
        )}
      >
        {done && <Check className={xl ? "h-9 w-9" : "h-7 w-7 md:h-9 md:w-9"} strokeWidth={3.5} />}
      </button>
    </div>
  );
}
