/**
 * Returns milliseconds until next Sunday at 23:59:59.
 * If today is Sunday, returns time until end-of-day.
 */
export function msUntilSunday() {
  const now  = new Date();
  const day  = now.getDay(); // 0 = Sun
  const diff = day === 0 ? 0 : 7 - day;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  target.setHours(23, 59, 59, 999);
  return Math.max(0, target - now);
}

/**
 * Format milliseconds → "Xh Ym Zs"
 */
export function formatMs(ms) {
  if (ms <= 0) return "Drawing…";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${h}h ${m}m ${s}s`;
}

/**
 * Monday-indexed day index for today (Mon=0 … Sun=6)
 */
export function todayMonIndex() {
  return (new Date().getDay() + 6) % 7;
}
