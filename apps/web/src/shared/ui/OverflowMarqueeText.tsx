import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  activeTrack,
  root,
  spacer,
  text,
  track,
} from "./OverflowMarqueeText.css.ts";

interface OverflowMarqueeTextProps {
  text: string;
  className?: string;
  title?: string;
}

type MarqueeStyle = CSSProperties & {
  "--overflow-marquee-distance"?: string;
  "--overflow-marquee-duration"?: string;
};

const MARQUEE_SPEED_PX_PER_SECOND = 32;
const MARQUEE_MIN_DURATION_SECONDS = 6;

export function OverflowMarqueeText({
  text: value,
  className,
  title,
}: OverflowMarqueeTextProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  const isOverflowing = overflowDistance > 0;
  const duration = Math.max(
    MARQUEE_MIN_DURATION_SECONDS,
    overflowDistance / MARQUEE_SPEED_PX_PER_SECOND,
  );
  const marqueeStyle: MarqueeStyle = {
    "--overflow-marquee-distance": `${overflowDistance}px`,
    "--overflow-marquee-duration": `${duration}s`,
  };
  const rootStyle: CSSProperties = {
    textOverflow: "clip",
  };

  useEffect(() => {
    const updateOverflow = () => {
      const rootElement = rootRef.current;
      const textElement = textRef.current;

      if (!rootElement || !textElement || textElement.textContent !== value) {
        setOverflowDistance(0);
        return;
      }

      setOverflowDistance(
        Math.max(0, textElement.scrollWidth - rootElement.clientWidth),
      );
    };

    updateOverflow();

    const rootElement = rootRef.current;
    if (!rootElement || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflow);
      return () => window.removeEventListener("resize", updateOverflow);
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(rootElement);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={rootRef}
      className={[root, className].filter(Boolean).join(" ")}
      title={title ?? value}
      style={rootStyle}
    >
      <span
        className={[track, isOverflowing ? activeTrack : ""]
          .filter(Boolean)
          .join(" ")}
        style={marqueeStyle}
      >
        <span ref={textRef} className={text}>
          {value}
        </span>
        {isOverflowing ? (
          <>
            <span className={spacer} aria-hidden="true" />
            <span className={text} aria-hidden="true">
              {value}
            </span>
          </>
        ) : null}
      </span>
    </span>
  );
}
