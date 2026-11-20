import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/TaskCard";
import { adminAction } from "@/lib/admin.functions";
import { autoTranslate } from "@/lib/translate.functions";
import { useI18n } from "@/lib/i18n";
import { LANGS, langMeta, type Lang } from "@/lib/locales";
import { dateKey, type RecurrenceType } from "@/lib/schedule";
import type { Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";

const EMOJI_GROUPS = [
  { key: "catCleaning", items: ["🧹", "🧽", "🪣", "🧼", "🫧", "🧴", "🪟", "🚪", "🛋️", "🪑", "🧯", "✨", "🗑️", "♻️", "🪠", "🕸️"] },
  { key: "catLaundry", items: ["🧺", "👕", "👖", "👗", "🧦", "🧥", "👔", "🩳", "🧣", "🛏️", "🪡", "🧷", "👟", "🥾"] },
  { key: "catKitchen", items: ["🍽️", "🍳", "🥘", "🍲", "🥗", "🥪", "🍞", "🥛", "☕", "🫖", "🔪", "🥄", "🧊", "🥡", "🍱", "🧂"] },
  { key: "catBathroom", items: ["🚿", "🛁", "🚽", "🧻", "🪥", "🪒", "🧴", "🪞"] },
  { key: "catShopping", items: ["🛒", "🛍️", "🥦", "🍎", "🥚", "🧃", "💊", "🧾"] },
  { key: "catGarden", items: ["🪴", "🌱", "🌿", "🌷", "🌳", "💧", "🚿", "🍂", "☀️", "🏡"] },
  { key: "catKidsPets", items: ["👶", "🍼", "🧸", "🎒", "📚", "🛝", "🐶", "🐱", "🐟", "🦴", "🐾"] },
  { key: "catErrands", items: ["🚗", "⛽", "📦", "📬", "💡", "🔧", "🔋", "🧰", "📋", "⏰", "📞", "💰", "🙏", "⭐", "❤️", "✅"] },
] as const;

export function TaskForm({ task, nextOrder, onClose }: { task: Task | null; nextOrder: number; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [emoji, setEmoji] = useState(task?.emoji ?? "🧹");

  // Single-Input Fast Mode States
  const [baseLang, setBaseLang] = useState<Lang>(() => (task?.base_lang as Lang) ?? lang);
  const [baseTitle, setBaseTitle] = useState(() => {
    const i18n = (task?.title_i18n as Record<string, string>) || {};
    return i18n[task?.base_lang as Lang] || (lang === "ar" ? task?.title_ar : task?.title) || task?.title || "";
  });
  const [baseDesc, setBaseDesc] = useState(() => {
    const i18n = (task?.description_i18n as Record<string, string>) || {};
    return i18n[task?.base_lang as Lang] || "";
  });

  // Multilingual Dynamic Translations
  const [titleI18n, setTitleI18n] = useState<Record<string, string>>(() => (task?.title_i18n as Record<string, string>) ?? {});
  const [descI18n, setDescI18n] = useState<Record<string, string>>(() => (task?.description_i18n as Record<string, string>) ?? {});
  const [translating, setTranslating] = useState(false);
  const [translateErr, setTranslateErr] = useState<string | null>(null);

  // Recurrence & Scheduling
  const [type, setType] = useState<RecurrenceType>((task?.recurrence_type as RecurrenceType) ?? "daily");
  const [days, setDays] = useState<number[]>(task?.recurrence_days ?? []);
  const [onceDate, setOnceDate] = useState(task?.once_date ?? dateKey(new Date()));
  const [time, setTime] = useState(task?.scheduled_time?.slice(0, 5) ?? "");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const cleanTitles = { ...titleI18n, [baseLang]: baseTitle.trim() };
  const cleanDescs = { ...descI18n };
  if (baseDesc.trim()) cleanDescs[baseLang] = baseDesc.trim();

  // One-Click Auto-Translate Handler
  const handleAutoTranslate = async () => {
    if (!baseTitle.trim()) return;
    setTranslating(true);
    setTranslateErr(null);
    try {
      const pin = sessionStorage.getItem("ht-pin") ?? "";
      const res = await autoTranslate({
        data: {
          pin,
          base_lang: baseLang,
          title: baseTitle.trim(),
          description: baseDesc.trim(),
        },
      });
      if (res.ok) {
        setTitleI18n({ ...res.title, [baseLang]: baseTitle.trim() });
        setDescI18n({ ...res.description, [baseLang]: baseDesc.trim() });
      } else {
        setTranslateErr(res.error === "rate_limited" ? t.tooManyAttempts : t.translateFailed);
      }
    } catch {
      setTranslateErr(t.translateFailed);
    } finally {
      setTranslating(false);
    }
  };

  const payload = {
    emoji,
    title: cleanTitles["en"]?.trim() || baseTitle.trim(),
    title_ar: cleanTitles["ar"]?.trim() || (baseLang === "ar" ? baseTitle.trim() : null),
    base_lang: baseLang,
    title_i18n: cleanTitles,
    description_i18n: cleanDescs,
    recurrence_type: type,
    recurrence_days: type === "weekly" ? [...days].sort() : [],
    once_date: type === "once" ? onceDate : null,
    scheduled_time: time || null,
  };

  const save = async () => {
    if (!baseTitle.trim()) {
      setFormErr(t.required);
      return;
    }
    if (type === "weekly" && days.length === 0) {
      setFormErr(t.pickDay);
      return;
    }
    setFormErr(null);
    setBusy(true);
    try {
      const pin = sessionStorage.getItem("ht-pin") ?? "";
      const res = task
        ? await adminAction({ data: { action: "update", pin, id: task.id, task: payload } })
        : await adminAction({ data: { action: "create", pin, task: payload, sort_order: nextOrder } });
      if (!res.ok) {
        setFormErr(res.error === "rate_limited" ? t.tooManyAttempts : t.wrongPin);
        return;
      }
      onClose();
    } catch {
      setFormErr(t.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!task) return;
    setFormErr(null);
    setBusy(true);
    try {
      const res = await adminAction({
        data: { action: "delete", pin: sessionStorage.getItem("ht-pin") ?? "", id: task.id },
      });
      if (!res.ok) {
        setFormErr(res.error === "rate_limited" ? t.tooManyAttempts : t.wrongPin);
        return;
      }
      onClose();
    } catch {
      setFormErr(t.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border bg-background px-3 py-2.5 text-base";
  const preview = {
    ...(task ?? {}),
    ...payload,
    title: cleanTitles[lang] || cleanTitles[baseLang] || baseTitle.trim() || "…",
    id: "preview-card",
  } as Task;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? t.editTask : t.addTask}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Emoji Picker */}
          <div>
            <p className="mb-2 text-sm font-bold">{t.emoji}</p>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-2">
              {EMOJI_GROUPS.map((g) => (
                <div key={g.key}>
                  <p className="mb-1 text-xs font-bold text-muted-foreground">{t[g.key]}</p>
                  <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                    {g.items.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={cn(
                          "emoji flex aspect-square items-center justify-center rounded-lg text-2xl hover:bg-secondary transition",
                          emoji === e && "bg-primary/15 ring-2 ring-primary",
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={cn(field, "mt-2 w-20 text-center")}
              maxLength={8}
            />
          </div>

          {/* Single-Input Fast Mode: Language Selector */}
          <div>
            <label className="mb-1 block text-sm font-bold">{t.baseLang}</label>
            <Select value={baseLang} onValueChange={(v) => setBaseLang(v as Lang)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 z-50">
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span dir={l.dir} className="font-medium">{l.name}</span>
                    <span className="text-xs text-muted-foreground ms-2">({l.english})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Task Title */}
          <label className="block">
            <span className="text-sm font-bold">{t.title}</span>
            <input
              dir={langMeta(baseLang).dir}
              value={baseTitle}
              onChange={(e) => {
                setBaseTitle(e.target.value);
                setFormErr(null);
              }}
              placeholder={t.required}
              className={field}
            />
          </label>

          {/* Primary Task Description / Notes */}
          <label className="block">
            <span className="text-sm font-bold">{t.description}</span>
            <input
              dir={langMeta(baseLang).dir}
              value={baseDesc}
              onChange={(e) => setBaseDesc(e.target.value)}
              placeholder="…"
              className={field}
            />
          </label>

          {/* One-Click Auto-Translate Action */}
          <div className="space-y-1">
            <button
              type="button"
              disabled={translating || !baseTitle.trim()}
              onClick={handleAutoTranslate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 px-4 font-bold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition cursor-pointer"
            >
              {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
              <span>{translating ? t.translating : `✨ ${t.autoTranslate}`}</span>
            </button>
            {translateErr && <p className="text-xs font-semibold text-destructive">{translateErr}</p>}
          </div>

          {/* Inline Review Accordion */}
          <Accordion type="single" collapsible className="w-full rounded-xl border px-3">
            <AccordionItem value="translations" className="border-none">
              <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline cursor-pointer">
                <div className="flex items-center gap-2">
                  <span>🌐 {t.translations}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">
                    {Object.keys(cleanTitles).filter((k) => k !== baseLang && cleanTitles[k]?.trim()).length} / 8
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1 pb-3">
                <p className="text-xs text-muted-foreground">{t.reviewHint}</p>
                {LANGS.filter((l) => l.code !== baseLang).map((l) => (
                  <div key={l.code} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" dir={l.dir}>{l.name}</span>
                      <span className="text-xs text-muted-foreground font-semibold">{l.english}</span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">{t.title}</label>
                      <input
                        dir={l.dir}
                        value={titleI18n[l.code] ?? ""}
                        onChange={(e) => setTitleI18n((prev) => ({ ...prev, [l.code]: e.target.value }))}
                        placeholder={baseTitle || "…"}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">{t.description}</label>
                      <input
                        dir={l.dir}
                        value={descI18n[l.code] ?? ""}
                        onChange={(e) => setDescI18n((prev) => ({ ...prev, [l.code]: e.target.value }))}
                        placeholder={baseDesc || "…"}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Schedule Configuration */}
          <div>
            <p className="mb-2 text-sm font-bold">{t.repeat}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "once"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setType(r);
                    setFormErr(null);
                  }}
                  className={cn(
                    "rounded-xl border py-2 font-bold cursor-pointer transition",
                    type === r && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {t[r]}
                </button>
              ))}
            </div>
          </div>

          {type === "weekly" && (
            <div className="grid grid-cols-7 gap-1">
              {t.dayNames.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i]);
                    setFormErr(null);
                  }}
                  className={cn(
                    "rounded-lg border py-2 text-xs font-bold cursor-pointer transition",
                    days.includes(i) && "border-accent bg-accent text-accent-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {type === "once" && (
            <label className="block">
              <span className="text-sm font-bold">{t.date}</span>
              <input type="date" value={onceDate} onChange={(e) => setOnceDate(e.target.value)} className={field} />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-bold">{t.time}</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
          </label>

          {/* Preview Card */}
          <div>
            <p className="mb-2 text-sm font-bold">{t.preview}</p>
            <TaskCard task={preview} done={false} onToggle={() => {}} />
            <p className="mt-1 text-xs text-muted-foreground">{t.fallbackHint}</p>
          </div>

          {formErr && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {formErr}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {task && (
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="rounded-xl border border-destructive px-4 py-3 font-bold text-destructive hover:bg-destructive/10 transition cursor-pointer disabled:opacity-50"
              >
                {t.delete}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-3 font-bold hover:bg-secondary transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={busy || !baseTitle.trim()}
              onClick={save}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
