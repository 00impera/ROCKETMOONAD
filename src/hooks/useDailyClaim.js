import { useState, useEffect, useCallback } from "react";
import { prepareContractCall } from "thirdweb";
import { rmadContract } from "../config";
import { playClaim } from "../utils/sound";
import { todayMonIndex } from "../utils/time";

/**
 * Daily free 1 RMAD claim logic.
 * State persisted in localStorage per wallet address.
 */
export function useDailyClaim(account, sendTx) {
  const [claimed,  setClaimed]  = useState({});
  const [msg,      setMsg]      = useState("");
  const [pending,  setPending]  = useState(false);

  // Load saved claims for this wallet
  useEffect(() => {
    if (!account) return;
    try {
      const saved = localStorage.getItem("rmad_claims_" + account.address);
      if (saved) setClaimed(JSON.parse(saved));
    } catch (_) {}
  }, [account]);

  const claimDay = useCallback(async (idx) => {
    if (!account || claimed[idx] || pending) return;
    const isToday = idx === todayMonIndex();
    if (!isToday) return;

    setPending(true);
    setMsg("Claiming…");
    try {
      const tx = prepareContractCall({
        contract: rmadContract,
        method: "function transfer(address,uint256)",
        params: [account.address, BigInt("1000000000000000000")],
      });
      await sendTx(tx);
      playClaim();
      const updated = { ...claimed, [idx]: true };
      setClaimed(updated);
      localStorage.setItem("rmad_claims_" + account.address, JSON.stringify(updated));
      setMsg("✅ 1 RMAD claimed!");
    } catch (e) {
      setMsg("❌ " + (e?.message || "Error"));
    } finally {
      setPending(false);
    }
  }, [account, claimed, pending, sendTx]);

  return { claimed, msg, pending, claimDay, todayIdx: todayMonIndex() };
}
