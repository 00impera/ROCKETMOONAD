import { useState, useEffect, useCallback } from "react";
import { readContract, prepareContractCall } from "thirdweb";
import { rmadContract, raffleContract, RAFFLE_ADDR } from "../config";
import { playEnter } from "../utils/sound";
import { msUntilSunday, formatMs } from "../utils/time";
import { fmt } from "../utils/format";

export const TICKET_PRICE = 10; // RMAD per ticket

/**
 * All raffle state: prize pool, leaderboard, countdown, entry.
 */
export function useRaffle(account, sendTx) {
  const [tickets,     setTickets]     = useState(1);
  const [entered,     setEntered]     = useState(false);
  const [msg,         setMsg]         = useState("");
  const [prizePool,   setPrizePool]   = useState("—");
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft,    setTimeLeft]    = useState("");
  const [txPending,   setTxPending]   = useState(false);

  // Countdown ticker
  useEffect(() => {
    const tick = () => setTimeLeft(formatMs(msUntilSunday()));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  // Load on-chain data
  const loadData = useCallback(async () => {
    // Prize pool
    try {
      const pool = await readContract({
        contract: raffleContract,
        method: "function getPrizePool() returns (uint256)",
        params: [],
      });
      setPrizePool(fmt(Number(pool) / 1e18));
    } catch (_) {}

    // Leaderboard: expects (address[], uint256[])
    try {
      const [players, counts] = await readContract({
        contract: raffleContract,
        method: "function getLeaderboard() returns (address[], uint256[])",
        params: [],
      });
      setLeaderboard(players.map((p, i) => ({ player: p, tickets: counts[i] })));
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 15_000);
    return () => clearInterval(id);
  }, [loadData]);

  const enter = useCallback(async () => {
    if (!account || txPending || entered) return;
    setTxPending(true);
    setMsg("Entering raffle…");
    try {
      const amount = BigInt(tickets) * BigInt("10000000000000000000");
      const tx = prepareContractCall({
        contract: rmadContract,
        method: "function transfer(address,uint256)",
        params: [RAFFLE_ADDR, amount],
      });
      await sendTx(tx);
      playEnter();
      setEntered(true);
      setMsg(`✅ Entered! ${tickets} ticket${tickets > 1 ? "s" : ""} bought. Good luck!`);
      loadData();
    } catch (e) {
      setMsg("❌ " + (e?.message || "Error"));
    } finally {
      setTxPending(false);
    }
  }, [account, tickets, entered, txPending, sendTx, loadData]);

  return {
    tickets, setTickets,
    entered, msg,
    prizePool, leaderboard, timeLeft,
    txPending, enter,
  };
}
