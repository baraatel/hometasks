import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LANG_CODES, LANGS } from "./locales";

const input = z.object({
  pin: z.string().max(12),
  base_lang: z.enum(LANG_CODES as [string, ...string[]]),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500),
});

type Out = { ok: true; title: Record<string, string>; description: Record<string, string> } | { ok: false; error: string };

export const autoTranslate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }): Promise<Out> => {
    const { verifyAdminPin } = await import("./auth.server");
    const check = verifyAdminPin(data.pin);
    if (!check.ok) return { ok: false, error: check.locked ? "rate_limited" : "pin" };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "config" };

    const langProps = Object.fromEntries(LANGS.map((l) => [l.code, { type: "string" }]));
    const langObj = { type: "object", properties: langProps, required: LANG_CODES, additionalProperties: false };
    const schema = {
      type: "object",
      properties: { title: langObj, description: langObj },
      required: ["title", "description"],
      additionalProperties: false,
    };
    const list = LANGS.map((l) => `${l.code} = ${l.english}${l.code === "en" ? " (Indian English spelling)" : l.code === "ar" ? " (Modern Standard Arabic)" : ""}`).join(", ");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          `You translate short household chore names and notes for a family chore checklist used by home helpers. ` +
          `Use natural, everyday wording a home helper would understand, not literal word-for-word translation. Keep it short. ` +
          `Keep emojis and numbers. Return every language: ${list}. If the description is empty, return empty strings for description.`,
        input: `Source language: ${data.base_lang}\nTitle: ${data.title}\nDescription: ${data.description || "(empty)"}`,
        text: { format: { type: "json_schema", name: "translations", strict: true, schema } },
      }),
    });
    if (!res.ok || !res.body) {
      console.error("translate failed", res.status, await res.text().catch(() => ""));
      return { ok: false, error: res.status === 402 || res.status === 403 ? "credits" : "failed" };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") return { ok: false, error: "failed" };
        } catch { /* partial */ }
      }
    }
    try {
      const parsed = JSON.parse(text);
      parsed.title[data.base_lang] = data.title;
      if (data.description) parsed.description[data.base_lang] = data.description;
      return { ok: true, title: parsed.title, description: parsed.description };
    } catch {
      return { ok: false, error: "failed" };
    }
  });
