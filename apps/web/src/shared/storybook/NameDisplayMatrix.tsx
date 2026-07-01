import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import type {
  NameDisplaySurfaceId,
  SearchListRowVariant,
} from "./NameDisplaySurface";
import { getNameDisplayContentWidth } from "./NameDisplaySurface";
import type { NameDisplayViewport } from "./name-display-matrix";
import { NAME_DISPLAY_VIEWPORT_LABELS } from "./name-display-matrix";

export interface NameDisplayMatrixRow {
  key: string;
  label: string;
  text?: string;
  length?: number;
  node: ReactNode;
}

interface NameDisplayMeasurement {
  visibleLines: number;
  naturalLines: number;
  isClipped: boolean;
  measuredLength?: number;
}

interface NameDisplayMatrixProps {
  rows: NameDisplayMatrixRow[];
  width: NameDisplayViewport;
  surface?: NameDisplaySurfaceId;
  searchListRowVariant?: SearchListRowVariant;
  note?: string;
}

export function NameDisplayMatrix({
  rows,
  width,
  surface,
  searchListRowVariant,
  note,
}: NameDisplayMatrixProps) {
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [measurements, setMeasurements] = useState<
    Record<string, NameDisplayMeasurement>
  >({});
  const contentWidth =
    surface != null
      ? getNameDisplayContentWidth(surface, width, searchListRowVariant)
      : null;

  useLayoutEffect(() => {
    const nextMeasurements: Record<string, NameDisplayMeasurement> = {};

    for (const row of rows) {
      const root = rowRefs.current[row.key];
      const measuredText = row.text;
      if (!root || !measuredText) continue;

      const textElement = findTextElement(root, measuredText);
      if (!textElement) continue;

      const style = window.getComputedStyle(textElement);
      const lineHeight = resolveLineHeight(style);
      const visibleLines = Math.max(
        1,
        Math.round(textElement.clientHeight / lineHeight),
      );
      const naturalLines = Math.max(
        visibleLines,
        Math.round(textElement.scrollHeight / lineHeight),
      );

      nextMeasurements[row.key] = {
        visibleLines,
        naturalLines,
        isClipped: textElement.scrollHeight > textElement.clientHeight + 1,
        measuredLength: Array.from(measuredText).length,
      };
    }

    setMeasurements((currentMeasurements) =>
      areMeasurementsEqual(currentMeasurements, nextMeasurements)
        ? currentMeasurements
        : nextMeasurements,
    );
  }, [rows]);

  return (
    <div
      style={{
        width,
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily:
          '"Pretendard", "Metropolis", system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: "12px",
          padding: "0 4px",
          fontSize: "12px",
          color: "#5f6368",
        }}
      >
        <span>
          viewport {width}px · {NAME_DISPLAY_VIEWPORT_LABELS[width]}
        </span>
        {contentWidth != null ? (
          <span>콘텐츠 폭 약 {contentWidth}px</span>
        ) : null}
        <span>실제 DOM 줄 수로 임계값 탐색</span>
      </div>
      {note ? (
        <p
          style={{
            margin: "0 0 12px",
            padding: "8px 10px",
            borderRadius: "6px",
            background: "#f1f3f4",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#3c4043",
          }}
        >
          {note}
        </p>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          border: "1px solid #e8eaed",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#fafafa",
        }}
      >
        {rows.map((row, index) => (
          <div
            key={row.key}
            ref={(node) => {
              rowRefs.current[row.key] = node;
            }}
            style={{
              borderTop: index === 0 ? "none" : "1px solid #e8eaed",
              background: "#fff",
            }}
          >
            <div
              style={{
                padding: "8px 12px 4px",
                fontFamily: "ui-monospace, monospace",
                fontSize: "11px",
                lineHeight: 1.4,
                color: "#5f6368",
              }}
            >
              <div>{row.label}</div>
              <MeasurementLabel
                expectedLength={row.length}
                measurement={measurements[row.key]}
              />
            </div>
            <div style={{ paddingBottom: 8 }}>{row.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementLabel({
  expectedLength,
  measurement,
}: {
  expectedLength?: number;
  measurement?: NameDisplayMeasurement;
}) {
  const lengthLabel = measurement?.measuredLength ?? expectedLength ?? null;

  if (!measurement) {
    return (
      <div style={{ marginTop: 2, color: "#9aa0a6" }}>
        {lengthLabel != null ? `문자 ${lengthLabel}자 · ` : ""}측정 중
      </div>
    );
  }

  const status =
    measurement.naturalLines <= 2
      ? "2줄 이내"
      : measurement.isClipped
        ? "3줄 이상에서 잘림"
        : "3줄 이상";
  const color = measurement.naturalLines <= 2 ? "#188038" : "#d93025";

  return (
    <div style={{ marginTop: 2, color }}>
      문자 {lengthLabel}자 · 보임 {measurement.visibleLines}줄 · 원문{" "}
      {measurement.naturalLines}줄 · {status}
    </div>
  );
}

function findTextElement(root: HTMLElement, text: string): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent?.includes(text)) {
      return node.parentElement;
    }

    node = walker.nextNode();
  }

  return null;
}

function resolveLineHeight(style: CSSStyleDeclaration): number {
  const parsedLineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(parsedLineHeight)) return parsedLineHeight;

  const parsedFontSize = Number.parseFloat(style.fontSize);
  return Number.isFinite(parsedFontSize) ? parsedFontSize * 1.2 : 16;
}

function areMeasurementsEqual(
  a: Record<string, NameDisplayMeasurement>,
  b: Record<string, NameDisplayMeasurement>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => {
    const aMeasurement = a[key];
    const bMeasurement = b[key];

    return (
      aMeasurement?.visibleLines === bMeasurement?.visibleLines &&
      aMeasurement?.naturalLines === bMeasurement?.naturalLines &&
      aMeasurement?.isClipped === bMeasurement?.isClipped &&
      aMeasurement?.measuredLength === bMeasurement?.measuredLength
    );
  });
}
