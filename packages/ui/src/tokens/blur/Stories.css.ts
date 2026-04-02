import { style } from "@vanilla-extract/css";
import { color } from "../color/color.css.ts";

// ── 공통 ──────────────────────────────────────────────────────────────────────

export const pageHeader = style({
  marginBottom: "40px",
});

export const pageTitle = style({
  fontSize: "22px",
  fontWeight: 700,
  color: color.palette.gray[800],
  margin: 0,
});

export const pageSubtitle = style({
  fontSize: "14px",
  color: color.palette.gray[600],
  marginTop: "6px",
  marginBottom: 0,
});

// ── BlurTokens ────────────────────────────────────────────────────────────────

export const wrapper = style({
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "40px",
  maxWidth: "900px",
});

export const tokenGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "32px",
});

export const tokenCard = style({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "24px",
  backgroundColor: color.palette.gray[200],
  borderRadius: "8px",
});

export const previewArea = style({
  position: "relative",
  height: "96px",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: color.palette.gray[300],
});

export const previewBg = style({
  position: "absolute",
  inset: 0,
  backgroundImage: `repeating-linear-gradient(
    45deg,
    ${color.palette.green[200]} 0px,
    ${color.palette.green[200]} 8px,
    ${color.palette.green[400]} 8px,
    ${color.palette.green[400]} 16px
  )`,
});

export const previewOverlay = style({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
});

export const tokenMeta = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const tokenKey = style({
  fontSize: "13px",
  fontWeight: 700,
  color: color.palette.gray[800],
  fontFamily: "ui-monospace, monospace",
});

export const tokenValue = style({
  fontSize: "11px",
  color: color.palette.gray[600],
  fontFamily: "ui-monospace, monospace",
});

// ── TokenTable ────────────────────────────────────────────────────────────────

export const tokenTableSection = style({
  marginTop: "48px",
});

export const tokenTableTitle = style({
  fontSize: "13px",
  fontWeight: 600,
  color: color.palette.gray[700],
  marginBottom: "12px",
});

export const tokenTable = style({
  width: "100%",
  borderCollapse: "collapse",
});

export const tokenTableHeadCell = style({
  padding: "6px 12px",
  textAlign: "left",
  fontSize: "10px",
  fontWeight: 600,
  color: color.palette.gray[500],
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: `2px solid ${color.palette.gray[300]}`,
});

export const tokenTableRow = style({
  borderBottom: `1px solid ${color.palette.gray[200]}`,
  selectors: {
    "&:hover": {
      backgroundColor: color.palette.gray[200],
    },
  },
});

export const tokenTableCellName = style({
  padding: "10px 12px",
  fontFamily: "ui-monospace, monospace",
  fontSize: "12px",
  color: color.palette.gray[800],
  whiteSpace: "nowrap",
});

export const tokenTableCellValue = style({
  padding: "10px 12px",
  fontFamily: "ui-monospace, monospace",
  fontSize: "12px",
  color: color.palette.gray[600],
});
