import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function pinOk(pin: string) {
  const expected = process.env["ADMIN_PIN"] || "1234";
  return pin.length === expected.length && pin === expected;
}

const taskFields = z.object({
  emoji: z.string().min(1).max(16),
  title: z.string().trim().min(1).max(100),
  title_ar: z.string().trim().max(100).nullable(),
  recurrence_type: z.enum(["daily", "weekly", "once"]),
  recurrence_days: z.array(z.number().int().min(0).max(6)).max(7),
  once_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
});

const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify"), pin: z.string().max(12) }),
  z.object({ action: z.literal("create"), pin: z.string().max(12), task: taskFields, sort_order: z.number().int() }),
  z.object({ action: z.literal("update"), pin: z.string().max(12), id: z.string().uuid(), task: taskFields }),
  z.object({ action: z.literal("delete"), pin: z.string().max(12), id: z.string().uuid() }),
  z.object({ action: z.literal("reorder"), pin: z.string().max(12), ids: z.array(z.string().uuid()).max(500) }),
]);

export const adminAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    if (!pinOk(data.pin)) return { ok: false as const };
    if (data.action === "verify") return { ok: true as const };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    if (data.action === "create") {
      const { error } = await db.from("tasks").insert({ ...data.task, sort_order: data.sort_order });
      if (error) throw new Error("Could not save task");
    } else if (data.action === "update") {
      const { error } = await db.from("tasks").update(data.task).eq("id", data.id);
      if (error) throw new Error("Could not save task");
    } else if (data.action === "delete") {
      await db.from("tasks").delete().eq("id", data.id);
    } else {
      await Promise.all(data.ids.map((id, i) => db.from("tasks").update({ sort_order: i }).eq("id", id)));
    }
    return { ok: true as const };
  });
