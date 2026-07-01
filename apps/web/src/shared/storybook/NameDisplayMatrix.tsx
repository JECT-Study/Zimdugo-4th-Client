import type { ReactNode } from "react";
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
  node: ReactNode;
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
  const contentWidth =
    surface != null
      ? getNameDisplayContentWidth(surface, width, searchListRowVariant)
      : null;

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
        <span>2줄 안에 노출되는지 눈으로 확인</span>
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
              {row.label}
            </div>
            <div style={{ paddingBottom: 8 }}>{row.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
