import { useState, useCallback, useEffect } from "react";
import { stakingContract, nftContract } from "../config";

// ── RPC nodes ─────────────────────────────────────────────────────────────────
const MONAD_RPCS = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

const STAKING_ADDR = stakingContract.address;
const NFT_ADDR     = nftContract.address;

// ── Low-level eth_call ────────────────────────────────────────────────────────
async function rpcCall(to, data) {
  for (const rpc of MONAD_RPCS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: 1,
          method: "eth_call",
          params: [{ to, data }, "latest"],
        }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const d = await r.json();
      if (d.result !== undefined && d.result !== "0x") return d.result;
    } catch (_) { clearTimeout(t); }
  }
  return null;
}

// ── ABI encode helpers ────────────────────────────────────────────────────────
function encodeAddr(selector, addr) {
  return selector + "000000000000000000000000" + addr.toLowerCase().replace("0x", "");
}

function encodeUint256Array(selector, ids) {
  const offset = "0000000000000000000000000000000000000000000000000000000000000020";
  const len    = ids.length.toString(16).padStart(64, "0");
  const els    = ids.map(id => BigInt(id).toString(16).padStart(64, "0")).join("");
  return selector + offset + len + els;
}

function encodeUint256(selector, id) {
  return selector + BigInt(id).toString(16).padStart(64, "0");
}

// ── Decode uint256[] return ───────────────────────────────────────────────────
function decodeUint256Array(hex) {
  if (!hex || hex === "0x") return [];
  const d = hex.replace("0x", "");
  const len = parseInt(d.slice(64, 128), 16);
  if (!len || isNaN(len)) return [];
  const result = [];
  for (let i = 0; i < len; i++) {
    const s = 128 + i * 64;
    result.push(BigInt("0x" + d.slice(s, s + 64)).toString());
  }
  return result;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useStaking(account, sendTx) {
  const [stakedIds, setStakedIds] = useState([]);
  const [pending,   setPending]   = useState("0");
  const [loading,   setLoading]   = useState(false);

  // ── READ ──────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      // stakedTokens(address) → 0xb46aba52
      const idsHex = await rpcCall(STAKING_ADDR, encodeAddr("0xb46aba52", account.address));
      setStakedIds(decodeUint256Array(idsHex));

      // pendingRewards(address) → 0xf40f0f52
      const rewHex = await rpcCall(STAKING_ADDR, encodeAddr("0xf40f0f52", account.address));
      const rewBig = rewHex ? BigInt(rewHex) : 0n;
      setPending((Number(rewBig) / 1e18).toFixed(4));
    } catch (e) {
      console.warn("[useStaking] load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { load(); }, [load]);

  // ── Raw sendTx helper — bypasses thirdweb ABI decoder entirely ───────────────
  async function sendRaw(to, data) {
    // thirdweb's useSendTransaction accepts a plain { to, data } object
    return sendTx({ to, data });
  }

  // ── ensureApproval ────────────────────────────────────────────────────────────
  async function ensureApproval() {
    const ownerHex    = account.address.toLowerCase().replace("0x", "").padStart(64, "0");
    const operatorHex = STAKING_ADDR.toLowerCase().replace("0x", "").padStart(64, "0");
    // isApprovedForAll(address,address) → 0xe985e9c5
    const res = await rpcCall(NFT_ADDR, "0xe985e9c5" + ownerHex + operatorHex);
    const approved = res && BigInt(res) === 1n;
    if (!approved) {
      // setApprovalForAll(address,bool) → 0xa22cb465
      const truePadded = "0000000000000000000000000000000000000000000000000000000000000001";
      await sendRaw(NFT_ADDR, "0xa22cb465" + operatorHex + truePadded);
    }
  }

  // ── stake(uint256[]) → 0x0fbf0a93 ────────────────────────────────────────────
  const stake = useCallback(async (ids) => {
    if (!account || !ids.length) return;
    try {
      await ensureApproval();
      await sendRaw(STAKING_ADDR, encodeUint256Array("0x0fbf0a93", ids));
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[stake] error:", e.message);
    }
  }, [sendTx, load, account]);

  // ── unstake(uint256) → 0x2e17de78 ────────────────────────────────────────────
  const unstake = useCallback(async (id) => {
    if (!account) return;
    try {
      await sendRaw(STAKING_ADDR, encodeUint256("0x2e17de78", id));
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[unstake] error:", e.message);
    }
  }, [sendTx, load, account]);

  // ── claimRewards() → 0x372500ab ──────────────────────────────────────────────
  const claimRewards = useCallback(async () => {
    if (!account) return;
    try {
      await sendRaw(STAKING_ADDR, "0x372500ab");
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[claimRewards] error:", e.message);
    }
  }, [sendTx, load, account]);

  return { stakedIds, pending, loading, stake, unstake, claimRewards, reload: load };
}
