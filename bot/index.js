const TelegramBot = require("node-telegram-bot-api");
const http = require("http");

const TOKEN = process.env.BOT_TOKEN;
const bot   = new TelegramBot(TOKEN, { polling: true });

// ── Keep-alive HTTP server for Render free tier ───────────
http.createServer((req, res) => res.end("🚀 RocketMoonad Bot is running!"))
    .listen(process.env.PORT || 3000);

// ── Crash protection ──────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err.message);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
});

// ── Constants ─────────────────────────────────────────────
const DAPP_URL     = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL      = "https://dexscreener.com/monad/0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3";
const MONAD_URL    = "https://monadvision.com/token/0x9a440Afaa434cDd19234e58798DeFA0E71be0A67?tab=Holders";
const NFT_ADDR     = "0x45336C2E15F2fe58c67Ee4035a520231b2751669";
const STAKING_ADDR = "0xec5773F31CA0F4012624392243E0B6517B518976";
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";
const RMAD_PAIR    = "0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3";
const MONAD_RPCS   = ["https://rpc.monad.xyz", "https://monad.drpc.org"];

// ── On-chain price helpers ────────────────────────────────
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

// Cache token0 so we only call it once per bot lifetime
let rmadToken0Cache = null;

async function fetchToken0(pairAddr) {
  // token0() selector: 0x0dfe1681
  const res = await rpcFetch("eth_call", [{ to: pairAddr, data: "0x0dfe1681" }, "latest"]);
  if (!res || res === "0x" || res.length < 66) return null;
  return ("0x" + res.slice(26)).toLowerCase();
}

async function fetchOnChainPrice() {
  try {
    // Resolve token0 direction once and cache
    if (!rmadToken0Cache) {
      rmadToken0Cache = await fetchToken0(RMAD_PAIR);
    }

    // getReserves() selector: 0x0902f1ac
    const res = await rpcFetch("eth_call", [{ to: RMAD_PAIR, data: "0x0902f1ac" }, "latest"]);
    if (!res || res === "0x" || res.length < 130) return null;

    const r0 = BigInt("0x" + res.slice(2, 66));
    const r1 = BigInt("0x" + res.slice(66, 130));
    if (r0 === 0n || r1 === 0n) return null;

    // Determine which reserve is RMAD and which is WMON
    const rmadIsToken0 = rmadToken0Cache
      ? rmadToken0Cache === RMAD_ADDR.toLowerCase()
      : RMAD_ADDR.toLowerCase() < WMON_ADDR.toLowerCase();

    // Price = WMON per RMAD
    const price = rmadIsToken0
      ? Number((r1 * 1_000_000_000_000n) / r0) / 1_000_000_000_000
      : Number((r0 * 1_000_000_000_000n) / r1) / 1_000_000_000_000;

    return price;
  } catch (e) {
    console.error("fetchOnChainPrice error:", e.message);
    return null;
  }
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
  const emoji = RARITY_EMOJI[nft.rarity] || "⚪";
  const stars = RARITY_STARS[nft.rarity] || "⭐";
  return (
`🚀 *Moon Rockets Season 1*
━━━━━━━━━━━━━━━━━━━━
${emoji} *${nft.name}*
🏷️ Rarity: \`${nft.rarity}\` ${stars}
🆔 Token ID: \`#${nft.id}\`

📊 *STATS*
⚔️ PWR: \`${bar(nft.power)}\`
💨 SPD: \`${bar(nft.speed)}\`
🚀 BST: \`${bar(nft.boost)}\`

💎 *RMAD Token:* \`${RMAD_ADDR}\`
📦 *NFT Contract:* \`${NFT_ADDR}\`
━━━━━━━━━━━━━━━━━━━━
🌐 [Open dApp](${DAPP_URL}) | 📈 [Trade RMAD](${DEX_URL})`
  );
}

function nftKeyboard(nft) {
  return {
    inline_keyboard: [
      [{ text: "🌐 Open dApp", url: DAPP_URL }, { text: "📈 Trade RMAD", url: DEX_URL }],
      [{ text: "📊 MonadVision", url: MONAD_URL }, { text: "🔍 Staking", url: DAPP_URL }],
      [
        { text: "◀️ Prev NFT", callback_data: `nft_${nft.id - 1 < 1 ? 11 : nft.id - 1}` },
        { text: `${nft.id}/11`, callback_data: "noop" },
        { text: "Next NFT ▶️", callback_data: `nft_${nft.id + 1 > 11 ? 1 : nft.id + 1}` },
      ],
      [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
    ],
  };
}

// ── Menu ──────────────────────────────────────────────────
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
    [{ text: "🌐 Open dApp", url: DAPP_URL }, { text: "📈 Trade RMAD", url: DEX_URL }],
    [{ text: "🖼️ View All NFTs", callback_data: "nft_1" }, { text: "💰 Live Price", callback_data: "price_check" }],
    [{ text: "📊 MonadVision", url: MONAD_URL }, { text: "ℹ️ How to Stake", callback_data: "how_stake" }],
    [{ text: "📋 All NFT Cards", callback_data: "all_nfts" }],
  ],
};

// ── Helper: send price message ────────────────────────────
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
RPC may be temporarily unavailable\\.
Please try again in a moment\\.`;

  await bot.sendMessage(chatId, text, {
    parse_mode: "MarkdownV2",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Refresh Price", callback_data: "price_check" }, { text: "📈 DexScreener Chart", url: DEX_URL }],
        [{ text: "📊 MonadVision", url: MONAD_URL }, { text: "🌐 Open dApp", url: DAPP_URL }],
        [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
      ],
    },
  });
}

// ── Commands ──────────────────────────────────────────────
bot.onText(/\/start/, (msg) =>
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, { parse_mode: "Markdown", reply_markup: MAIN_MENU_KEYBOARD })
);

bot.onText(/\/menu/, (msg) =>
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, { parse_mode: "Markdown", reply_markup: MAIN_MENU_KEYBOARD })
);

bot.onText(/\/price/, async (msg) => {
  await sendPriceMessage(msg.chat.id);
});

bot.onText(/\/nfts/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "🚀 Loading all 11 Moon Rockets NFTs...");
  for (const nft of NFTS) {
    try {
      await bot.sendPhoto(chatId, nft.image, {
        caption: nftCaption(nft),
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🌐 dApp", url: DAPP_URL }, { text: "📈 Trade", url: DEX_URL }]] },
      });
      await new Promise(r => setTimeout(r, 400));
    } catch (e) { console.error(`Error sending NFT ${nft.id}:`, e.message); }
  }
});

bot.onText(/\/nft(\d+)/, async (msg, match) => {
  const nft = NFTS.find(n => n.id === parseInt(match[1]));
  if (!nft) return bot.sendMessage(msg.chat.id, "❌ NFT not found. Use /nft1 - /nft11");
  try {
    await bot.sendPhoto(msg.chat.id, nft.image, { caption: nftCaption(nft), parse_mode: "Markdown", reply_markup: nftKeyboard(nft) });
  } catch (e) {
    bot.sendMessage(msg.chat.id, nftCaption(nft), { parse_mode: "Markdown", reply_markup: nftKeyboard(nft) });
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
  { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
    [{ text: "📈 Trade on DexScreener", url: DEX_URL }],
    [{ text: "💰 Live Price", callback_data: "price_check" }],
    [{ text: "🌐 Open dApp", url: DAPP_URL }],
    [{ text: "📊 View on MonadVision", url: MONAD_URL }],
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
  { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
    [{ text: "🌐 Start Staking", url: DAPP_URL }],
    [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
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
  { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
    [{ text: "📈 Trade", url: DEX_URL }, { text: "📊 MonadVision", url: MONAD_URL }],
    [{ text: "💰 Live Price", callback_data: "price_check" }],
    [{ text: "🌐 Open dApp", url: DAPP_URL }],
    [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
  ]}}
));

bot.onText(/\/help/, (msg) => bot.sendMessage(msg.chat.id,
`🚀 *RocketMoonad Bot Commands*
━━━━━━━━━━━━━━━━━━━━
/start   — Main menu
/price   — Live on-chain RMAD price
/nfts    — View all 11 NFT cards with photos
/nft1    — View specific NFT (1-11)
/trade   — Trade RMAD token
/stake   — How to stake guide
/info    — Token & contract info
/help    — This help message
━━━━━━━━━━━━━━━━━━━━`,
  { parse_mode: "Markdown" }
));

// ── Callback query handler ────────────────────────────────
bot.on("callback_query", async (query) => {
  const data   = query.data;
  const chatId = query.message.chat.id;

  try { await bot.answerCallbackQuery(query.id); } catch (e) {}

  if (data === "noop") return;

  if (data === "main_menu") {
    await bot.sendMessage(chatId, MAIN_MENU_TEXT, { parse_mode: "Markdown", reply_markup: MAIN_MENU_KEYBOARD });
    return;
  }

  if (data === "price_check") {
    await sendPriceMessage(chatId);
    return;
  }

  if (data === "token_info") {
    await bot.sendMessage(chatId,
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
━━━━━━━━━━━━━━━━━━━━`,
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
        [{ text: "📈 Trade", url: DEX_URL }, { text: "📊 MonadVision", url: MONAD_URL }],
        [{ text: "💰 Live Price", callback_data: "price_check" }],
        [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
      ]}}
    );
    return;
  }

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
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
        [{ text: "🌐 Start Staking", url: DAPP_URL }],
        [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
      ]}}
    );
    return;
  }

  if (data === "all_nfts") {
    await bot.sendMessage(chatId, "🚀 Sending all 11 NFT cards...");
    for (const nft of NFTS) {
      try {
        await bot.sendPhoto(chatId, nft.image, {
          caption: nftCaption(nft),
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🌐 dApp", url: DAPP_URL }, { text: "📈 Trade", url: DEX_URL }]] },
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
      await bot.sendPhoto(chatId, nft.image, { caption: nftCaption(nft), parse_mode: "Markdown", reply_markup: nftKeyboard(nft) });
    } catch (e) {
      await bot.sendMessage(chatId, nftCaption(nft), { parse_mode: "Markdown", reply_markup: nftKeyboard(nft) });
    }
    return;
  }
});

console.log("🚀 RocketMoonad Bot started!");
