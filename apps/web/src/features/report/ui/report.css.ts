import { vars } from "@repo/ui/vars";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

export const reportContainer = style({
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  minHeight: "100dvh",
  backgroundColor: vars.color.bg.default,
  position: "relative",
  overflow: "visible",
  display: "flex",
  flexDirection: "column",
  "@media": {
    [`screen and (min-width: ${vars.layout.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
    },
  },
});

export const reportHeader = style({
  position: "sticky",
  top: 0,
  left: "auto",
  transform: "none",
  width: "100%",
  maxWidth: "none",
  backgroundColor: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
  paddingTop: "env(safe-area-inset-top, 0px)",
  zIndex: 100,
  selectors: {
    "&&": {
      position: "sticky",
      top: 0,
      left: "auto",
      transform: "none",
      maxWidth: "none",
    },
  },
});

export const reportPageContent = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: "100dvh",
});

export const contentArea = style({
  position: "relative",
  flex: 1,
  width: "100%",
  minHeight: 0,
  padding: `${vars.spacing[16]} ${vars.layout.sidePadding} ${vars.spacing[28]}`,
  overflowY: "visible",
  overflowAnchor: "none",
  overscrollBehaviorY: "auto",
  touchAction: "pan-y",
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const stepWrapper = style({
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  gap: "32px",
  width: "100%",
  paddingTop: vars.spacing[16],
});

export const bottomButtonWrapper = style({
  position: "sticky",
  bottom: 0,
  width: "100%",
  padding: `${vars.spacing[16]} ${vars.layout.sidePadding} calc(env(safe-area-inset-bottom, 0px) + ${vars.spacing[16]})`,
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  backgroundColor: "white",
  zIndex: 100,
  boxSizing: "border-box",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  scrollMarginTop: vars.spacing[24],
});

export const disabledSection = style({
  opacity: 0.5,
});

export const locationSection = section;

export const classificationSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  width: "100%",
});

export const sectionTitleRow = style({
  display: "grid",
  gridTemplateColumns: "max-content minmax(0, 1fr)",
  alignItems: "center",
  columnGap: vars.spacing[8],
  width: "100%",
});

export const sectionTitleLabel = style({
  minWidth: 0,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.relaxed,
  color: vars.color.palette.gray[800],
});

export const sectionErrorTextBottom = style({
  margin: 0,
  marginTop: vars.spacing[8],
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  color: vars.color.palette.red[300],
  textAlign: "center",
});

export const sectionErrorTextInline = style({
  margin: 0,
  justifySelf: "end",
  minWidth: 0,
  maxWidth: "100%",
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  color: vars.color.palette.red[300],
  textAlign: "right",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

/** 하단 에러 영역과 동일한 높이 — 제목 옆 배치 시 섹션 간 gap 유지용 */
export const sectionErrorReserve = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  flexShrink: 0,
});

/** @deprecated 롤백용 — `sectionErrorTextBottom` 또는 `sectionErrorTextInline` 사용 */
export const sectionErrorText = sectionErrorTextBottom;

export const sectionGap24 = style({
  marginTop: vars.spacing[24],
});

export const placeType = style({
  marginTop: 0,
});

export const indoorOutdoorControl = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "56px",
  width: "296px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: 0,
  border: 0,
  minInlineSize: 0,
});

export const indoorOutdoorChip = style({
  width: "120px",
  maxWidth: "calc(50% - 28px)",
});

export const photoSectionContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "280px",
  margin: "0 auto",
});

export const emptyMapState = style({
  width: "100%",
  height: "100%",
  backgroundColor: vars.color.palette.gray[200],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
});

export const emptyMapIcon = style({
  width: "48px",
  height: "48px",
  color: vars.color.palette.gray[600],
});

export const locationTextButton = style({
  width: "100%",
  padding: `${vars.spacing[16]} ${vars.spacing[12]}`,
  backgroundColor: "white",
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: vars.radius[12],
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      cursor: "default",
    },
  },
});

export const floorDropdown = style({
  flex: 1,
});

export const floorControlRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const floorChoiceButton = style({
  flex: "0 0 auto",
  paddingLeft: vars.spacing[16],
  paddingRight: vars.spacing[16],
});

export const pickerTriggerButtonSlot = style({
  display: "flex",
  flex: 1,
  minWidth: 0,
  selectors: {
    '&[data-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
});

export const pickerTriggerButton = style({
  width: "100%",
  minWidth: 0,
  paddingLeft: vars.spacing[16],
  paddingRight: vars.spacing[16],
  borderRadius: vars.radius[4],
});

export const pickerTriggerButtonContent = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[8],
  width: "100%",
  minWidth: 0,
});

export const pickerTriggerButtonLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const dialContainer = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 16px",
  backgroundColor: vars.color.palette.gray[100], // #F8F9FA와 유사
  borderRadius: vars.radius[12],
  gap: vars.spacing[4],
});

export const dialSeparator = style({
  width: "1px",
  height: "40px",
  backgroundColor: vars.color.palette.gray[300],
});

export const sizeGuideBox = style({
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[600],
  lineHeight: "1.6",
  backgroundColor: vars.color.palette.gray[100],
  padding: vars.spacing[12],
  borderRadius: vars.radius[8],
});

export const sizeGuideList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const priceInputContainer = style({
  flex: 1,
  minWidth: 0,
  position: "relative",
});

// iOS Safari: 16px 미만 입력 포커스 시 자동 줌 방지
globalStyle(`${priceInputContainer} input`, {
  fontSize: vars.typography.fontSize[16],
});

export const priceUnit = style({
  position: "absolute",
  right: vars.spacing[12],
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: vars.typography.fontSize[14],
  color: vars.color.palette.gray[600],
  pointerEvents: "none",
});

export const reportTextareaRoot = style({
  width: "100%",
  minHeight: "200px",
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.border.default,
  padding: vars.spacing[16],
  boxSizing: "border-box",
  position: "relative",
  display: "block",
  cursor: "text",
  opacity: 0.6,
  selectors: {
    "&:focus-within": {
      opacity: 1,
    },
  },
});

export const reportTextareaField = style({
  width: "100%",
  minHeight: "168px",
  maxHeight: "168px",
  border: "none",
  outline: "none",
  resize: "none",
  // iOS Safari: 16px 미만 입력 포커스 시 자동 줌 방지
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.5,
  fontFamily: "inherit",
  color: vars.color.text.title,
  backgroundColor: "transparent",
  padding: 0,
  overflow: "hidden",
  "::placeholder": {
    color: vars.color.text.surface,
  },
});

export const reportTextareaCounter = style({
  position: "absolute",
  right: "48px",
  bottom: "18px",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.surface,
});

export const textareaClearButton = style({
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  color: vars.color.palette.gray[500],
  fontSize: vars.typography.fontSize[12],
  cursor: "pointer",
  padding: vars.spacing[4],
  zIndex: 2,
  selectors: {
    "&:hover": {
      color: vars.color.palette.gray[700],
    },
  },
});

export const reportTextareaIcon = style({
  position: "absolute",
  right: "16px",
  bottom: "14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  color: vars.color.text.title,
  pointerEvents: "none",
});

export const requiredMark = style({
  color: vars.color.palette.red[300],
  marginLeft: "4px",
  verticalAlign: "middle",
});

export const addressTextContent = style({
  fontSize: "15px",
  lineHeight: vars.typography.lineHeight.normal,
});

const baseUploadArea = style({
  display: "flex",
  height: "200px",
  padding: vars.spacing[24],
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: vars.spacing[12],
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "dashed",
  borderColor: "#CACACA",
  backgroundColor: "#F5F5F5",
  backgroundClip: "padding-box", // 테두리 영역과 배경 겹침 방지
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
  ":active": {
    backgroundColor: vars.color.palette.gray[200],
  },
});

export const locationMapArea = style([
  baseUploadArea,
  {
    width: "280px",
    margin: "0 auto",
  },
]);

/** 제보 사진 업로드·미리보기 공통 치수 */
export const REPORT_PHOTO_TILE_WIDTH = "min(343px, 100%)";
export const REPORT_PHOTO_TILE_HEIGHT = "200px";

const reportPhotoTileBase = style({
  flexShrink: 0,
  minWidth: 0,
  width: REPORT_PHOTO_TILE_WIDTH,
  height: REPORT_PHOTO_TILE_HEIGHT,
  boxSizing: "border-box",
});

export const reportPhotoGallery = style({
  display: "flex",
  gap: vars.spacing[12],
  overflowX: "auto",
  paddingBottom: vars.spacing[8],
  scrollbarWidth: "none",
  width: "100%",
});

export const photoUploadArea = style([
  baseUploadArea,
  reportPhotoTileBase,
  {
    flex: `1 0 ${REPORT_PHOTO_TILE_WIDTH}`,
    width: "100%",
    margin: 0,
    selectors: {
      [`${reportPhotoGallery}[data-has-images="true"] &`]: {
        flex: `0 0 ${REPORT_PHOTO_TILE_WIDTH}`,
        width: REPORT_PHOTO_TILE_WIDTH,
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
      },
      '&[data-state="error"]': {
        borderColor: vars.color.border.error,
        borderStyle: "dashed",
        backgroundColor: vars.color.bg.surface,
        gap: vars.spacing[12],
      },
      '&[data-state="error"]:disabled': {
        opacity: 1,
      },
    },
  },
]);

export const photoErrorIconCircle = style({
  width: "32px",
  height: "32px",
  borderRadius: vars.radius.max,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.error,
});

export const photoUploadErrorMessage = style({
  color: vars.color.text.error,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "1.2",
  textAlign: "center",
  whiteSpace: "pre-line",
  wordBreak: "keep-all",
  maxWidth: "100%",
});

export const imageWrapper = style([
  reportPhotoTileBase,
  {
    position: "relative",
    flex: `0 0 ${REPORT_PHOTO_TILE_WIDTH}`,
    borderRadius: vars.radius[12],
    overflow: "hidden",
    boxSizing: "border-box",
    selectors: {
      '&[data-state="error"]': {
        border: `1px dashed ${vars.color.border.error}`,
      },
    },
  },
]);

export const imagePreview = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const imageDeleteButton = style({
  position: "absolute",
  top: vars.spacing[8],
  right: vars.spacing[8],
  width: "28px",
  height: "28px",
  borderRadius: vars.radius.max,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  zIndex: 10,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

const photoUploadSpinner = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const photoPreviewUploadOverlay = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  zIndex: 5,
});

export const photoPreviewErrorOverlay = style({
  position: "absolute",
  inset: 0,
  zIndex: 6,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  padding: vars.spacing[24],
  backgroundColor: "rgba(245, 245, 245, 0.92)",
  boxSizing: "border-box",
});

export const photoPreviewUploadSpinner = style({
  width: "24px",
  height: "24px",
  borderRadius: "9999px",
  border: "3px solid #DEE2E6",
  borderTopColor: "#495057",
  animation: `${photoUploadSpinner} 0.8s linear infinite`,
  backgroundColor: "rgba(255, 255, 255, 0.78)",
});

export const miniMapContainer = style({
  width: "100%",
  height: "100%",
});

export const floatingCameraButton = style({
  position: "absolute",
  right: vars.spacing[12],
  bottom: vars.spacing[12],
  width: "40px",
  height: "40px",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: vars.shadow[1],
  zIndex: 5,
  cursor: "pointer",
});

export const uploadIcon = style({
  width: "40px",
  height: "40px",
  color: vars.color.palette.gray[600],
});

export const uploadText = style({
  fontSize: vars.typography.fontSize[14],
  color: vars.color.palette.gray[600],
  textAlign: "center",
  lineHeight: vars.typography.lineHeight.normal,
});

export const guideText = style({
  color: vars.color.palette.gray[600],
  fontSize: "14px",
});

export const agreementSection = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[8],
});

export const agreementCheckRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  selectors: {
    '&[data-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
});

export const agreementLabel = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  selectors: {
    [`${agreementCheckRow}[data-disabled="true"] &`]: {
      opacity: 0.5,
    },
  },
});

export const privacyPolicyLink = style({
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  textDecorationLine: "underline",
  textUnderlinePosition: "from-font",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
});

/** 체크박스(20px) + gap(8px) 만큼 들여써 동의 문구와 정렬 */
export const privacyPolicyLinkRow = style({
  paddingLeft: "28px",
  width: "100%",
  boxSizing: "border-box",
});

export const photoAgreementGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

export const nextButton = style({
  width: "100%",
});

export const submitActionFrame = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
});

export const submitSubButton = style({
  margin: 0,
  width: "auto",
  minHeight: "auto",
  padding: 0,
  color: "#8E8E8E",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  letterSpacing: 0,
  textAlign: "center",
  textDecorationLine: "underline",
  textUnderlinePosition: "from-font",
  whiteSpace: "nowrap",
  backgroundColor: "transparent",
  selectors: {
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const priceRow = style({
  width: "100%",
});

export const priceRadioGroup = style({
  width: "100%",
});

globalStyle(`${priceRadioGroup}${priceRadioGroup}`, {
  width: "100%",
});

globalStyle(`${priceRadioGroup} > div`, {
  width: "100%",
});

export const priceRadioGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  columnGap: vars.spacing[8],
  alignItems: "center",
  width: "100%",
});

export const priceUnknownRadio = style({
  gridColumn: "1",
  justifySelf: "start",
});

export const priceFreeRadio = style({
  gridColumn: "2",
  justifySelf: "center",
});

export const pricePaidRadio = style({
  gridColumn: "3",
  justifySelf: "end",
});

export const priceInputRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  columnGap: vars.spacing[8],
  alignItems: "center",
  width: "100%",
});

export const priceInputItem = style({
  flex: 1,
  minWidth: 0,
});

export const timeRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  columnGap: vars.spacing[8],
  alignItems: "center",
});

export const timeAllDayRow = style({
  display: "flex",
  justifyContent: "flex-start",
  width: "100%",
});

export const timeSeparator = style({
  flex: "0 0 auto",
  color: vars.color.palette.gray[500],
});
