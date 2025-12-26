import React from "react";

export type PillProps = {
  label: string;
  bgColor?: string;
  textColor?: string;
  intent?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
};

export function Pill({
  label,
  bgColor,
  textColor,
  intent,
  size = "md",
  icon,
  onDismiss,
  dismissLabel
}: PillProps) {
  const className = [
    "pill",
    "rls-react-pill",
    intent ? `rls-pill-${intent}` : "",
    size ? `rls-pill-${size}` : ""
  ].filter(Boolean).join(" ");

  const style = {
    ...(bgColor ? { backgroundColor: bgColor, borderColor: bgColor } : null),
    ...(textColor ? { color: textColor } : null)
  };

  return (
    <span className={className} style={style}>
      {icon ? <span className="rls-react-icon" aria-hidden="true">{icon}</span> : null}
      <span className="rls-react-label">{label}</span>
      {onDismiss ? (
        <button
          type="button"
          className="rls-react-dismiss"
          aria-label={dismissLabel || `Dismiss ${label}`}
          onClick={onDismiss}
        >
          x
        </button>
      ) : null}
    </span>
  );
}
