import { style } from "@vanilla-extract/css";
import { color } from "./tokens/color/color.css.ts";

export const container = style({
  fontFamily: "system-ui, -apple-system, sans-serif",
  maxWidth: "860px",
  padding: "60px 40px",
  backgroundColor: color.palette.gray[100],
});

export const divider = style({
  border: "none",
  borderTop: `1px solid ${color.palette.gray[300]}`,
  margin: "48px 0",
});

export const hero = style({
  marginBottom: "48px",
});

export const heroBadge = style({
  display: "inline-block",
  fontSize: "11px",
  fontWeight: 700,
  color: color.palette.green[700],
  backgroundColor: "#E2F3E7",
  padding: "3px 10px",
  borderRadius: "20px",
  marginBottom: "16px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
});

export const heroTitle = style({
  fontSize: "36px",
  fontWeight: 800,
  color: color.palette.gray[800],
  margin: "0 0 12px",
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
});

export const heroSubtitle = style({
  fontSize: "16px",
  color: color.palette.gray[600],
  lineHeight: 1.7,
  margin: 0,
  maxWidth: "580px",
});
