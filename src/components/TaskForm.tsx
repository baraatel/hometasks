import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskCard } from "@/components/TaskCard";
import { adminAction } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";
import { dateKey, type RecurrenceType } from "@/lib/schedule";
import type { Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const EMOJI_GROUPS = [
  { en: "Cleaning", ar: "التنظيف", items: ["🧹", "🧽", "🪣", "🧼", "🫧", "🧴", "🪟", "🚪", "🛋️", "🪑", "🧯", "✨", "🗑️", "♻️", "🪠", "🕸️"] },
  { en: "Laundry", ar: "الغسيل", items: ["🧺", "👕", "👖", "👗", "🧦", "🧥", "👔", "🩳", "🧣", "🛏️", "🪡", "🧷", "👟", "🥾"] },
  { en: "Kitchen", ar: "المطبخ", items: ["🍽️", "🍳", "🥘", "🍲", "🥗", "🥪", "🍞", "🥛", "☕", "🫖", "🔪", "🥄", "🧊", "🥡", "🍱", "🧂"] },
  { en: "Bathroom", ar: "الحمام", items: ["🚿", "🛁", "🚽", "🧻", "🪥", "🪒", "🧴", "🪞"] },
  { en: "Shopping", ar: "التسوق", items: ["🛒", "🛍️", "🥦", "🍎", "🥚", "🧃", "💊", "🧾"] },
  { en: "Garden & outdoor", ar: "الحديقة", items: ["🪴", "🌱", "🌿", "🌷", "🌳", "💧", "🚿", "🍂", "☀️", "🏡"] },
  { en: "Kids & pets", ar: "الأطفال والحيوانات", items: ["👶", "🍼", "🧸", "🎒", "📚", "🛝", "🐶", "🐱", "🐟", "🦴", "🐾"] },
  { en: "Errands & other", ar: "مهام أخرى", items: ["🚗", "⛽", "📦", "📬", "💡", "🔧", "🔋", "🧰", "📋", "⏰", "📞", "💰", "🙏", "⭐", "❤️", "✅"] },
];

export function TaskForm({ task, nextOrder, onClose }: { task: Task | null; nextOrder: number; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [emoji, setEmoji] = useState(task?.emoji ?? "🧹");
  const [title, setTitle] = useState(task?.title ?? "");
  const [titleAr, setTitleAr] = useState(task?.title_ar ?? "");
  const [type, setType] = useState<RecurrenceType>((task?.recurrence_type as RecurrenceType) ?? "daily");
  const [days, setDays] = useState<number[]>(task?.recurrence_days ?? []);
  const [onceDate, setOnceDate] = useState(task?.once_date ?? dateKey(new Date()));
  const [time, setTime] = useState(task?.scheduled_time?.slice(0, 5) ?? "");
  const [busy, setBusy] = useState(false);

  const payload = {
    emoji, title: title.trim(), title_ar: titleAr.trim() || null, recurrence_type: type,
    base_lang: "en", description_i18n: {} as Record<string, string>,
    title_i18n: { ...((task?.title_i18n as Record<string, string>) ?? {}), en: title.trim(), ...(titleAr.trim() ? { ar: titleAr.trim() } : {}) },
    recurrence_days: type === "weekly" ? [...days].sort() : [],
    once_date: type === "once" ? onceDate : null, scheduled_time: time || null,
  };

  const save = async () => {
    if (!payload.title || (type === "weekly" && days.length === 0)) return;
    setBusy(true);
    const pin = sessionStorage.getItem("ht-pin") ?? "";
    if (task) await adminAction({ data: { action: "update", pin, id: task.id, task: payload } });
    else await adminAction({ data: { action: "create", pin, task: payload, sort_order: nextOrder } });
    onClose();
  };
  const remove = async () => {
    if (!task) return;
    setBusy(true);
    await adminAction({ data: { action: "delete", pin: sessionStorage.getItem("ht-pin") ?? "", id: task.id } });
    onClose();
  };

  const field = "w-full rounded-xl border bg-background px-3 py-2.5 text-lg";
  const preview = { ...(task ?? {}), ...payload, title: payload.title || "…", id: "p" } as Task;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{task ? t.editTask : t.addTask}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold">{t.emoji}</p>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-2">
              {EMOJI_GROUPS.map((g) => (
                <div key={g.en}>
                  <p className="mb-1 text-xs font-bold text-muted-foreground">{lang === "ar" ? g.ar : g.en}</p>
                  <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                    {g.items.map((e) => (
                      <button key={e} type="button" onClick={() => setEmoji(e)}
                        className={cn("emoji flex aspect-square items-center justify-center rounded-lg text-2xl hover:bg-secondary", emoji === e && "bg-primary/15 ring-2 ring-primary")}>{e}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={cn(field, "mt-2 w-20 text-center")} maxLength={8} />
          </div>
          <label className="block"><span className="text-sm font-bold">{t.title} (English)</span>
            <input dir="ltr" value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
          <label className="block"><span className="text-sm font-bold">{t.title} (العربية)</span>
            <input dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className={field} /></label>
          <div>
            <p className="mb-2 text-sm font-bold">{t.repeat}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "once"] as const).map((r) => (
                <button key={r} onClick={() => setType(r)}
                  className={cn("rounded-xl border py-2 font-bold", type === r && "border-primary bg-primary text-primary-foreground")}>{t[r]}</button>
              ))}
            </div>
          </div>
          {type === "weekly" && (
            <div className="grid grid-cols-7 gap-1">
              {t.dayNames.map((d, i) => (
                <button key={i} onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i])}
                  className={cn("rounded-lg border py-2 text-xs font-bold", days.includes(i) && "border-accent bg-accent text-accent-foreground")}>{d}</button>
              ))}
            </div>
          )}
          {type === "once" && (
            <label className="block"><span className="text-sm font-bold">{t.date}</span>
              <input type="date" value={onceDate} onChange={(e) => setOnceDate(e.target.value)} className={field} /></label>
          )}
          <label className="block"><span className="text-sm font-bold">{t.time}</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} /></label>
          <div>
            <p className="mb-2 text-sm font-bold">{t.preview}</p>
            <TaskCard task={preview} done={false} onToggle={() => {}} />
          </div>
          <div className="flex gap-2">
            {task && <button disabled={busy} onClick={remove} className="rounded-xl border border-destructive px-4 py-3 font-bold text-destructive">{t.delete}</button>}
            <button onClick={onClose} className="flex-1 rounded-xl border py-3 font-bold">{t.cancel}</button>
            <button disabled={busy} onClick={save} className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">{t.save}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
