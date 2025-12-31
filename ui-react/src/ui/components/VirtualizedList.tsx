import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type ItemRenderer<T> = (item: T, index: number) => React.ReactNode;

type Props<T> = {
  items: T[];
  itemHeight: number;
  overscan?: number;
  renderItem: ItemRenderer<T>;
  className?: string;
  style?: CSSProperties;
};

export default function VirtualizedList<T>({
  items,
  itemHeight,
  overscan = 6,
  renderItem,
  className,
  style
}: Props<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => setVh(el.clientHeight))
      : null;
    el.addEventListener("scroll", onScroll, { passive: true });
    resizeObserver?.observe(el);
    setVh(el.clientHeight);
    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
    };
  }, []);

  const total = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + vh) / itemHeight) + overscan);
  const slice = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    el.appendChild(sentinel);
    const io = new IntersectionObserver(() => setScrollTop(el.scrollTop), {
      root: el,
      threshold: 0
    });
    io.observe(sentinel);
    return () => {
      io.disconnect();
      el.removeChild(sentinel);
    };
  }, []);

  const topPad = startIndex * itemHeight;

  return (
    <div
      ref={viewportRef}
      className={className}
      style={{ overflow: "auto", position: "relative", ...style }}
    >
      <div style={{ height: total, position: "relative" }}>
        <div style={{ position: "absolute", top: topPad, left: 0, right: 0 }}>
          {slice.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight, overflow: "hidden" }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
