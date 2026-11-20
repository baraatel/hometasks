import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LANG_CODES } from "./locales";

const textMap = z
  .record(z.string(), z.string().max(500))
  .refine((m) => Object.keys(m).every((k) => (LANG_CODES as string[]).includes(k)));

const taskFields = z.object({
  emoji: z.string().min(1).max(16),
  title: z.string().trim().min(1).max(100),
  title_ar: z.string().trim().max(100).nullable(),
  base_lang: z.enum(LANG_CODES as [string, ...string[]]),
  title_i18n: textMap,
  description_i18n: textMap,
  recurrence_type: z.enum(["daily", "weekly", "once"]),
  recurrence_days: z.array(z.number().int().min(0).max(6)).max(7),
  once_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
});

const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify"), pin: z.string().max(12) }),
  z.object({ action: z.literal("list"), pin: z.string().max(12) }),
  z.object({ action: z.literal("create"), pin: z.string().max(12), task: taskFields, sort_order: z.number().int() }),
  z.object({ action: z.literal("update"), pin: z.string().max(12), id: z.string().uuid(), task: taskFields }),
  z.object({ action: z.literal("delete"), pin: z.string().max(12), id: z.string().uuid() }),
  z.object({ action: z.literal("reorder"), pin: z.string().max(12), ids: z.array(z.string().uuid()).max(500) }),
]);

export const adminAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { verifyAdminPin } = await import("./auth.server");
    const check = verifyAdminPin(data.pin);
    if (!check.ok) {
      return {
        ok: false as const,
        error: check.locked ? ("rate_limited" as const) : ("pin" as const),
        tasks: [],
      };
    }
    if (data.action === "verify") return { ok: true as const, tasks: [] };

    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    if (data.action === "list") {
      const { data: rows } = await db.from("tasks").select("*").order("sort_order").order("scheduled_time");
      return { ok: true as const, tasks: rows ?? [] };
    }
    if (data.action === "create") {
      const { error } = await db.from("tasks").insert({ ...data.task, sort_order: data.sort_order });
      if (error) throw new Error("Could not save task");
    } else if (data.action === "update") {
      const { error } = await db.from("tasks").update(data.task).eq("id", data.id);
      if (error) throw new Error("Could not save task");
    } else if (data.action === "delete") {
      await db.from("task_logs").delete().eq("task_id", data.id);
      await db.from("tasks").delete().eq("id", data.id);
    } else {
      await Promise.all(data.ids.map((id, i) => db.from("tasks").update({ sort_order: i }).eq("id", id)));
    }
    return { ok: true as const, tasks: [] };
  });
