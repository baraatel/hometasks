import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetPinRateLimit, verifyAdminPin } from "@/lib/auth.server";

describe("admin PIN authentication & rate limiting", () => {
  const prevPin = process.env["ADMIN_PIN"];

  beforeEach(() => {
    delete process.env["ADMIN_PIN"];
    resetPinRateLimit();
  });

  afterEach(() => {
    if (prevPin === undefined) delete process.env["ADMIN_PIN"];
    else process.env["ADMIN_PIN"] = prevPin;
    resetPinRateLimit();
  });

  it("accepts the configured default PIN 8427 and rejects wrong or empty PINs", () => {
    expect(verifyAdminPin("8427", "test-1")).toEqual({ ok: true, locked: false });
    expect(verifyAdminPin("0000", "test-1")).toEqual({ ok: false, locked: false });
    expect(verifyAdminPin("", "test-1")).toEqual({ ok: false, locked: false });
  });

  it("respects ADMIN_PIN environment variable override", () => {
    process.env["ADMIN_PIN"] = "9135";
    expect(verifyAdminPin("8427", "env-test").ok).toBe(false);
    expect(verifyAdminPin("9135", "env-test").ok).toBe(true);
  });

  it("locks out after 5 failed attempts and recovers once the lockout expires", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 4; i++) {
      const r = verifyAdminPin("1111", "brute", t0 + i * 100);
      expect(r.ok).toBe(false);
      expect(r.locked).toBe(false);
    }
    // 5th failure triggers lockout
    const lockedRes = verifyAdminPin("1111", "brute", t0 + 500);
    expect(lockedRes.ok).toBe(false);
    expect(lockedRes.locked).toBe(true);
    if (!lockedRes.ok) expect(lockedRes.retryAfterSec).toBeGreaterThan(0);

    // Even the correct PIN is rejected while locked
    const duringLock = verifyAdminPin("8427", "brute", t0 + 10_000);
    expect(duringLock.ok).toBe(false);
    expect(duringLock.locked).toBe(true);

    // After 61 seconds, lockout lifts and valid PIN succeeds
    const afterLock = verifyAdminPin("8427", "brute", t0 + 61_000);
    expect(afterLock).toEqual({ ok: true, locked: false });
  });
});

