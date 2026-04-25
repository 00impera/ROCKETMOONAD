const TelegramBot = require("node-telegram-bot-api");
const http = require("http");

const TOKEN = process.env.BOT_TOKEN;
const bot   = new TelegramBot(TOKEN, { polling: true });

http.createServer((req,res)=>res.end("🚀 RocketMoonad Bot running!")).listen(process.env.PORT||3000);
process.on("unhandledRejection", err=>console.error("Rejection:",err.message));
process.on("uncaughtException",  err=>console.error("Exception:", err.message));

const NFT_ADDR     = "0x79C0bC7CF4B9F30F8614e66236eF634DB50f668f";
const STAKING_ADDR = "0x2F0317d1166fF385F44FACBd92BD4E43b03D2CbE";
const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1";
const RAFFLE_ADDR  = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee";
const RMAD_PAIR    = "0xb5CB9F4ECCBeae6F95C9222Aa12C319fF362a5a3";
const WMON_ADDR    = "0x2cE8C8F4961a54B2e87585f4178467006B76B418";

// ── Uniswap V4 ───────────────────────────────────────────────────────────────
const V4_POOL_MANAGER     = "0xb362A2b87695a71A65092bd500fB05B558180048";
const V4_POSITION_MANAGER = "0xECAD0032774e3697565A0B9613182AC03319F2A1";
const V4_PERMIT2          = "0x63b8378896B425A036E9FA09D2D437d957A96c5c";
const V4_STATE_VIEW       = "0x6698C8c1c098DF7F729493dBc2B2258eFcA539b0";
const WMOON               = "0x2ce8c8f4961a54b2e87585f4178467006b76b418";

const DAPP_URL  = "https://b7845c61.rocketmoonad.pages.dev";
const DEX_URL   = `https://dexscreener.com/monad/${RMAD_PAIR}`;
const MONAD_URL = `https://monadvision.com/token/${RMAD_ADDR}?tab=Holders`;
const MONAD_RPCS = ["https://rpc.monad.xyz","https://rpc.ankr.com/monad_mainnet"];

const V4_PAIRS = [
  {symbol:"EURO",   contract:"0x5548D8405F343a6075a46a45CB954bCeB8Ba4E79"},
  {symbol:"mBTC",   contract:"0x5078A3531Dba3Dea11AB4aaF641DB6f0fE88579e"},
  {symbol:"mETH",   contract:"0x271028A77301bb705C293Bd1fFA79E239AB1Daec"},
  {symbol:"mSOL",   contract:"0xEd59c5bA2180ce57a723Dbc04FF3A81e1ba84B3C"},
  {symbol:"mBNB",   contract:"0xb1326c51F73814f071bb4d3db44c86dD03DC8C76"},
  {symbol:"mXRP",   contract:"0x379563529988bD76DeD9bc4a175AD59df6191B75"},
  {symbol:"mUSDC",  contract:"0xe0Ed08D1bC86b98434861ae0403be968bD95465E"},
  {symbol:"mUSDT",  contract:"0x085368cae9d4eCffe676806c3a8105433377164b"},
  {symbol:"mMATIC", contract:"0x43C60d3cec23b0E85678602A4F5C1156a7398daC"},
  {symbol:"mDOGE",  contract:"0x111b31d8474Aee70767337FD794a7fb0A08788A8"},
  {symbol:"mLTC",   contract:"0x8abAe4dbf7A2e286d688fa7101bea0fAE4C0Dd75"},
  {symbol:"mTRX",   contract:"0x1A3206c56993d4906ec26Fe85194399E0dBD8EBf"},
  {symbol:"mBASE",  contract:"0xeA66DaF739823505817d4DAfEdBb43Dc0C2E5372"},
  {symbol:"mEURO",  contract:"0x4443892C796f7A519C9D099417EC8422f88F5867"},
  {symbol:"mMONAD", contract:"0xbF5E34B1EBE37F9a98BFcE48645dc67Dd84E5fD6"},
  {symbol:"mEURC",  contract:"0x7bD9bbFc0086B033ede5736e4Aa9C16a451D0904"},
  {symbol:"mCRO",   contract:"0x0127B3c3C864cfC1BB519beB935477299b961d46"},
];

const NFTS = [
  {id:0,name:"RocketMoonad #1",rarity:"Legendary",power:95,speed:90,boost:92,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057320/rocketmoonad/afomr3mzeyu1s2ydjfpn.jpg",history:"First rocket launched on Monad Mainnet. Genesis of the RocketMoonad collection."},
  {id:1,name:"RocketMoonad #2",rarity:"Epic",power:87,speed:82,boost:80,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057326/rocketmoonad/o2tn8s6s1mnq1c3ym0ci.jpg",history:"Pioneer of the RocketMoonad staking ecosystem."},
  {id:2,name:"RocketMoonad #3",rarity:"Epic",power:83,speed:78,boost:77,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057329/rocketmoonad/lazmddwnnu3urha31r4y.jpg",history:"Fueled by RMAD token rewards from the staking contract."},
  {id:3,name:"RocketMoonad #4",rarity:"Rare",power:72,speed:68,boost:70,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057337/rocketmoonad/hocbys9ebhxu4npr0yqq.jpg",history:"Entered the RocketMoonad raffle system at block 70257020."},
  {id:4,name:"RocketMoonad #5",rarity:"Rare",power:68,speed:74,boost:66,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057341/rocketmoonad/ei6mqxspfepkktds0tdk.jpg",history:"Staked in the RocketMoonad staking contract earning RMAD rewards."},
  {id:5,name:"RocketMoonad #6",rarity:"Uncommon",power:60,speed:65,boost:58,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057343/rocketmoonad/dr0lwprrotv0znjfkfof.jpg",history:"Part of the RocketMoonad DeFi ecosystem on Monad chain 143."},
  {id:6,name:"RocketMoonad #7",rarity:"Uncommon",power:55,speed:62,boost:54,image:"https://res.cloudinary.com/drmsykh02/image/upload/v1777057345/rocketmoonad/nzsd9blcfu8lke9j3xpa.jpg",history:"Final rocket of the genesis RocketMoonad collection on Monad Mainnet."},
];

const RARITY_EMOJI = {Legendary:"🔥",Epic:"💜",Rare:"💙",Uncommon:"💚",Common:"⚪"};
const RARITY_STARS = {Legendary:"⭐⭐⭐⭐⭐",Epic:"⭐⭐⭐⭐",Rare:"⭐⭐⭐",Uncommon:"⭐⭐",Common:"⭐"};

function bar(v){const f=Math.round(v/10);return "█".repeat(f)+"░".repeat(10-f)+` ${v}`;}

function nftCaption(nft){
  return `🚀 *Moon Rockets Season 1*
━━━━━━━━━━━━━━━━━━━━
${RARITY_EMOJI[nft.rarity]||"⚪"} *${nft.name}*
🏷️ Rarity: \`${nft.rarity}\` ${RARITY_STARS[nft.rarity]||"⭐"}
🆔 Token ID: \`#${nft.id}\`
📜 History: _${nft.history}_

📊 *STATS*
⚔️ PWR: \`${bar(nft.power)}\`
💨 SPD: \`${bar(nft.speed)}\`
🚀 BST: \`${bar(nft.boost)}\`

💎 *RMAD:* \`${RMAD_ADDR}\`
📦 *NFT:* \`${NFT_ADDR}\`
━━━━━━━━━━━━━━━━━━━━
🌐 [dApp](${DAPP_URL}) | 📈 [Trade](${DEX_URL})`;
}

function nftKeyboard(nft){
  const prev=nft.id-1<0?6:nft.id-1;
  const next=nft.id+1>6?0:nft.id+1;
  return {inline_keyboard:[
    [{text:"🌐 dApp",url:DAPP_URL},{text:"📈 Trade RMAD",url:DEX_URL}],
    [{text:"⚡ V4 Pools",callback_data:"v4_pools"},{text:"📊 MonadVision",url:MONAD_URL}],
    [{text:`◀️ #${prev}`,callback_data:`nft_${prev}`},{text:`${nft.id+1}/7`,callback_data:"noop"},{text:`#${next} ▶️`,callback_data:`nft_${next}`}],
    [{text:"🏠 Main Menu",callback_data:"main_menu"}],
  ]};
}

async function rpcFetch(method,params){
  for(const rpc of MONAD_RPCS){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),8000);
    try{
      const r=await fetch(rpc,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params}),signal:ctrl.signal});
      clearTimeout(t);
      const d=await r.json();
      if(d.result!==undefined)return d.result;
    }catch(_){clearTimeout(t);}
  }
  return null;
}

async function fetchOnChainPrice(){
  try{
    const res=await rpcFetch("eth_call",[{to:RMAD_PAIR,data:"0x0902f1ac"},"latest"]);
    if(!res||res==="0x"||res.length<130)return null;
    const r0=BigInt("0x"+res.slice(2,66));
    const r1=BigInt("0x"+res.slice(66,130));
    if(r0===0n||r1===0n)return null;
    const rmadIsToken0=RMAD_ADDR.toLowerCase()<WMON_ADDR.toLowerCase();
    return rmadIsToken0?Number((r1*1_000_000_000_000n)/r0)/1_000_000_000_000:Number((r0*1_000_000_000_000n)/r1)/1_000_000_000_000;
  }catch(e){console.error("price error:",e.message);return null;}
}

const MAIN_MENU_TEXT=`
🚀 *RocketMoonad* — Moon Rockets Season 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌕 Stake Moon Rockets NFTs · Earn RMAD
⚡ Uniswap V4 · 17 pools live on Monad
🎮 7 unique NFTs (Token IDs: #0–#6)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NFT: \`${NFT_ADDR}\`
💎 RMAD: \`${RMAD_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
⚡ V4 PoolMgr: \`${V4_POOL_MANAGER}\`
⚡ V4 PosMgr: \`${V4_POSITION_MANAGER}\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

const MAIN_MENU_KB={inline_keyboard:[
  [{text:"🌐 Open dApp",url:DAPP_URL},{text:"📈 Trade RMAD",url:DEX_URL}],
  [{text:"🖼️ View NFTs",callback_data:"nft_0"},{text:"💰 Live Price",callback_data:"price_check"}],
  [{text:"⚡ V4 Pools (17)",callback_data:"v4_pools"},{text:"📋 All NFTs",callback_data:"all_nfts"}],
  [{text:"📊 MonadVision",url:MONAD_URL},{text:"ℹ️ How to Stake",callback_data:"how_stake"}],
]};

async function sendPriceMessage(chatId){
  const loading=await bot.sendMessage(chatId,"⏳ Fetching live price…");
  const price=await fetchOnChainPrice();
  await bot.deleteMessage(chatId,loading.message_id).catch(()=>{});
  const now=new Date().toISOString().replace("T"," ").slice(0,19)+" UTC";
  const text=price!==null
    ?`💰 *RMAD Live Price*
━━━━━━━━━━━━━━━━━━━━
💱 Pair: \`RMAD / WMON\`
💵 Price: \`${price.toFixed(12)} WMON\`
━━━━━━━━━━━━━━━━━━━━
⚡ *Uniswap V4 Contracts*
🏊 PoolMgr: \`${V4_POOL_MANAGER}\`
📍 PosMgr: \`${V4_POSITION_MANAGER}\`
🔑 Permit2: \`${V4_PERMIT2}\`
💎 WMOON: \`${WMOON}\`
━━━━━━━━━━━━━━━━━━━━
🕐 _${now}_`
    :`❌ *Price Unavailable*\nCould not fetch on-chain price.`;
  await bot.sendMessage(chatId,text,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[
    [{text:"🔄 Refresh",callback_data:"price_check"},{text:"📈 DexScreener",url:DEX_URL}],
    [{text:"⚡ V4 Pools",callback_data:"v4_pools"}],
    [{text:"🏠 Main Menu",callback_data:"main_menu"}],
  ]}});
}

async function sendV4Pools(chatId){
  const lines=[
    `⚡ *Uniswap V4 · 17 Pools Live*`,
    `_Your custom deployment on Monad Mainnet_`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🏊 PoolManager: \`${V4_POOL_MANAGER}\``,
    `📍 PositionMgr: \`${V4_POSITION_MANAGER}\``,
    `🔑 Permit2: \`${V4_PERMIT2}\``,
    `💎 WMOON: \`${WMOON}\``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*All pools paired against WMOON:*\n`,
  ];
  V4_PAIRS.forEach((p,i)=>{
    lines.push(`${i+1}. *${p.symbol}* · \`${p.contract.slice(0,10)}…${p.contract.slice(-4)}\``);
  });
  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Fee: 0.3% · Tick spacing: 60 · Chain ID: 143_`);
  await bot.sendMessage(chatId,lines.join("\n"),{parse_mode:"Markdown",reply_markup:{inline_keyboard:[
    [{text:"🌐 dApp",url:DAPP_URL},{text:"💰 RMAD Price",callback_data:"price_check"}],
    [{text:"🏠 Main Menu",callback_data:"main_menu"}],
  ]}});
}

bot.onText(/\/start/,  msg=>bot.sendMessage(msg.chat.id,MAIN_MENU_TEXT,{parse_mode:"Markdown",reply_markup:MAIN_MENU_KB}));
bot.onText(/\/menu/,   msg=>bot.sendMessage(msg.chat.id,MAIN_MENU_TEXT,{parse_mode:"Markdown",reply_markup:MAIN_MENU_KB}));
bot.onText(/\/price/,  async msg=>sendPriceMessage(msg.chat.id));
bot.onText(/\/v4/,     async msg=>sendV4Pools(msg.chat.id));
bot.onText(/\/dex/,    async msg=>sendV4Pools(msg.chat.id));

bot.onText(/\/nfts/,async msg=>{
  await bot.sendMessage(msg.chat.id,"🚀 Loading all 7 Moon Rockets…");
  for(const nft of NFTS){
    try{await bot.sendPhoto(msg.chat.id,nft.image,{caption:nftCaption(nft),parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🌐 dApp",url:DAPP_URL},{text:"📈 Trade",url:DEX_URL}]]}});}
    catch(e){console.error(`NFT ${nft.id}:`,e.message);}
    await new Promise(r=>setTimeout(r,400));
  }
});

bot.onText(/\/nft(\d+)/,async(msg,match)=>{
  const id=parseInt(match[1]);
  const nft=NFTS.find(n=>n.id===id);
  if(!nft)return bot.sendMessage(msg.chat.id,"❌ Use /nft0 to /nft6");
  try{await bot.sendPhoto(msg.chat.id,nft.image,{caption:nftCaption(nft),parse_mode:"Markdown",reply_markup:nftKeyboard(nft)});}
  catch(e){bot.sendMessage(msg.chat.id,nftCaption(nft),{parse_mode:"Markdown",reply_markup:nftKeyboard(nft)});}
});

bot.onText(/\/stake/,msg=>bot.sendMessage(msg.chat.id,
  `🔒 *How to Stake Moon Rockets*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Connect wallet on Monad Mainnet (Chain 143)
2️⃣ Open the dApp
3️⃣ Click \`+ Stake\` on any NFT card
4️⃣ Earn RMAD rewards every second
5️⃣ Click \`Claim\` to collect RMAD
💡 Stake all 7 at once for max rewards!
━━━━━━━━━━━━━━━━━━━━
🔒 Staking: \`${STAKING_ADDR}\``,
  {parse_mode:"Markdown",reply_markup:{inline_keyboard:[
    [{text:"🌐 Start Staking",url:DAPP_URL}],
    [{text:"⚡ V4 Pools",callback_data:"v4_pools"}],
    [{text:"🏠 Main Menu",callback_data:"main_menu"}],
  ]}}
));

bot.onText(/\/info/,msg=>bot.sendMessage(msg.chat.id,
  `💎 *RocketMoonad · Full Info*
━━━━━━━━━━━━━━━━━━━━
🌐 Network: Monad Mainnet (Chain ID: 143)
📦 Collection: Moon Rockets Season 1
🔢 Total NFTs: 7 (IDs #0–#6)

📋 *Contracts*
💎 RMAD: \`${RMAD_ADDR}\`
🖼️ NFT: \`${NFT_ADDR}\`
🔒 Staking: \`${STAKING_ADDR}\`
🔮 Oracle: \`${ORACLE_ADDR}\`
🎰 Raffle: \`${RAFFLE_ADDR}\`
💱 LP Pair: \`${RMAD_PAIR}\`

⚡ *Uniswap V4*
🏊 PoolMgr: \`${V4_POOL_MANAGER}\`
📍 PosMgr: \`${V4_POSITION_MANAGER}\`
🔑 Permit2: \`${V4_PERMIT2}\`
📊 StateView: \`${V4_STATE_VIEW}\`
💎 WMOON: \`${WMOON}\`
🏊 17 pools live on Monad
━━━━━━━━━━━━━━━━━━━━`,
  {parse_mode:"Markdown",reply_markup:{inline_keyboard:[
    [{text:"📈 Trade",url:DEX_URL},{text:"📊 MonadVision",url:MONAD_URL}],
    [{text:"⚡ V4 Pools",callback_data:"v4_pools"}],
    [{text:"🌐 dApp",url:DAPP_URL}],
    [{text:"🏠 Main Menu",callback_data:"main_menu"}],
  ]}}
));

bot.onText(/\/help/,msg=>bot.sendMessage(msg.chat.id,
  `🚀 *RocketMoonad Bot Commands*
━━━━━━━━━━━━━━━━━━━━
/start  — Main menu
/price  — Live RMAD price
/v4     — Uniswap V4 pools (17 pairs)
/dex    — DEX pools info
/nfts   — All 7 NFT cards
/nft0   — Specific NFT (#0–#6)
/stake  — How to stake guide
/info   — All contracts info
/help   — This message
━━━━━━━━━━━━━━━━━━━━`,
  {parse_mode:"Markdown"}
));

bot.on("callback_query",async query=>{
  const data=query.data, chatId=query.message.chat.id;
  try{await bot.answerCallbackQuery(query.id);}catch(e){}
  if(data==="noop")return;
  if(data==="main_menu"){await bot.sendMessage(chatId,MAIN_MENU_TEXT,{parse_mode:"Markdown",reply_markup:MAIN_MENU_KB});return;}
  if(data==="price_check"){await sendPriceMessage(chatId);return;}
  if(data==="v4_pools"){await sendV4Pools(chatId);return;}
  if(data==="how_stake"){
    await bot.sendMessage(chatId,
      `🔒 *How to Stake Moon Rockets*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Connect wallet on Monad Mainnet
2️⃣ Open the dApp
3️⃣ Click \`+ Stake\` on any NFT
4️⃣ Earn RMAD every second
5️⃣ Click \`Claim\` to collect
━━━━━━━━━━━━━━━━━━━━`,
      {parse_mode:"Markdown",reply_markup:{inline_keyboard:[
        [{text:"🌐 Start Staking",url:DAPP_URL}],
        [{text:"🏠 Main Menu",callback_data:"main_menu"}],
      ]}}
    );return;
  }
  if(data==="all_nfts"){
    await bot.sendMessage(chatId,"🚀 Sending all 7 RocketMoonad NFTs…");
    for(const nft of NFTS){
      try{await bot.sendPhoto(chatId,nft.image,{caption:nftCaption(nft),parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🌐 dApp",url:DAPP_URL},{text:"📈 Trade",url:DEX_URL}]]}});}
      catch(e){console.error(`NFT ${nft.id}:`,e.message);}
      await new Promise(r=>setTimeout(r,400));
    }
    return;
  }
  if(data.startsWith("nft_")){
    const id=parseInt(data.split("_")[1]);
    const nft=NFTS.find(n=>n.id===id);
    if(!nft)return;
    try{await bot.sendPhoto(chatId,nft.image,{caption:nftCaption(nft),parse_mode:"Markdown",reply_markup:nftKeyboard(nft)});}
    catch(e){await bot.sendMessage(chatId,nftCaption(nft),{parse_mode:"Markdown",reply_markup:nftKeyboard(nft)});}
    return;
  }
});

console.log("🚀 RocketMoonad Bot started! V4 pools: 17 | NFTs: 7");
