import { style } from "@vanilla-extract/css";
import { color } from "./color.css.ts";

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

export const blockInfo = style({
  padding: "8px 6px",
  borderRadius: "0 0 8px 8px",
  border: `1px solid ${color.palette.gray[300]}`,
  borderTop: "none",
  backgroundColor: color.palette.gray[100],
});

export const blockStepLabel = style({
  fontSize: "11px",
  fontWeight: 700,
  color: color.palette.gray[800],
  lineHeight: 1.3,
});

export const blockValueLabel = style({
  fontSize: "10px",
  color: color.palette.gray[600],
  fontFamily: "monospace",
  marginTop: "2px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// ── PrimitiveColors ───────────────────────────────────────────────────────────

export const primitiveWrapper = style({
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "40px",
  maxWidth: "1100px",
  backgroundColor: color.palette.gray[100],
});

export const familyList = style({
  display: "flex",
  flexDirection: "column",
  gap: "36px",
});

export const familyName = style({
  fontSize: "13px",
  marginBottom: "10px",
  color: color.palette.gray[600],
});

export const swatchRow = style({
  display: "flex",
  gap: "6px",
});

export const opacityLabelContainer = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: 600,
  color: color.palette.gray[700],
  marginBottom: "10px",
});

export const opacityDot = style({
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${color.palette.gray[500]} 50%, transparent 50%)`,
  border: "1px solid rgba(0,0,0,0.1)",
  flexShrink: 0,
});

// ── SemanticColors ────────────────────────────────────────────────────────────

export const semanticWrapper = style({
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "40px",
  maxWidth: "900px",
  backgroundColor: color.palette.gray[100],
});

export const groupList = style({
  display: "flex",
  flexDirection: "column",
  gap: "48px",
});

export const groupHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "4px",
});

export const groupLabel = style({
  fontSize: "13px",
  fontWeight: 700,
  color: color.palette.gray[800],
});

export const groupCount = style({
  fontSize: "11px",
  color: color.palette.gray[500],
  fontFamily: "ui-monospace, monospace",
});

export const columnHeader = style({
  display: "flex",
  gap: "14px",
  padding: "6px 0",
  borderBottom: `1px solid ${color.palette.gray[300]}`,
});

export const columnHeaderSpacer = style({
  width: "40px",
  flexShrink: 0,
});

export const columnHeaderToken = style({
  flex: 1,
  fontSize: "10px",
  fontWeight: 600,
  color: color.palette.gray[500],
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

export const columnHeaderPrimitive = style({
  fontSize: "10px",
  fontWeight: 600,
  color: color.palette.gray[500],
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  flexShrink: 0,
});

// ── SemanticTokenRow ──────────────────────────────────────────────────────────

export const tokenRow = style({
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "10px 0",
  borderBottom: `1px solid ${color.palette.gray[200]}`,
});

export const tokenSwatch = style({
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  flexShrink: 0,
  border: `1px solid ${color.palette.gray[200]}`,
});

export const tokenInfo = style({
  flex: 1,
  minWidth: 0,
});

export const tokenName = style({
  fontSize: "12px",
  fontWeight: 600,
  color: color.palette.gray[800],
  fontFamily: "ui-monospace, monospace",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const tokenDescription = style({
  fontSize: "11px",
  color: color.palette.gray[600],
  marginTop: "2px",
});

export const primitiveTokenBadge = style({
  fontSize: "11px",
  color: color.palette.gray[700],
  fontFamily: "ui-monospace, monospace",
  textAlign: "right",
  flexShrink: 0,
  backgroundColor: color.palette.gray[200],
  padding: "3px 8px",
  borderRadius: "4px",
});

// ── ColorBlock ────────────────────────────────────────────────────────────────

export const colorBlockContainer = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  maxWidth: "100px",
});

export const colorBlockSwatch = style({
  height: "80px",
  borderRadius: "8px 8px 0 0",
  border: `1px solid ${color.palette.gray[300]}`,
});

// ── OpacityBlock ──────────────────────────────────────────────────────────────

export const opacityBlockContainer = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  maxWidth: "150px",
});

export const opacityBlockSwatch = style({
  height: "80px",
  borderRadius: "8px 8px 0 0",
  border: `1px solid ${color.palette.gray[300]}`,
  position: "relative",
  overflow: "hidden",
  backgroundImage: `linear-gradient(45deg, ${color.palette.gray[400]} 25%, transparent 25%, transparent 75%, ${color.palette.gray[400]} 75%), linear-gradient(45deg, ${color.palette.gray[400]} 25%, transparent 25%, transparent 75%, ${color.palette.gray[400]} 75%)`,
  backgroundSize: "10px 10px",
  backgroundPosition: "0 0, 5px 5px",
});

export const opacityOverlay = style({
  position: "absolute",
  inset: 0,
});

// ── PrimitiveTokenTable ───────────────────────────────────────────────────────

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
  gap: "8px",
});

export const tokenTableSwatch = style({
  width: "18px",
  height: "18px",
  borderRadius: "4px",
  flexShrink: 0,
  border: `1px solid ${color.palette.gray[300]}`,
});
