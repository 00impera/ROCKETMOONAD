import { useState, useCallback, useEffect } from "react";
import { readContract, prepareContractCall } from "thirdweb";
import { stakingContract } from "../config";

/**
 * All staking read/write logic.
 * Returns staked token IDs, pending rewards, and action functions.
 */
export function useStaking(account, sendTx) {
  const [stakedIds, setStakedIds] = useState([]);
  const [pending,   setPending]   = useState("0");
  const [loading,   setLoading]   = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const ids = await readContract({
        contract: stakingContract,
        method: "function stakedTokens(address) returns (uint256[])",
        params: [account.address],
      });
      setStakedIds(ids.map(id => id.toString()));

      const rew = await readContract({
        contract: stakingContract,
        method: "function pendingRewards(address) returns (uint256)",
        params: [account.address],
      });
      setPending((Number(rew) / 1e18).toFixed(4));
    } catch (e) {
      console.error("[useStaking] load error:", e);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { load(); }, [load]);

  const stake = useCallback(async (ids) => {
    await sendTx(prepareContractCall({
      contract: stakingContract,
      method: "function stake(uint256[])",
      params: [ids.map(BigInt)],
    }));
    load();
  }, [sendTx, load]);

  const unstake = useCallback(async (id) => {
    await sendTx(prepareContractCall({
      contract: stakingContract,
      method: "function unstake(uint256)",
      params: [BigInt(id)],
    }));
    load();
  }, [sendTx, load]);

  const claimRewards = useCallback(async () => {
    await sendTx(prepareContractCall({
      contract: stakingContract,
      method: "function claimRewards()",
      params: [],
    }));
    load();
  }, [sendTx, load]);

  return { stakedIds, pending, loading, stake, unstake, claimRewards, reload: load };
}
