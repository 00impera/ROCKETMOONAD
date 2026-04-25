import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThirdwebProvider, useActiveAccount, useSendTransaction } from "thirdweb/react";

import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/neon.css";
import "./styles/hologram.css";

import { useStaking }   from "./hooks/useStaking";
import { useToken }     from "./hooks/useToken";

import WalletPanel     from "./components/WalletPanel";
import NeonButton      from "./components/NeonButton";
import DailyClaimPanel from "./components/DailyClaimPanel";
import RafflePanel     from "./components/RafflePanel";

const NFT_ADDR     = "0x79C0bC7CF4B9F30F8614e66236eF634DB50f668f";
const STAKING_ADDR = "0x2F0317d1166fF385F44FACBd92BD4E43b03D2CbE";
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1";
const RAFFLE_ADDR  = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee";
const RMAD_PAIR    = "0xb5CB9F4ECCBeae6F95C9222Aa12C319fF362a5a3";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";

// ── Uniswap V4 contracts (YOUR deployment) ──────────────────────────────────
const V4_POOL_MANAGER     = "0xb362A2b87695a71A65092bd500fB05B558180048";
const V4_POSITION_MANAGER = "0xECAD0032774e3697565A0B9613182AC03319F2A1";
const V4_PERMIT2          = "0x63b8378896B425A036E9FA09D2D437d957A96c5c";
const WMOON               = "0x2ce8c8f4961a54b2e87585f4178467006b76b418";

const DAPP_URL  = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL   = `https://dexscreener.com/monad/${RMAD_PAIR}`;
const MONAD_URL = `https://monadvision.com/token/${RMAD_ADDR}?tab=Holders`;
const MONAD_RPCS = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

// ── V4 Pools (YOUR 17 pools against WMOON) ──────────────────────────────────
const V4_PAIRS = [
  { symbol:"EURO",   name:"Meta EuroCoin",  color:"#00ff88", contract:"0x5548D8405F343a6075a46a45CB954bCeB8Ba4E79" },
  { symbol:"mBTC",   name:"Meta Bitcoin",   color:"#F7931A", contract:"0x5078A3531Dba3Dea11AB4aaF641DB6f0fE88579e" },
  { symbol:"mETH",   name:"Meta Ethereum",  color:"#627EEA", contract:"0x271028A77301bb705C293Bd1fFA79E239AB1Daec" },
  { symbol:"mSOL",   name:"Meta Solana",    color:"#9945FF", contract:"0xEd59c5bA2180ce57a723Dbc04FF3A81e1ba84B3C" },
  { symbol:"mBNB",   name:"Meta BNB",       color:"#F3BA2F", contract:"0xb1326c51F73814f071bb4d3db44c86dD03DC8C76" },
  { symbol:"mXRP",   name:"Meta XRP",       color:"#00AAE4", contract:"0x379563529988bD76DeD9bc4a175AD59df6191B75" },
  { symbol:"mUSDC",  name:"Meta USDC",      color:"#2775CA", contract:"0xe0Ed08D1bC86b98434861ae0403be968bD95465E" },
  { symbol:"mUSDT",  name:"Meta Tether",    color:"#26A17B", contract:"0x085368cae9d4eCffe676806c3a8105433377164b" },
  { symbol:"mMATIC", name:"Meta Polygon",   color:"#8247E5", contract:"0x43C60d3cec23b0E85678602A4F5C1156a7398daC" },
  { symbol:"mDOGE",  name:"Meta Dogecoin",  color:"#C2A633", contract:"0x111b31d8474Aee70767337FD794a7fb0A08788A8" },
  { symbol:"mLTC",   name:"Meta Litecoin",  color:"#a8a8a8", contract:"0x8abAe4dbf7A2e286d688fa7101bea0fAE4C0Dd75" },
  { symbol:"mTRX",   name:"Meta TRON",      color:"#EF4444", contract:"0x1A3206c56993d4906ec26Fe85194399E0dBD8EBf" },
  { symbol:"mBASE",  name:"Meta Base",      color:"#2563eb", contract:"0xeA66DaF739823505817d4DAfEdBb43Dc0C2E5372" },
  { symbol:"mEURO",  name:"Meta Euro",      color:"#3b82f6", contract:"0x4443892C796f7A519C9D099417EC8422f88F5867" },
  { symbol:"mMONAD", name:"Meta Monad",     color:"#836EF9", contract:"0xbF5E34B1EBE37F9a98BFcE48645dc67Dd84E5fD6" },
  { symbol:"mEURC",  name:"Meta EURC",      color:"#FFD700", contract:"0x7bD9bbFc0086B033ede5736e4Aa9C16a451D0904" },
  { symbol:"mCRO",   name:"Meta Cronos",    color:"#60a5fa", contract:"0x0127B3c3C864cfC1BB519beB935477299b961d46" },
];

const ROCKET_NFTS = [
  { id:0, name:"RocketMoonad #1", rarity:"Legendary", power:95, speed:90, boost:92, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057320/rocketmoonad/afomr3mzeyu1s2ydjfpn.jpg" },
  { id:1, name:"RocketMoonad #2", rarity:"Epic",      power:87, speed:82, boost:80, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057326/rocketmoonad/o2tn8s6s1mnq1c3ym0ci.jpg" },
  { id:2, name:"RocketMoonad #3", rarity:"Epic",      power:83, speed:78, boost:77, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057329/rocketmoonad/lazmddwnnu3urha31r4y.jpg" },
  { id:3, name:"RocketMoonad #4", rarity:"Rare",      power:72, speed:68, boost:70, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057337/rocketmoonad/hocbys9ebhxu4npr0yqq.jpg" },
  { id:4, name:"RocketMoonad #5", rarity:"Rare",      power:68, speed:74, boost:66, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057341/rocketmoonad/ei6mqxspfepkktds0tdk.jpg" },
  { id:5, name:"RocketMoonad #6", rarity:"Uncommon",  power:60, speed:65, boost:58, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057343/rocketmoonad/dr0lwprrotv0znjfkfof.jpg" },
  { id:6, name:"RocketMoonad #7", rarity:"Uncommon",  power:55, speed:62, boost:54, image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057345/rocketmoonad/nzsd9blcfu8lke9j3xpa.jpg" },
];

const RMAD_AD_LINKS = [
  { label:"Telegram",    sub:"@Rocket_Moonad_bot", url:"https://t.me/Rocket_Moonad_bot",                   color:"#00c8ff" },
  { label:"Discord",     sub:"Join Server",         url:"https://discord.com/channels/1316093079090106472", color:"#5865f2" },
  { label:"Twitter / X", sub:"@bnbgold277983",      url:"https://twitter.com/bnbgold277983",                color:"#e0e0ff" },
  { label:"MonadVision", sub:"RMAD Holders",        url:MONAD_URL,                                          color:"#836ef9" },
  { label:"DexScreener", sub:"RMAD/WMON Pair",      url:DEX_URL,                                            color:"#00FF88" },
  { label:"V4 DEX",      sub:"17 Pools Live",       url:"#",                                                color:"#a78bfa" },
];

async function rpcFetch(method, params) {
  for (const rpc of MONAD_RPCS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(rpc, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ jsonrpc:"2.0", id:1, method, params }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const d = await r.json();
      if (d.result !== undefined) return d.result;
    } catch(e) { clearTimeout(t); }
  }
  return null;
}

async function fetchPairReserves(pairAddr) {
  try {
    const res = await rpcFetch("eth_call",[{to:pairAddr,data:"0x0902f1ac"},"latest"]);
    if (!res||res==="0x"||res.length<130) return null;
    const r0 = BigInt("0x"+res.slice(2,66));
    const r1 = BigInt("0x"+res.slice(66,130));
    if (r0===0n||r1===0n) return null;
    return {r0,r1};
  } catch(_){ return null; }
}

async function fetchERC20Balance(tokenAddr, walletAddr) {
  try {
    const data = "0x70a08231" + "000000000000000000000000" + walletAddr.toLowerCase().replace("0x","");
    const res = await rpcFetch("eth_call",[{to:tokenAddr,data},"latest"]);
    if (!res||res==="0x") return 0n;
    return BigInt(res);
  } catch(_){ return 0n; }
}

const RARITY_COLOR = { Legendary:"#FFD700", Epic:"#9945FF", Rare:"#00c8ff", Uncommon:"#00FF88", Common:"#888" };
const RARITY_EMOJI = { Legendary:"🔥", Epic:"💜", Rare:"💙", Uncommon:"💚", Common:"⚪" };

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
    <div style={{width:"100%",background:"rgba(4,4,12,0.98)",overflow:"hidden"}}>
      <div style={{height:2,background:"linear-gradient(90deg,#836ef9,#00c8ff,#00FF88,#5865f2,#836ef9)",backgroundSize:"300% 100%",animation:"bannerGlow 4s linear infinite"}}/>
      <div style={{overflow:"hidden",padding:"7px 0"}}>
        <div ref={trackRef} style={{display:"flex",alignItems:"center",whiteSpace:"nowrap",willChange:"transform"}}>
          {RMAD_AD_LINKS.map((item,i)=>(
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:10,padding:"6px 32px",textDecoration:"none",borderRight:"1px solid rgba(131,110,249,0.1)"}}>
              <span style={{display:"flex",flexDirection:"column",gap:1}}>
                <span style={{fontSize:11,fontWeight:800,color:item.color,letterSpacing:1,fontFamily:"monospace",textTransform:"uppercase",textShadow:`0 0 8px ${item.color}`}}>{item.label}</span>
                <span style={{fontSize:9,color:"#444",letterSpacing:.5,fontFamily:"monospace"}}>{item.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div style={{height:2,background:"linear-gradient(90deg,#5865f2,#00FF88,#00c8ff,#836ef9)",backgroundSize:"300% 100%",animation:"bannerGlow 4s linear infinite reverse"}}/>
    </div>
  );
}

function useLiveDexPrice() {
  const [dexPrice,setDexPrice]=useState(null);
  const [dexChange,setDexChange]=useState(null);
  const [dexLoading,setDexLoading]=useState(true);
  const prevRef=useRef(null);
  async function load() {
    const data = await fetchPairReserves(RMAD_PAIR);
    if (!data){setDexLoading(false);return;}
    const rmadIsToken0 = RMAD_ADDR.toLowerCase()<WMON_ADDR.toLowerCase();
    const price = rmadIsToken0
      ? Number((data.r1*1_000_000_000_000n)/data.r0)/1_000_000_000_000
      : Number((data.r0*1_000_000_000_000n)/data.r1)/1_000_000_000_000;
    if(prevRef.current!==null) setDexChange(((price-prevRef.current)/prevRef.current)*100);
    prevRef.current=price;
    setDexPrice(price);
    setDexLoading(false);
  }
  useEffect(()=>{load();const id=setInterval(load,30000);return()=>clearInterval(id);},[]);
  return {dexPrice,dexChange,dexLoading};
}

// ── V4 Swap Panel ────────────────────────────────────────────────────────────
function V4SwapPanel({account}) {
  const [tokenIn,  setTokenIn]  = useState(V4_PAIRS[0]);
  const [amountIn, setAmountIn] = useState("");
  const [balIn,    setBalIn]    = useState("—");
  const [status,   setStatus]   = useState(null);

  useEffect(()=>{
    if(!account?.address) return;
    fetchERC20Balance(tokenIn.contract, account.address)
      .then(b => setBalIn((Number(b)/1e18).toFixed(4)));
  },[tokenIn, account]);

  async function doSwap() {
    if(!account||!amountIn) return;
    setStatus({type:"info", msg:"Open your wallet app and run swap.js with these settings:"});
  }

  return (
    <div style={{background:"var(--bg-panel)",border:"0.5px solid #1a1a2a",borderRadius:14,padding:18,marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>
        ⚡ Uniswap V4 Swap
      </div>
      <div style={{fontSize:10,color:"#555",marginBottom:14}}>
        Your V4 deployment · PoolManager {V4_POOL_MANAGER.slice(0,10)}…
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",marginBottom:4}}>WMOON → Token</div>
        <select
          value={tokenIn.symbol}
          onChange={e=>setTokenIn(V4_PAIRS.find(p=>p.symbol===e.target.value))}
          style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"0.5px solid #222",background:"#0a0a14",color:"#e0e0e0",fontSize:13,marginBottom:8}}
        >
          {V4_PAIRS.map(p=><option key={p.symbol} value={p.symbol}>{p.symbol} — {p.name}</option>)}
        </select>
        <input
          type="number" placeholder="Amount WMOON"
          value={amountIn} onChange={e=>setAmountIn(e.target.value)}
          style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"0.5px solid #222",background:"#0a0a14",color:"#e0e0e0",fontSize:14}}
        />
        <div style={{fontSize:10,color:"#444",marginTop:4}}>
          Balance: {balIn} {tokenIn.symbol}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10,fontSize:10,color:"#555"}}>
        <div style={{background:"#0a0a14",borderRadius:8,padding:"8px 10px"}}>Pool fee: <span style={{color:"#836ef9"}}>0.3%</span></div>
        <div style={{background:"#0a0a14",borderRadius:8,padding:"8px 10px"}}>Tick spacing: <span style={{color:"#836ef9"}}>60</span></div>
        <div style={{background:"#0a0a14",borderRadius:8,padding:"8px 10px",gridColumn:"1/-1"}}>
          Token: <span style={{color:tokenIn.color,fontFamily:"monospace",fontSize:9}}>{tokenIn.contract.slice(0,14)}…</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <button
          onClick={doSwap}
          style={{padding:"10px",borderRadius:8,border:`1px solid ${tokenIn.color}44`,background:`${tokenIn.color}11`,color:tokenIn.color,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
        >
          ⚡ Swap via V4
        </button>
        <a
          href={`https://monadvision.com/token/${tokenIn.contract}`}
          target="_blank" rel="noreferrer"
          style={{padding:"10px",borderRadius:8,border:"0.5px solid #836ef944",background:"#836ef911",color:"#836ef9",fontSize:11,fontWeight:700,textDecoration:"none",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}
        >
          📊 MonadVision
        </a>
      </div>

      <div style={{background:"#0a0a14",borderRadius:8,padding:"10px 12px",fontSize:10,color:"#555",lineHeight:1.8}}>
        <div style={{color:"#836ef9",fontWeight:700,marginBottom:4}}>V4 Contracts:</div>
        <div>PoolManager: <span style={{fontFamily:"monospace",color:"#666"}}>{V4_POOL_MANAGER.slice(0,14)}…</span></div>
        <div>PositionMgr: <span style={{fontFamily:"monospace",color:"#666"}}>{V4_POSITION_MANAGER.slice(0,14)}…</span></div>
        <div>Permit2: <span style={{fontFamily:"monospace",color:"#666"}}>{V4_PERMIT2.slice(0,14)}…</span></div>
        <div>WMOON: <span style={{fontFamily:"monospace",color:"#666"}}>{WMOON.slice(0,14)}…</span></div>
      </div>

      {status && (
        <div style={{marginTop:10,padding:"10px 12px",borderRadius:8,background:"rgba(131,110,249,.1)",border:"0.5px solid #836ef944",fontSize:11,color:"#836ef9"}}>
          {status.msg}<br/>
          <code style={{fontSize:10,color:"#00FF88",display:"block",marginTop:6}}>
            node ~/uniswap-v4-monad/rmad-test/swap.js
          </code>
        </div>
      )}
    </div>
  );
}

// ── V4 Pool Grid ─────────────────────────────────────────────────────────────
function V4PoolGrid() {
  return (
    <div style={{background:"var(--bg-panel)",border:"0.5px solid #1a1a2a",borderRadius:14,padding:18,marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>
        🏊 V4 Pools Live — 17 Pairs
      </div>
      <div style={{fontSize:10,color:"#555",marginBottom:14}}>All paired against WMOON · Your Uniswap V4 deployment</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
        {V4_PAIRS.map(p=>(
          <a
            key={p.symbol}
            href={`https://monadvision.com/token/${p.contract}`}
            target="_blank" rel="noreferrer"
            style={{textDecoration:"none",background:"#0a0a14",border:`0.5px solid ${p.color}33`,borderLeft:`3px solid ${p.color}`,borderRadius:10,padding:"10px 12px",display:"block",transition:"all .2s"}}
          >
            <div style={{fontSize:12,fontWeight:700,color:p.color,marginBottom:2}}>{p.symbol}</div>
            <div style={{fontSize:9,color:"#444",marginBottom:6}}>{p.name}</div>
            <div style={{fontSize:8,color:"#333",fontFamily:"monospace"}}>{p.contract.slice(0,8)}…</div>
            <div style={{marginTop:6,fontSize:8,color:"#00FF88",border:"0.5px solid #00FF8833",borderRadius:4,padding:"2px 6px",display:"inline-block"}}>● live</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const account = useActiveAccount();
  const { mutateAsync:sendTx, isPending } = useSendTransaction();
  const { price, change, loading:priceLoading } = useToken();
  const { dexPrice, dexChange, dexLoading } = useLiveDexPrice();
  const { stakedIds, pending, stake, unstake, claimRewards } = useStaking(account, sendTx);

  const [filter,  setFilter]  = useState("all");
  const [tab,     setTab]     = useState("staking");

  const nftsWithState = ROCKET_NFTS.map(n=>({...n,staked:stakedIds.includes(n.id.toString())}));
  const filtered =
    filter==="staked"   ? nftsWithState.filter(n=> n.staked)
    : filter==="unstaked" ? nftsWithState.filter(n=>!n.staked)
    : nftsWithState;

  const toggleNft = id => stakedIds.includes(id.toString()) ? unstake(id) : stake([id]);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg-deep)",fontFamily:"var(--font-ui)",color:"var(--text-secondary)"}}>
      <style>{`
        @keyframes bannerGlow{0%{background-position:0% 0%}100%{background-position:300% 0%}}
        @keyframes pricePulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .tab-btn{padding:8px 16px;border-radius:8px;border:0.5px solid #222;background:transparent;color:#555;font-size:11px;cursor:pointer;transition:all .2s;font-family:inherit;}
        .tab-btn.active{background:#00FF8815;border-color:#00FF88;color:#00FF88;font-weight:600;}
        .nft-card{background:var(--bg-panel);border-radius:14px;overflow:hidden;border:0.5px solid #1a1a2a;transition:transform .2s,box-shadow .2s;cursor:pointer;}
        .nft-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,255,136,.08);}
        .chg-up{color:#00FF88;font-size:9px;font-family:monospace;}
        .chg-down{color:#ff4444;font-size:9px;font-family:monospace;}
      `}</style>

      <AdBanner/>

      <div style={{padding:"20px 20px 80px"}}>
        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:26,fontWeight:700,color:"var(--text-primary)"}}>
              Rocket<span style={{color:"var(--green)"}}>Moonad</span>
            </div>
            <div style={{fontSize:10,color:"#444",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>
              Moon Rockets Season 1 · Monad · 7 NFTs · Uniswap V4
            </div>
          </div>
          <WalletPanel/>
        </div>

        {/* CONTRACT PILLS */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {[
            {label:"NFT",        addr:NFT_ADDR},
            {label:"Staking",    addr:STAKING_ADDR},
            {label:"RMAD",       addr:RMAD_ADDR},
            {label:"PoolMgr V4", addr:V4_POOL_MANAGER},
            {label:"PosMgr V4",  addr:V4_POSITION_MANAGER},
            {label:"Raffle",     addr:RAFFLE_ADDR},
          ].map(({label,addr})=>(
            <a key={addr} href={`https://monadscan.com/address/${addr}`} target="_blank" rel="noreferrer"
              style={{textDecoration:"none",background:"var(--bg-panel)",border:"0.5px solid var(--border-subtle)",borderRadius:8,padding:"6px 10px",display:"block"}}>
              <div style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{label}</div>
              <div style={{fontSize:10,color:"#666",fontFamily:"var(--font-mono)"}}>{addr.slice(0,6)}…{addr.slice(-4)}</div>
            </a>
          ))}
        </div>

        {/* PRICE BAR */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",gap:10,background:"var(--bg-panel)",border:"0.5px solid var(--green-dim)",borderRadius:10,padding:"10px 14px"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#444",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>RMAD / WMON · On-Chain</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:15,fontWeight:700,color:"var(--green)",fontFamily:"var(--font-mono)"}}>
                  {dexLoading?"Loading…":dexPrice!==null?dexPrice.toFixed(10)+" WMON":"No liquidity"}
                </span>
                {dexChange!==null&&<span className={dexChange>0?"chg-up":"chg-down"}>{dexChange>0?"▲":"▼"}{Math.abs(dexChange).toFixed(2)}%</span>}
              </div>
            </div>
            <a href={DEX_URL} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#00FF88",border:"0.5px solid #00FF8844",borderRadius:6,padding:"3px 8px",textDecoration:"none"}}>📊</a>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {[
            {id:"staking", label:"🚀 Staking"},
            {id:"v4swap",  label:"⚡ V4 Swap"},
            {id:"v4pools", label:"🏊 V4 Pools"},
          ].map(t=>(
            <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── STAKING TAB ── */}
        {tab==="staking"&&<>
          {!account&&(
            <motion.p style={{color:"var(--green)",textAlign:"center",fontSize:20,marginTop:80,textShadow:"0 0 20px #00FF88"}}
              animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:2}}>
              Connect your wallet to start staking
            </motion.p>
          )}
          {account&&<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              {[
                {label:"Total NFTs",      value:ROCKET_NFTS.length},
                {label:"Staked",          value:stakedIds.length,                     green:true},
                {label:"Pending Rewards", value:`${pending} RMAD`,                    green:true},
                {label:"Unstaked",        value:ROCKET_NFTS.length-stakedIds.length},
              ].map(({label,value,green})=>(
                <div key={label} style={{background:"var(--bg-panel)",borderRadius:10,padding:14}}>
                  <div style={{fontSize:11,color:"#444",marginBottom:6}}>{label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:green?"var(--green)":"var(--text-primary)"}}>{value}</div>
                </div>
              ))}
            </div>

            <DailyClaimPanel account={account} sendTx={sendTx}/>
            <RafflePanel account={account} sendTx={sendTx}/>

            <div style={{marginBottom:16}}>
              <div style={{background:"var(--bg-panel)",border:"0.5px solid var(--green-dim)",borderRadius:12,padding:16}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:10}}>Claim staking rewards</div>
                <div style={{display:"flex",alignItems:"center",gap:20}}>
                  <div>
                    <div style={{fontSize:28,fontWeight:700,color:"var(--green)",fontFamily:"var(--font-mono)"}}>{pending}</div>
                    <div style={{fontSize:11,color:"#444"}}>RMAD</div>
                  </div>
                  <NeonButton onClick={claimRewards} disabled={isPending}>{isPending?"…":"Claim"}</NeonButton>
                </div>
              </div>
            </div>

            <div style={{background:"var(--bg-panel)",border:"0.5px solid var(--border-subtle)",borderRadius:14,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <span style={{fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>Moon Rockets ({filtered.length})</span>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  {["all","staked","unstaked"].map(f=>(
                    <button key={f} onClick={()=>setFilter(f)} style={{
                      background:filter===f?"#00FF8822":"transparent",
                      border:`0.5px solid ${filter===f?"#00FF88":"#333"}`,
                      color:filter===f?"#00FF88":"#555",
                      padding:"5px 12px",borderRadius:6,fontSize:11,cursor:"pointer",
                      textTransform:"capitalize",fontFamily:"inherit",
                    }}>{f}</button>
                  ))}
                  <NeonButton small onClick={()=>stake(nftsWithState.filter(n=>!n.staked).map(n=>n.id))} disabled={isPending}>Stake all</NeonButton>
                  <NeonButton small gray onClick={()=>nftsWithState.filter(n=>n.staked).forEach(n=>unstake(n.id))} disabled={isPending}>Unstake all</NeonButton>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
                <AnimatePresence>
                  {filtered.map(n=>(
                    <motion.div key={n.id} className="nft-card"
                      initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                      style={{border:`0.5px solid ${n.staked?"#00FF8844":"#1a1a2a"}`}}>
                      <div style={{position:"relative",aspectRatio:"1",overflow:"hidden"}}>
                        <img src={n.image} alt={n.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                        {n.staked&&<div style={{position:"absolute",top:8,right:8,background:"#00FF8822",border:"0.5px solid #00FF88",borderRadius:6,padding:"2px 7px",fontSize:9,color:"#00FF88",fontWeight:700}}>STAKED</div>}
                        <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.7)",borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:700,color:RARITY_COLOR[n.rarity]||"#888"}}>
                          {RARITY_EMOJI[n.rarity]} {n.rarity}
                        </div>
                      </div>
                      <div style={{padding:"10px 12px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text-primary)",marginBottom:6}}>{n.name}</div>
                        {[["PWR",n.power],["SPD",n.speed],["BST",n.boost]].map(([label,val])=>(
                          <div key={label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontSize:9,color:"#444",width:24,fontFamily:"monospace"}}>{label}</span>
                            <div style={{flex:1,height:3,background:"#111",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${val}%`,height:"100%",background:"linear-gradient(90deg,#00FF88,#00c8ff)",borderRadius:2}}/>
                            </div>
                            <span style={{fontSize:9,color:"#555",fontFamily:"monospace",width:20,textAlign:"right"}}>{val}</span>
                          </div>
                        ))}
                        <button onClick={()=>toggleNft(n.id)} disabled={isPending}
                          style={{width:"100%",marginTop:10,padding:7,borderRadius:8,border:"none",cursor:"pointer",
                            background:n.staked?"rgba(255,68,68,0.12)":"rgba(0,255,136,0.12)",
                            color:n.staked?"#ff4444":"#00FF88",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                          {isPending?"…":n.staked?"− Unstake":"+ Stake"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>}
        </>}

        {/* ── V4 SWAP TAB ── */}
        {tab==="v4swap"&&(
          account
            ? <V4SwapPanel account={account}/>
            : <div style={{textAlign:"center",padding:"60px 0",color:"#555",fontSize:14}}>Connect wallet to use V4 Swap</div>
        )}

        {/* ── V4 POOLS TAB ── */}
        {tab==="v4pools"&&<V4PoolGrid/>}
      </div>
    </div>
  );
}

export default function App() {
  return <ThirdwebProvider><Dashboard/></ThirdwebProvider>;
}
