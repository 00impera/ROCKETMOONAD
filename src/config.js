import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: "39d5688409d060364e2d612723c14984",
});

export const monad = defineChain({
  id: 143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpc: "https://rpc.monad.xyz",
  blockExplorers: [{ name: "MonadScan", url: "https://monadscan.com" }],
});

// ── Raw addresses (for hooks that use eth_call directly) ──────────────────────
export const RMAD_ADDR    = "0x9a440Afaa434cDd19234e58798DeFA0E71be0A67";
export const NFT_ADDR     = "0x45336C2E15F2fe58c67Ee4035a520231b2751669";
export const STAKING_ADDR = "0xec5773F31CA0F4012624392243E0B6517B518976";
export const RAFFLE_ADDR  = "0x00508e9F485021d20d8b2eDa6E6415f9Bf7300ee";
export const ORACLE_ADDR  = "0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1";

// ── Thirdweb contract objects (for sendTx / prepareContractCall) ──────────────
export const nftContract = getContract({
  client,
  chain: monad,
  address: NFT_ADDR,
});

export const stakingContract = getContract({
  client,
  chain: monad,
  address: STAKING_ADDR,
});

export const rmadContract = getContract({
  client,
  chain: monad,
  address: RMAD_ADDR,
});

export const oracleContract = getContract({
  client,
  chain: monad,
  address: ORACLE_ADDR,
});

export const raffleContract = getContract({
  client,
  chain: monad,
  address: RAFFLE_ADDR,
});
