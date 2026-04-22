import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const CLIENT_ID = "821819db832d1a313ae3b1a62fbeafb7";

export const client = createThirdwebClient({ clientId: CLIENT_ID });

export const monad = defineChain({
  id: 10143,
  name: "Monad Mainnet",
  rpc: "https://monad-mainnet.g.alchemy.com/v2/Uwb7T0DbXMQHjiJBNf9_b005qYjLmJqk",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
});

export const NFT_ADDR     = "0x45336C2E15F2fe58c67Ee4035a520231b2751669";
export const STAKING_ADDR = "0xec5773F31CA0F4012624392243E0B6517B518976";
export const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
export const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1";
export const RAFFLE_ADDR  = "0xbcc94553Cb4facD17f209FDda4a54012Be616Cfc";

export const stakingContract = getContract({ client, chain: monad, address: STAKING_ADDR });
export const rmadContract    = getContract({ client, chain: monad, address: RMAD_ADDR });
export const raffleContract  = getContract({ client, chain: monad, address: RAFFLE_ADDR });

export const CONTRACTS_LIST = [
  { label: "NFT",     addr: NFT_ADDR },
  { label: "Staking", addr: STAKING_ADDR },
  { label: "RMAD",    addr: RMAD_ADDR },
  { label: "Oracle",  addr: ORACLE_ADDR },
  { label: "Raffle",  addr: RAFFLE_ADDR },
];

export const RARITY_COLORS = {
  Legendary: { bg: "#2a1a00", border: "#FF8C00", text: "#FFB347", glow: "#FF8C0066" },
  Mythic:    { bg: "#1a002a", border: "#CC00FF", text: "#DD88FF", glow: "#CC00FF66" },
  Epic:      { bg: "#1a0030", border: "#9933FF", text: "#BB77FF", glow: "#9933FF44" },
  Rare:      { bg: "#001a30", border: "#0088FF", text: "#44AAFF", glow: "#0088FF44" },
  Uncommon:  { bg: "#001a10", border: "#00CC66", text: "#44FF99", glow: "#00CC6644" },
  Common:    { bg: "#1a1a1a", border: "#888",    text: "#aaa",    glow: "#44444444" },
};

export const NFTS = [
  { id: 1,  name: "Dark Flame Knight I",   rarity: "Legendary", power: 95, speed: 88, boost: 92,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867743/rocketmoonad/nfts/dark_flame_knight_i.jpg" },
  { id: 2,  name: "Ember Warlord",         rarity: "Epic",      power: 87, speed: 75, boost: 80,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867746/rocketmoonad/nfts/ember_warlord.jpg" },
  { id: 3,  name: "Shadow Thunder Knight", rarity: "Epic",      power: 83, speed: 79, boost: 77,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867749/rocketmoonad/nfts/shadow_thunder_knight.jpg" },
  { id: 4,  name: "Iron Crown Sentinel",   rarity: "Rare",      power: 72, speed: 68, boost: 70,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867752/rocketmoonad/nfts/iron_crown_sentinel.jpg" },
  { id: 5,  name: "Dark Flame Knight II",  rarity: "Legendary", power: 97, speed: 90, boost: 95,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867756/rocketmoonad/nfts/dark_flame_knight_ii.jpg" },
  { id: 6,  name: "Galactic Voyager",      rarity: "Epic",      power: 80, speed: 95, boost: 85,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867758/rocketmoonad/nfts/galactic_voyager.jpg" },
  { id: 7,  name: "Neon Rocket Alpha",     rarity: "Rare",      power: 65, speed: 88, boost: 72,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867762/rocketmoonad/nfts/neon_rocket_alpha.jpg" },
  { id: 8,  name: "Cosmic Shuttle",        rarity: "Rare",      power: 60, speed: 85, boost: 68,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867764/rocketmoonad/nfts/cosmic_shuttle.jpg" },
  { id: 9,  name: "Neon Rocket Omega",     rarity: "Uncommon",  power: 55, speed: 80, boost: 60,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867767/rocketmoonad/nfts/neon_rocket_omega.jpg" },
  { id: 10, name: "Arby Butterfly Rocket", rarity: "Mythic",    power: 99, speed: 99, boost: 99,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867770/rocketmoonad/nfts/arby_butterfly_rocket.gif" },
  { id: 11, name: "Boys Club Rocket Ride", rarity: "Legendary", power: 91, speed: 94, boost: 93,
    image: "https://res.cloudinary.com/drmsykh02/image/upload/v1776867774/rocketmoonad/nfts/boys_club_rocket_ride.gif" },
];
