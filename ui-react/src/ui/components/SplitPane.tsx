import React, { useEffect, useRef, useState } from "react";

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
  minSizes?: { left?: number; right?: number };
  onResize?: (leftWidth: number) => void;
  className?: string;
};

export default function SplitPane({
  left,
  right,
  minSizes = { left: 240, right: 320 },
  onResize,
  className
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(360);
  const dragging = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let next = e.clientX - rect.left;
      const minLeft = minSizes.left ?? 0;
      const minRight = minSizes.right ?? 0;
      next = Math.max(minLeft, Math.min(next, rect.width - minRight));
      setLeftWidth(next);
      onResize?.(next);
    };
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [minSizes.left, minSizes.right, onResize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `${leftWidth}px 6px 1fr`,
        width: "100%",
        height: "100%"
      }}
    >
      <div style={{ minWidth: minSizes.left }}>{left}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => {
          dragging.current = true;
        }}
        style={{
          cursor: "col-resize",
          background: "var(--border, #e5e7eb)"
        }}
        title="Drag to resize"
      />
      <div style={{ minWidth: minSizes.right }}>{right}</div>
    </div>
  );
}
