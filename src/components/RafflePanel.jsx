import { motion } from "framer-motion";
import { useRaffle, TICKET_PRICE } from "../hooks/useRaffle";
import Countdown  from "./Countdown";
import PrizePool  from "./PrizePool";
import Leaderboard from "./Leaderboard";

export default function RafflePanel({ account, sendTx }) {
  const {
    tickets, setTickets,
    entered, msg,
    prizePool, leaderboard, timeLeft,
    txPending, enter,
  } = useRaffle(account, sendTx);

  const disabled = txPending || entered;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "0.5px solid var(--purple-dim)",
      borderRadius: "var(--r-lg)",
      padding: "18px",
      marginBottom: "16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
          Weekly Raffle
        </div>
        <Countdown timeLeft={timeLeft} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.8fr", gap: "10px", marginBottom: "14px" }}>
        <PrizePool prizePool={prizePool} />

        <div style={{ background: "#111", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#444", marginBottom: "4px" }}>Ticket Price</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--blue)" }}>
            {TICKET_PRICE} RMAD
          </div>
        </div>

        <div style={{ background: "#111", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#444", marginBottom: "4px" }}>Your Tickets</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--green)" }}>
            {entered ? tickets : "0"}
          </div>
        </div>
      </div>

      {/* Ticket selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#555" }}>Tickets:</span>
        {[1, 2, 5, 10].map(n => (
          <button
            key={n}
            onClick={() => setTickets(n)}
            style={{
              padding: "5px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
              background: tickets === n ? "#CC00FF22" : "transparent",
              border: `1px solid ${tickets === n ? "#CC00FF" : "#333"}`,
              color: tickets === n ? "#CC00FF" : "#555",
              fontFamily: "inherit",
            }}
          >
            x{n}
          </button>
        ))}
        <span style={{ fontSize: "12px", color: "var(--green)", marginLeft: "auto" }}>
          Total: {tickets * TICKET_PRICE} RMAD
        </span>
      </div>

      {/* Enter button */}
      <motion.button
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled   ? {} : { scale: 0.98 }}
        onClick={enter}
        disabled={disabled}
        style={{
          width: "100%", padding: "10px",
          fontSize: "13px", fontWeight: "700",
          borderRadius: "8px",
          border: "1px solid #CC00FF",
          background: entered
            ? "linear-gradient(90deg, #1a002a, #220033)"
            : "transparent",
          color: entered ? "#CC88FF" : "#DD88FF",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: txPending ? 0.4 : 1,
          boxShadow: "0 0 18px rgba(204,0,255,0.35)",
          fontFamily: "inherit",
        }}
      >
        {entered
          ? "🎟 Entered — Draw Sunday!"
          : `🎰 Buy ${tickets} Ticket${tickets > 1 ? "s" : ""} (${tickets * TICKET_PRICE} RMAD)`}
      </motion.button>

      {msg && (
        <div style={{ color: "var(--green)", fontSize: "12px", marginTop: "10px", textAlign: "center" }}>
          {msg}
        </div>
      )}

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
}
