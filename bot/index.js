const TelegramBot = require("node-telegram-bot-api");
const http = require("http");

const TOKEN = process.env.BOT_TOKEN;
const bot   = new TelegramBot(TOKEN, { polling: true });

http.createServer((req, res) => res.end("🚀 RocketMoonad Bot is running!"))
    .listen(process.env.PORT || 3000);

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err.message));
process.on("uncaughtException",  (err) => console.error("Uncaught exception:",  err.message));

// ─── CONTRACTS (updated) ────────────────────────────────────────────────────
const NFT_ADDR     = "0x79C0bC7CF4B9F30F8614e66236eF634DB50f668f"; // NEW
const STAKING_ADDR = "0x2F0317d1166fF385F44FACBd92BD4E43b03D2CbE"; // NEW
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67"; // unchanged
const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1"; // unchanged
const RAFFLE_ADDR  = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee"; // NEW
const RMAD_PAIR    = "0xb5CB9F4ECCBeae6F95C9222Aa12C319fF362a5a3";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";

// ─── URLS ───────────────────────────────────────────────────────────────────
const DAPP_URL   = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL    = `https://dexscreener.com/monad/${RMAD_PAIR}`;
const MONAD_URL  = `https://monadvision.com/token/${RMAD_ADDR}?tab=Holders`;
const DS_API     = "https://api.dexscreener.com/latest/dex/pairs/monad";
const MONAD_RPCS = ["https://rpc.monad.xyz", "https://rpc.ankr.com/monad_mainnet"];

// ─── EUROSPACE DEX PAIRS ───────────────────────────────────────────────────
const DEX_PAIRS = [
  { symbol:"EURO",   name:"Meta EuroCoin",  pair:"0x9E32FdD909a5BdcCfb874DEE72F24169AfE4eC02" },
  { symbol:"mBTC",   name:"Meta Bitcoin",   pair:"0x47Dc73D3e1C520056AdF52349A6A282e5262D56d" },
  { symbol:"mETH",   name:"Meta Ethereum",  pair:"0xDE92BC23146222B86e638B6E88E23917eD378a6E" },
  { symbol:"mSOL",   name:"Meta Solana",    pair:"0xf8dbc8Cc478506fb0844C670B35b90A7AD6Ad912" },
  { symbol:"mBNB",   name:"Meta BNB",       pair:"0xd77B55A199EA0DC81EB4c7c36d45fBda4D6477B6" },
  { symbol:"mXRP",   name:"Meta XRP",       pair:"0x69884c6C8Fe6F833aEEDE2A4c0949e667C7F79fB" },
  { symbol:"mUSDC",  name:"Meta USDC",      pair:"0x3BE5B19348d6Ccbc20e0DCF3Cab0aDF9e4643dCa" },
  { symbol:"mUSDT",  name:"Meta Tether",    pair:"0xAB4CFB051E73db47f75c4A2c31dFaAAFd3A82A8b" },
  { symbol:"mMATIC", name:"Meta Polygon",   pair:"0x5F5908aD27AFf28b0BDbAD8F93470e83310aE365" },
  { symbol:"mDOGE",  name:"Meta Dogecoin",  pair:"0x8e71b96897c6D5EF3954b06636c24EdB4866b488" },
  { symbol:"mLTC",   name:"Meta Litecoin",  pair:"0xd4faf6a3B43105395C1f3db6525eA0fBF5B3aF9a" },
  { symbol:"mTRX",   name:"Meta TRON",      pair:"0x77A4Ad2ac41775A543353C8255cd88C7bF58e404" },
  { symbol:"mBASE",  name:"Meta Base",      pair:"0x9f1b9A6D727DF983a74F11252EDa0Fa96132cc12" },
  { symbol:"mEURO",  name:"Meta Euro",      pair:"0x2f3B240444F5b8Dc6f211373ff29CCE0Ba798114" },
  { symbol:"mMONAD", name:"Meta Monad",     pair:"0xc7a8f6A2452D1ec709006E36A3B89f4Df7188a9a" },
  { symbol:"mEURC",  name:"Meta EURC",      pair:"0x669d78953a14a147DA6730dA255b4E7A7b15b111" },
  { symbol:"mCRO",   name:"Meta Cronos",    pair:"0x7D9e8050Ba0c0a6c8336A49a5Af6748AA6BD855C" },
];

// ─── NFT COLLECTION (7 rockets — minted at block 70276151) ─────────────────
const NFTS = [
  {
    id: 0,
    name: "RocketMoonad #1",
    rarity: "Legendary",
    power: 95, speed: 90, boost: 92,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057320/rocketmoonad/afomr3mzeyu1s2ydjfpn.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057830/rocketmoonad/metadata/qzhcti7accat6tv8yu3k.json",
    history: "First rocket launched on Monad Mainnet. Genesis of the RocketMoonad collection.",
  },
  {
    id: 1,
    name: "RocketMoonad #2",
    rarity: "Epic",
    power: 87, speed: 82, boost: 80,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057326/rocketmoonad/o2tn8s6s1mnq1c3ym0ci.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057835/rocketmoonad/metadata/gay5cfxorwckrkkleexw.json",
    history: "Pioneer of the RocketMoonad staking ecosystem.",
  },
  {
    id: 2,
    name: "RocketMoonad #3",
    rarity: "Epic",
    power: 83, speed: 78, boost: 77,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057329/rocketmoonad/lazmddwnnu3urha31r4y.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057839/rocketmoonad/metadata/qf3nxcojxnf4yz0jje6q.json",
    history: "Fueled by RMAD token rewards from the staking contract.",
  },
  {
    id: 3,
    name: "RocketMoonad #4",
    rarity: "Rare",
    power: 72, speed: 68, boost: 70,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057337/rocketmoonad/hocbys9ebhxu4npr0yqq.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057843/rocketmoonad/metadata/sicn0a0h38magrtsr3bd.json",
    history: "Entered the RocketMoonad raffle system at block 70257020.",
  },
  {
    id: 4,
    name: "RocketMoonad #5",
    rarity: "Rare",
    power: 68, speed: 74, boost: 66,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057341/rocketmoonad/ei6mqxspfepkktds0tdk.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057845/rocketmoonad/metadata/t6frxxq1hzxcu7dozcn9.json",
    history: "Staked in the RocketMoonad staking contract earning RMAD rewards.",
  },
  {
    id: 5,
    name: "RocketMoonad #6",
    rarity: "Uncommon",
    power: 60, speed: 65, boost: 58,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057343/rocketmoonad/dr0lwprrotv0znjfkfof.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057849/rocketmoonad/metadata/eics5dz9z4z58a5wa10x.json",
    history: "Part of the RocketMoonad DeFi ecosystem on Monad chain 143.",
  },
  {
    id: 6,
    name: "RocketMoonad #7",
    rarity: "Uncommon",
    power: 55, speed: 62, boost: 54,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1777057345/rocketmoonad/nzsd9blcfu8lke9j3xpa.jpg",
    metadata: "https://res.cloudinary.com/drmsykh02/raw/upload/v1777057851/rocketmoonad/metadata/qz6k0ckluxo4ayrkoxpn.json",
    history: "Final rocket of the genesis RocketMoonad collection on Monad Mainnet.",
  },
];

const RARITY_EMOJI = { Legendary:"🔥", Epic:"💜", Rare:"💙", Uncommon:"💚", Common:"⚪" };
const RARITY_STARS = { Legendary:"⭐⭐⭐⭐⭐", Epic:"⭐⭐⭐⭐", Rare:"⭐⭐⭐", Uncommon:"⭐⭐", Common:"⭐" };

function bar(value) {
  const filled = Math.round(value / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${value}`;
}

function nftCaption(nft) {
  return `🚀 *Moon Rockets Season 1*
━━━━━━━━━━━━━━━━━━━━
${RARITY_EMOJI[nft.rarity] || "⚪"} *${nft.name}*
🏷️ Rarity: \`${nft.rarity}\` ${RARITY_STARS[nft.rarity] || "⭐"}
🆔 Token ID: \`#${nft.id}\`
📜 History: _${nft.history}_

📊 *STATS*
⚔️ PWR: \`${bar(nft.power)}\`
💨 SPD: \`${bar(nft.speed)}\`
🚀 BST: \`${bar(nft.boost)}\`

💎 *RMAD Token:* \`${RMAD_ADDR}\`
📦 *NFT Contract:* \`${NFT_ADDR}\`
━━━━━━━━━━━━━━━━━━━━
🌐 [Open dApp](${DAPP_URL}) | 📈 [Trade RMAD](${DEX_URL})`;
}

function nftKeyboard(nft) {
  const prevId = nft.id - 1 < 0 ? 6 : nft.id - 1;
  const nextId = nft.id + 1 > 6 ? 0 : nft.id + 1;
  return {
    inline_keyboard: [
      [{ text:"🌐 Open dApp", url:DAPP_URL }, { text:"📈 Trade RMAD", url:DEX_URL }],
      [{ text:"📊 MonadVision", url:MONAD_URL }, { text:"🔍 Staking", url:DAPP_URL }],
      [
        { text:`◀️ #${prevId}`, callback_data:`nft_${prevId}` },
        { text:`${nft.id + 1}/7`, callback_data:"noop" },
        { text:`#${nextId} ▶️`, callback_data:`nft_${nextId}` },
      ],
      [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
    ],
  };
}

// ─── ON-CHAIN RPC HELPER ────────────────────────────────────────────────────
async function rpcFetch(method, params) {
  for (const rpc of MONAD_RPCS) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      const d = await r.json();
      if (d.result !== undefined) return d.result;
    } catch (_) { clearTimeout(timeout); }
  }
  return null;
}

// ─── RMAD ON-CHAIN PRICE ────────────────────────────────────────────────────
let rmadToken0Cache = null;

async function fetchToken0(pairAddr) {
  const res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0dfe1681" }, "latest"]);
  if (!res || res === "0x" || res.length < 66) return null;
  return ("0x" + res.slice(26)).toLowerCase();
}

async function fetchOnChainPrice() {
  try {
    if (!rmadToken0Cache) rmadToken0Cache = await fetchToken0(RMAD_PAIR);
    const res = await rpcFetch("eth_call", [{ to: RMAD_PAIR, data: "0x0902f1ac" }, "latest"]);
    if (!res || res === "0x" || res.length < 130) return null;
    const r0 = BigInt("0x" + res.slice(2, 66));
    const r1 = BigInt("0x" + res.slice(66, 130));
    if (r0 === 0n || r1 === 0n) return null;
    const rmadIsToken0 = rmadToken0Cache
      ? rmadToken0Cache === RMAD_ADDR.toLowerCase()
      : RMAD_ADDR.toLowerCase() < WMON_ADDR.toLowerCase();
    return rmadIsToken0
      ? Number((r1 * 1_000_000_000_000n) / r0) / 1_000_000_000_000
      : Number((r0 * 1_000_000_000_000n) / r1) / 1_000_000_000_000;
  } catch (e) {
    console.error("fetchOnChainPrice error:", e.message);
    return null;
  }
}

async function fetchPairOnChainPrice(pairAddr) {
  try {
    const t0res  = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0dfe1681" }, "latest"]);
    const token0 = t0res && t0res.length >= 66 ? ("0x" + t0res.slice(26)).toLowerCase() : null;
    const res    = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0902f1ac" }, "latest"]);
    if (!res || res === "0x" || res.length < 130) return null;
    const r0 = BigInt("0x" + res.slice(2, 66));
    const r1 = BigInt("0x" + res.slice(66, 130));
    if (r0 === 0n || r1 === 0n) return null;
    const wmonIsToken0 = token0 === WMON_ADDR.toLowerCase();
    return wmonIsToken0
      ? Number((r0 * 1_000_000_000_000n) / r1) / 1_000_000_000_000
      : Number((r1 * 1_000_000_000_000n) / r0) / 1_000_000_000_000;
  } catch (_) { return null; }
}

// ─── DEXSCREENER BATCH FETCH ────────────────────────────────────────────────
async function fetchDexScreenerPairs(pairAddresses) {
  try {
    const CHUNK = 30;
    const results = {};
    for (let i = 0; i < pairAddresses.length; i += CHUNK) {
      const chunk = pairAddresses.slice(i, i + CHUNK);
      const url   = `${DS_API}/${chunk.join(",")}`;
      const ctrl  = new AbortController();
      const t     = setTimeout(() => ctrl.abort(), 10000);
      try {
        const r = await fetch(url, { headers:{ Accept:"application/json" }, signal:ctrl.signal });
        clearTimeout(t);
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
          };
        }
      } catch (_) { clearTimeout(t); }
    }
    return results;
  } catch (e) {
    console.error("DexScreener API error:", e.message);
    return {};
  }
}

// ─── FORMATTERS ─────────────────────────────────────────────────────────────
function fmtNative(n) {
  if (!n || n === 0) return "—";
  if (n < 0.000001) return n.toExponential(4);
  if (n < 0.001)    return n.toFixed(8);
  if (n < 1)        return n.toFixed(6);
  return n.toFixed(4);
}
function fmtUsd(u) {
  if (!u || u === 0) return null;
  if (u < 0.000001) return "$" + u.toExponential(2);
  if (u < 0.01)     return "$" + u.toFixed(6);
  if (u < 1)        return "$" + u.toFixed(4);
  return "$" + u.toFixed(2);
}
function fmtVolLiq(v) {
  if (!v || v === 0) return null;
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)     return "$" + (v / 1_000).toFixed(1) + "k";
  return "$" + v.toFixed(0);
}
function chgArrow(v) {
  if (v === null || v === undefined) return "";
  const n = Number(v);
  return (n >= 0 ? "▲" : "▼") + Math.abs(n).toFixed(2) + "%";
}

// ─── MENUS ──────────────────────────────────────────────────────────────────
const MAIN_MENU_TEXT = `
🚀 *RocketMoonad* — Moon Rockets Season 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌕 Stake your Moon Rockets NFTs
💎 Earn \`RMAD\` rewards on Monad Mainnet
🎮 7 unique NFT rockets (Token IDs: #0–#6)
📦 Minted at block 70276151 on Monad

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NFT: \`${NFT_ADDR}\`
💎 RMAD: \`${RMAD_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
🔮 Oracle: \`${ORACLE_ADDR}\`
🎰 Raffle: \`${RAFFLE_ADDR}\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [{ text:"🌐 Open dApp", url:DAPP_URL }, { text:"📈 Trade RMAD", url:DEX_URL }],
    [{ text:"🖼️ View All NFTs", callback_data:"nft_0" }, { text:"💰 Live Price", callback_data:"price_check" }],
    [{ text:"📊 MonadVision", url:MONAD_URL }, { text:"ℹ️ How to Stake", callback_data:"how_stake" }],
    [{ text:"📋 All NFT Cards", callback_data:"all_nfts" }, { text:"📊 DEX Live", callback_data:"dex_all" }],
  ],
};

// ─── SEND PRICE MESSAGE ─────────────────────────────────────────────────────
async function sendPriceMessage(chatId) {
  const loadingMsg = await bot.sendMessage(chatId, "⏳ Fetching live on-chain price...");
  const price = await fetchOnChainPrice();
  await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const text = price !== null
    ? `💰 *RMAD Live Price*
━━━━━━━━━━━━━━━━━━━━
🔗 Source: On-Chain (Monad Mainnet)
💱 Pair: \`RMAD / WMON\`
💵 Price: \`${price.toFixed(12)} WMON\`
━━━━━━━━━━━━━━━━━━━━
📦 NFT: \`${NFT_ADDR}\`
💎 RMAD: \`${RMAD_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
🔮 Oracle: \`${ORACLE_ADDR}\`
🎰 Raffle: \`${RAFFLE_ADDR}\`
━━━━━━━━━━━━━━━━━━━━
🕐 _Updated: ${now}_`
    : `❌ *Price Unavailable*
━━━━━━━━━━━━━━━━━━━━
Could not fetch on-chain price. RPC may be temporarily unavailable.`;

  await bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text:"🔄 Refresh Price", callback_data:"price_check" }, { text:"📈 DexScreener Chart", url:DEX_URL }],
        [{ text:"📊 DEX Live (17 pairs)", callback_data:"dex_all" }],
        [{ text:"📊 MonadVision", url:MONAD_URL }, { text:"🌐 Open dApp", url:DAPP_URL }],
        [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
      ],
    },
  });
}

// ─── SEND DEX MESSAGE ───────────────────────────────────────────────────────
async function sendDexMessage(chatId, filter = "all") {
  const loadingMsg = await bot.sendMessage(chatId, "⏳ Fetching DEX prices...");

  const dsData    = await fetchDexScreenerPairs(DEX_PAIRS.map(p => p.pair));
  const dsHasData = Object.keys(dsData).length > 0;

  const filtered = filter === "stable"
    ? DEX_PAIRS.filter(p => ["mUSDC","mUSDT"].includes(p.symbol))
    : filter === "euro"
    ? DEX_PAIRS.filter(p => ["EURO","mEURO","mEURC"].includes(p.symbol))
    : DEX_PAIRS;

  const pairPrices = {};
  for (const p of filtered) {
    const key = p.pair.toLowerCase();
    if (dsHasData && dsData[key] && dsData[key].priceNative > 0) {
      pairPrices[key] = { price: dsData[key].priceNative, source: "DS", ...dsData[key] };
    } else {
      const onchain = await fetchPairOnChainPrice(p.pair);
      if (onchain) pairPrices[key] = { price: onchain, priceNative: onchain, source: "RPC" };
    }
  }

  await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

  const sourceNote = dsHasData ? "DexScreener API" : "On-Chain RPC (DS not indexed yet)";

  const lines = [
    `📊 *EUROSPACE DEX Live · Monad*`,
    `_Source: ${sourceNote}_`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ];

  for (const p of filtered) {
    const key      = p.pair.toLowerCase();
    const pd       = pairPrices[key];
    const hasPrice = pd && pd.price > 0;
    const priceStr = hasPrice ? fmtNative(pd.price) + " WMON" : "—";
    const usdStr   = hasPrice && pd.priceUsd ? fmtUsd(pd.priceUsd) : "";
    const ch24     = pd?.change24h ?? null;
    const ch1h     = pd?.change1h  ?? null;
    const chg24Str = ch24 !== null ? chgArrow(ch24) + " 24h" : "";
    const chg1hStr = ch1h !== null ? chgArrow(ch1h) + " 1h"  : "";
    const liq      = fmtVolLiq(pd?.liquidity);
    const vol      = fmtVolLiq(pd?.volume24h);
    const srcTag   = pd?.source === "RPC" ? " _(on-chain)_" : "";

    lines.push(
      `\n*${p.symbol}* · ${p.name}${srcTag}`,
      `💱 \`${priceStr}\`${usdStr ? " · " + usdStr : ""}`,
      [chg24Str, chg1hStr].filter(Boolean).join(" | ") || "",
      [liq ? "💧" + liq : "", vol ? "📊" + vol : ""].filter(Boolean).join(" · ") || "",
    );
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);

  const text    = lines.filter(l => l !== "").join("\n");
  const trimmed = text.length > 4000 ? text.slice(0, 3990) + "\n…" : text;

  await bot.sendMessage(chatId, trimmed, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text:"ALL",    callback_data:"dex_all"    },
          { text:"EURO",   callback_data:"dex_euro"   },
          { text:"STABLE", callback_data:"dex_stable" },
        ],
        [{ text:"🔄 Refresh", callback_data:"dex_all" }, { text:"📈 DexScreener", url:"https://dexscreener.com/monad" }],
        [{ text:"💰 RMAD Price", callback_data:"price_check" }],
        [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
      ],
    },
  });
}

// ─── COMMANDS ───────────────────────────────────────────────────────────────
bot.onText(/\/start/, (msg) =>
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, { parse_mode:"Markdown", reply_markup:MAIN_MENU_KEYBOARD })
);
bot.onText(/\/menu/, (msg) =>
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, { parse_mode:"Markdown", reply_markup:MAIN_MENU_KEYBOARD })
);
bot.onText(/\/price/, async (msg) => sendPriceMessage(msg.chat.id));
bot.onText(/\/dex/,   async (msg) => sendDexMessage(msg.chat.id, "all"));

bot.onText(/\/nfts/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "🚀 Loading all 7 Moon Rockets NFTs...");
  for (const nft of NFTS) {
    try {
      await bot.sendPhoto(chatId, nft.image, {
        caption: nftCaption(nft),
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard:[[{ text:"🌐 dApp", url:DAPP_URL }, { text:"📈 Trade", url:DEX_URL }]] },
      });
      await new Promise(r => setTimeout(r, 400));
    } catch (e) { console.error(`Error sending NFT ${nft.id}:`, e.message); }
  }
});

// /nft0 through /nft6
bot.onText(/\/nft(\d+)/, async (msg, match) => {
  const id  = parseInt(match[1]);
  const nft = NFTS.find(n => n.id === id);
  if (!nft) return bot.sendMessage(msg.chat.id, "❌ NFT not found. Use /nft0 - /nft6");
  try {
    await bot.sendPhoto(msg.chat.id, nft.image, { caption:nftCaption(nft), parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
  } catch (e) {
    bot.sendMessage(msg.chat.id, nftCaption(nft), { parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
  }
});

bot.onText(/\/trade/, (msg) => bot.sendMessage(msg.chat.id,
  `📈 *Trade RMAD Token*
━━━━━━━━━━━━━━━━━━━━
💱 Pair: \`RMAD / WMON\`
🏦 DEX: Uniswap V2 Fork on Monad
📍 Pair: \`${RMAD_PAIR}\`
💎 RMAD: \`${RMAD_ADDR}\`
━━━━━━━━━━━━━━━━━━━━`,
  { parse_mode:"Markdown", reply_markup:{ inline_keyboard:[
    [{ text:"📈 Trade on DexScreener", url:DEX_URL }],
    [{ text:"💰 Live Price", callback_data:"price_check" }, { text:"📊 DEX Live", callback_data:"dex_all" }],
    [{ text:"🌐 Open dApp", url:DAPP_URL }],
    [{ text:"📊 View on MonadVision", url:MONAD_URL }],
  ]}}
));

bot.onText(/\/stake/, (msg) => bot.sendMessage(msg.chat.id,
  `🔒 *How to Stake Moon Rockets*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Connect wallet on Monad Mainnet
2️⃣ Open the dApp below
3️⃣ Click \`+ Stake\` on any NFT card
4️⃣ Earn RMAD rewards every second
5️⃣ Click \`− Unstake\` to unstake anytime
6️⃣ Click \`Claim\` to collect RMAD
💡 Stake all 7 at once for max rewards!
━━━━━━━━━━━━━━━━━━━━
🔒 Staking: \`${STAKING_ADDR}\``,
  { parse_mode:"Markdown", reply_markup:{ inline_keyboard:[
    [{ text:"🌐 Start Staking", url:DAPP_URL }],
    [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
  ]}}
));

bot.onText(/\/info/, (msg) => bot.sendMessage(msg.chat.id,
  `💎 *RMAD Token Info*
━━━━━━━━━━━━━━━━━━━━
🌐 Network: Monad Mainnet (Chain ID: 143)
💎 Token: \`RMAD\`
📦 Collection: Moon Rockets Season 1
🔢 Total NFTs: 7 (Token IDs: #0–#6)
📅 Deployed: Block 70257020
📦 Minted: Block 70276151

📋 *Contracts*
💎 RMAD: \`${RMAD_ADDR}\`
🖼️ NFT: \`${NFT_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
🔮 Oracle: \`${ORACLE_ADDR}\`
🎰 Raffle: \`${RAFFLE_ADDR}\`
💱 LP Pair: \`${RMAD_PAIR}\`
━━━━━━━━━━━━━━━━━━━━`,
  { parse_mode:"Markdown", reply_markup:{ inline_keyboard:[
    [{ text:"📈 Trade", url:DEX_URL }, { text:"📊 MonadVision", url:MONAD_URL }],
    [{ text:"💰 Live Price", callback_data:"price_check" }, { text:"📊 DEX Live", callback_data:"dex_all" }],
    [{ text:"🌐 Open dApp", url:DAPP_URL }],
    [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
  ]}}
));

bot.onText(/\/help/, (msg) => bot.sendMessage(msg.chat.id,
  `🚀 *RocketMoonad Bot Commands*
━━━━━━━━━━━━━━━━━━━━
/start   — Main menu
/price   — Live on-chain RMAD price
/dex     — DEX Live: all 17 EUROSPACE pairs
/nfts    — View all 7 NFT cards with photos
/nft0    — View specific NFT (#0 to #6)
/trade   — Trade RMAD token
/stake   — How to stake guide
/info    — Token & contract info
/help    — This help message
━━━━━━━━━━━━━━━━━━━━`,
  { parse_mode:"Markdown" }
));

// ─── CALLBACK QUERIES ───────────────────────────────────────────────────────
bot.on("callback_query", async (query) => {
  const data   = query.data;
  const chatId = query.message.chat.id;
  try { await bot.answerCallbackQuery(query.id); } catch (e) {}

  if (data === "noop")        return;
  if (data === "main_menu")   { await bot.sendMessage(chatId, MAIN_MENU_TEXT, { parse_mode:"Markdown", reply_markup:MAIN_MENU_KEYBOARD }); return; }
  if (data === "price_check") { await sendPriceMessage(chatId); return; }
  if (data === "dex_all")     { await sendDexMessage(chatId, "all");    return; }
  if (data === "dex_euro")    { await sendDexMessage(chatId, "euro");   return; }
  if (data === "dex_stable")  { await sendDexMessage(chatId, "stable"); return; }

  if (data === "how_stake") {
    await bot.sendMessage(chatId,
      `🔒 *How to Stake Moon Rockets*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Connect wallet on Monad Mainnet
2️⃣ Open the dApp
3️⃣ Click \`+ Stake\` on any NFT card
4️⃣ Earn RMAD rewards every second
5️⃣ Click \`− Unstake\` to unstake anytime
6️⃣ Click \`Claim\` to collect RMAD
━━━━━━━━━━━━━━━━━━━━`,
      { parse_mode:"Markdown", reply_markup:{ inline_keyboard:[
        [{ text:"🌐 Start Staking", url:DAPP_URL }],
        [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
      ]}}
    );
    return;
  }

  if (data === "token_info") {
    await bot.sendMessage(chatId,
      `💎 *RMAD Token Info*
━━━━━━━━━━━━━━━━━━━━
💎 RMAD: \`${RMAD_ADDR}\`
🖼️ NFT: \`${NFT_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
🔮 Oracle: \`${ORACLE_ADDR}\`
🎰 Raffle: \`${RAFFLE_ADDR}\`
💱 LP Pair: \`${RMAD_PAIR}\`
━━━━━━━━━━━━━━━━━━━━`,
      { parse_mode:"Markdown", reply_markup:{ inline_keyboard:[
        [{ text:"📈 Trade", url:DEX_URL }, { text:"📊 MonadVision", url:MONAD_URL }],
        [{ text:"💰 Live Price", callback_data:"price_check" }],
        [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
      ]}}
    );
    return;
  }

  if (data === "all_nfts") {
    await bot.sendMessage(chatId, "🚀 Sending all 7 RocketMoonad NFTs...");
    for (const nft of NFTS) {
      try {
        await bot.sendPhoto(chatId, nft.image, {
          caption: nftCaption(nft), parse_mode: "Markdown",
          reply_markup:{ inline_keyboard:[[{ text:"🌐 dApp", url:DAPP_URL }, { text:"📈 Trade", url:DEX_URL }]] },
        });
        await new Promise(r => setTimeout(r, 400));
      } catch (e) { console.error(`NFT ${nft.id} error:`, e.message); }
    }
    return;
  }

  if (data.startsWith("nft_")) {
    const id  = parseInt(data.split("_")[1]);
    const nft = NFTS.find(n => n.id === id);
    if (!nft) return;
    try {
      await bot.sendPhoto(chatId, nft.image, { caption:nftCaption(nft), parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
    } catch (e) {
      await bot.sendMessage(chatId, nftCaption(nft), { parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
    }
    return;
  }
});

console.log("🚀 RocketMoonad Bot started! NFTs: 7 | Contracts: updated");
