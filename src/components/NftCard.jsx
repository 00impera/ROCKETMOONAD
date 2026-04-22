import { motion } from "framer-motion";
import { useRef } from "react";
import { RARITY_COLORS } from "../config";

const PAIR_ADDR = "0xb5cb9f4eccbeae6f95c9222aa12c319ff362a5a3";
const DEX_URL   = `https://dexscreener.com/monad/${PAIR_ADDR}`;

function Sparkline({ positive }) {
  const points = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: i,
      y: 50 + Math.sin(i * 0.7) * 20 + (Math.random() - 0.5) * 18,
    }))
  ).current;
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const range = maxY - minY || 1;
  const w = 200, h = 48;
  const toSvg = ({ x, y }) => ({ sx: (x / 19) * w, sy: h - ((y - minY) / range) * h });
  const pts = points.map(toSvg);
  const linePts = pts.map(p => `${p.sx},${p.sy}`).join(" ");
  const areaPath = `M${pts[0].sx},${h} ` + pts.map(p => `L${p.sx},${p.sy}`).join(" ") + ` L${pts[pts.length-1].sx},${h} Z`;
  const color = positive ? "#00FF88" : "#FF4455";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "44px", display: "block" }}>
      <defs>
        <linearGradient id={`sg${positive ? "p" : "n"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg${positive ? "p" : "n"})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length-1].sx} cy={pts[pts.length-1].sy} r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

function StatBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#555", marginBottom: "2px" }}>
        <span>{label}</span><span style={{ color: color || "#00FF88" }}>{value}</span>
      </div>
      <div style={{ height: "2px", background: "#111", borderRadius: "2px", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: `linear-gradient(90deg,${color || "#00FF88"},#00C8FF)`, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

export default function NftCard({ nft, staked, price, change, priceLoading, onToggle, isPending }) {
  const rc = RARITY_COLORS[nft.rarity] || RARITY_COLORS.Common;
  const isPositive = change === null ? true : change >= 0;
  const changeStr = change !== null ? `${change > 0 ? "+" : ""}${parseFloat(change).toFixed(2)}%` : "—";
  const changeColor = change === null ? "#555" : isPositive ? "#00FF88" : "#FF4455";
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      style={{ background: rc.bg, border: `1px solid ${staked ? rc.border : "#1e1e1e"}`, borderRadius: "16px",
        overflow: "hidden", position: "relative", boxShadow: staked ? `0 0 20px ${rc.glow}` : "0 2px 12px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.3s", display: "flex", flexDirection: "column" }}>
      {staked && <div style={{ height: "2px", background: `linear-gradient(90deg,transparent,${rc.border},transparent)` }} />}
      <div style={{ position: "relative", paddingTop: "90%", overflow: "hidden" }}>
        <img src={nft.image} alt={nft.name}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover",
            filter: staked ? "brightness(1.1)" : "brightness(0.8)", transition: "filter 0.3s" }}
          onError={e => { e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", top: "8px", right: "8px", background: `${rc.bg}ee`, border: `1px solid ${rc.border}`,
          borderRadius: "4px", padding: "2px 7px", fontSize: "8px", color: rc.text, letterSpacing: "1px", fontWeight: "700", textTransform: "uppercase" }}>
          {nft.rarity}
        </div>
        <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.75)", border: "0.5px solid #333",
          borderRadius: "4px", padding: "2px 7px", fontSize: "10px", color: "#888", fontFamily: "monospace" }}>
          #{nft.id}
        </div>
        {staked && (
          <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)", border: `1px solid ${rc.border}`, borderRadius: "4px",
            padding: "2px 10px", fontSize: "8px", color: rc.text, letterSpacing: "2px", fontWeight: "700" }}>
            ● STAKED
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#ddd", lineHeight: "1.3" }}>{nft.name}</div>
        <div>
          <StatBar label="PWR" value={nft.power} color={rc.text} />
          <StatBar label="SPD" value={nft.speed} color={rc.text} />
          <StatBar label="BST" value={nft.boost} color={rc.text} />
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", border: `0.5px solid ${isPositive ? "#00FF8822" : "#FF445522"}`,
          borderRadius: "8px", padding: "6px 6px 2px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
            <span style={{ fontSize: "9px", color: "#444", letterSpacing: "1px" }}>RMAD/USD</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "11px", color: "#00FF88", fontFamily: "monospace", fontWeight: "700" }}>
                {priceLoading ? "…" : (price || "N/A")}
              </span>
              <span style={{ fontSize: "9px", color: changeColor, background: `${changeColor}18`, borderRadius: "3px", padding: "1px 4px" }}>
                {priceLoading ? "" : changeStr}
              </span>
            </div>
          </div>
          <Sparkline positive={isPositive} />
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
          <motion.button
            whileHover={isPending || !staked ? {} : { scale: 1.08 }}
            whileTap={isPending || !staked ? {} : { scale: 0.93 }}
            onClick={() => !isPending && staked && onToggle(nft.id)}
            disabled={isPending || !staked} title="Unstake"
            style={{ width: "34px", height: "34px", borderRadius: "8px",
              border: `1px solid ${staked ? "#FF4455" : "#1e1e1e"}`,
              background: staked ? "rgba(255,68,85,0.1)" : "rgba(255,255,255,0.02)",
              color: staked ? "#FF4455" : "#333", fontSize: "18px", lineHeight: 1,
              cursor: isPending || !staked ? "not-allowed" : "pointer", opacity: isPending ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
            −
          </motion.button>
          <motion.a href={DEX_URL} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, height: "34px", borderRadius: "8px", border: `1px solid ${rc.border}66`,
              background: `linear-gradient(135deg,${rc.bg},rgba(0,0,0,0.4))`, color: rc.text,
              fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "4px", textDecoration: "none", fontFamily: "inherit" }}>
            ↗ Trade
          </motion.a>
          <motion.button
            whileHover={isPending || staked ? {} : { scale: 1.08 }}
            whileTap={isPending || staked ? {} : { scale: 0.93 }}
            onClick={() => !isPending && !staked && onToggle(nft.id)}
            disabled={isPending || staked} title="Stake"
            style={{ width: "34px", height: "34px", borderRadius: "8px",
              border: `1px solid ${!staked ? rc.border : "#1e1e1e"}`,
              background: !staked ? `${rc.bg}cc` : "rgba(255,255,255,0.02)",
              color: !staked ? rc.text : "#333", fontSize: "18px", lineHeight: 1,
              cursor: isPending || staked ? "not-allowed" : "pointer", opacity: isPending ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
