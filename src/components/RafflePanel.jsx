import { useState, useEffect, useCallback } from "react";

const RAFFLE_ADDR = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee";
const MONAD_RPCS  = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

// ── Selectors (keccak256 of sig, first 4 bytes) ───────────────────────────────
// nextRaffleId()           → 0x61d027b3
// raffles(uint256)         → 0x5aea0ec4
// buyTicket(uint256)       → 0x4e4f2c0a   payable

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

async function fetchNextRaffleId() {
  const res = await rpcCall(RAFFLE_ADDR, "0x61d027b3");
  if (!res) return 0;
  return parseInt(res, 16);
}

async function fetchRaffle(id) {
  const padded = id.toString(16).padStart(64, "0");
  const res = await rpcCall(RAFFLE_ADDR, "0x5aea0ec4" + padded);
  if (!res || res.length < 386) return null;
  const d = res.replace("0x", "");
  return {
    id:           parseInt(d.slice(0,   64), 16),
    ticketPrice:  BigInt("0x" + d.slice(64,  128)),
    totalTickets: parseInt(d.slice(128, 192), 16),
    sold:         parseInt(d.slice(192, 256), 16),
    active:       d.slice(256, 320).slice(-1) === "1",
    winner:       "0x" + d.slice(320 + 24, 384),
  };
}

export default function RafflePanel({ account, sendTx }) {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId,  setBusyId]  = useState(null);
  const [msg,     setMsg]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const count = await fetchNextRaffleId();
      if (!count) { setRaffles([]); return; }
      const results = await Promise.all(
        Array.from({ length: count }, (_, i) => fetchRaffle(i).catch(() => null))
      );
      setRaffles(results.filter(r => r?.active));
    } catch (e) {
      console.warn("[RafflePanel] load error (non-fatal):", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleBuy(raffleId, ticketPrice) {
    if (!account || busyId !== null) return;
    setBusyId(raffleId);
    setMsg("");
    try {
      // buyTicket(uint256) = 0x4e4f2c0a
      const data = "0x4e4f2c0a" + raffleId.toString(16).padStart(64, "0");
      await sendTx({
        to:    RAFFLE_ADDR,
        data,
        value: ticketPrice,
      });
      setMsg("🎉 Ticket bought! Good luck!");
      setTimeout(load, 2500);
    } catch (e) {
      console.error("[buyTicket] error:", e.message);
      setMsg("❌ Transaction failed — check your wallet.");
    } finally {
      setBusyId(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "var(--bg-panel)",
      border: "0.5px solid #1a1a2a",
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          🎟 Raffle
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: "transparent", border: "0.5px solid #333",
            borderRadius: 6, padding: "3px 10px", color: "#555",
            fontSize: 10, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {loading ? "…" : "↻ Refresh"}
        </button>
      </div>

      {/* States */}
      {loading && (
        <div style={{ fontSize: 11, color: "#444", padding: "8px 0" }}>Loading raffles…</div>
      )}

      {!loading && raffles.length === 0 && (
        <div style={{ fontSize: 11, color: "#444" }}>No active raffles right now.</div>
      )}

      {/* Raffle cards */}
      {!loading && raffles.map(r => {
        const priceInMon = (Number(r.ticketPrice) / 1e18).toFixed(4);
        const spotsLeft  = r.totalTickets - r.sold;
        const isBusy     = busyId === r.id;
        const soldOut    = spotsLeft <= 0;

        return (
          <div key={r.id} style={{
            background: "#0a0a14",
            border: "0.5px solid #1a1a2a",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
          }}>
            {/* Title row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                Raffle #{r.id}
              </span>
              <span style={{
                fontSize: 9, color: "#00FF88",
                border: "0.5px solid #00FF8833", borderRadius: 4,
                padding: "2px 8px",
              }}>
                ● active
              </span>
            </div>

            {/* Stats grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8, marginBottom: 10,
            }}>
              {[
                ["Price",   `${priceInMon} MON`],
                ["Tickets", `${r.sold} / ${r.totalTickets}`],
                ["Left",    soldOut ? "Sold out" : spotsLeft],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 9, color: "#444", marginBottom: 2 }}>{label}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: label === "Left" && soldOut ? "#ff4444" : "var(--text-primary)",
                    fontFamily: "monospace",
                  }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{
              height: 3, background: "#111", borderRadius: 2,
              overflow: "hidden", marginBottom: 10,
            }}>
              <div style={{
                width: `${Math.min(100, (r.sold / r.totalTickets) * 100)}%`,
                height: "100%",
                background: soldOut
                  ? "linear-gradient(90deg,#ff4444,#ff8888)"
                  : "linear-gradient(90deg,#00FF88,#00c8ff)",
                borderRadius: 2,
                transition: "width .4s",
              }} />
            </div>

            {/* Buy button */}
            {account && !soldOut && (
              <button
                onClick={() => handleBuy(r.id, r.ticketPrice)}
                disabled={isBusy}
                style={{
                  width: "100%", padding: "8px", borderRadius: 8,
                  border: "none", cursor: isBusy ? "not-allowed" : "pointer",
                  background: isBusy ? "rgba(0,255,136,0.05)" : "rgba(0,255,136,0.12)",
                  color: "#00FF88", fontSize: 11, fontWeight: 700,
                  fontFamily: "inherit", opacity: isBusy ? 0.6 : 1,
                }}
              >
                {isBusy ? "Waiting for wallet…" : `🎟 Buy Ticket — ${priceInMon} MON`}
              </button>
            )}

            {account && soldOut && (
              <div style={{ textAlign: "center", fontSize: 11, color: "#ff4444", paddingTop: 4 }}>
                Sold out
              </div>
            )}

            {!account && (
              <div style={{ textAlign: "center", fontSize: 11, color: "#444", paddingTop: 4 }}>
                Connect wallet to buy
              </div>
            )}
          </div>
        );
      })}

      {/* Status message */}
      {msg && (
        <div style={{
          marginTop: 8, padding: "8px 12px", borderRadius: 8,
          background: msg.startsWith("❌") ? "rgba(255,68,68,.08)" : "rgba(0,255,136,.08)",
          border: `0.5px solid ${msg.startsWith("❌") ? "#ff444433" : "#00FF8833"}`,
          fontSize: 11,
          color: msg.startsWith("❌") ? "#ff4444" : "#00FF88",
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}
