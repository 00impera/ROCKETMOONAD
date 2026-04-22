import { motion } from "framer-motion";

/**
 * PrizePool — pulsing holographic prize pool display.
 */
export default function PrizePool({ prizePool }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 8px #FF00FF22",
          "0 0 22px #FF00FF55",
          "0 0 8px #FF00FF22",
        ],
      }}
      transition={{ repeat: Infinity, duration: 2.2 }}
      style={{
        background: "radial-gradient(circle at top, #330044, #050509)",
        borderRadius: "10px",
        padding: "10px",
        textAlign: "center",
        border: "1px solid #CC00FF55",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scan-line overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(204,0,255,0.03) 3px, rgba(204,0,255,0.03) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{ fontSize: "10px", color: "#DD88FF", marginBottom: "4px" }}>Prize Pool</div>
      <div style={{
        fontSize: "18px", fontWeight: "800",
        color: "#FF44FF",
        textShadow: "0 0 14px #FF00FF",
        fontFamily: "var(--font-mono)",
      }}>
        {prizePool}
      </div>
      <div style={{ fontSize: "9px", color: "#884488", marginTop: "2px" }}>RMAD</div>
    </motion.div>
  );
}
