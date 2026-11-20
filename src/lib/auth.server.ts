import { createHash, timingSafeEqual } from "node:crypto";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const LOCKOUT_MS = 60_000;

interface AttemptRecord {
  count: number;
  windowStart: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptRecord>();

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export type PinCheckResult =
  | { ok: true; locked: false }
  | { ok: false; locked: boolean; retryAfterSec?: number };

/**
 * Constant-time admin PIN check with sliding-window rate limiting to prevent
 * brute-force enumeration of the 4-digit household PIN.
 */
export function verifyAdminPin(pin: string, clientKey = "global", now = Date.now()): PinCheckResult {
  const rec = attempts.get(clientKey);
  if (rec && rec.lockedUntil > now) {
    return { ok: false, locked: true, retryAfterSec: Math.ceil((rec.lockedUntil - now) / 1000) };
  }

  const expected = process.env["ADMIN_PIN"]?.trim();
  if (!expected) {
    return { ok: false, locked: false };
  }
  const matched = pin.length > 0 && timingSafeEqual(sha256(pin), sha256(expected));

  if (matched) {
    attempts.delete(clientKey);
    return { ok: true, locked: false };
  }

  const freshWindow = !rec || now - rec.windowStart > WINDOW_MS;
  const count = freshWindow ? 1 : rec.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;

  attempts.set(clientKey, {
    count,
    windowStart: freshWindow ? now : rec.windowStart,
    lockedUntil,
  });

  if (lockedUntil > now) {
    return { ok: false, locked: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
  }
  return { ok: false, locked: false };
}

export function resetPinRateLimit() {
  attempts.clear();
}

