import { useState, useEffect } from "react";
import { RMAD_ADDR } from "../config";

/**
 * Polls DexScreener every 30 s for RMAD/USD price and 24h change.
 */
export function useToken() {
  const [price,   setPrice]   = useState(null);
  const [change,  setChange]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      try {
        const res  = await fetch(`https://api.dexscreener.com/token-pairs/v1/monad/${RMAD_ADDR}`);
        const data = await res.json();
        const pair = Array.isArray(data) ? data[0] : data?.pairs?.[0];
        if (pair && !cancelled) {
          setPrice(pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(6)}` : "N/A");
          setChange(pair.priceChange?.h24 ?? null);
        }
      } catch {
        if (!cancelled) setPrice("N/A");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrice();
    const id = setInterval(fetchPrice, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { price, change, loading };
}
