import { useState, useEffect, useRef } from "react";
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

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const RMAD_PAIR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418"; // RMAD/WMON pair
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";
const DAPP_URL     = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL      = `https://dexscreener.com/monad/${RMAD_PAIR}`;
const MONAD_RPCS   = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

// ─── ON-CHAIN HELPERS ─────────────────────────────────────────────────────────
async function rpcFetch(method, params) {
  for (const rpc of MONAD_RPCS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const d = await r.json();
      if (d.result !== undefined) return d.result;
    } catch (e) { clearTimeout(t); }
  }
  return null;
}

async function fetchPairReserves(pairAddr) {
  try {
    const res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0902f1ac" }, "latest"]);
    if (!res || res === "0x" || res.length < 130) return null;
    const r0 = BigInt("0x" + res.slice(2, 66));
    const r1 = BigInt("0x" + res.slice(66, 130));
    if (r0 === 0n || r1 === 0n) return null;
    return { r0, r1 };
  } catch (_) { return null; }
}

// Determine token order in pair: RMAD vs WMON by address comparison
function calcRmadPrice(r0, r1) {
  // token0 is the lower address
  const rmadIsToken0 = RMAD_ADDR.toLowerCase() < WMON_ADDR.toLowerCase();
  // price = WMON / RMAD (how much WMON per 1 RMAD)
  if (rmadIsToken0) {
    return Number((r1 * 1000000n) / r0) / 1000000;
  } else {
    return Number((r0 * 1000000n) / r1) / 1000000;
  }
}

// ─── AD BANNER ───────────────────────────────────────────────────────────────
const RMAD_AD_LINKS = [
  { label: "Telegram",    sub: "@Rocket_Moonad_bot", url: "https://t.me/Rocket_Moonad_bot",                                                        color: "#00c8ff" },
  { label: "Discord",     sub: "Join Server",         url: "https://discord.com/channels/1316093079090106472",                                      color: "#5865f2" },
  { label: "Twitter / X", sub: "@bnbgold277983",      url: "https://twitter.com/bnbgold277983",                                                    color: "#e0e0ff" },
  { label: "MonadVision", sub: "RMAD Holders",        url: "https://monadvision.com/token/0x9a440Afaa434cDd19234e58798DeFA0E71be0A67?tab=Holders",  color: "#836ef9" },
  { label: "DexScreener", sub: "RMAD/WMON Pair",      url: DEX_URL,                                                                                color: "#00FF88" },
  { label: "Moon Rockets",sub: "Season 1 · Monad",    url: DAPP_URL,                                                                               color: "#a78bfa" },
];

function AdBanner() {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const rafRef   = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.innerHTML += track.innerHTML;
    function animate() {
      posRef.current -= 0.5;
      if (Math.abs(posRef.current) >= track.scrollWidth / 2) posRef.current = 0;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ width: "100%", background: "rgba(4,4,12,0.98)", overflow: "hidden" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg,#836ef9,#00c8ff,#00FF88,#5865f2,#836ef9)", backgroundSize: "300% 100%", animation: "bannerGlow 4s linear infinite" }} />
      <div style={{ overflow: "hidden", padding: "7px 0" }}>
        <div ref={trackRef} style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", willChange: "transform" }}>
          {RMAD_AD_LINKS.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 32px", textDecoration: "none", borderRight: "1px solid rgba(131,110,249,0.1)", transition: "background 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.background = item.color + "14"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: item.color, letterSpacing: 1, fontFamily: "monospace", textTransform: "uppercase", textShadow: `0 0 8px ${item.color}` }}>{item.label}</span>
                <span style={{ fontSize: 9, color: "#444", letterSpacing: .5, fontFamily: "monospace" }}>{item.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div style={{ height: 2, background: "linear-gradient(90deg,#5865f2,#00FF88,#00c8ff,#836ef9)", backgroundSize: "300% 100%", animation: "bannerGlow 4s linear infinite reverse" }} />
    </div>
  );
}

// ─── LIVE DEX PRICE HOOK ──────────────────────────────────────────────────────
function useLiveDexPrice() {
  const [dexPrice,   setDexPrice]   = useState(null);
  const [dexChange,  setDexChange]  = useState(null);
  const [dexLoading, setDexLoading] = useState(true);
  const prevRef = useRef(null);

  async function load() {
    const data = await fetchPairReserves(RMAD_PAIR);
    if (!data) { setDexLoading(false); return; }
    const price = calcRmadPrice(data.r0, data.r1);
    if (prevRef.current !== null) {
      setDexChange(((price - prevRef.current) / prevRef.current) * 100);
    }
    prevRef.current = price;
    setDexPrice(price);
    setDexLoading(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return { dexPrice, dexChange, dexLoading };
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx, isPending } = useSendTransaction();

  // Existing token hook (DexScreener API)
  const { price, change, loading: priceLoading } = useToken();

  // New on-chain DEX price
  const { dexPrice, dexChange, dexLoading } = useLiveDexPrice();

  const { stakedIds, pending, stake, unstake, claimRewards } = useStaking(account, sendTx);
  const [filter, setFilter] = useState("all");

  const nftsWithState = NFTS.map(n => ({ ...n, staked: stakedIds.includes(n.id.toString()) }));
  const filtered =
    filter === "staked"   ? nftsWithState.filter(n =>  n.staked)
    : filter === "unstaked" ? nftsWithState.filter(n => !n.staked)
    : nftsWithState;

  const toggleNft = (id) =>
    stakedIds.includes(id.toString()) ? unstake(id) : stake([id]);

  // Format price
  const fmtPrice = (p) => p !== null ? `$${p.toFixed(8)}` : "—";
  const fmtChange = (c) => c !== null ? `${c > 0 ? "▲" : "▼"} ${Math.abs(c).toFixed(2)}%` : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", padding: "24px", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>

      <style>{`
        @keyframes bannerGlow { 0%{background-position:0% 0%} 100%{background-position:300% 0%} }
        @keyframes pricePulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      <AdBanner />

      {/* HEADER */}
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

      {/* CONTRACT PILLS */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
        {CONTRACTS_LIST.map(({ label, addr }) => (
          <div key={addr} style={{ background: "var(--bg-panel)", border: "0.5px solid var(--border-subtle)", borderRadius: "8px", padding: "7px 12px" }}>
            <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "11px", color: "#666", fontFamily: "var(--font-mono)" }}>{addr.slice(0, 6)}…{addr.slice(-4)}</div>
          </div>
        ))}
      </div>

      {/* PRICE BAR — dual source */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>

        {/* On-chain DEX price */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-panel)", border: "0.5px solid var(--green-dim)", borderRadius: "10px", padding: "10px 16px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>RMAD / WMON · On-Chain</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--green)", fontFamily: "var(--font-mono)", animation: dexLoading ? "pricePulse 1.5s infinite" : "none" }}>
                {dexLoading ? "Loading…" : dexPrice !== null ? dexPrice.toFixed(8) + " WMON" : "No liquidity"}
              </span>
              {dexChange !== null && (
                <span style={{ color: dexChange > 0 ? "var(--green)" : "var(--red)", fontSize: "12px" }}>
                  {fmtChange(dexChange)}
                </span>
              )}
            </div>
          </div>
          <a href={DEX_URL} target="_blank" rel="noreferrer"
            style={{ marginLeft: "auto", fontSize: "10px", color: "#00FF88", border: "0.5px solid #00FF8844", borderRadius: "6px", padding: "4px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>
            📊 Chart
          </a>
          <span style={{ fontSize: "10px", color: "#333" }}>↻ 30s</span>
        </div>

        {/* DexScreener USD price */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-panel)", border: "0.5px solid var(--green-dim)", borderRadius: "10px", padding: "10px 16px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>RMAD / USD · DexScreener</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                {priceLoading ? "Loading…" : price}
              </span>
              {change !== null && (
                <span style={{ color: change > 0 ? "var(--green)" : "var(--red)", fontSize: "13px" }}>
                  {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% 24h
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: "10px", color: "#333", marginLeft: "auto" }}>↻ 30s</span>
        </div>

      </div>

      {/* NOT CONNECTED */}
      {!account && (
        <motion.p
          style={{ color: "var(--green)", textAlign: "center", fontSize: "20px", marginTop: "100px", textShadow: "0 0 20px #00FF88" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Connect your wallet to start staking
        </motion.p>
      )}

      {/* CONNECTED */}
      {account && (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
            {[
              { label: "Total NFTs",      value: NFTS.length },
              { label: "Staked",          value: stakedIds.length,              green: true },
              { label: "Pending Rewards", value: `${pending} RMAD`,             green: true },
              { label: "Unstaked",        value: NFTS.length - stakedIds.length },
            ].map(({ label, value, green }) => (
              <div key={label} style={{ background: "var(--bg-panel)", borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "#444", marginBottom: "6px" }}>{label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: green ? "var(--green)" : "var(--text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>

          <DailyClaimPanel account={account} sendTx={sendTx} />
          <RafflePanel account={account} sendTx={sendTx} />

          {/* Claim rewards */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ background: "var(--bg-panel)", border: "0.5px solid var(--green-dim)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px" }}>Claim staking rewards</div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--green)", fontFamily: "var(--font-mono)" }}>{pending}</div>
                  <div style={{ fontSize: "11px", color: "#444" }}>RMAD</div>
                </div>
                <NeonButton onClick={claimRewards} disabled={isPending}>
                  {isPending ? "…" : "Claim"}
                </NeonButton>
              </div>
            </div>
          </div>

          {/* NFT Grid */}
          <div style={{ background: "var(--bg-panel)", border: "0.5px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>Your NFTs ({filtered.length})</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {["all", "staked", "unstaked"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    background: filter === f ? "#00FF8822" : "transparent",
                    border: `0.5px solid ${filter === f ? "#00FF88" : "#333"}`,
                    color: filter === f ? "#00FF88" : "#555",
                    padding: "5px 12px", borderRadius: "6px", fontSize: "11px",
                    cursor: "pointer", textTransform: "capitalize",
                    fontWeight: filter === f ? "600" : "400", fontFamily: "inherit",
                  }}>
                    {f}
                  </button>
                ))}
                <NeonButton small onClick={() => stake(nftsWithState.filter(n => !n.staked).map(n => n.id))} disabled={isPending}>
                  Stake all
                </NeonButton>
                <NeonButton small gray onClick={() => nftsWithState.filter(n => n.staked).forEach(n => unstake(n.id))} disabled={isPending}>
                  Unstake all
                </NeonButton>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "14px" }}>
              <AnimatePresence>
                {filtered.map(n => (
                  <NftCard key={n.id} nft={n} staked={n.staked} price={price} change={change} priceLoading={priceLoading} onToggle={toggleNft} isPending={isPending} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThirdwebProvider>
      <Dashboard />
    </ThirdwebProvider>
  );
}
