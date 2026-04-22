# RocketMoonad App

Moon Rockets Season 1 — Staking dApp on Monad Mainnet.

## Stack

- React 18 + Vite
- Thirdweb v5 (wallet connect, contract calls)
- Framer Motion (animations)
- Web Audio API (no mp3 files needed)

## Contracts (Monad Mainnet)

| Contract | Address |
|----------|---------|
| NFT      | `0x45336C2E15F2fe58c67Ee4035a520231b2751669` |
| Staking  | `0xec5773F31CA0F4012624392243E0B6517B518976` |
| RMAD     | `0x9a440Afaa434cDd19234e58798DeFA0E71be0A67` |
| Oracle   | `0xEf98C35c95206527Bf2783fEf8f69Cfc12a3c2e1` |
| Raffle   | `0xbcc94553Cb4facD17f209FDda4a54012Be616Cfc` |

## Setup

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  config.js          # contracts, chain, NFT list, rarity colors
  main.jsx           # React entry point
  App.jsx            # Dashboard shell
  components/
    WalletPanel.jsx      # ConnectButton wrapper
    NeonButton.jsx       # Reusable styled button
    NftCard.jsx          # Single NFT card with stats + stake toggle
    DailyClaimPanel.jsx  # Daily free 1 RMAD claim (7-day grid)
    RafflePanel.jsx      # Weekly raffle entry
    PrizePool.jsx        # Pulsing prize pool display
    Countdown.jsx        # Live countdown to Sunday
    Leaderboard.jsx      # Top 5 raffle participants
  hooks/
    useStaking.js        # stakedTokens, pendingRewards, stake/unstake
    useToken.js          # RMAD price from DexScreener (30s poll)
    useDailyClaim.js     # Daily claim state + localStorage persistence
    useRaffle.js         # Prize pool, leaderboard, countdown, entry tx
  utils/
    sound.js             # Web Audio API synth SFX (no mp3 files)
    format.js            # shortAddr, fromWei, fmt
    time.js              # countdown helpers, todayMonIndex
  styles/
    theme.css            # CSS variables
    layout.css           # Global reset + scrollbar
    neon.css             # Glow utility classes + animations
    hologram.css         # 3D tilt + scan-line + shimmer effects
```

## Raffle Contract Requirements

`RafflePanel` reads two view functions. If your contract uses different names, update `useRaffle.js`:

```solidity
function getPrizePool() external view returns (uint256);
function getLeaderboard() external view returns (address[] memory, uint256[] memory);
```

If these don't exist, the prize pool shows `—` and the leaderboard is hidden — everything else works normally.

## Sounds

No `.mp3` files needed. All SFX are generated at runtime via Web Audio API in `utils/sound.js`.
The `public/sounds/` folder can remain empty.
