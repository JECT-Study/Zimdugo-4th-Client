import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const sheetColumn = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  minHeight: 0,
  padding: `${vars.spacing[8]} ${vars.spacing[16]} 0`,
});

/**
 * contentStack 의 세로 간격.
 * 콘텐츠에 빠져 있는 항목을 더해 full 높이를 보정할 때 이 값도 함께 쓴다.
 */
export const CONTENT_STACK_GAP_PX = Number.parseFloat(vars.spacing.scale[8]);

export const contentStack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
  minHeight: 0,
});

export const loadingContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[16],
  width: "100%",
  padding: `${vars.spacing[8]} ${vars.spacing[4]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
});

export const loadingSummary = style({
  display: "flex",
  gap: vars.spacing[8],
  width: "100%",
});

export const loadingTextStack = style({
  display: "flex",
  flex: 1,
  minWidth: 0,
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const loadingDetailList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  width: "100%",
});

export const loadingDetailRow = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[12],
  width: "100%",
});

export const loadingActionRow = style({
  display: "flex",
  gap: vars.spacing[8],
  width: "100%",
});

export const detailHeader = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "32px",
});

export const backButton = style({
  width: "32px",
  minWidth: "32px",
  height: "32px",
  padding: 0,
  alignSelf: "start",
  flexShrink: 0,
  color: vars.color.text.title,
});

export const backIcon = style({
  flexShrink: 0,
});

export const fullContentScroll = style({
  flex: 1,
  minHeight: 0,
  overflowY: "hidden",
  overflowX: "hidden",
  paddingBottom: vars.spacing[24],
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const fullContentScrollEnabled = style({
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
});

export const summarySection = style({
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: vars.color.bg.default,
});

export const summaryRow = style({
  display: "flex",
  gap: vars.spacing[8],
  alignItems: "start",
  width: "100%",
  padding: `${vars.spacing[8]} ${vars.spacing[4]}`,
  boxSizing: "border-box",
});

export const realtimeAvailabilityDivider = style({
  width: `calc(100% + (${vars.spacing[16]} * 2))`,
  height: "1px",
  margin: `0 -${vars.spacing[16]}`,
  border: 0,
  padding: 0,
  flexShrink: 0,
  backgroundColor: vars.color.border.default,
});

export const realtimeStatusCardOverlay = style({
  position: "absolute",
  left: vars.spacing[16],
  zIndex: vars.zIndex.bottomSheet,
  pointerEvents: "none",
});

export const summaryTextColumn = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  flex: 1,
  paddingRight: 0,
});

export const titleControlRow = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[4],
  width: "100%",
  minWidth: 0,
});

export const lockerTitle = style({
  overflow: "hidden",
  flex: 1,
  minWidth: 0,
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

export const lockerTitleExpanded = style({
  overflow: "visible",
  whiteSpace: "normal",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const titleExpandButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  padding: 0,
  flexShrink: 0,
  border: 0,
  borderRadius: vars.radius[4],
  background: "transparent",
  color: vars.color.text.disable,
  cursor: "pointer",
});

export const titleExpandIcon = style({
  transform: "rotate(-90deg) scale(0.72)",
  transition: "transform 160ms ease",
});

export const titleExpandIconExpanded = style({
  transform: "rotate(90deg) scale(0.72)",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  minWidth: 0,
  overflow: "hidden",
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
});

export const metaIconText = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.spacing[4],
  minWidth: 0,
});

export const metaIcon = style({
  width: "14px",
  height: "14px",
  flexShrink: 0,
});

export const metaTruncatedText = style({
  minWidth: 0,
  flex: "1 1 auto",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const distanceRow = style({
  color: vars.color.text.surface,
});

export const metaDot = style({
  width: "2px",
  height: "2px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.text.disable,
});

/**
 * 홈 헤더의 원형 버튼과 같은 결로 맞춘다. 회색 원(CircleBox) 대신 흰 원에 그림자를
 * 얹어 띄우고, 포커스 링도 헤더와 동일하게 준다.
 *
 * 그림자는 헤더 프로필 버튼(IconHomeProfile32)과 같은 shadow[2] 를 쓴다. 시트 배경도
 * 흰색이라 한 단계 옅은 shadow[1] 로는 원의 경계가 거의 드러나지 않는다.
 *
 * 원 32px·아이콘 24px 은 그대로다. 원을 버튼이 그리게 되면서 아이콘은 원을 품지 않는
 * 24px 글리프(IconMore24·IconX24)를 쓴다. 같은 글리프라 모양은 달라지지 않는다.
 */
export const summaryIconButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  padding: 0,
  alignSelf: "start",
  flexShrink: 0,
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const summaryActions = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.spacing[8],
  flexShrink: 0,
});

export const lockerImage = style({
  width: "100%",
  height: "160px",
  objectFit: "cover",
  borderRadius: vars.radius[6],
  border: `1px solid ${vars.color.border.default}`,
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.surface,
});

export const lockerImageButton = style({
  display: "block",
  width: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  cursor: "pointer",
  borderRadius: vars.radius[6],
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const fullLockerImage = style({
  flexShrink: 0,
});

export const actionRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const primaryActionButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "32px",
  minWidth: 0,
  flex: 1,
  padding: `0 ${vars.spacing[16]}`,
  border: 0,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.palette.green[700],
  color: vars.color.text.white,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  cursor: "pointer",
});

export const fullDetailList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  width: "100%",
});

export const detailItem = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const detailItemContent = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  padding: `${vars.spacing[8]} ${vars.spacing[4]}`,
  boxSizing: "border-box",
});

export const detailLeading = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[16],
  minWidth: 0,
  flex: 1,
});

export const detailIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
  color: vars.color.text.surface,
});

export const detailIconNeutral = style({});

globalStyle(`${detailIconNeutral} svg path`, {
  fill: vars.color.text.surface,
});

export const detailTextColumn = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  flex: 1,
});

export const detailTitle = style({
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const detailTitleMultiline = style({
  overflow: "visible",
  whiteSpace: "normal",
  textOverflow: "clip",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const detailDescription = style({
  overflow: "hidden",
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const detailDescriptionMultiline = style({
  overflow: "visible",
  whiteSpace: "normal",
  textOverflow: "clip",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const detailTrailing = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: vars.spacing[4],
  flexShrink: 0,
  paddingLeft: vars.spacing[12],
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

export const actionSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
});

export const actionDivider = style({
  position: "relative",
  width: `calc(100% + (${vars.spacing[16]} * 2))`,
  height: "1px",
  margin: `0 -${vars.spacing[16]}`,
  flexShrink: 0,
  selectors: {
    "&::before": {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      height: "1px",
      backgroundColor: vars.color.palette.gray[500],
      content: '""',
      transform: "scaleY(0.5)",
      transformOrigin: "top",
    },
  },
});

export const fullActionRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const fullPrimaryActionButton = style({
  height: "40px",
  fontSize: vars.typography.fontSize[18],
});
