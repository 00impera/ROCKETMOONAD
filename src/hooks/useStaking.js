import { useState, useCallback, useEffect } from "react";
import { readContract, prepareContractCall } from "thirdweb";
import { stakingContract, nftContract } from "../config";

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

  async function ensureApproval() {
    const approved = await readContract({
      contract: nftContract,
      method: "function isApprovedForAll(address,address) returns (bool)",
      params: [account.address, stakingContract.address],
    });
    if (!approved) {
      await sendTx(prepareContractCall({
        contract: nftContract,
        method: "function setApprovalForAll(address,bool)",
        params: [stakingContract.address, true],
      }));
    }
  }

  const stake = useCallback(async (ids) => {
    if (!account || !ids.length) return;
    try {
      await ensureApproval();
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function stake(uint256[])",
        params: [ids.map(BigInt)],
      }));
      setTimeout(load, 2000);
    } catch (e) {
      console.error("[stake] error:", e);
    }
  }, [sendTx, load, account]);

  const unstake = useCallback(async (id) => {
    if (!account) return;
    try {
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function unstake(uint256)",
        params: [BigInt(id)],
      }));
      setTimeout(load, 2000);
    } catch (e) {
      console.error("[unstake] error:", e);
    }
  }, [sendTx, load, account]);

  const claimRewards = useCallback(async () => {
    if (!account) return;
    try {
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function claimRewards()",
        params: [],
      }));
      setTimeout(load, 2000);
    } catch (e) {
      console.error("[claimRewards] error:", e);
    }
  }, [sendTx, load, account]);

  return { stakedIds, pending, loading, stake, unstake, claimRewards, reload: load };
}
