import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

/**
 * 카드 높이. Figma 고정값이다.
 *
 * 상세 시트가 카드 없이 full 콘텐츠 높이를 잴 때 이 값을 더해 보정하므로,
 * 높이를 바꾸면 시트의 full 스냅 위치도 함께 따라온다.
 */
export const LOCKER_REALTIME_STATUS_CARD_HEIGHT_PX = 58;

export const card = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "fit-content",
  minWidth: "178px",
  height: `${LOCKER_REALTIME_STATUS_CARD_HEIGHT_PX}px`,
  padding: "4px 12px 8px",
  boxSizing: "border-box",
  overflow: "hidden",
  borderRadius: "16px",
  backgroundColor: vars.color.bg.default,
});

export const cardVariant = styleVariants({
  floating: {
    boxShadow: "0 4px 20px rgb(0 0 0 / 25%)",
  },
  inline: {
    border: "1px solid #EEE",
    padding: "3px 11px 7px",
  },
});

export const statusHeader = style({
  position: "relative",
  width: "100%",
  minWidth: "154px",
  height: "20px",
  flexShrink: 0,
  overflow: "hidden",
  backgroundColor: vars.color.bg.default,
});

export const liveIndicator = style({
  position: "absolute",
  top: "50%",
  left: "3px",
  width: "6px",
  height: "6px",
  transform: "translateY(-50%)",
});

export const statusLabel = style({
  position: "absolute",
  top: "4px",
  left: "13px",
  color: "#16181C",
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "normal",
  whiteSpace: "nowrap",
});

export const updatedLabel = style({
  position: "absolute",
  top: "5px",
  right: 0,
  width: "120px",
  overflow: "hidden",
  color: "#617A69",
  fontSize: "8px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: "normal",
  textAlign: "right",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const sizeList = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  marginTop: "6px",
  overflow: "hidden",
  backgroundColor: vars.color.bg.default,
  fontSize: "10px",
  lineHeight: "normal",
  whiteSpace: "nowrap",
});

/**
 * `대형 마감`과 가변 수량까지 세 항목이 모두 잘리지 않도록 카드 폭을 콘텐츠에 맞춘다.
 */
export const sizeItem = style({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  flexShrink: 0,
  padding: "4px 8px",
  boxSizing: "border-box",
  overflow: "hidden",
  borderRadius: vars.radius[8],
});

export const sizeItemState = styleVariants({
  available: {
    color: "#0D7330",
    backgroundColor: "#DBF7E3",
  },
  closed: {
    color: "#737D78",
    backgroundColor: "#EBF0ED",
  },
});

export const sizeLabel = style({
  fontWeight: vars.typography.fontWeight.Regular,
});

export const sizeValue = style({
  flexShrink: 0,
  fontWeight: vars.typography.fontWeight.SemiBold,
  fontVariantNumeric: "tabular-nums",
});
