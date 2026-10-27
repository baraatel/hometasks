import { describe, expect, it } from "vitest";
import { isDueOn } from "@/lib/schedule";

const wed = new Date(2026, 9, 28); // Wednesday
const sat = new Date(2026, 9, 31);

describe("schedule", () => {
  it("daily tasks are due every day", () => {
    expect(isDueOn({ recurrence_type: "daily", recurrence_days: [], once_date: null }, sat)).toBe(true);
  });
  it("weekly Sun/Wed laundry is due Wednesday, not Saturday", () => {
    const t = { recurrence_type: "weekly", recurrence_days: [0, 3], once_date: null };
    expect(isDueOn(t, wed)).toBe(true);
    expect(isDueOn(t, sat)).toBe(false);
  });
  it("one-off tasks are due only on their date", () => {
    const t = { recurrence_type: "once", recurrence_days: [], once_date: "2026-10-31" };
    expect(isDueOn(t, sat)).toBe(true);
    expect(isDueOn(t, wed)).toBe(false);
  });
});
