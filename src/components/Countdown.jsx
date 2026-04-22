/**
 * Countdown — displays a live timer string.
 * Receives `timeLeft` string from useRaffle hook.
 */
export default function Countdown({ timeLeft }) {
  return (
    <div style={{
      fontSize: "11px",
      color: "#CC00FF",
      border: "1px solid #CC00FF44",
      borderRadius: "6px",
      padding: "3px 10px",
      fontFamily: "var(--font-mono)",
    }}>
      Draw in: {timeLeft || "…"}
    </div>
  );
}
