import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: "your-client-id",
});

export const monad = defineChain({
  id: 143,
  name: "Monad Mainnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpc: "https://rpc.ankr.com/monad_mainnet",
  blockExplorers: [{ name: "MonadVision", url: "https://monadvision.com" }],
});

// NFT contract — RMoonadNFT (IDs 19-25 have real metadata with Cloudinary images)
export const nftContract = getContract({
  client,
  chain: monad,
  address: "0x45336C2E15F2fe58c67Ee4035a520231b2751669",
});

// Staking contract — points to the NFT above
export const stakingContract = getContract({
  client,
  chain: monad,
  address: "0xec5773F31CA0F4012624392243E0B6517B518976",
});

// RMAD token
export const rmadContract = getContract({
  client,
  chain: monad,
  address: "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67",
});

// Oracle
export const oracleContract = getContract({
  client,
  chain: monad,
  address: "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1",
});

// Raffle
export const raffleContract = getContract({
  client,
  chain: monad,
  address: "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee",
});
