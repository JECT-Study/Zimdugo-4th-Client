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

// ── RadiusTokens ──────────────────────────────────────────────────────────────

export const wrapper = style({
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "40px",
  maxWidth: "900px",
  backgroundColor: color.palette.gray[100],
});

export const tokenGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "16px",
});

export const tokenCard = style({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
  backgroundColor: color.palette.gray[200],
  borderRadius: "8px",
  border: `1px solid ${color.palette.gray[300]}`,
});

export const previewBox = style({
  width: "100%",
  height: "64px",
  backgroundColor: color.palette.green[200],
  border: `2px solid ${color.palette.green[500]}`,
});

export const tokenMeta = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
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
  padding: "7px 12px",
  fontFamily: "ui-monospace, monospace",
  fontSize: "12px",
  color: color.palette.gray[800],
});

export const tokenTableCellValue = style({
  padding: "7px 12px",
  fontFamily: "ui-monospace, monospace",
  fontSize: "12px",
  color: color.palette.gray[600],
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

export const previewInline = style({
  width: "32px",
  height: "32px",
  backgroundColor: color.palette.green[200],
  border: `2px solid ${color.palette.green[500]}`,
  flexShrink: 0,
});
