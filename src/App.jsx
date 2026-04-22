import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThirdwebProvider, useActiveAccount, useSendTransaction } from "thirdweb/react";

import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/neon.css";
import "./styles/hologram.css";

import { CONTRACTS_LIST, NFTS } from "./config";
import { useStaking }   from "./hooks/useStaking";
import { useToken }     from "./hooks/useToken";

import WalletPanel     from "./components/WalletPanel";
import NftCard         from "./components/NftCard";
import NeonButton      from "./components/NeonButton";
import DailyClaimPanel from "./components/DailyClaimPanel";
import RafflePanel     from "./components/RafflePanel";

// ─── Dashboard (needs wallet context) ────────────────────────────────────────
function Dashboard() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx, isPending } = useSendTransaction();
  const { price, change, loading: priceLoading } = useToken();
  const { stakedIds, pending, stake, unstake, claimRewards } = useStaking(account, sendTx);

  const [stakeInput, setStakeInput] = useState("");
  const [filter,     setFilter]     = useState("all");

  const nftsWithState = NFTS.map(n => ({ ...n, staked: stakedIds.includes(n.id.toString()) }));
  const filtered =
    filter === "staked"   ? nftsWithState.filter(n =>  n.staked)
    : filter === "unstaked" ? nftsWithState.filter(n => !n.staked)
    : nftsWithState;

  const toggleNft = (id) =>
    stakedIds.includes(id.toString()) ? unstake(id) : stake([id]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      padding: "24px",
      fontFamily: "var(--font-ui)",
      color: "var(--text-secondary)",
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }}>
            Rocket<span style={{ color: "var(--green)" }}>Moonad</span>
          </div>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "2px", textTransform: "uppercase", marginTop: "3px" }}>
            Moon Rockets Season 1 · Monad Mainnet
          </div>
        </div>
        <WalletPanel />
      </div>

      {/* ── CONTRACT PILLS ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
        {CONTRACTS_LIST.map(({ label, addr }) => (
          <div key={addr} style={{
            background: "var(--bg-panel)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: "8px", padding: "7px 12px",
          }}>
            <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>
              {label}
            </div>
            <div style={{ fontSize: "11px", color: "#666", fontFamily: "var(--font-mono)" }}>
              {addr.slice(0, 6)}…{addr.slice(-4)}
            </div>
          </div>
        ))}
      </div>

      {/* ── PRICE BAR ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        background: "var(--bg-panel)", border: "0.5px solid var(--green-dim)",
        borderRadius: "10px", padding: "10px 16px", marginBottom: "16px",
      }}>
        <span style={{ fontSize: "11px", color: "#444" }}>RMAD / USD · DexScreener</span>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--green)", fontFamily: "var(--font-mono)" }}>
          {priceLoading ? "Loading…" : price}
        </span>
        {change !== null && (
          <span style={{ color: change > 0 ? "var(--green)" : "var(--red)", fontSize: "13px" }}>
            {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% 24h
          </span>
        )}
        <span style={{ fontSize: "10px", color: "#333", marginLeft: "auto" }}>↻ 30s</span>
      </div>

      {/* ── NOT CONNECTED ── */}
      {!account && (
        <motion.p
          style={{
            color: "var(--green)", textAlign: "center",
            fontSize: "20px", marginTop: "100px",
            textShadow: "0 0 20px #00FF88",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Connect your wallet to start staking
        </motion.p>
      )}

      {/* ── CONNECTED ── */}
      {account && (
        <>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
            {[
              { label: "Total NFTs",      value: NFTS.length },
              { label: "Staked",          value: stakedIds.length,              green: true },
              { label: "Pending Rewards", value: `${pending} RMAD`,             green: true },
              { label: "Unstaked",        value: NFTS.length - stakedIds.length },
            ].map(({ label, value, green }) => (
              <div key={label} style={{ background: "var(--bg-panel)", borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "#444", marginBottom: "6px" }}>{label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: green ? "var(--green)" : "var(--text-primary)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Daily Claim */}
          <DailyClaimPanel account={account} sendTx={sendTx} />

          {/* Raffle */}
          <RafflePanel account={account} sendTx={sendTx} />

          {/* Claim staking rewards + Stake by ID */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            {/* Staking rewards */}
            <div style={{
              flex: 1, background: "var(--bg-panel)",
              border: "0.5px solid var(--green-dim)",
              borderRadius: "12px", padding: "16px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px" }}>
                Claim staking rewards
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                    {pending}
                  </div>
                  <div style={{ fontSize: "11px", color: "#444" }}>RMAD</div>
                </div>
                <NeonButton onClick={claimRewards} disabled={isPending}>
                  {isPending ? "…" : "Claim"}
                </NeonButton>
              </div>
            </div>

            {/* Stake by ID */}
            <div style={{
              flex: 1, background: "var(--bg-panel)",
              border: "0.5px solid var(--border-subtle)",
              borderRadius: "12px", padding: "16px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px" }}>
                Stake by token ID
              </div>
              <input
                style={{
                  width: "100%", background: "var(--bg-input)",
                  border: "0.5px solid #2a2a2a", borderRadius: "8px",
                  color: "var(--text-primary)", padding: "8px 10px",
                  fontSize: "13px", marginBottom: "10px",
                  boxSizing: "border-box", outline: "none",
                }}
                placeholder="e.g. 1, 2, 3"
                value={stakeInput}
                onChange={e => setStakeInput(e.target.value)}
              />
              <NeonButton
                onClick={() => {
                  const ids = stakeInput.split(",").map(s => s.trim()).filter(Boolean);
                  if (ids.length) { stake(ids); setStakeInput(""); }
                }}
                disabled={isPending || !stakeInput}
              >
                Stake
              </NeonButton>
            </div>
          </div>

          {/* NFT Grid */}
          <div style={{
            background: "var(--bg-panel)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: "14px", padding: "18px",
          }}>
            {/* Grid header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "16px",
              flexWrap: "wrap", gap: "10px",
            }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                Your NFTs ({filtered.length})
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {["all", "staked", "unstaked"].map(f => (
                  <button
                    key={f} onClick={() => setFilter(f)}
                    style={{
                      background: filter === f ? "#00FF8822" : "transparent",
                      border: `0.5px solid ${filter === f ? "#00FF88" : "#333"}`,
                      color: filter === f ? "#00FF88" : "#555",
                      padding: "5px 12px", borderRadius: "6px", fontSize: "11px",
                      cursor: "pointer", textTransform: "capitalize",
                      fontWeight: filter === f ? "600" : "400",
                      fontFamily: "inherit",
                    }}
                  >
                    {f}
                  </button>
                ))}
                <NeonButton
                  small
                  onClick={() => stake(nftsWithState.filter(n => !n.staked).map(n => n.id))}
                  disabled={isPending}
                >
                  Stake all
                </NeonButton>
                <NeonButton
                  small gray
                  onClick={() => nftsWithState.filter(n => n.staked).forEach(n => unstake(n.id))}
                  disabled={isPending}
                >
                  Unstake all
                </NeonButton>
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "14px" }}>
              <AnimatePresence>
                {filtered.map(n => (
                  <NftCard
                    key={n.id} nft={n} staked={n.staked}
                    price={price} change={change} priceLoading={priceLoading}
                    onToggle={toggleNft} isPending={isPending}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThirdwebProvider>
      <Dashboard />
    </ThirdwebProvider>
  );
}
