import { motion } from "framer-motion";
import { useDailyClaim } from "../hooks/useDailyClaim";
import { todayMonIndex } from "../utils/time";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DailyClaimPanel({ account, sendTx }) {
  const { claimed, msg, pending, claimDay } = useDailyClaim(account, sendTx);
  const todayIdx = todayMonIndex();

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "0.5px solid var(--green-dim)",
      borderRadius: "var(--r-lg)",
      padding: "18px",
      marginBottom: "16px",
    }}>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "14px" }}>
        Daily Free RMAD Claim
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
        {DAYS.map((day, idx) => {
          const isToday   = idx === todayIdx;
          const isClaimed = !!claimed[idx];
          const clickable = isToday && !isClaimed && !pending;

          return (
            <motion.div
              key={day}
              whileHover={clickable ? { scale: 1.08, rotateY: 8, rotateX: -4 } : {}}
              animate={isToday && !isClaimed
                ? { boxShadow: ["0 0 6px #00FF8844", "0 0 18px #00FF8888", "0 0 6px #00FF8844"] }
                : {}}
              transition={isToday && !isClaimed
                ? { boxShadow: { repeat: Infinity, duration: 1.8 } }
                : {}}
              onClick={() => clickable && claimDay(idx)}
              style={{
                background: isClaimed ? "#0a2a0a" : isToday ? "#00FF8811" : "#111",
                border: `1px solid ${isClaimed ? "#00FF88" : isToday ? "#00FF8888" : "#222"}`,
                borderRadius: "10px",
                padding: "10px 4px",
                textAlign: "center",
                cursor: clickable ? "pointer" : "default",
                transformStyle: "preserve-3d",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer on today */}
              {isToday && !isClaimed && (
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: "50%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.1), transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px" }}>{day}</div>
              <div style={{ fontSize: "18px" }}>
                {isClaimed ? "✅" : isToday ? "🎁" : "🔒"}
              </div>
              <div style={{ fontSize: "9px", color: isClaimed ? "#00FF88" : "#444", marginTop: "4px" }}>
                {isClaimed ? "Claimed" : "1 RMAD"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {msg && (
        <div style={{ color: "var(--green)", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
