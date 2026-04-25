import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const CLIENT_ID = "821819db832d1a313ae3b1a62fbeafb7";

export const client = createThirdwebClient({ clientId: CLIENT_ID });

export const monad = defineChain({
  id: 143,
  name: "Monad Mainnet",
  rpc: "https://rpc.ankr.com/monad_mainnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
});

export const NFT_ADDR     = "0x79C0bC7CF4B9F30F8614e66236eF634DB50f668f";
export const STAKING_ADDR = "0x2F0317d1166fF385F44FACBd92BD4E43b03D2CbE";
export const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
export const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1";
export const RAFFLE_ADDR  = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee";

export const stakingContract = getContract({ client, chain: monad, address: STAKING_ADDR });
export const nftContract     = getContract({ client, chain: monad, address: NFT_ADDR });
export const rmadContract    = getContract({ client, chain: monad, address: RMAD_ADDR });
export const raffleContract  = getContract({ client, chain: monad, address: RAFFLE_ADDR });
