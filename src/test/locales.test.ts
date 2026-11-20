import { describe, expect, it } from "vitest";
import { BUNDLES, LANGS, LANG_CODES, flatDict, isLang, langMeta, pickText } from "@/lib/locales";
import { timeBucket } from "@/lib/schedule";
import { fmtTime } from "@/lib/tasks";

describe("locales & i18n integrity", () => {
  it("supports all 9 required target locales with accurate text direction", () => {
    expect(LANG_CODES).toEqual(["en", "ar", "hi", "fil", "ne", "si", "ta", "ur", "bn"]);
    for (const l of LANGS) {
      if (l.code === "ar" || l.code === "ur") {
        expect(l.dir).toBe("rtl");
      } else {
        expect(l.dir).toBe("ltr");
      }
      expect(isLang(l.code)).toBe(true);
    }
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });

  it("maintains 100% key parity and non-empty values across all 9 locale files", () => {
    const en = BUNDLES.en;
    const enSections = Object.keys(en).sort();

    for (const code of LANG_CODES) {
      const bundle = BUNDLES[code];
      expect(Object.keys(bundle).sort(), `sections mismatch in ${code}.json`).toEqual(enSections);

      for (const sec of enSections as (keyof typeof en)[]) {
        const enKeys = Object.keys(en[sec]).sort();
        const curSec = bundle[sec] as Record<string, unknown>;
        expect(Object.keys(curSec).sort(), `keys mismatch in ${code}.json -> ${sec}`).toEqual(enKeys);

        for (const k of enKeys) {
          const val = curSec[k];
          if (Array.isArray(val)) {
            expect(val.length, `${code}.${sec}.${k} must have 7 day names`).toBe(7);
            for (const day of val) expect(String(day).trim().length).toBeGreaterThan(0);
          } else {
            expect(typeof val).toBe("string");
            expect((val as string).trim().length, `empty string at ${code}.${sec}.${k}`).toBeGreaterThan(0);
          }
        }
      }

      // Flattened dictionary contains new features (kiosk, TTS, emoji categories, time buckets)
      const dict = flatDict(code);
      expect(dict.kioskMode).toBeTruthy();
      expect(dict.speak).toBeTruthy();
      expect(dict.catCleaning).toBeTruthy();
      expect(dict.morning).toBeTruthy();
      expect(dict.tooManyAttempts).toBeTruthy();
    }
  });

  it("resolves user-generated text via the full fallback chain", () => {
    const map = {
      ar: "تنظيف المطبخ",
      en: "Clean the kitchen",
      ur: "   ",
    };
    expect(pickText(map, "ar", "ar")).toBe("تنظيف المطبخ");
    expect(pickText(map, "en", "ar")).toBe("Clean the kitchen");
    // Blank Urdu entry falls back to base_lang ('ar')
    expect(pickText(map, "ur", "ar")).toBe("تنظيف المطبخ");
    // Missing Hindi entry falls back to base_lang ('ar')
    expect(pickText(map, "hi", "ar")).toBe("تنظيف المطبخ");
    // Missing both target & base_lang falls back to 'en'
    expect(pickText({ en: "Laundry" }, "fil", "ne")).toBe("Laundry");
    // Missing target, base_lang, and 'en' falls back to first non-empty entry
    expect(pickText({ fil: "Dilig ng Halaman" }, "ta", "ne")).toBe("Dilig ng Halaman");
    // Completely empty map uses explicit fallback string
    expect(pickText({}, "en", "en", "Default")).toBe("Default");
  });

  it("groups scheduled times into morning, afternoon, evening, and anytime", () => {
    expect(timeBucket("08:30:00")).toBe("morning");
    expect(timeBucket("11:59")).toBe("morning");
    expect(timeBucket("12:00")).toBe("afternoon");
    expect(timeBucket("16:45")).toBe("afternoon");
    expect(timeBucket("17:00")).toBe("evening");
    expect(timeBucket("21:15")).toBe("evening");
    expect(timeBucket(null)).toBe("anytime");
    expect(timeBucket(undefined)).toBe("anytime");
  });

  it("formats chore times for different locales", () => {
    expect(fmtTime(null, "en")).toBeNull();
    expect(fmtTime("09:00:00", "en")).toBeTruthy();
    expect(fmtTime("17:30", "ar")).toBeTruthy();
    expect(langMeta("ur").intl).toBe("ur-PK");
  });
});

