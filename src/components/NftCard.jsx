import { motion } from "framer-motion";
import { RARITY_COLORS } from "../config";

function StatBar({ label, value }) {
  return (
    <div style={{ marginBottom: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#666", marginBottom: "2px" }}>
        <span>{label}</span>
        <span style={{ color: "#00FF88" }}>{value}</span>
      </div>
      <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: "linear-gradient(90deg,#00FF88,#00C8FF)", borderRadius: "2px" }}
        />
      </div>
    </div>
  );
}

export default function NftCard({ nft, staked, price, change, priceLoading, onToggle, isPending }) {
  const rc = RARITY_COLORS[nft.rarity] || RARITY_COLORS.Common;
  const changeStr   = change !== null ? `${change > 0 ? "+" : ""}${parseFloat(change).toFixed(2)}%` : "—";
  const changeColor = change === null ? "#555" : change > 0 ? "#00FF88" : "#FF4444";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 8px 32px ${rc.glow}` }}
      style={{
        background: rc.bg,
        border: `1px solid ${staked ? rc.border : "#222"}`,
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        boxShadow: staked ? `0 0 16px ${rc.glow}` : "none",
        transition: "box-shadow 0.3s",
      }}
    >
      {staked && (
        <div style={{ height: "2px", background: `linear-gradient(90deg,transparent,${rc.border},transparent)` }} />
      )}

      {/* Image */}
      <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
        <img
          src={nft.image} alt={nft.name}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover",
            filter: staked ? "brightness(1.1)" : "brightness(0.85)",
            transition: "filter 0.3s",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          background: rc.bg, border: `1px solid ${rc.border}`,
          borderRadius: "4px", padding: "2px 7px",
          fontSize: "9px", color: rc.text, letterSpacing: "1px",
          fontWeight: "600", textTransform: "uppercase",
        }}>
          {nft.rarity}
        </div>
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          background: "rgba(0,0,0,0.7)", border: "0.5px solid #333",
          borderRadius: "4px", padding: "2px 7px",
          fontSize: "10px", color: "#aaa", fontFamily: "monospace",
        }}>
          #{nft.id}
        </div>
        {staked && (
          <div style={{
            position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)", border: `1px solid ${rc.border}`,
            borderRadius: "4px", padding: "2px 10px",
            fontSize: "9px", color: rc.text, letterSpacing: "2px", fontWeight: "700",
          }}>
            ● STAKED
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#eee", marginBottom: "8px", lineHeight: "1.3" }}>
          {nft.name}
        </div>

        <StatBar label="PWR" value={nft.power} />
        <StatBar label="SPD" value={nft.speed} />
        <StatBar label="BST" value={nft.boost} />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "8px", marginBottom: "8px",
          background: "rgba(0,255,136,0.04)", borderRadius: "6px", padding: "5px 8px",
          border: "0.5px solid #1D9E7522",
        }}>
          <span style={{ fontSize: "10px", color: "#444" }}>RMAD</span>
          <span style={{ fontSize: "11px", color: "#00FF88", fontFamily: "monospace" }}>
            {priceLoading ? "…" : price}
          </span>
          <span style={{ fontSize: "10px", color: changeColor }}>
            {priceLoading ? "" : changeStr}
          </span>
        </div>

        <motion.button
          whileHover={isPending ? {} : { scale: 1.03 }}
          whileTap={isPending   ? {} : { scale: 0.97 }}
          onClick={() => !isPending && onToggle(nft.id)}
          disabled={isPending}
          style={{
            width: "100%", padding: "8px 0",
            fontSize: "12px", fontWeight: "600",
            borderRadius: "8px",
            border: `1px solid ${staked ? "#444" : rc.border}`,
            background: staked ? "rgba(255,255,255,0.03)" : `${rc.bg}cc`,
            color: staked ? "#666" : rc.text,
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.4 : 1,
            letterSpacing: "0.5px",
            fontFamily: "inherit",
          }}
        >
          {staked ? "Unstake" : "Stake"}
        </motion.button>
      </div>
    </motion.div>
  );
}
