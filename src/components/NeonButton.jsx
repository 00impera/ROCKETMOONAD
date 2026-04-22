import { motion } from "framer-motion";

/**
 * NeonButton — reusable styled button.
 *
 * Props:
 *   onClick, disabled, small, gray, purple, children
 */
export default function NeonButton({ children, onClick, disabled, small, gray, purple }) {
  const color  = purple ? "#CC00FF" : gray ? "#444" : "#00FF88";
  const tColor = purple ? "#DD88FF" : gray ? "#555" : "#00FF88";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled   ? {} : { scale: 0.96 }}
      style={{
        background: "transparent",
        border: `1px solid ${color}`,
        color: tColor,
        padding: small ? "6px 14px" : "9px 20px",
        borderRadius: "8px",
        fontSize: small ? "12px" : "13px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </motion.button>
  );
}
