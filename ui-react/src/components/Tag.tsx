import React from "react";

export type TagProps = {
  label: string;
  bgColor?: string;
  textColor?: string;
  intent?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
};

export function Tag({
  label,
  bgColor,
  textColor,
  intent,
  size = "md",
  icon,
  onDismiss,
  dismissLabel
}: TagProps) {
  const className = [
    "tag",
    "rls-react-tag",
    intent ? `rls-tag-${intent}` : "",
    size ? `rls-tag-${size}` : ""
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
