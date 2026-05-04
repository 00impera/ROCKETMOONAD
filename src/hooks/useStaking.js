import { useState, useCallback, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import { stakingContract, nftContract } from "../config";

const MONAD_RPCS = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

async function rpcCall(to, data) {
  for (const rpc of MONAD_RPCS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const d = await r.json();
      if (d.result !== undefined && d.result !== "0x") return d.result;
    } catch (_) { clearTimeout(t); }
  }
  return null;
}

// ABI-encode a single address param
function encodeAddr(fnSig, addr) {
  const selector = fnSig; // pass pre-computed selector
  return selector + "000000000000000000000000" + addr.toLowerCase().replace("0x", "");
}

// Decode a uint256[] returned by stakedTokens(address)
// ABI layout: offset (32) | length (32) | ...elements (32 each)
function decodeUint256Array(hex) {
  if (!hex || hex === "0x") return [];
  const data = hex.replace("0x", "");
  // slot 0 = offset to array data (always 0x20 = 32 for a single return)
  const len = parseInt(data.slice(64, 128), 16);
  if (!len || isNaN(len)) return [];
  const result = [];
  for (let i = 0; i < len; i++) {
    const start = 128 + i * 64;
    result.push(data.slice(start, start + 64));
  }
  return result.map(h => BigInt("0x" + h).toString());
}

// stakedTokens(address)  → 0xb46aba52 (keccak256 first 4 bytes)
const SEL_STAKED_TOKENS  = "0xb46aba52";
// pendingRewards(address) → 0xf40f0f52
const SEL_PENDING_REWARDS = "0xf40f0f52";
// isApprovedForAll(address,address) → 0xe985e9c5
const SEL_IS_APPROVED    = "0xe985e9c5";

export function useStaking(account, sendTx) {
  const [stakedIds, setStakedIds] = useState([]);
  const [pending,   setPending]   = useState("0");
  const [loading,   setLoading]   = useState(false);

  const stakingAddr = stakingContract.address;
  const nftAddr     = nftContract.address;

  const load = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      // ── stakedTokens(address) ─────────────────────────────────────────────
      const idsHex = await rpcCall(
        stakingAddr,
        encodeAddr(SEL_STAKED_TOKENS, account.address)
      );
      setStakedIds(decodeUint256Array(idsHex));

      // ── pendingRewards(address) ───────────────────────────────────────────
      const rewHex = await rpcCall(
        stakingAddr,
        encodeAddr(SEL_PENDING_REWARDS, account.address)
      );
      const rewBig = rewHex ? BigInt(rewHex) : 0n;
      setPending((Number(rewBig) / 1e18).toFixed(4));
    } catch (e) {
      console.warn("[useStaking] load error (non-fatal):", e.message);
    } finally {
      setLoading(false);
    }
  }, [account, stakingAddr]);

  useEffect(() => { load(); }, [load]);

  // ── ensureApproval ──────────────────────────────────────────────────────────
  async function ensureApproval() {
    // isApprovedForAll(owner, operator) — two address params
    const ownerHex    = account.address.toLowerCase().replace("0x", "").padStart(64, "0");
    const operatorHex = stakingAddr.toLowerCase().replace("0x", "").padStart(64, "0");
    const res = await rpcCall(nftAddr, SEL_IS_APPROVED + ownerHex + operatorHex);
    const approved = res && BigInt(res) === 1n;
    if (!approved) {
      await sendTx(prepareContractCall({
        contract: nftContract,
        method: "function setApprovalForAll(address,bool)",
        params: [stakingAddr, true],
      }));
    }
  }

  // ── stake ───────────────────────────────────────────────────────────────────
  const stake = useCallback(async (ids) => {
    if (!account || !ids.length) return;
    try {
      await ensureApproval();
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function stake(uint256[])",
        params: [ids.map(BigInt)],
      }));
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[stake] error:", e.message);
    }
  }, [sendTx, load, account]);

  // ── unstake ─────────────────────────────────────────────────────────────────
  const unstake = useCallback(async (id) => {
    if (!account) return;
    try {
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function unstake(uint256)",
        params: [BigInt(id)],
      }));
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[unstake] error:", e.message);
    }
  }, [sendTx, load, account]);

  // ── claimRewards ────────────────────────────────────────────────────────────
  const claimRewards = useCallback(async () => {
    if (!account) return;
    try {
      await sendTx(prepareContractCall({
        contract: stakingContract,
        method: "function claimRewards()",
        params: [],
      }));
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[claimRewards] error:", e.message);
    }
  }, [sendTx, load, account]);

  return { stakedIds, pending, loading, stake, unstake, claimRewards, reload: load };
}
