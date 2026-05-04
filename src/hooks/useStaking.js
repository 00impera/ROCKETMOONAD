import { useState, useCallback, useEffect } from "react";
import { prepareTransaction } from "thirdweb";
import { stakingContract, nftContract, monad, client } from "../config";

const MONAD_RPCS   = ["https://rpc.monad.xyz", "https://monad.drpc.org"];
const STAKING_ADDR = stakingContract.address;
const NFT_ADDR     = nftContract.address;

// ── eth_call ──────────────────────────────────────────────────────────────────
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

// ── Encode helpers ────────────────────────────────────────────────────────────
function encodeAddr(sel, addr) {
  return sel + "000000000000000000000000" + addr.toLowerCase().replace("0x", "");
}
function encodeUint256(sel, id) {
  return sel + BigInt(id).toString(16).padStart(64, "0");
}
function encodeUint256Array(sel, ids) {
  const offset = "0000000000000000000000000000000000000000000000000000000000000020";
  const len    = ids.length.toString(16).padStart(64, "0");
  const els    = ids.map(id => BigInt(id).toString(16).padStart(64, "0")).join("");
  return sel + offset + len + els;
}
function decodeUint256Array(hex) {
  if (!hex || hex === "0x") return [];
  const d   = hex.replace("0x", "");
  const len = parseInt(d.slice(64, 128), 16);
  if (!len || isNaN(len)) return [];
  return Array.from({ length: len }, (_, i) => {
    const s = 128 + i * 64;
    return BigInt("0x" + d.slice(s, s + 64)).toString();
  });
}

// ── Build a thirdweb transaction from raw calldata ────────────────────────────
// prepareTransaction accepts { to, data, chain, client } and does NOT run ABI decode
function rawTx(to, data) {
  return prepareTransaction({ to, data, chain: monad, client });
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useStaking(account, sendTx) {
  const [stakedIds, setStakedIds] = useState([]);
  const [pending,   setPending]   = useState("0");
  const [loading,   setLoading]   = useState(false);

  const load = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      const idsHex = await rpcCall(STAKING_ADDR, encodeAddr("0xb46aba52", account.address));
      setStakedIds(decodeUint256Array(idsHex));
      const rewHex = await rpcCall(STAKING_ADDR, encodeAddr("0xf40f0f52", account.address));
      setPending(rewHex ? (Number(BigInt(rewHex)) / 1e18).toFixed(4) : "0");
    } catch (e) {
      console.warn("[useStaking] load:", e.message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { load(); }, [load]);

  async function ensureApproval() {
    const ownerHex    = account.address.toLowerCase().replace("0x", "").padStart(64, "0");
    const operatorHex = STAKING_ADDR.toLowerCase().replace("0x", "").padStart(64, "0");
    const res = await rpcCall(NFT_ADDR, "0xe985e9c5" + ownerHex + operatorHex);
    if (!res || BigInt(res) !== 1n) {
      const truePadded = "0000000000000000000000000000000000000000000000000000000000000001";
      await sendTx(rawTx(NFT_ADDR, "0xa22cb465" + operatorHex + truePadded));
    }
  }

  const stake = useCallback(async (ids) => {
    if (!account || !ids.length) return;
    try {
      await ensureApproval();
      await sendTx(rawTx(STAKING_ADDR, encodeUint256Array("0x0fbf0a93", ids)));
      setTimeout(load, 2500);
    } catch (e) { console.error("[stake]", e.message); }
  }, [sendTx, load, account]);

  const unstake = useCallback(async (id) => {
    if (!account) return;
    try {
      await sendTx(rawTx(STAKING_ADDR, encodeUint256("0x2e17de78", id)));
      setTimeout(load, 2500);
    } catch (e) { console.error("[unstake]", e.message); }
  }, [sendTx, load, account]);

  const claimRewards = useCallback(async () => {
    if (!account) return;
    try {
      await sendTx(rawTx(STAKING_ADDR, "0x372500ab"));
      setTimeout(load, 2500);
    } catch (e) { console.error("[claimRewards]", e.message); }
  }, [sendTx, load, account]);

  return { stakedIds, pending, loading, stake, unstake, claimRewards, reload: load };
}
