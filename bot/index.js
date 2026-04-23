const TelegramBot = require("node-telegram-bot-api");
const http = require("http");

const TOKEN = process.env.BOT_TOKEN;
const bot   = new TelegramBot(TOKEN, { polling: true });

http.createServer((req, res) => res.end("🚀 RocketMoonad Bot is running!"))
    .listen(process.env.PORT || 3000);

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err.message));
process.on("uncaughtException",  (err) => console.error("Uncaught exception:",  err.message));

const DAPP_URL     = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL      = "https://dexscreener.com/monad/0x2cE8C8F4961a54B2e87585f4178467006B76B418";
const MONAD_URL    = "https://monadvision.com/token/0x9a440Afaa434cDd19234e58798DeFA0E71be0A67?tab=Holders";
const NFT_ADDR     = "0x45336C2E15F2fe58c67Ee4035a520231b2751669";
const STAKING_ADDR = "0xec5773F31CA0F4012624392243E0B6517B518976";
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";
const RMAD_PAIR    = "0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3";
const MONAD_RPCS   = ["https://rpc.monad.xyz", "https://rpc.ankr.com/monad_mainnet"];
const DS_API       = "https://api.dexscreener.com/latest/dex/pairs/monad";

const DEX_PAIRS = [
  { symbol:"EURO",   name:"Meta EuroCoin",  pair:"0x9E32FdD909a5BdcCfb874DEE72F24169AfE4eC02" },
  { symbol:"mBTC",   name:"Meta Bitcoin",   pair:"0x47Dc73D3e1C520056AdF52349A6A282e5262D56d" },
  { symbol:"mETH",   name:"Meta Ethereum",  pair:"0xDE92BC23146222B86e638B6E88E23917eD378a6E" },
  { symbol:"mSOL",   name:"Meta Solana",    pair:"0xf8dbc8Cc478506fb0844C670B35b90A7AD6Ad912" },
  { symbol:"mBNB",   name:"Meta BNB",       pair:"0xd77B55A199EA0DC81EB4c7c36d45fBda4D6477B6" },
  { symbol:"mXRP",   name:"Meta XRP",       pair:"0x69884c6C8Fe6F833aEEDE2A4c0949e667C7F79fB" },
  { symbol:"mUSDC",  name:"Meta USDC",      pair:"0x3BE5B19348d6Ccbc20e0DCF3Cab0aDF9e4643dCa" },
  { symbol:"mUSDT",  name:"Meta Tether",    pair:"0xAB4CFB051E73db47f75c4A2c31dFaAFd3A82A8b8" },
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

// ── On-chain RPC helper ───────────────────────────────────
async function rpcFetch(method, params) {
  for (const rpc of MONAD_RPCS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json();
      if (d.result !== undefined) return d.result;
    } catch (_) {}
  }
  return null;
}

// ── RMAD on-chain price ───────────────────────────────────
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

// ── On-chain price for any EUROSPACE pair ─────────────────
// token0() = 0x0dfe1681, getReserves() = 0x0902f1ac
async function fetchPairOnChainPrice(pairAddr) {
  try {
    const t0res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0dfe1681" }, "latest"]);
    const token0 = t0res && t0res.length >= 66 ? ("0x" + t0res.slice(26)).toLowerCase() : null;

    const res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0902f1ac" }, "latest"]);
    if (!res || res === "0x" || res.length < 130) return null;
    const r0 = BigInt("0x" + res.slice(2, 66));
    const r1 = BigInt("0x" + res.slice(66, 130));
    if (r0 === 0n || r1 === 0n) return null;

    // token0 is the base token (not WMON), token1 is WMON
    // price in WMON = r1/r0 if base is token0, else r0/r1
    const wmonLower = WMON_ADDR.toLowerCase();
    const wmonIsToken0 = token0 === wmonLower;
    // price of base token in WMON
    const price = wmonIsToken0
      ? Number((r0 * 1_000_000_000_000n) / r1) / 1_000_000_000_000
      : Number((r1 * 1_000_000_000_000n) / r0) / 1_000_000_000_000;
    return price;
  } catch (_) { return null; }
}

// ── DexScreener batch fetch (fallback) ───────────────────
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
        };
      }
    }
    return results;
  } catch (e) {
    console.error("DexScreener API error:", e.message);
    return {};
  }
}

// ── Price formatters ──────────────────────────────────────
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

// ── NFT data ──────────────────────────────────────────────
const NFTS = [
  { id:1,  name:"Dark Flame Knight I",   rarity:"Legendary", power:95, speed:88, boost:92,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867743/rocketmoonad/nfts/dark_flame_knight_i.jpg" },
  { id:2,  name:"Ember Warlord",         rarity:"Epic",      power:87, speed:75, boost:80,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867746/rocketmoonad/nfts/ember_warlord.jpg" },
  { id:3,  name:"Shadow Thunder Knight", rarity:"Epic",      power:83, speed:79, boost:77,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867749/rocketmoonad/nfts/shadow_thunder_knight.jpg" },
  { id:4,  name:"Iron Crown Sentinel",   rarity:"Rare",      power:72, speed:68, boost:70,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867752/rocketmoonad/nfts/iron_crown_sentinel.jpg" },
  { id:5,  name:"Dark Flame Knight II",  rarity:"Legendary", power:97, speed:90, boost:95,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867756/rocketmoonad/nfts/dark_flame_knight_ii.jpg" },
  { id:6,  name:"Galactic Voyager",      rarity:"Epic",      power:80, speed:95, boost:85,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867758/rocketmoonad/nfts/galactic_voyager.jpg" },
  { id:7,  name:"Neon Rocket Alpha",     rarity:"Rare",      power:65, speed:88, boost:72,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867762/rocketmoonad/nfts/neon_rocket_alpha.jpg" },
  { id:8,  name:"Cosmic Shuttle",        rarity:"Rare",      power:60, speed:85, boost:68,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867764/rocketmoonad/nfts/cosmic_shuttle.jpg" },
  { id:9,  name:"Neon Rocket Omega",     rarity:"Uncommon",  power:55, speed:80, boost:60,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867767/rocketmoonad/nfts/neon_rocket_omega.jpg" },
  { id:10, name:"Arby Butterfly Rocket", rarity:"Mythic",    power:99, speed:99, boost:99,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867770/rocketmoonad/nfts/arby_butterfly_rocket.gif" },
  { id:11, name:"Boys Club Rocket Ride", rarity:"Legendary", power:91, speed:94, boost:93,
    image:"https://res.cloudinary.com/drmsykh02/image/upload/v1776867774/rocketmoonad/nfts/boys_club_rocket_ride.gif" },
];

const RARITY_EMOJI = { Legendary:"🔥", Mythic:"🐉", Epic:"💜", Rare:"💙", Uncommon:"💚", Common:"⚪" };
const RARITY_STARS = { Legendary:"⭐⭐⭐⭐⭐", Mythic:"🌟🌟🌟🌟🌟", Epic:"⭐⭐⭐⭐", Rare:"⭐⭐⭐", Uncommon:"⭐⭐", Common:"⭐" };

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
  return {
    inline_keyboard: [
      [{ text:"🌐 Open dApp", url:DAPP_URL }, { text:"📈 Trade RMAD", url:DEX_URL }],
      [{ text:"📊 MonadVision", url:MONAD_URL }, { text:"🔍 Staking", url:DAPP_URL }],
      [
        { text:"◀️ Prev NFT", callback_data:`nft_${nft.id - 1 < 1 ? 11 : nft.id - 1}` },
        { text:`${nft.id}/11`, callback_data:"noop" },
        { text:"Next NFT ▶️", callback_data:`nft_${nft.id + 1 > 11 ? 1 : nft.id + 1}` },
      ],
      [{ text:"🏠 Main Menu", callback_data:"main_menu" }],
    ],
  };
}

const MAIN_MENU_TEXT = `
🚀 *RocketMoonad* — Moon Rockets Season 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌕 Stake your Moon Rockets NFTs
💎 Earn \`RMAD\` rewards on Monad Mainnet
🎮 11 unique NFT characters with stats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NFT Contract:
\`${NFT_ADDR}\`

💎 RMAD Token:
\`${RMAD_ADDR}\`

🔒 Staking Contract:
\`${STAKING_ADDR}\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [{ text:"🌐 Open dApp", url:DAPP_URL }, { text:"📈 Trade RMAD", url:DEX_URL }],
    [{ text:"🖼️ View All NFTs", callback_data:"nft_1" }, { text:"💰 Live Price", callback_data:"price_check" }],
    [{ text:"📊 MonadVision", url:MONAD_URL }, { text:"ℹ️ How to Stake", callback_data:"how_stake" }],
    [{ text:"📋 All NFT Cards", callback_data:"all_nfts" }, { text:"📊 DEX Live", callback_data:"dex_all" }],
  ],
};

async function sendPriceMessage(chatId) {
  const loadingMsg = await bot.sendMessage(chatId, "⏳ Fetching live on-chain price...");
  const price = await fetchOnChainPrice();
  await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
  const now = new Date().toUTCString();
  const text = price !== null
    ? `💰 *RMAD Live Price*
━━━━━━━━━━━━━━━━━━━━
🔗 Source: On\\-Chain \\(Monad Mainnet\\)
💱 Pair: \`RMAD / WMON\`
💵 Price: \`${price.toFixed(12)} WMON\`
━━━━━━━━━━━━━━━━━━━━
📦 NFT: \`${NFT_ADDR}\`
💎 RMAD: \`${RMAD_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
━━━━━━━━━━━━━━━━━━━━
🕐 _Updated: ${now}_`
    : `❌ *Price Unavailable*
━━━━━━━━━━━━━━━━━━━━
Could not fetch on\\-chain price\\.
RPC may be temporarily unavailable\\.`;

  await bot.sendMessage(chatId, text, {
    parse_mode: "MarkdownV2",
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

// ── DEX live — tries DexScreener first, falls back to on-chain RPC ────────────
async function sendDexMessage(chatId, filter = "all") {
  const loadingMsg = await bot.sendMessage(chatId, "⏳ Fetching DEX prices...");

  // Try DexScreener first
  const dsData = await fetchDexScreenerPairs(DEX_PAIRS.map(p => p.pair));
  const dsHasData = Object.keys(dsData).length > 0;

  const filtered = filter === "stable"
    ? DEX_PAIRS.filter(p => ["mUSDC","mUSDT"].includes(p.symbol))
    : filter === "euro"
    ? DEX_PAIRS.filter(p => ["EURO","mEURO","mEURC"].includes(p.symbol))
    : DEX_PAIRS;

  // For each pair, get price: DS first, then on-chain RPC fallback
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

  let lines = [
    `📊 *EUROSPACE DEX Live · Monad*`,
    `_Source: ${sourceNote}_`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ];

  for (const p of filtered) {
    const key = p.pair.toLowerCase();
    const pd  = pairPrices[key];
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

// ── Commands ──────────────────────────────────────────────
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
  await bot.sendMessage(chatId, "🚀 Loading all 11 Moon Rockets NFTs...");
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

bot.onText(/\/nft(\d+)/, async (msg, match) => {
  const nft = NFTS.find(n => n.id === parseInt(match[1]));
  if (!nft) return bot.sendMessage(msg.chat.id, "❌ NFT not found. Use /nft1 - /nft11");
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
📍 Pair Address: \`${RMAD_PAIR}\`
💎 RMAD Token: \`${RMAD_ADDR}\`
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
3️⃣ Click \`+\` on any NFT card to stake
4️⃣ Earn RMAD rewards daily
5️⃣ Click \`−\` to unstake anytime
6️⃣ Click \`Claim\` to collect RMAD
💡 You can stake multiple NFTs at once!
━━━━━━━━━━━━━━━━━━━━
🔒 Staking Contract: \`${STAKING_ADDR}\``,
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
📦 NFT: Moon Rockets Season 1
🔢 Total NFTs: 11 unique characters
📋 *Contracts*
💎 RMAD: \`${RMAD_ADDR}\`
🖼️ NFT: \`${NFT_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
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
/nfts    — View all 11 NFT cards with photos
/nft1    — View specific NFT (1-11)
/trade   — Trade RMAD token
/stake   — How to stake guide
/info    — Token & contract info
/help    — This help message
━━━━━━━━━━━━━━━━━━━━`,
  { parse_mode:"Markdown" }
));

bot.on("callback_query", async (query) => {
  const data   = query.data;
  const chatId = query.message.chat.id;
  try { await bot.answerCallbackQuery(query.id); } catch (e) {}

  if (data === "noop") return;
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
3️⃣ Click \`+\` on any NFT card to stake
4️⃣ Earn RMAD rewards daily
5️⃣ Click \`−\` to unstake anytime
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
    await bot.sendMessage(chatId, "🚀 Sending all 11 NFT cards...");
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
    const nft = NFTS.find(n => n.id === parseInt(data.split("_")[1]));
    if (!nft) return;
    try {
      await bot.sendPhoto(chatId, nft.image, { caption:nftCaption(nft), parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
    } catch (e) {
      await bot.sendMessage(chatId, nftCaption(nft), { parse_mode:"Markdown", reply_markup:nftKeyboard(nft) });
    }
    return;
  }
});

console.log("🚀 RocketMoonad Bot started!");
