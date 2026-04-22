/** Shorten 0x address → 0x1234…abcd */
export const shortAddr = (addr = "") =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

/** wei (BigInt | string | number) → human-readable RMAD string */
export const fromWei = (wei, decimals = 4) =>
  (Number(BigInt(wei)) / 1e18).toFixed(decimals);

/** Format large numbers with locale separators */
export const fmt = (n, decimals = 2) =>
  Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals });
