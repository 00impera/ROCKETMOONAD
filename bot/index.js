const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const bot   = new TelegramBot(TOKEN, { polling: true });

const DAPP_URL    = "https://6e82f368.rocketmoonad.pages.dev";
const DEX_URL     = "https://dexscreener.com/monad/0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3";
const MONAD_URL   = "https://monadvision.com/token/0x9a440Afaa434cDd19234e58798DeFA0E71be0A67?tab=Holders";
const NFT_ADDR    = "0x45336C2E15F2fe58c67Ee4035a520231b2751669";
const STAKING_ADDR= "0xec5773F31CA0F4012624392243E0B6517B518976";
const RMAD_ADDR   = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";

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

const RARITY_EMOJI = {
  Legendary: "🔥",
  Mythic:    "🐉",
  Epic:      "💜",
  Rare:      "💙",
  Uncommon:  "💚",
  Common:    "⚪",
};

const RARITY_STARS = {
  Legendary: "⭐⭐⭐⭐⭐",
  Mythic:    "🌟🌟🌟🌟🌟",
  Epic:      "⭐⭐⭐⭐",
  Rare:      "⭐⭐⭐",
  Uncommon:  "⭐⭐",
  Common:    "⭐",
};

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
      [
        { text: "🌐 Open dApp",    url: DAPP_URL },
        { text: "📈 Trade RMAD",   url: DEX_URL  },
      ],
      [
        { text: "📊 MonadVision",  url: MONAD_URL },
        { text: "🔍 Staking",      url: `${DAPP_URL}` },
      ],
      [
        { text: "◀️ Prev NFT", callback_data: `nft_${nft.id - 1 < 1 ? 11 : nft.id - 1}` },
        { text: `${nft.id}/11`,    callback_data: "noop" },
        { text: "Next NFT ▶️", callback_data: `nft_${nft.id + 1 > 11 ? 1 : nft.id + 1}` },
      ],
      [
        { text: "🏠 Main Menu", callback_data: "main_menu" },
      ],
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
    [
      { text: "🌐 Open dApp",       url: DAPP_URL   },
      { text: "📈 Trade RMAD",      url: DEX_URL    },
    ],
    [
      { text: "🖼️ View All NFTs",   callback_data: "nft_1"      },
      { text: "📊 Token Info",       callback_data: "token_info" },
    ],
    [
      { text: "📊 MonadVision",      url: MONAD_URL  },
      { text: "ℹ️ How to Stake",     callback_data: "how_stake"  },
    ],
    [
      { text: "📋 All NFT Cards",    callback_data: "all_nfts"   },
    ],
  ],
};

// ── /start ────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, {
    parse_mode: "Markdown",
    reply_markup: MAIN_MENU_KEYBOARD,
  });
});

// ── /menu ─────────────────────────────────────────────────
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, MAIN_MENU_TEXT, {
    parse_mode: "Markdown",
    reply_markup: MAIN_MENU_KEYBOARD,
  });
});

// ── /nfts ─────────────────────────────────────────────────
bot.onText(/\/nfts/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "🚀 Loading all 11 Moon Rockets NFTs...");
  for (const nft of NFTS) {
    try {
      await bot.sendPhoto(chatId, nft.image, {
        caption: nftCaption(nft),
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "🌐 dApp",       url: DAPP_URL },
            { text: "📈 Trade",      url: DEX_URL  },
          ]],
        },
      });
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`Error sending NFT ${nft.id}:`, e.message);
    }
  }
});

// ── /nft <id> ─────────────────────────────────────────────
bot.onText(/\/nft(\d+)/, async (msg, match) => {
  const id  = parseInt(match[1]);
  const nft = NFTS.find(n => n.id === id);
  if (!nft) return bot.sendMessage(msg.chat.id, "❌ NFT not found. Use /nft1 - /nft11");
  try {
    await bot.sendPhoto(msg.chat.id, nft.image, {
      caption: nftCaption(nft),
      parse_mode: "Markdown",
      reply_markup: nftKeyboard(nft),
    });
  } catch (e) {
    bot.sendMessage(msg.chat.id, nftCaption(nft), {
      parse_mode: "Markdown",
      reply_markup: nftKeyboard(nft),
    });
  }
});

// ── /trade ────────────────────────────────────────────────
bot.onText(/\/trade/, (msg) => {
  bot.sendMessage(msg.chat.id,
`📈 *Trade RMAD Token*
━━━━━━━━━━━━━━━━━━━━
💱 Pair: \`RMAD / WMON\`
🏦 DEX: Uniswap V2 Fork on Monad
📍 Pair Address:
\`0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3\`

💎 RMAD Token:
\`${RMAD_ADDR}\`
━━━━━━━━━━━━━━━━━━━━`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📈 Trade on DexScreener", url: DEX_URL }],
          [{ text: "🌐 Open dApp",            url: DAPP_URL }],
          [{ text: "📊 View on MonadVision",  url: MONAD_URL }],
        ],
      },
    }
  );
});

// ── /stake ────────────────────────────────────────────────
bot.onText(/\/stake/, (msg) => {
  bot.sendMessage(msg.chat.id,
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
🔒 Staking Contract:
\`${STAKING_ADDR}\``,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌐 Start Staking", url: DAPP_URL }],
          [{ text: "🏠 Main Menu",     callback_data: "main_menu" }],
        ],
      },
    }
  );
});

// ── /info ─────────────────────────────────────────────────
bot.onText(/\/info/, (msg) => {
  bot.sendMessage(msg.chat.id,
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
💱 LP Pair: \`0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3\`
━━━━━━━━━━━━━━━━━━━━`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📈 Trade",        url: DEX_URL    },
            { text: "📊 MonadVision",  url: MONAD_URL  },
          ],
          [{ text: "🌐 Open dApp",     url: DAPP_URL   }],
          [{ text: "🏠 Main Menu",     callback_data: "main_menu" }],
        ],
      },
    }
  );
});

// ── /help ─────────────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🚀 *RocketMoonad Bot Commands*
━━━━━━━━━━━━━━━━━━━━
/start   — Main menu
/nfts    — View all 11 NFT cards with photos
/nft1    — View specific NFT (1-11)
/trade   — Trade RMAD token
/stake   — How to stake guide
/info    — Token & contract info
/help    — This help message
━━━━━━━━━━━━━━━━━━━━`,
    { parse_mode: "Markdown" }
  );
});

// ── CALLBACK QUERIES ──────────────────────────────────────
bot.on("callback_query", async (query) => {
  const data   = query.data;
  const chatId = query.message.chat.id;
  const msgId  = query.message.message_id;

  await bot.answerCallbackQuery(query.id);

  if (data === "noop") return;

  if (data === "main_menu") {
    await bot.sendMessage(chatId, MAIN_MENU_TEXT, {
      parse_mode: "Markdown",
      reply_markup: MAIN_MENU_KEYBOARD,
    });
    return;
  }

  if (data === "token_info") {
    bot.emit("text", { chat: { id: chatId }, text: "/info" }, ["/info"]);
    bot.onText(/\/info/, () => {}); // trigger
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
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📈 Trade", url: DEX_URL }, { text: "📊 MonadVision", url: MONAD_URL }],
            [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
          ],
        },
      }
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
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Start Staking", url: DAPP_URL }],
            [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
          ],
        },
      }
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
          reply_markup: {
            inline_keyboard: [[
              { text: "🌐 dApp", url: DAPP_URL },
              { text: "📈 Trade", url: DEX_URL },
            ]],
          },
        });
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        console.error(`NFT ${nft.id} error:`, e.message);
      }
    }
    return;
  }

  if (data.startsWith("nft_")) {
    const id  = parseInt(data.split("_")[1]);
    const nft = NFTS.find(n => n.id === id);
    if (!nft) return;
    try {
      await bot.sendPhoto(chatId, nft.image, {
        caption: nftCaption(nft),
        parse_mode: "Markdown",
        reply_markup: nftKeyboard(nft),
      });
    } catch (e) {
      await bot.sendMessage(chatId, nftCaption(nft), {
        parse_mode: "Markdown",
        reply_markup: nftKeyboard(nft),
      });
    }
  }
});

console.log("🚀 RocketMoonad Bot started!");
