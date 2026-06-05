import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import {
  pickerContainer,
  pickerGradientBottom,
  pickerGradientTop,
  pickerItem,
  pickerList,
  pickerSelection,
} from "./WheelPicker.css.ts";

interface WheelPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  width?: string | number;
}

export function WheelPicker({
  value,
  onChange,
  options,
  width,
}: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const selectedIndex = options.indexOf(value);
    if (selectedIndex !== -1) {
      const itemHeight = 46;
      scrollEl.scrollTop = selectedIndex * itemHeight;
    }
  }, [value, options]);

  const handleScroll = () => {
    if (isScrolling.current) {
      clearTimeout(isScrolling.current);
    }

    isScrolling.current = setTimeout(() => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;

      const itemHeight = 46;
      const index = Math.round(scrollEl.scrollTop / itemHeight);
      const newValue = options[index];

      if (newValue !== undefined && newValue !== value) {
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }
        onChange(newValue);
      }
    }, 150);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const currentIndex = options.indexOf(value);
    let nextIndex = -1;

    if (event.key === "ArrowUp") {
      nextIndex = Math.max(0, currentIndex - 1);
    } else if (event.key === "ArrowDown") {
      nextIndex = Math.min(options.length - 1, currentIndex + 1);
    }

    if (nextIndex !== -1 && nextIndex !== currentIndex) {
      event.preventDefault();
      onChange(options[nextIndex]);
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    isDragging.current = true;
    startY.current = event.pageY;
    startScrollTop.current = scrollRef.current?.scrollTop || 0;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const deltaY = event.pageY - startY.current;
    scrollRef.current.scrollTop = startScrollTop.current - deltaY;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <fieldset
      className={pickerContainer}
      style={{ maxWidth: width }}
      aria-label="Selection dial"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(event) => {
        if (event.touches.length > 1) event.preventDefault();
      }}
      onTouchMove={(event) => {
        if (event.cancelable) event.preventDefault();
      }}
    >
      <div className={pickerGradientTop} />
      <div className={pickerGradientBottom} />
      <div className={pickerSelection} aria-hidden="true" />
      <div
        ref={scrollRef}
        className={pickerList}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-activedescendant={value}
        tabIndex={0}
      >
        <div style={{ height: "46px", flexShrink: 0 }} aria-hidden="true" />
        {options.map((option) => (
          <div
            key={option}
            id={option}
            className={pickerItem}
            role="option"
            aria-selected={value === option}
            tabIndex={-1}
            style={{
              color: value === option ? "#16181C" : "#ADB5BD",
              fontWeight: value === option ? "700" : "400",
              fontSize: value === option ? "16px" : "14px",
            }}
          >
            {option}
          </div>
        ))}
        <div style={{ height: "46px", flexShrink: 0 }} aria-hidden="true" />
      </div>
    </fieldset>
  );
}
