import { motion } from "framer-motion";
import { shortAddr } from "../utils/format";

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * Leaderboard — holographic top-5 raffle players.
 */
export default function Leaderboard({ leaderboard }) {
  if (!leaderboard?.length) return null;

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>
        Top Players
      </div>
      <div style={{ display: "grid", gap: "6px" }}>
        {leaderboard.slice(0, 5).map((p, idx) => (
          <motion.div
            key={p.player}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{
              scale: 1.01,
              background: "linear-gradient(90deg, rgba(0,255,136,0.08), rgba(0,200,255,0.08))",
            }}
            style={{
              background: "linear-gradient(90deg, rgba(0,255,136,0.04), rgba(0,200,255,0.04))",
              borderRadius: "8px",
              padding: "7px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(0,255,136,0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Hologram shimmer */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3 + idx * 0.4, ease: "linear" }}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "40%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.06), transparent)",
                pointerEvents: "none",
              }}
            />

            <span style={{ fontSize: "14px", width: "22px" }}>
              {MEDALS[idx] || `#${idx + 1}`}
            </span>
            <span style={{ fontSize: "11px", color: "#aaa", flex: 1, fontFamily: "var(--font-mono)" }}>
              {shortAddr(p.player)}
            </span>
            <span style={{ fontSize: "11px", color: "#00FF88", fontWeight: "700" }}>
              🎟 {p.tickets.toString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
