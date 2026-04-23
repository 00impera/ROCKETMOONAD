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
const RMAD_PAIR    = "0x754704bc059f8c67012fed69bc8a327a5aafb603"; // RMAD/WMON pair
const NFT_ADDR     = "0x45336C2E15F2fe58c67Ee4035a520231b2751669"; // NFT contract (ERC-721)
const STAKING_ADDR = "0xec5773F31CA0F4012624392243E0B6517B518976"; // Staking (MODEL D)
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67"; // RMAD Token (ERC-20)
const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1"; // Oracle (PriceFeed)
const RAFFLE_ADDR  = "0xbcc94553Cb4facD17f209FDda4a54012Be616Cfc"; // Raffle (VRF Fake)
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";
const DAPP_URL     = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL      = `https://dexscreener.com/monad/${RMAD_PAIR}`;
const MONAD_RPCS   = ["https://rpc.monad.xyz", "https://monad.drpc.org"];
const DS_API       = "https://api.dexscreener.com/latest/dex/pairs/monad";

// ─── EUROSPACE DEX PAIRS ─────────────────────────────────────────────────────
const DEX_PAIRS = [
  { symbol:"EURO",   name:"Meta EuroCoin",  color:"#00ff88", img:"https://files.catbox.moe/9o0wad.png", pair:"0x9E32FdD909a5BdcCfb874DEE72F24169AfE4eC02" },
  { symbol:"mBTC",   name:"Meta Bitcoin",   color:"#F7931A", img:"", pair:"0x47Dc73D3e1C520056AdF52349A6A282e5262D56d" },
  { symbol:"mETH",   name:"Meta Ethereum",  color:"#627EEA", img:"", pair:"0xDE92BC23146222B86e638B6E88E23917eD378a6E" },
  { symbol:"mSOL",   name:"Meta Solana",    color:"#9945FF", img:"", pair:"0xf8dbc8Cc478506fb0844C670B35b90A7AD6Ad912" },
  { symbol:"mBNB",   name:"Meta BNB",       color:"#F3BA2F", img:"", pair:"0xd77B55A199EA0DC81EB4c7c36d45fBda4D6477B6" },
  { symbol:"mXRP",   name:"Meta XRP",       color:"#00AAE4", img:"", pair:"0x69884c6C8Fe6F833aEEDE2A4c0949e667C7F79fB" },
  { symbol:"mUSDC",  name:"Meta USDC",      color:"#2775CA", img:"", pair:"0x3BE5B19348d6Ccbc20e0DCF3Cab0aDF9e4643dCa" },
  { symbol:"mUSDT",  name:"Meta Tether",    color:"#26A17B", img:"", pair:"0xAB4CFB051E73db47f75c4A2c31dFaAFd3A82A8b8" },
  { symbol:"mMATIC", name:"Meta Polygon",   color:"#8247E5", img:"", pair:"0x5F5908aD27AFf28b0BDbAD8F93470e83310aE365" },
  { symbol:"mDOGE",  name:"Meta Dogecoin",  color:"#C2A633", img:"", pair:"0x8e71b96897c6D5EF3954b06636c24EdB4866b488" },
  { symbol:"mLTC",   name:"Meta Litecoin",  color:"#a8a8a8", img:"", pair:"0xd4faf6a3B43105395C1f3db6525eA0fBF5B3aF9a" },
  { symbol:"mTRX",   name:"Meta TRON",      color:"#EF4444", img:"", pair:"0x77A4Ad2ac41775A543353C8255cd88C7bF58e404" },
  { symbol:"mBASE",  name:"Meta Base",      color:"#2563eb", img:"", pair:"0x9f1b9A6D727DF983a74F11252EDa0Fa96132cc12" },
  { symbol:"mEURO",  name:"Meta Euro",      color:"#3b82f6", img:"", pair:"0x2f3B240444F5b8Dc6f211373ff29CCE0Ba798114" },
  { symbol:"mMONAD", name:"Meta Monad",     color:"#836EF9", img:"", pair:"0xc7a8f6A2452D1ec709006E36A3B89f4Df7188a9a" },
  { symbol:"mEURC",  name:"Meta EURC",      color:"#FFD700", img:"", pair:"0x669d78953a14a147DA6730dA255b4E7A7b15b111" },
  { symbol:"mCRO",   name:"Meta Cronos",    color:"#60a5fa", img:"", pair:"0x7D9e8050Ba0c0a6c8336A49a5Af6748AA6BD855C" },
];

// ─── ON-CHAIN RPC HELPERS ─────────────────────────────────────────────────────
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

async function fetchToken0(pairAddr) {
  try {
    const res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0dfe1681" }, "latest"]);
    if (!res || res === "0x" || res.length < 66) return null;
    return ("0x" + res.slice(26)).toLowerCase();
  } catch (_) { return null; }
}

function calcRmadPrice(r0, r1, token0Addr) {
  const rmadIsToken0 = token0Addr
    ? token0Addr === RMAD_ADDR.toLowerCase()
    : RMAD_ADDR.toLowerCase() < WMON_ADDR.toLowerCase();
  if (rmadIsToken0) return Number((r1 * 1_000_000_000_000n) / r0) / 1_000_000_000_000;
  return Number((r0 * 1_000_000_000_000n) / r1) / 1_000_000_000_000;
}

// ─── DEXSCREENER API — batch fetch all pairs ──────────────────────────────────
async function fetchDexScreenerPairs(pairAddresses) {
  try {
    const CHUNK = 30;
    const results = {};
    for (let i = 0; i < pairAddresses.length; i += CHUNK) {
      const chunk = pairAddresses.slice(i, i + CHUNK);
      const url   = `${DS_API}/${chunk.join(",")}`;
      const r = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (!Array.isArray(d.pairs)) continue;
      for (const p of d.pairs) {
        const addr = p.pairAddress?.toLowerCase();
        if (!addr) continue;
        results[addr] = {
          priceNative : parseFloat(p.priceNative) || 0,
          priceUsd    : parseFloat(p.priceUsd)    || 0,
          change24h   : p.priceChange?.h24  ?? null,
          change1h    : p.priceChange?.h1   ?? null,
          volume24h   : p.volume?.h24       ?? 0,
          liquidity   : p.liquidity?.usd    ?? 0,
          baseSymbol  : p.baseToken?.symbol ?? "",
          quoteSymbol : p.quoteToken?.symbol ?? "",
        };
      }
    }
    return results;
  } catch (e) {
    console.error("DexScreener API error:", e);
    return {};
  }
}

// ─── AD BANNER ───────────────────────────────────────────────────────────────
const MONAD_URL = `https://monadvision.com/token/${RMAD_ADDR}?tab=Holders`;

const RMAD_AD_LINKS = [
  { label:"Telegram",    sub:"@Rocket_Moonad_bot", url:"https://t.me/Rocket_Moonad_bot",  color:"#00c8ff" },
  { label:"Discord",     sub:"Join Server",         url:"https://discord.com/channels/1316093079090106472", color:"#5865f2" },
  { label:"Twitter / X", sub:"@bnbgold277983",      url:"https://twitter.com/bnbgold277983", color:"#e0e0ff" },
  { label:"MonadVision", sub:"RMAD Holders",        url:MONAD_URL,                         color:"#836ef9" },
  { label:"DexScreener", sub:"RMAD/WMON Pair",      url:DEX_URL,                           color:"#00FF88" },
  { label:"Moon Rockets",sub:"Season 1 · Monad",    url:DAPP_URL,                          color:"#a78bfa" },
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
    <div style={{ width:"100%", background:"rgba(4,4,12,0.98)", overflow:"hidden" }}>
      <div style={{ height:2, background:"linear-gradient(90deg,#836ef9,#00c8ff,#00FF88,#5865f2,#836ef9)", backgroundSize:"300% 100%", animation:"bannerGlow 4s linear infinite" }} />
      <div style={{ overflow:"hidden", padding:"7px 0" }}>
        <div ref={trackRef} style={{ display:"flex", alignItems:"center", whiteSpace:"nowrap", willChange:"transform" }}>
          {RMAD_AD_LINKS.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 32px", textDecoration:"none", borderRight:"1px solid rgba(131,110,249,0.1)", transition:"background 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.background = item.color + "14"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display:"flex", flexDirection:"column", gap:1 }}>
                <span style={{ fontSize:11, fontWeight:800, color:item.color, letterSpacing:1, fontFamily:"monospace", textTransform:"uppercase", textShadow:`0 0 8px ${item.color}` }}>{item.label}</span>
                <span style={{ fontSize:9, color:"#444", letterSpacing:.5, fontFamily:"monospace" }}>{item.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div style={{ height:2, background:"linear-gradient(90deg,#5865f2,#00FF88,#00c8ff,#836ef9)", backgroundSize:"300% 100%", animation:"bannerGlow 4s linear infinite reverse" }} />
    </div>
  );
}

// ─── LIVE RMAD PRICE HOOK (on-chain) ─────────────────────────────────────────
function useLiveDexPrice() {
  const [dexPrice,   setDexPrice]   = useState(null);
  const [dexChange,  setDexChange]  = useState(null);
  const [dexLoading, setDexLoading] = useState(true);
  const prevRef   = useRef(null);
  const token0Ref = useRef(null);

  async function load() {
    if (!token0Ref.current) token0Ref.current = await fetchToken0(RMAD_PAIR);
    const data = await fetchPairReserves(RMAD_PAIR);
    if (!data) { setDexLoading(false); return; }
    const price = calcRmadPrice(data.r0, data.r1, token0Ref.current);
    if (prevRef.current !== null) setDexChange(((price - prevRef.current) / prevRef.current) * 100);
    prevRef.current = price;
    setDexPrice(price);
    setDexLoading(false);
  }

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, []);
  return { dexPrice, dexChange, dexLoading };
}

// ─── DEX PAIRS PRICES HOOK (DexScreener API) ─────────────────────────────────
function useDexPrices() {
  const [prices,  setPrices]  = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await fetchDexScreenerPairs(DEX_PAIRS.map(p => p.pair));
    setPrices(data);
    setLoading(false);
  }

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, []);
  return { prices, loading };
}

// ─── PRICE FORMATTER ─────────────────────────────────────────────────────────
function fmtNative(n) {
  if (!n || n === 0) return "—";
  if (n < 0.000001)  return n.toExponential(4);
  if (n < 0.001)     return n.toFixed(8);
  if (n < 1)         return n.toFixed(6);
  return n.toFixed(4);
}

function fmtUsd(u) {
  if (!u || u === 0) return null;
  if (u < 0.000001)  return "$" + u.toExponential(2);
  if (u < 0.01)      return "$" + u.toFixed(6);
  if (u < 1)         return "$" + u.toFixed(4);
  return "$" + u.toFixed(2);
}

function fmtVolLiq(v) {
  if (!v || v === 0) return null;
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)     return "$" + (v / 1_000).toFixed(1) + "k";
  return "$" + v.toFixed(0);
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx, isPending } = useSendTransaction();
  const { price, change, loading: priceLoading } = useToken();
  const { dexPrice, dexChange, dexLoading } = useLiveDexPrice();
  const { prices: dexPrices, loading: dexPairsLoading } = useDexPrices();
  const { stakedIds, pending, stake, unstake, claimRewards } = useStaking(account, sendTx);

  const [filter,       setFilter]      = useState("all");
  const [tab,          setTab]         = useState("staking");
  const [dexFilter,    setDexFilter]   = useState("all");
  const [selectedPair, setSelectedPair]= useState(null);

  const nftsWithState = NFTS.map(n => ({ ...n, staked: stakedIds.includes(n.id.toString()) }));
  const filtered =
    filter === "staked"   ? nftsWithState.filter(n =>  n.staked)
    : filter === "unstaked" ? nftsWithState.filter(n => !n.staked)
    : nftsWithState;

  const toggleNft = (id) => stakedIds.includes(id.toString()) ? unstake(id) : stake([id]);

  const filteredDex = dexFilter === "all" ? DEX_PAIRS : DEX_PAIRS.filter(p =>
    dexFilter === "stable" ? ["mUSDC","mUSDT"].includes(p.symbol)
    : dexFilter === "euro" ? ["EURO","mEURO","mEURC"].includes(p.symbol)
    : !["mUSDC","mUSDT","EURO","mEURO","mEURC"].includes(p.symbol)
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-deep)", fontFamily:"var(--font-ui)", color:"var(--text-secondary)" }}>
      <style>{`
        @keyframes bannerGlow { 0%{background-position:0% 0%} 100%{background-position:300% 0%} }
        @keyframes pricePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        .tab-btn  { padding:8px 16px; border-radius:8px; border:0.5px solid #222; background:transparent; color:#555; font-size:11px; cursor:pointer; transition:all .2s; font-family:inherit; }
        .tab-btn.active { background:#00FF8815; border-color:#00FF88; color:#00FF88; font-weight:600; }
        .dex-card { background:var(--bg-panel); border:0.5px solid #1a1a1a; border-left:3px solid transparent; border-radius:12px; padding:10px 14px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all .2s; }
        .dex-card:hover { transform:translateX(3px); border-color:#333 !important; }
        .dex-dot  { width:6px; height:6px; border-radius:50%; background:#00FF88; animation:pricePulse 2s infinite; flex-shrink:0; }
        .dex-dot.offline { background:#444; animation:none; }
        .flt-btn  { padding:5px 12px; border-radius:6px; border:0.5px solid #222; background:transparent; color:#555; font-size:10px; cursor:pointer; transition:all .2s; font-family:inherit; }
        .flt-btn.active { border-color:#836ef9; color:#836ef9; background:rgba(131,110,249,.1); }
        .chg-up   { color:#00FF88; font-size:9px; font-family:monospace; }
        .chg-down { color:#ff4444; font-size:9px; font-family:monospace; }
      `}</style>

      <AdBanner />

      <div style={{ padding:"20px 20px 80px" }}>

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div>
            <div style={{ fontSize:"26px", fontWeight:"700", color:"var(--text-primary)" }}>
              Rocket<span style={{ color:"var(--green)" }}>Moonad</span>
            </div>
            <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginTop:"2px" }}>
              Moon Rockets Season 1 · Monad Mainnet
            </div>
          </div>
          <WalletPanel />
        </div>

        {/* CONTRACT PILLS */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
          {[
            { label:"NFT (ERC-721)",    addr: NFT_ADDR     },
            { label:"Staking",          addr: STAKING_ADDR },
            { label:"RMAD (ERC-20)",    addr: RMAD_ADDR    },
            { label:"Oracle",           addr: ORACLE_ADDR  },
            { label:"Raffle",           addr: RAFFLE_ADDR  },
          ].map(({ label, addr }) => (
            <div key={addr} style={{ background:"var(--bg-panel)", border:"0.5px solid var(--border-subtle)", borderRadius:"8px", padding:"6px 10px" }}>
              <div style={{ fontSize:"9px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>{label}</div>
              <div style={{ fontSize:"10px", color:"#666", fontFamily:"var(--font-mono)" }}>{addr.slice(0,6)}…{addr.slice(-4)}</div>
            </div>
          ))}
        </div>

        {/* PRICE BAR */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"14px" }}>
          <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:"10px", background:"var(--bg-panel)", border:"0.5px solid var(--green-dim)", borderRadius:"10px", padding:"10px 14px" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"2px" }}>RMAD / WMON · On-Chain</div>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontSize:"15px", fontWeight:"700", color:"var(--green)", fontFamily:"var(--font-mono)", animation:dexLoading?"pricePulse 1.5s infinite":"none" }}>
                  {dexLoading ? "Loading…" : dexPrice !== null ? dexPrice.toFixed(10) + " WMON" : "No liquidity"}
                </span>
                {dexChange !== null && (
                  <span className={dexChange > 0 ? "chg-up" : "chg-down"} style={{ fontSize:"11px" }}>
                    {dexChange > 0 ? "▲" : "▼"} {Math.abs(dexChange).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <a href={DEX_URL} target="_blank" rel="noreferrer" style={{ fontSize:"10px", color:"#00FF88", border:"0.5px solid #00FF8844", borderRadius:"6px", padding:"3px 8px", textDecoration:"none" }}>📊</a>
            <span style={{ fontSize:"9px", color:"#333" }}>↻30s</span>
          </div>
          <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:"10px", background:"var(--bg-panel)", border:"0.5px solid var(--green-dim)", borderRadius:"10px", padding:"10px 14px" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"2px" }}>RMAD / USD · DexScreener</div>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontSize:"15px", fontWeight:"700", color:"var(--green)", fontFamily:"var(--font-mono)" }}>
                  {priceLoading ? "Loading…" : price || "—"}
                </span>
                {change !== null && (
                  <span className={change > 0 ? "chg-up" : "chg-down"} style={{ fontSize:"11px" }}>
                    {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontSize:"9px", color:"#333" }}>↻30s</span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"16px" }}>
          {[{ id:"staking", label:"🚀 Staking" }, { id:"dex", label:"📊 DEX Live" }].map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ══ STAKING TAB ══ */}
        {tab === "staking" && <>
          {!account && (
            <motion.p style={{ color:"var(--green)", textAlign:"center", fontSize:"20px", marginTop:"80px", textShadow:"0 0 20px #00FF88" }}
              animate={{ opacity:[0.5,1,0.5] }} transition={{ repeat:Infinity, duration:2 }}>
              Connect your wallet to start staking
            </motion.p>
          )}
          {account && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"14px" }}>
                {[
                  { label:"Total NFTs",      value:NFTS.length },
                  { label:"Staked",          value:stakedIds.length,               green:true },
                  { label:"Pending Rewards", value:`${pending} RMAD`,              green:true },
                  { label:"Unstaked",        value:NFTS.length - stakedIds.length },
                ].map(({ label, value, green }) => (
                  <div key={label} style={{ background:"var(--bg-panel)", borderRadius:"10px", padding:"14px" }}>
                    <div style={{ fontSize:"11px", color:"#444", marginBottom:"6px" }}>{label}</div>
                    <div style={{ fontSize:"20px", fontWeight:"700", color:green ? "var(--green)" : "var(--text-primary)" }}>{value}</div>
                  </div>
                ))}
              </div>

              <DailyClaimPanel account={account} sendTx={sendTx} />
              <RafflePanel account={account} sendTx={sendTx} />

              <div style={{ marginBottom:"16px" }}>
                <div style={{ background:"var(--bg-panel)", border:"0.5px solid var(--green-dim)", borderRadius:"12px", padding:"16px" }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-primary)", marginBottom:"10px" }}>Claim staking rewards</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
                    <div>
                      <div style={{ fontSize:"28px", fontWeight:"700", color:"var(--green)", fontFamily:"var(--font-mono)" }}>{pending}</div>
                      <div style={{ fontSize:"11px", color:"#444" }}>RMAD</div>
                    </div>
                    <NeonButton onClick={claimRewards} disabled={isPending}>{isPending ? "…" : "Claim"}</NeonButton>
                  </div>
                </div>
              </div>

              <div style={{ background:"var(--bg-panel)", border:"0.5px solid var(--border-subtle)", borderRadius:"14px", padding:"18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
                  <span style={{ fontSize:"15px", fontWeight:"700", color:"var(--text-primary)" }}>Your NFTs ({filtered.length})</span>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                    {["all","staked","unstaked"].map(f => (
                      <button key={f} onClick={() => setFilter(f)} style={{
                        background: filter === f ? "#00FF8822" : "transparent",
                        border: `0.5px solid ${filter === f ? "#00FF88" : "#333"}`,
                        color: filter === f ? "#00FF88" : "#555",
                        padding:"5px 12px", borderRadius:"6px", fontSize:"11px",
                        cursor:"pointer", textTransform:"capitalize",
                        fontWeight: filter === f ? "600" : "400", fontFamily:"inherit",
                      }}>{f}</button>
                    ))}
                    <NeonButton small onClick={() => stake(nftsWithState.filter(n => !n.staked).map(n => n.id))} disabled={isPending}>Stake all</NeonButton>
                    <NeonButton small gray onClick={() => nftsWithState.filter(n => n.staked).forEach(n => unstake(n.id))} disabled={isPending}>Unstake all</NeonButton>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"14px" }}>
                  <AnimatePresence>
                    {filtered.map(n => (
                      <NftCard
                        key={n.id}
                        nft={n}
                        staked={n.staked}
                        price={dexPrice ? dexPrice.toFixed(10) + " WMON" : price}
                        change={dexChange ?? change}
                        priceLoading={dexLoading}
                        onToggle={toggleNft}
                        isPending={isPending}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </>}

        {/* ══ DEX LIVE TAB ══ */}
        {tab === "dex" && (
          <div>
            {/* Header row */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-primary)" }}>
                📊 DEX Live · {DEX_PAIRS.length} Pairs · EUROSPACE on Monad
              </span>
              {dexPairsLoading
                ? <span style={{ fontSize:"10px", color:"#555" }}><span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span> Loading…</span>
                : <span style={{ marginLeft:"auto", fontSize:"9px", color:"#444" }}>via DexScreener API · ↻30s</span>
              }
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"14px", flexWrap:"wrap" }}>
              {["all","meta","stable","euro"].map(f => (
                <button key={f} className={`flt-btn ${dexFilter === f ? "active" : ""}`} onClick={() => setDexFilter(f)}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Pair cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"8px" }}>
              {filteredDex.map(p => {
                const key      = p.pair.toLowerCase();
                const pd       = dexPrices[key];
                const hasPrice = pd && pd.priceNative > 0;
                const ch24     = pd?.change24h ?? null;
                const ch1h     = pd?.change1h  ?? null;
                const volFmt   = fmtVolLiq(pd?.volume24h);
                const liqFmt   = fmtVolLiq(pd?.liquidity);
                const usdFmt   = fmtUsd(pd?.priceUsd);

                return (
                  <div
                    key={p.pair}
                    className="dex-card"
                    style={{ borderLeftColor:p.color }}
                    onClick={() => setSelectedPair(selectedPair === p.pair ? null : p.pair)}
                  >
                    {/* Live dot */}
                    <div className={`dex-dot ${hasPrice ? "" : "offline"}`} />

                    {/* Token circle */}
                    <div style={{ width:36, height:36, borderRadius:"50%", background:p.color+"22", border:`2px solid ${p.color}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, fontWeight:700, color:p.color, fontFamily:"monospace" }}>
                      {p.symbol.slice(0,3)}
                    </div>

                    {/* Middle info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"12px", fontWeight:"700", color:p.color, letterSpacing:"0.5px" }}>{p.symbol}</div>
                      <div style={{ fontSize:"10px", color:"#444", marginTop:"1px" }}>{p.name}</div>

                      {/* Changes */}
                      {(ch24 !== null || ch1h !== null) && (
                        <div style={{ display:"flex", gap:"6px", marginTop:"3px", flexWrap:"wrap" }}>
                          {ch24 !== null && (
                            <span className={Number(ch24) >= 0 ? "chg-up" : "chg-down"}>
                              {Number(ch24) >= 0 ? "▲" : "▼"}{Math.abs(Number(ch24)).toFixed(2)}% 24h
                            </span>
                          )}
                          {ch1h !== null && (
                            <span className={Number(ch1h) >= 0 ? "chg-up" : "chg-down"}>
                              {Number(ch1h) >= 0 ? "▲" : "▼"}{Math.abs(Number(ch1h)).toFixed(2)}% 1h
                            </span>
                          )}
                        </div>
                      )}

                      {/* Liq / Vol */}
                      {(liqFmt || volFmt) && (
                        <div style={{ display:"flex", gap:"8px", marginTop:"3px" }}>
                          {liqFmt && <span style={{ fontSize:"9px", color:"#555" }}>💧{liqFmt}</span>}
                          {volFmt && <span style={{ fontSize:"9px", color:"#555" }}>📊{volFmt}</span>}
                        </div>
                      )}

                      {/* DexScreener link */}
                      <div style={{ marginTop:"5px" }}>
                        <a
                          href={`https://dexscreener.com/monad/${p.pair}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize:"9px", padding:"2px 8px", border:"0.5px solid #00FF8844", borderRadius:"4px", color:"#00FF88", textDecoration:"none" }}
                          onClick={e => e.stopPropagation()}
                        >📊 Chart</a>
                      </div>
                    </div>

                    {/* Price column */}
                    <div style={{ textAlign:"right", minWidth:"82px", flexShrink:0 }}>
                      {hasPrice ? (
                        <>
                          <div style={{ fontSize:"11px", fontWeight:"700", color:"#00e5ff", fontFamily:"var(--font-mono)" }}>
                            {fmtNative(pd.priceNative)}
                          </div>
                          <div style={{ fontSize:"9px", color:"#555", marginTop:"1px" }}>WMON</div>
                          {usdFmt && (
                            <div style={{ fontSize:"9px", color:"#666", marginTop:"2px", fontFamily:"var(--font-mono)" }}>{usdFmt}</div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize:"11px", color:"#333", fontFamily:"var(--font-mono)" }}>
                          {dexPairsLoading ? "…" : "—"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Embedded chart */}
            {selectedPair && (
              <div style={{ marginTop:"16px", borderRadius:"12px", overflow:"hidden", border:"0.5px solid #1a1a1a" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#050510", borderBottom:"0.5px solid #111" }}>
                  <span style={{ fontSize:"11px", color:"#555" }}>
                    {DEX_PAIRS.find(p => p.pair === selectedPair)?.symbol} · {selectedPair.slice(0,8)}…
                  </span>
                  <button onClick={() => setSelectedPair(null)} style={{ background:"transparent", border:"none", color:"#555", cursor:"pointer", fontSize:"14px" }}>✕</button>
                </div>
                <iframe
                  src={`https://dexscreener.com/monad/${selectedPair}?embed=1&theme=dark&trades=0&info=0`}
                  style={{ width:"100%", height:400, border:"none", display:"block" }}
                  title="DEX Chart"
                />
              </div>
            )}

            <div style={{ marginTop:"14px", padding:"10px 14px", background:"var(--bg-panel)", borderRadius:"8px", fontSize:"10px", color:"#444", lineHeight:1.8 }}>
              ℹ️ Prices fetched from <code style={{ color:"#836ef9" }}>api.dexscreener.com</code> every 30 s.
              Shows WMON price, USD price, 24 h/1 h change, liquidity and volume.
              Click any card to open embedded chart. EUROSPACE DEX · Monad Mainnet.
            </div>
          </div>
        )}
      </div>
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
