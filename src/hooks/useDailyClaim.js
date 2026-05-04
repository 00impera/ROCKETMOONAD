import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { stakingContract } from "../config";

const STAKING_ADDR = stakingContract.address;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 0=Mon … 6=Sun
function todayMonIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function isoWeek() {
  const d    = new Date();
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const wk   = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
}

function storageKey(addr) {
  return `dailyClaim:${addr.toLowerCase()}:${isoWeek()}`;
}

function loadClaimed(addr) {
  if (!addr) return Array(7).fill(false);
  try {
    const raw = localStorage.getItem(storageKey(addr));
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return Array(7).fill(false);
}

function saveClaimed(addr, arr) {
  try { localStorage.setItem(storageKey(addr), JSON.stringify(arr)); } catch (_) {}
}

// ── Hook ──────────────────────────────────────────────────────────────────────
function useDailyClaim(account, sendTx) {
  const [claimed, setClaimed] = useState(Array(7).fill(false));
  const [pending, setPending] = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    if (account?.address) setClaimed(loadClaimed(account.address));
  }, [account?.address]);

  const claimDay = useCallback(async (idx) => {
    if (!account?.address || pending) return;
    const todayIdx = todayMonIndex();
    if (idx !== todayIdx) { setMsg("You can only claim today's reward."); return; }
    if (claimed[idx])     { setMsg("Already claimed today!");            return; }

    setPending(true);
    setMsg("");
    try {
      // claimRewards() raw calldata — selector 0x372500ab
      // bypasses thirdweb ABI decoder completely
      await sendTx({ to: STAKING_ADDR, data: "0x372500ab" });

      const next  = [...claimed];
      next[idx]   = true;
      setClaimed(next);
      saveClaimed(account.address, next);
      setMsg("✅ 1 RMAD claimed!");
    } catch (e) {
      console.error("[claimDay] error:", e.message);
      setMsg("❌ Claim failed — check wallet.");
    } finally {
      setPending(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }, [account, claimed, pending, sendTx]);

  return { claimed, msg, pending, claimDay };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DailyClaimPanel({ account, sendTx }) {
  const { claimed, msg, pending, claimDay } = useDailyClaim(account, sendTx);
  const todayIdx = todayMonIndex();

  return (
    <div style={{
      background:   "var(--bg-panel)",
      border:       "0.5px solid var(--green-dim)",
      borderRadius: 14,
      padding:      18,
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
        Daily Free RMAD Claim
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {DAYS.map((day, idx) => {
          const isToday   = idx === todayIdx;
          const isClaimed = !!claimed[idx];
          const clickable = isToday && !isClaimed && !pending && !!account;

          return (
            <motion.div
              key={day}
              whileHover={clickable ? { scale: 1.08, rotateY: 8, rotateX: -4 } : {}}
              animate={isToday && !isClaimed
                ? { boxShadow: ["0 0 6px #00FF8844","0 0 18px #00FF8888","0 0 6px #00FF8844"] }
                : {}}
              transition={isToday && !isClaimed
                ? { boxShadow: { repeat: Infinity, duration: 1.8 } }
                : {}}
              onClick={() => clickable && claimDay(idx)}
              style={{
                background:    isClaimed ? "#0a2a0a" : isToday ? "#00FF8811" : "#111",
                border:        `1px solid ${isClaimed ? "#00FF88" : isToday ? "#00FF8888" : "#222"}`,
                borderRadius:  10,
                padding:       "10px 4px",
                textAlign:     "center",
                cursor:        clickable ? "pointer" : "default",
                transformStyle:"preserve-3d",
                position:      "relative",
                overflow:      "hidden",
              }}
            >
              {isToday && !isClaimed && (
                <motion.div
                  animate={{ x: ["-100%","200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: "50%", height: "100%",
                    background: "linear-gradient(90deg,transparent,rgba(0,255,136,0.1),transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{day}</div>
              <div style={{ fontSize: 18 }}>
                {isClaimed ? "✅" : isToday ? (pending ? "⏳" : "🎁") : "🔒"}
              </div>
              <div style={{ fontSize: 9, color: isClaimed ? "#00FF88" : "#444", marginTop: 4 }}>
                {isClaimed ? "Claimed" : "1 RMAD"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {msg && (
        <div style={{
          marginTop:  12, fontSize: 12, textAlign: "center",
          color: msg.startsWith("❌") ? "#ff4444" : "var(--green)",
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}
